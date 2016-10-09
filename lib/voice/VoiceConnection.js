"use strict";

const ChildProcess = require("child_process");
const Constants = require("../Constants");
const Dgram = require("dgram");
const DNS = require("dns");
var NaCl = null;
const OPCodes = Constants.VoiceOPCodes;
const Piper = require("./Piper");
const VoiceDataStream = require("./VoiceDataStream");
const WebSocket = typeof window !== "undefined" ? window.WebSocket : require("ws");

var EventEmitter;
try {
    EventEmitter = require("eventemitter3");
} catch(err) {
    EventEmitter = require("events").EventEmitter;
}
var OpusScript;
try {
    OpusScript = require("opusscript");
} catch(err) { // eslint-disable no-empty
}

const MAX_FRAME_SIZE = 1276 * 3;
const ENCRYPTION_MODE = "xsalsa20_poly1305";
const SILENCE = new Buffer([0xF8, 0xFF, 0xFE]);

/**
* Represents a voice connection
* @extends EventEmitter
* @prop {String} id The ID of the voice connection (guild ID)
* @prop {String} channelID The ID of the voice connection's current channel
* @prop {Boolean} connecting Whether the voice connection is connecting
* @prop {Boolean} ready Whether the voice connection is ready
* @prop {Boolean} playing Whether the voice connection is playing something
* @prop {Boolean} paused Whether the voice connection is paused
* @prop {Number} playTime Position of playback of current resource in milliseconds
*/
class VoiceConnection extends EventEmitter {
    constructor(guildID, userID, sessionID, shard, shared) {
        super();

        if(typeof window !== "undefined") {
            throw new Error("Voice is not supported in browsers at this time");
        }

        try {
            NaCl = require("tweetnacl");
        } catch(err) {
            throw new Error("error loading tweetnacl, voice not available");
        }

        this.samplingRate = 48000;
        this.channels = 2;
        this.frameDuration = 60;
        this.frameSize = this.samplingRate * this.frameDuration / 1000;
        this.pcmSize = this.frameSize * this.channels * 2;
        this.bitrate = 64000;
        this.shared = shared;

        if (!this.shared) {
            if(this.shard && this.shard.client.opus) {
                this.opus = this.shard.client.opus;
            } else {
                try {
                    this.opus = new (require("node-opus")).OpusEncoder(this.samplingRate, this.channels, OpusScript.Application.AUDIO);
                } catch(err) {
                    this.emit("debug", "Error initializing node-opus encoder, falling back to opusscript");
                    try {
                        this.opus = new OpusScript(this.samplingRate, this.channels, OpusScript.Application.AUDIO);
                        this.opus.setBitrate(this.bitrate);
                    } catch(err) {
                        this.emit((shard.client.options.opusOnly ? "warn" : "error"), "No opus encoder found, playing non-opus audio will not work.");
                    }
                }
                if(this.shard) {
                    this.shard.client.opus = this.opus;
                }
            }
        }

        this.id = guildID || "call";
        this.userID = userID;
        this.sessionID = sessionID;
        this.shard = shard;
        this.channelID = null;
        this.paused = true;
        this.speaking = false;
        this.sequence = 0;
        this.timestamp = 0;
        this.playTime = 0;
        this.ssrcUserMap = {};
        this.converterCommand = null;

        this.nonce = new Buffer(24);
        this.nonce.fill(0);

        this.packetBuffer = new Buffer(12 + 16 + MAX_FRAME_SIZE);
        this.packetBuffer.fill(0);
        this.packetBuffer[0] = 0x80;
        this.packetBuffer[1] = 0x78;

        if (!this.shared) {
            var pick = this.pickCommand();
            if(pick instanceof Error) {
                this.emit("error", pick);
            }

            this.piper = new Piper(this.converterCommand, this.opus);
            this.piper.on("error", (e) => this.emit("error", e));

            if(pick && this.converterCommand) {
                this.piper.libopus = false;
            }
        }
    }

