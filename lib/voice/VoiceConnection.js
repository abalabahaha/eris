"use strict";

const ChildProcess = require("child_process");
const Constants = require("../Constants");
const Dgram = require("dgram");
const DNS = require("dns");
const OPCodes = Constants.VoiceOPCodes;
const Piper = require("./Piper");
const VoiceDataStream = require("./VoiceDataStream");
let WebSocket = typeof window !== "undefined" ? window.WebSocket : require("ws");

let EventEmitter;
try {
    EventEmitter = require("eventemitter3");
} catch(err) {
    EventEmitter = require("events").EventEmitter;
}
let NodeOpus;
try {
    NodeOpus = require("node-opus");
} catch(err) { // eslint-disable no-empty
}
let OpusScript;
try {
    OpusScript = require("opusscript");
} catch(err) { // eslint-disable no-empty
}
let Sodium = false;
let NaCl = false;
try {
    Sodium = require("sodium-native");
} catch(err) {
    try {
        NaCl = require("tweetnacl");
    } catch(err) { // eslint-disable no-empty
    }
}
try {
    WebSocket = require("uws");
} catch(err) { // eslint-disable no-empty
}

const MAX_FRAME_SIZE = 1276 * 3;
const ENCRYPTION_MODE = "xsalsa20_poly1305";

const converterCommand = {
    cmd: null,
    libopus: false
};

converterCommand.pickCommand = function pickCommand() {
    let tenative;
    for(const command of ["./ffmpeg", "./avconv", "ffmpeg", "avconv"]) {
        const res = ChildProcess.spawnSync(command, ["-encoders"]);
        if(!res.error) {
            if(!res.stdout.toString().includes("libopus")) {
                tenative = command;
                continue;
            }
            converterCommand.cmd = command;
            converterCommand.libopus = true;
            return;
        }
    }
    if(tenative) {
        converterCommand.cmd = tenative;
        return;
    }
};

/**
* Represents a voice connection
* @extends EventEmitter
* @prop {String} id The ID of the voice connection (guild ID)
* @prop {String} channelID The ID of the voice connection's current channel
* @prop {Boolean} connecting Whether the voice connection is connecting
* @prop {Boolean} ready Whether the voice connection is ready
* @prop {Boolean} playing Whether the voice connection is playing something
* @prop {Boolean} paused Whether the voice connection is paused
* @prop {Number} volume The current volume level of the connection
* @prop {Object?} current The state of the currently playing stream
* @prop {Number} current.startTime The timestamp of the start of the current stream
* @prop {Number} current.playTime How long the current stream has been playing for, in milliseconds
* @prop {Number} current.pausedTimestamp The timestamp of the most recent pause
* @prop {Number} current.pausedTime How long the current stream has been paused for, in milliseconds
* @prop {Options} current.options The custom options for the current stream
*/
class VoiceConnection extends EventEmitter {
    constructor(id, options = {}) {
        super();

        if(typeof window !== "undefined") {
            throw new Error("Voice is not supported in browsers at this time");
        }

        if(!Sodium && !NaCl) {
            throw new Error("Error loading tweetnacl/libsodium, voice not available");
        }

        this.id = id;
        this.samplingRate = 48000;
        this.channels = 2;
        this.frameDuration = 20;
        this.frameSize = this.samplingRate * this.frameDuration / 1000;
        this.pcmSize = this.frameSize * this.channels * 2;
        this.bitrate = 64000;
        this.shared = !!options.shared;
        this.shard = options.shard || {};
        this.opusOnly = !!options.opusOnly;

        if(!this.opusOnly && !this.shared) {
            if(NodeOpus) {
                this.opus = new NodeOpus.OpusEncoder(this.samplingRate, this.channels);
            } else if(OpusScript) {
                this.emit("debug", "node-opus not found, falling back to opusscript");
                this.opus = new OpusScript(this.samplingRate, this.channels, OpusScript.Application.AUDIO);
                if(this.opus.setBitrate) {
                    this.opus.setBitrate(this.bitrate);
                } else if(this.opus.encoderCTL) {
                    this.opus.encoderCTL(4002, this.bitrate);
                }
            } else {
                throw new Error("No opus encoder found, playing non-opus audio will not work.");
            }
        }

        this.channelID = null;
        this.paused = true;
        this.speaking = false;
        this.sequence = 0;
        this.timestamp = 0;
        this.ssrcUserMap = {};

        this.nonce = Buffer.alloc(24);

        this.packetBuffer = Buffer.alloc(12 + 16 + MAX_FRAME_SIZE);
        this.packetBuffer[0] = 0x80;
        this.packetBuffer[1] = 0x78;

        if(!options.shared) {
            if(!converterCommand.cmd) {
                converterCommand.pickCommand();
            }

            this.piper = new Piper(converterCommand.cmd, this.opus);
            /**
            * Fired when the voice connection encounters an error. This event should be handled by users
            * @event VoiceConnection#error
            * @prop {Error} err The error object
            */
            this.piper.on("error", (e) => this.emit("error", e));
            if(!converterCommand.libopus) {
                this.piper.libopus = false;
            }
        }

        this._send = this._send.bind(this);
    }

