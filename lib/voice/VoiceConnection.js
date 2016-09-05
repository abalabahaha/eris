"use strict";

const ChildProcess = require("child_process");
const Constants = require("../Constants");
const DCAOpusTransformer = require("./streaming/DCAOpusTransformer");
const Dgram = require("dgram");
const DNS = require("dns");
const FFmpegOggTransformer = require("./streaming/FFmpegOggTransformer");
const FFmpegPCMTransformer = require("./streaming/FFmpegPCMTransformer");
const FS = require("fs");
var NaCl = null;
const OggOpusTransformer = require("./streaming/OggOpusTransformer");
const OPCodes = Constants.VoiceOPCodes;
const PCMOpusTransformer = require("./streaming/PCMOpusTransformer");
const ReadableStream = require("stream").Readable;
const VoiceDataStream = require("./VoiceDataStream");
const VolumeTransformer = require("./streaming/VolumeTransformer");
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
*/
class VoiceConnection extends EventEmitter {
    constructor(guildID, shard) {
        super();
        this.shard = shard;

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

        if(!this.shard.client.opus) {
            try {
                this.shard.client.opus = new (require("node-opus")).OpusEncoder(this.samplingRate, this.channels, OpusScript.Application.AUDIO);
            } catch(err) {
                this.shard.client.emit("debug", "Error initializing node-opus encoder, falling back to opusscript");
                try {
                    this.shard.client.opus = new OpusScript(this.samplingRate, this.channels, OpusScript.Application.AUDIO);
                    this.shard.client.opus.setBitrate(this.bitrate);
                } catch(err) {
                    this.shard.client.emit((shard.client.options.opusOnly ? "warn" : "error"), "No opus encoder found, playing non-opus audio will not work.");
                }
            }
        }

        this.nonce = new Buffer(24);
        this.nonce.fill(0);

        this.packetBuffer = new Buffer(12 + 16 + MAX_FRAME_SIZE);
        this.packetBuffer.fill(0);
        this.packetBuffer[0] = 0x80;
        this.packetBuffer[1] = 0x78;

        this.id = guildID || "call";
        this.channel = null;
        this.paused = true;
        this.speaking = false;
        this.sequence = 0;
        this.timestamp = 0;
        this.ssrcUserMap = {};
        this.dataPackets = [];

        this.transformers = {
            dcaOpus: new DCAOpusTransformer(this),
            ffmpegOgg: new FFmpegOggTransformer(this, this.bitrate, this.frameDuration),
            ffmpegPCM: new FFmpegPCMTransformer(this),
            oggOpus: new OggOpusTransformer(this),
            pcmOpus: new PCMOpusTransformer(this, this.pcmSize, this.frameSize),
            volume: new VolumeTransformer(this)
        };

        this.pickCommand();
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
            console.log(this.ssrcUserMap[nonce.readUIntBE(8, 4)]);
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
                data = this.shard.client.opus.decode(data, this.frameSize);
                if(!data) {
                    return this.emit("warn", "Failed to decode received packet");
                }
                this.receiveStreamPCM.emit("data", data, this.ssrcUserMap[nonce.readUIntBE(8, 4)], nonce.readUIntBE(4, 4), nonce.readUIntBE(2, 2));
            }
        });
    }

    pickCommand() {
        for(var command of ["./ffmpeg", "./avconv", "ffmpeg", "avconv"]) {
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
            return this.switchChannel(channelID);
        }
        this.channel = this.shard.client.getChannel(channelID);
        if(!this.channel) {
            throw new Error(`Channel ${channelID} not found`);
        }
        this.updateVoiceState();
        var serverUpdateTimeout = setTimeout(() => {
            this.voiceServerUpdateCallback = null;
            this.disconnect(new Error("No voice server details received within 4000ms"));
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
                    server_id: this.id === "call" ? this.channel.id : this.id,
                    user_id: this.shard.client.user.id,
                    session_id: this.shard.sessionID,
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
                        this.emit("ping", Date.now() - packet.d);
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
            }, this.shard.client.options.connectionTimeout);
        };
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
            this.channel = null;
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
    * Play an audio or video resource. If playing from HTTPS, FFMPEG must be compiled with --enable-openssl
    * @arg {ReadableStream | String} resource The audio or video resource, either a ReadableStream or URL
    * @arg {Object} [options] Music options (see options parameter in VoiceConnection.playRaw description)
    * @arg {Number} [options.startOffset=0] Set the music start time offset
    * @arg {Boolean} [options.inlineVolume=false] Whether to enable on-the-fly volume changing
    * @arg {Boolean} [options.voiceDataTimeout] Timeout when waiting for voice data (-1 for no timeout)
    */
    play(source, options) {
        options = options || {};
        options.encoding = options.encoding || null;
        options.inlineVolume = !!options.inlineVolume;

        if(this.playing) {
            this.stopPlaying();
        }

        var resolve, reject;
        new Promise(function(res, rej) {
            resolve = res;
            reject = rej;
        }).then((source) => {
            if(options.encoding === "dca") {
                this.transformers.dcaOpus.attach(source);
                source = this.transformers.dcaOpus;
            } else if(options.encoding === "oggopus") {
                this.transformers.oggOpus.attach(source);
                source = this.transformers.oggOpus;
            } else if(options.inlineVolume) {
                if(options.encoding !== "pcm") {
                    this.transformers.ffmpegPCM.attach(source);
                    source = this.transformers.ffmpegPCM.stream;
                }
                this.transformers.volume.attach(source);
                this.transformers.pcmOpus.attach(this.transformers.volume);
                source = this.transformers.pcmOpus;
            } else {
                this.transformers.ffmpegOgg.attach(source);
                this.transformers.oggOpus.attach(this.transformers.ffmpegOgg.stream);
                source = this.transformers.oggOpus;
            }

            this._play(source, options);
        }).catch((err) => {
            this.emit("error", err);
        });

        if(typeof source === "string") {
            if(!options.encoding || options.encoding === "pcm") {
                resolve(source);
            } else if(source.startsWith("http://") || source.startsWith("https://")) {
                reject(new Error("Unrecognized source type")); // TODO resolve(httpRequestStream);
            } else {
                FS.stat(source, function(err) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(FS.createReadStream(source));
                    }
                });
            }
        } else if(source instanceof Buffer) {
            reject(new Error("Unrecognized source type")); // TODO resolve(streamify);
        } else if(source instanceof ReadableStream) {
            resolve(source);
        } else {
            reject(new Error("Unrecognized source type"));
        }
    }

    _play(source, options) {
        options = options || {};

        var startTime = Date.now();
        var packets = 0;
        var waitingForData = 0;
        var voiceDataTimeout = options.voiceDataTimeout !== undefined ? options.voiceDataTimeout : this.shard.client.options.voiceDataTimeout;
        var buffer;
        var pausedTime = 0;
        var ending = false;

        var addPacket = (packet) => {
            this.dataPackets.push(packet);
            if(this.dataPackets.length > 100) {
                source.pause();
                setTimeout(() => {
                    source.resume();
                }, this.frameDuration * 50);
            }
        };

        source.on("data", addPacket);

        var tellEnd = () => {
            if(ending) {
                return;
            }
            ending = true;

            source.removeListener("data", addPacket);

            this.stopPlaying();

            source.unattach();

            this.dataPackets = [];

            /**
            * Fired when the voice connection finishes playing a stream
            * @event VoiceConnection#end
            */
            this.emit("end");
        };

        var send = () => {
            try {
                if(source.destroyed) {
                    this.setSpeaking(false);
                    tellEnd();
                    return;
                }

                if(this.paused && this.playing) {
                    pausedTime += 5 * this.frameDuration;
                    this.timestamp += 5 * this.frameDuration;
                    if(this.timestamp >= 4294967295) {
                        this.timestamp -= 4294967295;
                    }
                    return setTimeout(send, 5 * this.frameDuration);
                }

                this.timestamp += this.frameSize;
                if(this.timestamp >= 4294967295) {
                    this.timestamp -= 4294967295;
                }

                if(++this.sequence >= 65536) {
                    this.sequence -= 65536;
                }

                buffer = this.dataPackets.shift();
                if(!buffer && this.playing && (voiceDataTimeout === -1 || waitingForData <= voiceDataTimeout / this.frameDuration)) { // wait for data
                    if(++waitingForData <= 5) {
                        this.setSpeaking(false);
                        buffer = SILENCE;
                    } else {
                        pausedTime += 2 * this.frameDuration;
                        this.timestamp += 2 * this.frameDuration;
                        if(this.timestamp >= 4294967295) {
                            this.timestamp -= 4294967295;
                        }
                        return setTimeout(send, 2 * this.frameDuration);
                    }
                } else if(!buffer || !this.playing || !this.ready) {
                    this.playing = false;
                    for(var i = 1; i <= 5; ++i) {
                        this.timestamp += this.frameSize;
                        if(this.timestamp >= 4294967295) {
                            this.timestamp -= 4294967295;
                        }

                        if(++this.sequence >= 65536) {
                            this.sequence -= 65536;
                        }

                        this.sendPacket(this.createPacket(SILENCE));
                    }
                    return tellEnd();
                } else {
                    waitingForData = 0;
                    this.setSpeaking(true);
                }

                if(this.sendPacket(this.createPacket(buffer))) {
                    return setTimeout(send, startTime + pausedTime + ++packets * this.frameDuration - Date.now());
                }

                tellEnd();
            } catch(e) {
                this.emit("error", e);
                tellEnd();
            }
        };

        if(this.playing) {
            this.playing = false;
            setTimeout(() => {
                this.playing = true;
                this.emit("start");
                send();
                /**
                * Fired when the voice connection starts playing a stream
                * @event VoiceConnection#start
                */
            }, 15 * this.frameDuration);
        } else {
            this.playing = true;
            this.emit("start");
            send();
        }
    }

    createPacket(buffer) {
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

    sendPacket(packet) {
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
    switchChannel(channelID) {
        if(this.channel && this.channel.id === channelID) {
            return;
        }
        this.channel = this.shard.client.getChannel(channelID);
        if(!this.channel) {
            throw new Error(`Channel ${channelID} not found`);
        }
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
            channel_id: this.channel ? this.channel.id : null,
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
    * Modify the output volume of the current stream (if inlineVoice is enabled for the current stream)
    * @arg {Number} [volume=1.0] The desired volume. 0.0 is 0%, 1.0 is 100%, 2.0 is 200%, etc. It is not recommended to go above 2.0
    */
    setVolume(volume) {
        this.transformers.volume.setVolume(volume);
    }

    /**
    * Stop the bot from sending audio
    */
    stopPlaying() {
        this.setSpeaking(this.playing = false);

        this.dataPackets = [];
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