    /**
    * Tells the voice connection to connect to a channel
    * @arg {String} channelID The ID of the voice channel
    */
    connect(channelID) {
        if(this.ws && this.ws.readyState !== WebSocket.CLOSED) {
            return this.switchChannel(channelID);
        }

        this.channelID = channelID;
        this.updateVoiceState();
        this.serverUpdateTimeout = setTimeout(() => {
            this.disconnect(new Error("No voice server details received within 4000ms"));
        }, 4000);
    }

    voiceServerUpdateCallback(data) {
        if(this.serverUpdateTimeout) {
            clearTimeout(this.serverUpdateTimeout);
            this.serverUpdateTimeout = null;
        }
        if(this.ws && this.ws.readyState !== WebSocket.CLOSED) {
            this.disconnect(undefined, true);
        }
        this.endpoint = data.endpoint.split(":")[0];
        this.ws = new WebSocket("wss://" + this.endpoint);
        this.ws.on("open", () => {
            /**
            * Fired when the voice connection connects
            * @event VoiceConnection#connect
            */
            this.emit("connect");
            this.sendWS(OPCodes.IDENTIFY, {
                server_id: this.id === "call" ? this.channelID : this.id,
                user_id: this.userID,
                session_id: this.sessionID,
                token: data.token
            });
        });
        this.ws.on("message", (m) => {
            var packet = JSON.parse(m);
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
                    this.modes = packet.d.modes;
                    if(!~this.modes.indexOf(ENCRYPTION_MODE)) {
                        throw new Error("No supported voice mode found");
                    }
                    this.udpPort = packet.d.port;
                    DNS.lookup(this.endpoint, (err, address) => { // RIP DNS
                        if(err) {
                            this.emit("error", err);
                            return;
                        }

                        this.udpIP = address;

                        /**
                        * Fired when stuff happens and gives more info
                        * @event VoiceConnection#debug
                        * @prop {String} message The debug message
                        */
                        this.emit("debug", "Connecting to UDP: " + this.udpIP + ":" + this.udpPort);

                        this.udpSocket = Dgram.createSocket("udp4");
                        this.udpSocket.once("message", (packet) => {
                            var localIP = "";
                            var i = 3;
                            while(++i < packet.indexOf(0, i)) {
                                localIP += String.fromCharCode(packet[i]);
                            }
                            var localPort = parseInt(packet.readUIntLE(packet.length - 2, 2).toString(10));

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
                            if(this.ready) {
                                this.disconnect(err);
                            }
                        });
                        this.udpSocket.on("close", (err) => {
                            if(err) {
                                this.emit("warn", "Voice UDP close: " + err);
                            }
                            if(this.ready) {
                                this.disconnect(err);
                            }
                        });
                        var udpMessage = new Buffer(70);
                        udpMessage.fill(0);
                        udpMessage.writeUIntBE(this.ssrc, 0, 4);
                        this._sendPacket(udpMessage, (err) => {
                            if(err) {
                                this.emit("error", "Voice UDP error: " + err);
                            }
                        });
                    });
                    break;
                }
                case OPCodes.SESSION_DESCRIPTION: {
                    this.mode = packet.d.mode;
                    this.secret = new Uint8Array(new ArrayBuffer(packet.d.secret_key.length));
                    for (var i = 0; i < packet.d.secret_key.length; ++i) {
                        this.secret[i] = packet.d.secret_key[i];
                    }
                    this.ready = true;
                    /**
                    * Fired when the voice connection turns ready
                    * @event VoiceConnection#ready
                    */
                    this.emit("ready");
                    this.paused = false;
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
                    this.emit(packet.d.speaking ? "speakingStart" : "speakingStop", packet.d.user_id);
                    break;
                }
                default: {
                    this.emit("unknown", packet);
                    break;
                }
            }
        });
        this.ws.on("close", (code, err) => {
            this.emit("warn", `Voice WS close ${code}` + (err && " | " + err));
            if(this.ready) {
                this.disconnect(err);
            }
        });
        setTimeout(() => {
            if(this.connecting) {
                this.disconnect(new Error("Voice connection timeout"));
            }
        }, this.shard && this.shard.client ? this.shard.client.options.connectionTimeout : 10000);
    }

    /**
    * Tells the voice connection to disconnect
    * @arg {Error} [err] The error, if any
    * @arg {Boolean} [reconnecting] Whether the voice connection is reconnecting or not
    */
    disconnect(error, reconnecting) {
        this.ready = false;
        this.speaking = false;
        if(reconnecting) {
            this.paused = true;
        } else {
            this.playing = false;
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
            this.ws.close();
            this.ws = null;
        }
        if(!reconnecting) {
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
    * @arg {Object} [options] Music options (see options parameter in VoiceConnection.playRaw description)
    * @arg {Boolean} [options.inlineVolume=false] Whether to enable on-the-fly volume changing. Note that enabling this leads to increased CPU usage
    * @arg {Number} [options.voiceDataTimeout=2000] Timeout when waiting for voice data (-1 for no timeout)
    * @arg {Array<String>} [options.encoderArgs] Additional parameters to pass to ffmpeg/avconv
    * @arg {String} [options.format] The format of the resource. If null, FFmpeg will attempt to guess and play the format. Available options: "dca", "ogg", "pcm", null
    * @arg {Number} [options.frameDuration=60] The resource opus frame duration (required for DCA/Ogg)
    * @arg {Number} [options.frameSize=2880] The resource opus frame size
    * @arg {Number} [options.sampleRate=48000] The resource audio sampling rate
    */
    play(source, options) {
        options = options || {};
        options.format = options.format || null;
        options.voiceDataTimeout = !isNaN(options.voiceDataTimeout) ? options.voiceDataTimeout : 2000;
        options.inlineVolume = !!options.inlineVolume;
        options.encoderArgs = options.encoderArgs || [];

        options.samplingRate = options.samplingRate || this.samplingRate;
        options.frameDuration = options.frameDuration || this.frameDuration;
        options.frameSize = options.frameSize || options.samplingRate * options.frameDuration / 1000;
        options.pcmSize = options.pcmSize || options.frameSize * 2 * this.channels;

        if(!this.piper.encode(source, options)) {
            this.emit("error", new Error("Unable to encode source"));
            return;
        }

        this._play(options);
    }

    _play(options) {
        var startTime = Date.now();
        var waitingForData = 0;
        var buffer;
        var pausedTime = 0;

        this.playTime = 0;
        this.ended = false;

        var send = () => {
            if(!this.piper.encoding && this.piper.dataPacketCount === 0) {
                return this._stopPlaying();
            }

            if(this.paused && this.playing) {
                pausedTime += 4 * options.frameDuration;
                this.timestamp += 4 * options.frameSize;
                if(this.timestamp >= 4294967295) {
                    this.timestamp -= 4294967295;
                }
                return setTimeout(send, 4 * options.frameDuration);
            }

            if(!this.playing || !this.ready) {
                return this._stopPlaying();
            }

            this.timestamp += options.frameSize;
            if(this.timestamp >= 4294967295) {
                this.timestamp -= 4294967295;
            }

            if(++this.sequence >= 65536) {
                this.sequence -= 65536;
            }

            if((buffer = this.piper.getDataPacket())) {
                if(waitingForData > 0) {
                    waitingForData = 0;
                    this.setSpeaking(true);
                }
            } else if(options.voiceDataTimeout === -1 || waitingForData < options.voiceDataTimeout / options.frameDuration) { // wait for data
                if(++waitingForData <= 5) {
                    this.setSpeaking(false);
                    buffer = SILENCE;
                } else {
                    pausedTime += 4 * options.frameDuration;
                    this.timestamp += 4 * options.frameSize;
                    if(this.timestamp >= 4294967295) {
                        this.timestamp -= 4294967295;
                    }
                    return setTimeout(send, 4 * options.frameDuration);
                }
            } else {
                return this._stopPlaying();
            }

            if(this._sendPacket(this._createPacket(buffer))) {
                this.playTime += options.frameDuration;
                return setTimeout(send, startTime + pausedTime + this.playTime - Date.now());
            }

            this._stopPlaying();
        };

        this.playing = true;
        /**
        * Fired when the voice connection starts playing a stream
        * @event VoiceConnection#start
        */
        this.emit("start");
        send();
    }

    _stopPlaying() {
        if(this.ended) {
            return;
        }
        this.ended = true;

        if (!this.shared) {
            this.piper.stop();
        }

        for(var i = 0; i < 5; i++) {
            this.timestamp += this.frameSize;
            if(this.timestamp >= 4294967295) {
                this.timestamp -= 4294967295;
            }

            if(++this.sequence >= 65536) {
                this.sequence -= 65536;
            }

            this._sendPacket(this._createPacket(SILENCE));
        }

        this.setSpeaking(false);
        this.playTime = 0;
        this.stopPlaying();

        /**
        * Fired when the voice connection finishes playing a stream
        * @event VoiceConnection#end
        */
        this.emit("end");
    }

    _createPacket(buffer) {
        this.packetBuffer.writeUIntBE(this.sequence, 2, 2);
        this.packetBuffer.writeUIntBE(this.timestamp, 4, 4);

        this.packetBuffer.copy(this.nonce, 0, 0, 12);

        buffer = NaCl.secretbox(buffer, this.nonce, this.secret);

        this.packetBuffer.fill(0, 12, 12 + buffer.length);
        for (var i = 0; i < buffer.length; ++i) {
            this.packetBuffer[12 + i] = buffer[i];
        }

        return this.packetBuffer.slice(0, 12 + buffer.length);
    }

    _sendPacket(packet) {
        try {
            this.udpSocket.send(packet, 0, packet.length, this.udpPort, this.udpIP);
            return true;
        } catch(e) {
            if(this.udpSocket) {
                this.emit("error", e);
            }
        }
        return false;
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
            var nonce = new Buffer(24);
            nonce.fill(0);
            msg.copy(nonce, 0, 0, 12);
            var data = NaCl.secretbox.open(msg.slice(12), nonce, this.secret);
            if(!data) {
                /**
                * Fired to warn of something weird but non-breaking happening
                * @event VoiceConnection#warn
                * @prop {String} message The warning message
                */
                this.emit("warn", "Failed to decrypt received packet");
                return;
            }
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

    pickCommand() {
        var tenative;
        for(var command of ["./ffmpeg", "./avconv", "ffmpeg", "avconv"]) {
            var res = ChildProcess.spawnSync(command, ["-encoders"]);
            if(!res.error) {
                if(!res.stdout.toString().includes("libopus")) {
                    tenative = command;
                    continue;
                }
                this.converterCommand = command;
                return;
            }
        }
        if(tenative) {
            return (this.converterCommand = tenative) + " does not have libopus support. Non-opus playback may be laggy";
        }
        throw new Error("Neither ffmpeg nor avconv was found. Make sure you installed either one, and check that it is in your PATH");
    }

    setSpeaking(value) {
        if((value = !!value) != this.speaking) {
            this.speaking = value;
            this.sendWS(OPCodes.SPEAKING, {
                speaking: value,
                delay: 0
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
        if(this.shard) {
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
        }
    }

    /**
    * Modify the output volume of the current stream (if inlineVoice is enabled for the current stream)
    * @arg {Number} [volume=1.0] The desired volume. 0.0 is 0%, 1.0 is 100%, 2.0 is 200%, etc. It is not recommended to go above 2.0
    */
    setVolume(volume) {
        this.piper.setVolume(volume);
    }

    /**
    * Stop the bot from sending audio
    */
    stopPlaying() {
        this.piper.stop();
        this.piper.resetPackets();

        this.setSpeaking(this.playing = false);
    }

    /**
    * Pause sending audio (if playing)
    */
    pause() {
        this.paused = true;
    }

    /**
    * Resume sending audio (if paused)
    */
    resume() {
        this.paused = false;
    }

    join(channelID) {
        return this.connect(channelID);
    }

    leave() {
        return this.disconnect();
    }
}

module.exports = VoiceConnection;