    _destroy() {
        if(this.opus && this.opus.delete) {
            this.opus.delete();
            delete this.opus;
        }
        delete this.piper;
        if(this.receiveStreamOpus) {
            this.receiveStreamOpus.removeAllListeners();
            this.receiveStreamOpus = null;
        }
        if(this.receiveStreamPCM) {
            this.receiveStreamPCM.removeAllListeners();
            this.receiveStreamPCM = null;
        }
    }

    connect(data) {
        if(this.connecting) {
            return;
        }
        this.connecting = true;
        if(this.ws && this.ws.readyState !== WebSocket.CLOSED) {
            this.disconnect(undefined, true);
            return setTimeout(() => this.connect(data), 500);
        }
        if(!data.endpoint || !data.token || !data.session_id || !data.user_id) {
            this.disconnect(new Error("Malformed voice server update: " + JSON.stringify(data)));
            return;
        }
        this.channelID = data.channel_id;
        this.endpoint = data.endpoint.split(":")[0];
        this.ws = new WebSocket("wss://" + this.endpoint);
        let connectionTimeout = setTimeout(() => {
            if(this.connecting) {
                this.disconnect(new Error("Voice connection timeout"));
            }
            connectionTimeout = null;
        }, this.shard.client ? this.shard.client.options.connectionTimeout : 30000);
        /**
        * Fired when stuff happens and gives more info
        * @event VoiceConnection#debug
        * @prop {String} message The debug message
        */
        this.emit("debug", "Connection: " + JSON.stringify(data));
        this.ws.on("open", () => {
            /**
            * Fired when the voice connection connects
            * @event VoiceConnection#connect
            */
            this.emit("connect");
            if(connectionTimeout) {
                clearTimeout(connectionTimeout);
                connectionTimeout = null;
            }
            this.sendWS(OPCodes.IDENTIFY, {
                server_id: this.id === "call" ? data.channel_id : this.id,
                user_id: data.user_id,
                session_id: data.session_id,
                token: data.token
            });
        });
        this.ws.on("message", (m) => {
            const packet = JSON.parse(m);
            if(this.listeners("debug").length > 0) {
                this.emit("debug", "Rec: " + JSON.stringify(packet));
            }
            switch(packet.op) {
                case OPCodes.HELLO: {
                    if(packet.d.heartbeat_interval > 0) {
                        if(this.heartbeatInterval) {
                            clearInterval(this.heartbeatInterval);
                        }
                        this.heartbeatInterval = setInterval(() => {
                            this.heartbeat();
                        }, packet.d.heartbeat_interval);
                        this.heartbeat();
                    }

                    this.ssrc = packet.d.ssrc;
                    this.packetBuffer.writeUIntBE(this.ssrc, 8, 4);
                    if(!packet.d.modes.includes(ENCRYPTION_MODE)) {
                        throw new Error("No supported voice mode found");
                    }
                    this.modes = packet.d.modes;
                    this.udpPort = packet.d.port;

                    DNS.lookup(this.endpoint, (err, address) => { // RIP DNS
                        if(err) {
                            this.emit("error", err);
                            return;
                        }

                        this.udpIP = address;

                        this.emit("debug", "Connecting to UDP: " + this.udpIP + ":" + this.udpPort);

                        this.udpSocket = Dgram.createSocket("udp4");
                        this.udpSocket.once("message", (packet) => {
                            this.emit("debug", packet.toString());
                            let localIP = "";
                            let i = 3;
                            while(++i < packet.indexOf(0, i)) {
                                localIP += String.fromCharCode(packet[i]);
                            }
                            const localPort = parseInt(packet.readUIntLE(packet.length - 2, 2).toString(10));

                            this.sendWS(OPCodes.SELECT_PROTOCOL, {
                                protocol: "udp",
                                data: {
                                    address: localIP,
                                    port: localPort,
                                    mode: ENCRYPTION_MODE
                                }
                            });
                        });
                        this.udpSocket.on("error", (err, msg) => {
                            this.emit("error", err);
                            if(msg) {
                                this.emit("debug", "Voice UDP error: " + msg);
                            }
                            if(this.ready || this.connecting) {
                                this.disconnect(err);
                            }
                        });
                        this.udpSocket.on("close", (err) => {
                            if(err) {
                                this.emit("warn", "Voice UDP close: " + err);
                            }
                            if(this.ready || this.connecting) {
                                this.disconnect(err);
                            }
                        });
                        const udpMessage = Buffer.alloc(70);
                        udpMessage.writeUIntBE(this.ssrc, 0, 4);
                        this._sendPacket(udpMessage);
                    });
                    break;
                }
                case OPCodes.SESSION_DESCRIPTION: {
                    this.mode = packet.d.mode;
                    this.secret = new Uint8Array(new ArrayBuffer(packet.d.secret_key.length));
                    for (let i = 0; i < packet.d.secret_key.length; ++i) {
                        this.secret[i] = packet.d.secret_key[i];
                    }
                    this.connecting = false;
                    this.ready = true;
                    /**
                    * Fired when the voice connection turns ready
                    * @event VoiceConnection#ready
                    */
                    this.emit("ready");
                    this.resume();
                    break;
                }
                case OPCodes.HEARTBEAT: {
                    /**
                    * Fired when the voice connection receives a pong
                    * @event VoiceConnection#pong
                    * @prop {Number} latency The current latency in milliseconds
                    */
                    this.emit("pong", Date.now() - packet.d);
                    break;
                }
                case OPCodes.SPEAKING: {
                    this.ssrcUserMap[packet.d.ssrc] = packet.d.user_id;
                    /**
                    * Fired when a user begins speaking
                    * @event VoiceConnection#speakingStart
                    * @prop {String} userID The ID of the user that began speaking
                    */
                    /**
                    * Fired when a user stops speaking
                    * @event VoiceConnection#speakingStop
                    * @prop {String} userID The ID of the user that stopped speaking
                    */
                    this.emit(packet.d.speaking ? "speakingStart" : "speakingStop", packet.d.user_id);
                    break;
                }
                default: {
                    this.emit("unknown", packet);
                    break;
                }
            }
        });
        this.ws.on("error", (err) => {
            this.emit("error", err);
        });
        this.ws.on("close", (code, reason) => {
            const err = !code || code === 1000 ? null : new Error(code + ": " + reason);
            this.emit("warn", `Voice WS close ${code}: ${reason}`);
            if(this.connecting || this.ready) {
                let reconnecting = true;
                if(code === 4006) {
                    reconnecting = false;
                } else if(code === 1000) {
                    reconnecting = false;
                }
                this.disconnect(err, reconnecting);
                if(reconnecting) {
                    setTimeout(() => this.connect(data), 500);
                }
            }
        });
    }

