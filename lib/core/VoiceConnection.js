"use strict";

const ChildProcess = require("child_process");
const Constants = require("../Constants");
const DNS = require("dns");
const Dgram = require("dgram");
const EventEmitter = require('events').EventEmitter;
const FS = require("fs");
var NaCl = null;
const OPCodes = Constants.VoiceOPCodes;
const Util = require("util");
const WebSocket = require("ws");

const encryptionMode = "xsalsa20_poly1305";
const tfNonce = new Buffer(24);
tfNonce.fill(0);
const silence = new Uint8Array([0xF8, 0xFF, 0xFE]);

/**
* Represents a voice connection
* @extends EventEmitter
* @prop {String} id The ID of the voice connection (guild ID)
* @prop {String} channelID The ID of the voice connection's current channel
* @prop {Collection} voiceConnections Collection of VoiceConnections
* @prop {Boolean} connecting Whether the voice connection is connecting
* @prop {Boolean} ready Whether the voice connection is ready
* @prop {Boolean} playing Whether the voice connection is playing something
*/
class VoiceConnection extends EventEmitter {
    constructor(guildID, shard) {
        super();
        this.id = guildID || "call";
        this.channelID = null;
        this.shard = shard;
        try {
            this.opus = new (require("node-opus")).OpusEncoder(48000, 2);
        } catch(err) {
            if(this.shard.client.options.opusOnly) {
                /**
                * Fired to warn of something weird but non-breaking happening
                * @event VoiceConnection#warn
                * @prop {String} message The warning message
                */
                this.emit("warn", "error loading node-opus, non-opus playback not supported");
            } else {
                /**
                * Fired when the voice connection encounters an error
                * @event VoiceConnection#error
                * @prop {Error} err The error
                */
                this.emit("error", err);
                throw new Error("error loading node-opus, non-opus playback not available. Set the client option opusOnly to true to suppress this");
            }
        }
        try {
            NaCl = require("tweetnacl");
        } catch(err) {
            throw new Error("error loading tweetnacl, voice not available");
        }
        this.pickCommand();
    }

    /**
    * Generate the receive stream of the voice connection. The stream will fire a "data" event with a voice data packet every time a valid voice packet is received
    * @arg {Boolean} [pcm=false] Whether you want PCM or opus data
    */
    receive(pcm) {
        if(!this.receiveStream) {
            this.receiveStream = new EventEmitter();
            this.udpSocket.on("message", (msg) => {
                var nonce = new Buffer(tfNonce);
                nonce.fill(0);
                msg.copy(nonce, 0, 0, 12);
                var data = NaCl.secretbox.open(msg.slice(12), nonce, this.secret);
                if(!data) {
                    this.emit("warn", "Failed to decrypt received packet");
                    return;
                }
                data = new Buffer(data);
                if(!this.receiveStream.pcm || (data = this.opus.decode(data, 1920))) {
                    this.receiveStream.emit("data", data);
                }
            });
        }
        this.receiveStream.pcm = pcm;
        return this.receiveStream;
    }

    pickCommand() {
        for(var command of ["ffmpeg", "avconv"]) {
            if(!ChildProcess.spawnSync(command, ["-h"]).error) {
                this.converterCommand = command;
                return;
            }
        }
        throw new Error("Neither ffmpeg nor avconv was found. Make sure you install either one, and check that it is in your PATH");
    }

