"use strict";

const ChildProcess = require("child_process");
const Piper = require("./Piper");
const VoiceConnection = require("./VoiceConnection");
const Collection = require("../util/Collection");

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

const SILENCE = new Buffer([0xF8, 0xFF, 0xFE]);

/**
* Represents a collection of VoiceConnections sharing an input stream
* @extends EventEmitter
*/
class SharedStream extends EventEmitter {
    constructor(client, source, userAgent) {
        super();

        if(typeof window !== "undefined") {
            throw new Error("Voice is not supported in browsers at this time");
        }

        this.client = client;

        this.samplingRate = 48000;
        this.channels = 2;
        this.frameDuration = 60;
        this.frameSize = this.samplingRate * this.frameDuration / 1000;
        this.pcmSize = this.frameSize * this.channels * 2;
        this.bitrate = 64000;

        try {
            this.opus = new (require("node-opus")).OpusEncoder(this.samplingRate, this.channels, OpusScript.Application.AUDIO);
        } catch(err) {
            this.emit("debug", "Error initializing node-opus encoder, falling back to opusscript");
            try {
                this.opus = new OpusScript(this.samplingRate, this.channels, OpusScript.Application.AUDIO);
                this.opus.setBitrate(this.bitrate);
            } catch(err) {
                this.emit("error", "No opus encoder found, playing non-opus audio will not work.");
            }
        }

        this.voiceConnections = new Collection(VoiceConnection);
        this.sequence = 0;
        this.timestamp = 0;
        this.converterCommand = null;
        var pick = this.pickCommand();
        if(pick instanceof Error) {
            this.emit("error", pick);
        }

        this.piper = new Piper(this.converterCommand, this.opus);
        this.piper.on("error", (e) => this.emit("error", e));

        if(pick && this.converterCommand) {
            this.piper.libopus = false;
        }

        var options = {};
        options.samplingRate = this.samplingRate;
        options.frameDuration = this.frameDuration;
        options.frameSize = this.frameSize;
        options.inlineVolume = true;
        options.encoderArgs = [
            "-headers", "'User Agent: \"" + userAgent + "\"'"
        ];
        this.piper.encode(source, options);
        this._play(options);
    }

    pickCommand() {
        var tentative;
        for(var command of ["./ffmpeg", "./avconv", "ffmpeg", "avconv"]) {
            var res = ChildProcess.spawnSync(command, ["-encoders"]);
            if(!res.error) {
                if(!res.stdout.toString().includes("libopus")) {
                    tentative = command;
                    continue;
                }
                this.converterCommand = command;
                return;
            }
        }
        if(tentative) {
            this.converterCommand = tentative;
            return new Error(tentative + " does not have libopus support. Non-opus playback may be laggy");
        }
        return new Error("Neither ffmpeg nor avconv was found. Make sure you installed either one, and check that it is in your PATH");
    }

    /** Joins a voice channel using this shared stream as input. If a VoiceConnection has already been initialised on
    * that guild, you will need to disconnect that VoiceConnection first.
    * @arg {String} channelID
    * @return {Promise<VoiceConnection>} Resolves with an established VoiceConnection set to shared mode
    */
    joinVoiceChannel(channelID) {
        var channel = this.client.getChannel(channelID);
        if (!channel) {
            return Promise.reject(new Error("Channel not found"));
        }
        if(channel.guild && !channel.permissionsOf(this.client.user.id).json.voiceConnect) {
            return Promise.reject(new Error("Insufficient permission to connect to voice channel"));
        }
        var guildID = channel.guild && this.client.channelGuildMap[channelID] || "call";
        var connection = this.voiceConnections.get(guildID);
        if (connection) {
            connection.switchChannel(channelID);
            return Promise.resolve(connection);
        }
        connection = this.client.voiceConnections.get(guildID);
        if (connection) {
            return Promise.reject(new Error("A VoiceConnection has already been created for this guild. Disconnect and " +
                "destroy that VoiceConnection first before attempting to join a voice channel on a shared stream."));
        } else {
            var shard = this.client.shards.get(channel.guild && this.client.guildShardMap[guildID] || 0);
            connection = this.voiceConnections.add(new VoiceConnection(guildID, this.client.user.id, shard.sessionID, shard, true));
            this.client.voiceConnections.add(connection);
            connection.connect(channelID);

            if (connection.ready) {
                return Promise.resolve(connection);
            }
        }
        return new Promise((resolve, reject) => {
            var disconnectHandler, readyHandler;
            disconnectHandler = (err) => {
                connection.removeListener("ready", readyHandler);
                reject(err);
            };
            readyHandler = () => {
                connection.removeListener("disconnect", disconnectHandler);
                resolve(connection);
            };
            connection.once("ready", readyHandler);
            connection.once("disconnect", disconnectHandler);
        });
    }

    _incrementTimestamps(val) {
        for (var vc of this.voiceConnections.values()) {
            vc.timestamp += val;
            if (vc.timestamp >= 4294967295) {
                vc.timestamp -= 4294967295;
            }
        }
    }

    _incrementSequences() {
        for (var vc of this.voiceConnections.values()) {
            vc.sequence++;
            if (vc.sequence >= 65536) {
                vc.sequence -= 65536;
            }
        }
    }

    _setSpeaking(speaking) {
        for (var vc of this.voiceConnections.values()) {
            vc.setSpeaking(speaking);
        }
    }

    //End of stream or encoder died
    _end() {
        this.emit("end");
        this._setSpeaking(false);
        this.piper.stop();
    }

    _play(options) {
        var startTime = Date.now();
        var packets = 0;
        var waitingForData = 0;
        var buffer;
        var pausedTime = 0;
        options.voiceDataTimeout = options.voiceDataTimeout || 2000;

        var send = () => {
            if (!this.piper.encoding && this.piper.dataPackets.length === 0) {
                this._end();
                return;
            }

            this._incrementTimestamps(options.frameSize);

            this._incrementSequences();

            if ((buffer = this.piper.getDataPacket())) {
                if (waitingForData) {
                    waitingForData = 0;
                    this._setSpeaking(true);
                }
            } else if (options.voiceDataTimeout === -1 || waitingForData < options.voiceDataTimeout / options.frameDuration) { // wait for data
                if (++waitingForData <= 5) {
                    this._setSpeaking(false);
                    buffer = SILENCE;
                } else {
                    pausedTime += 4 * options.frameDuration;
                    this._incrementTimestamps(4 * options.frameSize);
                    return setTimeout(send, 4 * options.frameDuration);
                }
            } else {
                this._end();
                return;
            }

            for (var vc of this.voiceConnections.values()) {
                if (!vc.ready) {
                    continue;
                }
                if (!vc._sendPacket(vc._createPacket(buffer))) {
                    //Disconnected from this VC, remove it
                    this.voiceConnections.remove(vc);
                    this.emit("disconnect", vc);
                    vc._stopPlaying();
                }
            }
            return setTimeout(send, startTime + pausedTime + ++packets * options.frameDuration - Date.now());
        };

        this.emit("start");
        send();
    }
}

module.exports = SharedStream;