    disconnect(error, reconnecting) {
        this.connecting = false;
        this.ready = false;
        this.speaking = false;
        this.timestamp = 0;
        this.sequence = 0;

        if(reconnecting) {
            this.pause();
        } else {
            this.stopPlaying();
        }
        if(this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if(this.udpSocket) {
            try {
                this.udpSocket.close();
            } catch(err) {
                if(err.message !== "Not running") {
                    this.emit("error", err);
                }
            }
            this.udpSocket = null;
        }
        if(this.ws) {
            try {
                this.ws.close();
            } catch(err) {
                this.emit("error", err);
            }
            this.ws = null;
        }
        if(reconnecting) {
            if(error) {
                this.emit("error", error);
            }
        } else {
            this.channelID = null;
            this.updateVoiceState();
            /**
            * Fired when the voice connection disconnects
            * @event VoiceConnection#disconnect
            * @prop {Error?} err The error, if any
            */
            this.emit("disconnect", error);
        }
    }

    heartbeat() {
        this.sendWS(OPCodes.HEARTBEAT, Date.now());
    }

    /**
    * Play an audio or video resource. If playing from a non-opus resource, FFMPEG should be compiled with --enable-libopus for best performance. If playing from HTTPS, FFMPEG must be compiled with --enable-openssl
    * @arg {ReadableStream | String} resource The audio or video resource, either a ReadableStream, URL, or file path
    * @arg {Object} [options] Music options
    * @arg {Boolean} [options.inlineVolume=false] Whether to enable on-the-fly volume changing. Note that enabling this leads to increased CPU usage
    * @arg {Number} [options.voiceDataTimeout=2000] Timeout when waiting for voice data (-1 for no timeout)
    * @arg {Array<String>} [options.inputArgs] Additional input parameters to pass to ffmpeg/avconv (before -i)
    * @arg {Array<String>} [options.encoderArgs] Additional encoder parameters to pass to ffmpeg/avconv (after -i)
    * @arg {String} [options.format] The format of the resource. If null, FFmpeg will attempt to guess and play the format. Available options: "dca", "ogg", "webm", "pcm", null
    * @arg {Number} [options.frameDuration=20] The resource opus frame duration (required for DCA/Ogg)
    * @arg {Number} [options.frameSize=2880] The resource opus frame size
    * @arg {Number} [options.sampleRate=48000] The resource audio sampling rate
    */
    play(source, options = {}) {
        if(this.shared) {
            throw new Error("Cannot play stream on shared voice connection");
        }
        if(!this.ready) {
            throw new Error("Not ready yet");
        }

        options.format = options.format || null;
        options.voiceDataTimeout = !isNaN(options.voiceDataTimeout) ? options.voiceDataTimeout : 2000;
        options.inlineVolume = !!options.inlineVolume;
        options.inputArgs = options.inputArgs || [];
        options.encoderArgs = options.encoderArgs || [];

        options.samplingRate = options.samplingRate || this.samplingRate;
        options.frameDuration = options.frameDuration || this.frameDuration;
        options.frameSize = options.frameSize || options.samplingRate * options.frameDuration / 1000;
        options.pcmSize = options.pcmSize || options.frameSize * 2 * this.channels;

        if(!this.piper.encode(source, options)) {
            this.emit("error", new Error("Unable to encode source"));
            return;
        }

        this.ended = false;
        this.current = {
            startTime: 0, // later
            playTime: 0,
            pausedTimestamp: 0,
            pausedTime: 0,
            bufferingTicks: 0,
            options: options,
            timeout: null,
            buffer: null
        };

        this.playing = true;

        /**
        * Fired when the voice connection starts playing a stream
        * @event SharedStream#start
        */
        this.emit("start");

        this._send();
    }

    _send() {
        if(!this.piper.encoding && this.piper.dataPacketCount === 0) {
            return this.stopPlaying();
        }

        this.timestamp += this.current.options.frameSize;
        if(this.timestamp >= 4294967295) {
            this.timestamp -= 4294967295;
        }

        if(++this.sequence >= 65536) {
            this.sequence -= 65536;
        }

        if((this.current.buffer = this.piper.getDataPacket())) {
            if(this.current.startTime === 0) {
                this.current.startTime = Date.now();
            }
            if(this.current.bufferingTicks > 0) {
                this.current.bufferingTicks = 0;
                this.setSpeaking(true);
            }
        } else if(this.current.options.voiceDataTimeout === -1 || this.current.bufferingTicks < this.current.options.voiceDataTimeout / this.current.options.frameDuration) { // wait for data
            if(++this.current.bufferingTicks <= 0) {
                this.setSpeaking(false);
            }
            this.current.pausedTime += 4 * this.current.options.frameDuration;
            this.timestamp += 3 * this.current.options.frameSize;
            if(this.timestamp >= 4294967295) {
                this.timestamp -= 4294967295;
            }
            this.current.timeout = setTimeout(this._send, 4 * this.current.options.frameDuration);
            return;
        } else {
            return this.stopPlaying();
        }

        this._sendPacket(this._createPacket(this.current.buffer));
        this.current.playTime += this.current.options.frameDuration;
        this.current.timeout = setTimeout(this._send, this.current.startTime + this.current.pausedTime + this.current.playTime - Date.now());
    }

    /**
    * Stop the bot from sending audio
    */
    stopPlaying() {
        if(this.ended) {
            return;
        }
        this.ended = true;
        if(this.current && this.current.timeout) {
            clearTimeout(this.current.timeout);
            this.current.timeout = null;
        }
        this.current = null;
        if(this.piper) {
            this.piper.stop();
            this.piper.resetPackets();
        }

        if(this.secret) {
            for(let i = 0; i < 5; i++) {
                this.timestamp += this.frameSize;
                if(this.timestamp >= 4294967295) {
                    this.timestamp -= 4294967295;
                }

                if(++this.sequence >= 65536) {
                    this.sequence -= 65536;
                }

                this._sendPacket(this._createPacket(Buffer.from([0xF8, 0xFF, 0xFE])));
            }
        }
        this.setSpeaking(this.playing = false);

        /**
        * Fired when the voice connection finishes playing a stream
        * @event VoiceConnection#end
        */
        this.emit("end");
    }

    _createPacket(_buffer) {
        this.packetBuffer.writeUIntBE(this.sequence, 2, 2);
        this.packetBuffer.writeUIntBE(this.timestamp, 4, 4);

        this.packetBuffer.copy(this.nonce, 0, 0, 12);

        let {length} = _buffer;
        if(!NaCl) {
            Sodium.crypto_secretbox_easy(this.packetBuffer.slice(12), _buffer, this.nonce, this.secret);
            length += Sodium.crypto_secretbox_MACBYTES;
        } else {
            const buffer = NaCl.secretbox(_buffer, this.nonce, this.secret);
            length += NaCl.lowlevel.crypto_secretbox_BOXZEROBYTES;
            this.packetBuffer.fill(0, 12, 12 + length);
            for (let i = 0; i < length; ++i) {
                this.packetBuffer[12 + i] = buffer[i];
            }
        }

        return this.packetBuffer.slice(0, 12 + length);
    }

    _sendPacket(packet) {
        try {
            this.udpSocket.send(packet, 0, packet.length, this.udpPort, this.udpIP);
        } catch(e) {
            if(this.udpSocket) {
                this.emit("error", e);
            }
        }
    }

    /**
    * Generate a receive stream for the voice connection.
    * @arg {String} [type="pcm"] The desired vocie data type, either "opus" or "pcm"
    * @returns {VoiceDataStream}
    */
    receive(type) {
        if(type === "pcm") {
            if(!this.receiveStreamPCM) {
                this.receiveStreamPCM = new VoiceDataStream(type);
                if(!this.receiveStreamOpus) {
                    this.registerReceiveEventHandler();
                }
            }
        } else if(type === "opus") {
            if(!this.receiveStreamOpus) {
                this.receiveStreamOpus = new VoiceDataStream(type);
                if(!this.receiveStreamPCM) {
                    this.registerReceiveEventHandler();
                }
            }
        } else {
            throw new Error(`Unsupported voice data type: ${type}`);
        }
        return type === "pcm" ? this.receiveStreamPCM : this.receiveStreamOpus;
    }

    registerReceiveEventHandler() {
        this.udpSocket.on("message", (msg) => {
            const nonce = Buffer.alloc(24);
            msg.copy(nonce, 0, 0, 12);
            let data;
            if(!NaCl) {
                data = Buffer.allocUnsafe(msg.length - 12 - Sodium.crypto_secretbox_MACBYTES);
                Sodium.crypto_secretbox_open_easy(data, msg.slice(12), this.nonce, this.secret);
            } else {
                if(!(data = NaCl.secretbox.open(msg.slice(12), nonce, this.secret))) {
                    /**
                    * Fired to warn of something weird but non-breaking happening
                    * @event VoiceConnection#warn
                    * @prop {String} message The warning message
                    */
                    this.emit("warn", "Failed to decrypt received packet");
                    return;
                }
            }
            if(data[0] === 0xBE && data[1] === 0xDE) { // RFC5285 Section 4.2: One-Byte Header
                const rtpHeaderExtensionLength = data[2] << 8 | data[3];
                let index = 4;
                let byte;
                for(let i = 0; i < rtpHeaderExtensionLength; ++i) {
                    byte = data[index];
                    ++index;
                    const l = (byte & 0b1111) + 1;
                    index += l;
                    while(data[index] == 0) {
                        ++index;
                    }
                }
                data = data.slice(index);
            }
            // Have not received a RFC5285 Section 4.3: Two-Byte Header yet, so that is unimplemented for now
            if(this.receiveStreamOpus) {
                /**
                * Fired when a voice data packet is received
                * @event VoiceDataStream#data
                * @prop {Buffer} data The voice data
                * @prop {String} userID The user who sent the voice packet
                * @prop {Number} timestamp The intended timestamp of the packet
                * @prop {Number} sequence The intended sequence number of the packet
                */
                this.receiveStreamOpus.emit("data", data, this.ssrcUserMap[nonce.readUIntBE(8, 4)], nonce.readUIntBE(4, 4), nonce.readUIntBE(2, 2));
            }
            if(this.receiveStreamPCM) {
                data = this.opus.decode(data, this.frameSize);
                if(!data) {
                    return this.emit("warn", "Failed to decode received packet");
                }
                this.receiveStreamPCM.emit("data", data, this.ssrcUserMap[nonce.readUIntBE(8, 4)], nonce.readUIntBE(4, 4), nonce.readUIntBE(2, 2));
            }
        });
    }

    setSpeaking(value) {
        if((value = !!value) != this.speaking) {
            this.speaking = value;
            this.sendWS(OPCodes.SPEAKING, {
                speaking: value,
                delay: 0,
                ssrc: this.ssrc
            });
        }
    }

    /**
    * Switch the voice channel the bot is in. The channel to switch to must be in the same guild as the current voice channel
    * @arg {String} channelID The ID of the voice channel
    */
    switchChannel(channelID, reactive) {
        if(this.channelID === channelID) {
            return;
        }

        this.channelID = channelID;
        if(!reactive) {
            this.updateVoiceState();
        }
    }

    /**
    * Update the bot's voice state
    * @arg {Boolean} selfMute Whether the bot muted itself or not (audio sending is unaffected)
    * @arg {Boolean} selfDeaf Whether the bot deafened itself or not (audio receiving is unaffected)
    */
    updateVoiceState(selfMute, selfDeaf) {
        if(this.shard.sendWS) {
            this.shard.sendWS(Constants.GatewayOPCodes.VOICE_STATE_UPDATE, {
                guild_id: this.id === "call" ? null : this.id,
                channel_id: this.channelID || null,
                self_mute: !!selfMute,
                self_deaf: !!selfDeaf
            });
        }
    }

    sendWS(op, data) {
        if(this.ws && this.ws.readyState === WebSocket.OPEN) {
            data = JSON.stringify({op: op, d: data});
            this.ws.send(data);
            this.emit("debug", data);
        }
    }

    get volume() {
        return this.piper.volumeLevel;
    }

    /**
    * Modify the output volume of the current stream (if inlineVolume is enabled for the current stream)
    * @arg {Number} [volume=1.0] The desired volume. 0.0 is 0%, 1.0 is 100%, 2.0 is 200%, etc. It is not recommended to go above 2.0
    */
    setVolume(volume) {
        this.piper.setVolume(volume);
    }

    /**
    * Pause sending audio (if playing)
    */
    pause() {
        this.paused = true;
        this.setSpeaking(false);
        if(this.current) {
            if(!this.current.pausedTimestamp) {
                this.current.pausedTimestamp = Date.now();
            }
            if(this.current.timeout) {
                clearTimeout(this.current.timeout);
                this.current.timeout = null;
            }
        }
    }

    /**
    * Resume sending audio (if paused)
    */
    resume() {
        this.paused = false;
        this.setSpeaking(true);
        if(this.current) {
            if(this.current.pausedTimestamp) {
                this.current.pausedTime += Date.now() - this.current.pausedTimestamp;
                this.current.pausedTimestamp = 0;
            }
            this._send();
        }
    }

    toJSON() {
        const base = {};
        for(const key in this) {
            if(this.hasOwnProperty(key) && !key.startsWith("_") && !key.endsWith("Interval") && !key.endsWith("Timeout") && !["nonce", "packetBuffer", "piper", "shard", "udpSocket", "ws"].includes(key)) {
                if(!this[key]) {
                    base[key] = this[key];
                } else if(this[key] instanceof Set) {
                    base[key] = Array.from(this[key]);
                } else if(this[key] instanceof Map) {
                    base[key] = Array.from(this[key].values());
                } else if(typeof this[key].toJSON === "function") {
                    base[key] = this[key].toJSON();
                } else {
                    base[key] = this[key];
                }
            }
        }
        if(base.current && base.current.timeout) {
            delete base.current.timeout;
        }
        return base;
    }
}

VoiceConnection._converterCommand = converterCommand;

module.exports = VoiceConnection;