    /**
    * Tells the voice connection to connect to a channel
    * @arg {String} channelID The ID of the voice channel
    */
    connect(channelID) {
        if(this.ws && this.ws.readyState !== WebSocket.CLOSED) {
            return;
        }
        this.channelID = channelID;
        this.updateVoiceState();
        var serverUpdateTimeout = setTimeout(() => {
            if(!this.ws) {
                this.voiceServerUpdateCallback = null;
                this.disconnect(new Error("No voice server details received within 4000ms"));
            }
        }, 4000);
        this.voiceServerUpdateCallback = (data) => {
            clearTimeout(serverUpdateTimeout);
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
                    user_id: this.shard.client.user.id,
                    session_id: this.shard.sessionID,
                    token: data.token
                });
            });
            this.ws.on("message", (m) => {
                var packet = JSON.parse(m);
                switch(packet.op) {
                    case OPCodes.READY: {
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
                        this.modes = packet.d.modes;
                        if(!~this.modes.indexOf(encryptionMode)) {
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
                            this.udpSocket.once("message", (m) => {
                                var packet = new Buffer(m);

                                var localIP = "";
                                var i = 4;
                                while(i < packet.indexOf(0, i)) {
                                    localIP += String.fromCharCode(packet[i++]);
                                }
                                var localPort = parseInt(packet.readUIntLE(packet.length - 2, 2).toString(10));

                                this.sendWS(OPCodes.SELECT_PROTOCOL, {
                                    protocol: "udp",
                                    data: {
                                        address: localIP,
                                        port: localPort,
                                        mode: encryptionMode
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
                            udpMessage.writeUIntBE(this.ssrc, 0, 4);
                            this.sendPacket(udpMessage, (err) => {
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
                        this.paused = false;
                        this.ready = true;
                        /**
                        * Fired when the voice connection turns ready
                        * @event VoiceConnection#ready
                        */
                        this.emit("ready");
                        break;
                    }
                }
            });
            this.ws.on("error", (err, msg) => {
                this.emit("error", err);
                if(msg) {
                    this.emit("debug", "Voice WS error: " + msg);
                }
                if(this.ready) {
                    this.disconnect(err);
                }
            });
            this.ws.on("close", (code, err) => {
                if(err) {
                    this.emit("warn", "Voice WS close: " + err);
                }
                if(this.ready) {
                    this.disconnect(err);
                }
            });
            setTimeout(() => {
                if(this.connecting) {
                    this.disconnect(new Error("Voice connection timeout"));
                }
            }, this.shard.client.options.connectionTimeout);
        };
    }

    /**
    * Tells the voice connection to disconnect
    * @arg {Error} [err] The error, if any
    * @arg {Boolean} [reconnecting] Whether the voice connection is reconnecting or not
    */
    disconnect(error, reconnecting) {
        this.ready = this.playing = false;
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
        if(!reconnecting) {
            this.channelID = null;
            this.updateVoiceState();
            if(this.ws) {
                this.ws.close();
                this.ws = null;
            }
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
    * Play a music file
    * @arg {String} filepath The filepath of the music file
    * @arg {Object} [options] Music options (see options parameter in VoiceConnection.playStream description)
    */
    playFile(filename, options) {
        this.playStream(FS.createReadStream(filename, options));
    }

    /**
    * Play a music stream
    * @arg {ReadableStream} stream The music stream
    * @arg {Object} [options] Music options (see options parameter in VoiceConnection.playRaw description)
    * @arg {Number} [startOffset=0] Set the music start time offset
    */
    playStream(stream, options) {
        options = options || {};
        options.startOffset = options.startOffset || 0;
        var encoder = ChildProcess.spawn(this.converterCommand, [
            "-loglevel", "0",
            "-i", "-",
            "-f", "s16le",
            "-ar", "48000",
            "-ss", options.startOffset.toString(),
            "pipe:1"
        ], {stdio: ["pipe", "pipe", "ignore"]});

        stream.pipe(encoder.stdin);

        var onError = (e) => {
            encoder.kill();
            
            if(typeof stream.destroy === 'function') {
                stream.destroy();
            }

            if(e && this.playing) {
                this.emit("error", e);
            }
        };

        stream.on("error", onError);

        encoder.stdin.on("error", onError);

        encoder.stdout.on("error", onError);
        encoder.stdout.on("end", onError);
        encoder.stdout.on("close", onError);

        this.playRawStream(encoder.stdout, options);
    }

    /**
    * Play a raw PCM stream
    * @arg {ReadableStream} stream The raw stream
    * @arg {Object} [options] Music options (see options parameter in VoiceConnection.playRaw description)
    */
    playRawStream(stream, options) {
        if(!this.opus) {
            try {
                stream.destroy();
            } catch(err) {
                this.emit("error", err);
            }
            throw new Error("node-opus not found, non-opus playback not supported");
        }
        stream.once("readable", () => {
            this.playRaw(stream, (source) => {
                var buffer = source.read(3840); // 1920 * 2
                if(!buffer) {
                    return null;
                }

                if (buffer.length !== 3840) {
                    var newBuffer = new Buffer(3840).fill(0);
                    buffer.copy(newBuffer);
                    buffer = newBuffer;
                }

                return this.opus.encode(buffer, 1920);
            }, options);
        });
    }

    /**
    * Play a DCA stream
    * @arg {ReadableStream} stream The DCA stream
    * @arg {Object} [options] Music options (see options parameter in VoiceConnection.playRaw description)
    */
    playDCA(stream, options) {
        if(typeof stream === "string") {
            stream = FS.createReadStream(stream);
        }
        var onReadable = () => {
            var dcaVersion = stream.read(4);
            if(!dcaVersion) {
                return;
            }
            stream.removeListener("readable", onReadable);
            if(dcaVersion[0] !== 68 || dcaVersion[1] !== 67 || dcaVersion[2] !== 65) { // DCA0 or invalid
                stream.unshift(dcaVersion);
            } else if(dcaVersion[3] === 49) { // DCA1
                var jsonLength = stream.read(4).readInt32LE(0);
                var jsonMetadata = stream.read(jsonLength);
                this.emit("debug", jsonMetadata.toString());
            }

            this.playRaw(stream, (source) => {
                var opusLen = source.read(2);
                if(!opusLen) {
                    return null;
                }
                return source.read(opusLen.readUInt16LE(0));
            }, options);
        };
        stream.on("readable", onReadable);
    }

    /**
    * Play a raw opus data stream
    * @arg {ReadableStream} stream The opus data stream
    * @arg {function} opusBufferGenerator A function that returns opus data when passed a stream
    * @arg {Object} [options] Music options
    * @arg {Boolean} [options.voiceDataTimeout] Timeout when waiting for voice data (-1 for no timeout)
    */
    playRaw(source, opusBufferGenerator, options) {
        options = options || {};

        var startTime = Date.now();
        var sequence = 0;
        var timestamp = 0;
        var length = 20;
        var waitingForData = 0;
        var voiceDataTimeout = options.voiceDataTimeout !== undefined ? voiceDataTimeout : this.shard.client.options.voiceDataTimeout;
        var buffer;

        this.playing = true;

        var send = () => {
            try {
                if(source.destroyed) {
                    this.setSpeaking(false);
                    /**
                    * Fired when the voice connection finishes playing a stream
                    * @event VoiceConnection#end
                    */
                    this.emit("end");
                    return;
                }

                timestamp += 960;
                if(timestamp >= 4294967295) {
                    timestamp -= 4294967295;
                }

                if(++sequence >= 65536) {
                    sequence -= 65536;
                }

                if(this.paused && this.playing) {
                    return setTimeout(send, 10 * length);
                }

                buffer = opusBufferGenerator(source);
                if(!buffer && (voiceDataTimeout === -1 || waitingForData <= voiceDataTimeout / length) && this.playing) { // wait for data
                    waitingForData++;
                    buffer = silence; // dead silence
                    this.setSpeaking(false);
                } else if(!buffer || !this.playing || !this.ready) {
                    this.setSpeaking(false);
                    try {
                        source.destroy();
                    } catch(err) {
                        this.emit("error", err);
                    }
                    for(var i = 1; i <= 5; ++i) {
                        this.sendPacket(this.createPacket(sequence + i, timestamp + i * 960, silence));
                    }
                    this.emit("end");
                    return;
                } else {
                    waitingForData = 0;
                    this.setSpeaking(true);
                }

                if(this.sendPacket(this.createPacket(sequence, timestamp, buffer))) {
                    setTimeout(send, startTime + sequence * length - Date.now());
                }
            } catch(e) {
                this.emit("error", e);
                this.emit("end");
            }
        };

        this.setSpeaking(true);
        send();
    }

    createPacket(sequence, timestamp, buffer) {
        var packetBuffer = new Buffer(buffer.length + 12 + 16); // seq, timestamp, and ssrc; secret
        packetBuffer.fill(0);
        packetBuffer[0] = 0x80;
        packetBuffer[1] = 0x78;

        packetBuffer.writeUIntBE(sequence, 2, 2);
        packetBuffer.writeUIntBE(timestamp, 4, 4);
        packetBuffer.writeUIntBE(this.ssrc, 8, 4);

        var nonce = new Buffer(tfNonce);
        packetBuffer.copy(nonce, 0, 0, 12);
        buffer = NaCl.secretbox(buffer, nonce, this.secret);

        for (var i = 0; i < buffer.length; ++i) {
            packetBuffer[i + 12] = buffer[i];
        }

        return packetBuffer;
    }

    sendPacket(packet) {
        if(this.udpSocket) {
            try {
                this.udpSocket.send(packet, 0, packet.length, this.udpPort, this.udpIP);
                return true;
            } catch(e) {
                this.emit("error", e);
            }
        }
        return false;
    }

    setSpeaking(value) {
        if(value != this.speaking) {
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
    switchChannel(channelID) {
        this.channelID = channelID;
        this.updateVoiceState();
    }

    /**
    * Update the bot's voice state
    * @arg {Boolean} selfMute Whether the bot muted itself or not (audio sending is unaffected)
    * @arg {Boolean} selfDeaf Whether the bot deafened itself or not (audio receiving is unaffected)
    */
    updateVoiceState(selfMute, selfDeaf) {
        this.shard.sendWS(Constants.GatewayOPCodes.VOICE_STATE_UPDATE, {
            guild_id: this.id === "call" ? null : this.id,
            channel_id: this.channelID,
            self_mute: !!selfMute,
            self_deaf: !!selfDeaf
        });
    }

    sendWS(op, data) {
        if(this.ws && this.ws.readyState === WebSocket.OPEN) {
            data = JSON.stringify({op: op, d: data});
            this.ws.send(data);
        }
    }

    /**
    * Stop the bot from sending audio
    */
    stopPlaying() {
        this.playing = false;
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
}

module.exports = VoiceConnection;