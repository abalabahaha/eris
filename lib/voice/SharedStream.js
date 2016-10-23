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

const SILENCE = new Buffer([0xF8, 0xFF, 0xFE]);

/**
* Represents a collection of VoiceConnections sharing an input stream
* @extends EventEmitter
*/
class SharedStream extends EventEmitter {
    constructor() {
        super();

        this.samplingRate = 48000;
        this.frameDuration = 60;
        this.channels = 2;

        this.voiceConnections = new Collection(VoiceConnection);

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
    }

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

    stopPlaying() {
        this.emit("end");
        this._setSpeaking(false);
        this.piper.stop();
        this.piper.resetPackets();
    }

    _play(options) {
        var startTime = Date.now();
        var waitingForData = 0;
        var buffer;
        var pausedTime = 0;
        var playTime = 0;

        var send = () => {
            if(!this.piper.encoding && this.piper.dataPacketCount === 0) {
                return this.stopPlaying();
            }

            this._incrementTimestamps(options.frameSize);

            this._incrementSequences();

            if((buffer = this.piper.getDataPacket())) {
                if(waitingForData > 0) {
                    waitingForData = 0;
                    this._setSpeaking(true);
                }
            } else if(options.voiceDataTimeout === -1 || waitingForData < options.voiceDataTimeout / options.frameDuration) { // wait for data
                if(++waitingForData <= 5) {
                    this._setSpeaking(false);
                    buffer = SILENCE;
                } else {
                    pausedTime += 4 * options.frameDuration;
                    this._incrementTimestamps(4 * options.frameSize);
                    return setTimeout(send, 4 * options.frameDuration);
                }
            } else {
                return this.stopPlaying();
            }

            playTime += options.frameDuration;
            for(let vc of this.voiceConnections.values()) {
                if(vc.ready) {
                    vc._sendPacket(vc._createPacket(buffer));
                }
            }
            return setTimeout(send, startTime + pausedTime + playTime - Date.now());
        };

        this.emit("start");
        send();
    }

    _incrementTimestamps(val) {
        for(let vc of this.voiceConnections.values()) {
            vc.timestamp += val;
            if(vc.timestamp >= 4294967295) {
                vc.timestamp -= 4294967295;
            }
        }
    }

    _incrementSequences() {
        for(let vc of this.voiceConnections.values()) {
            vc.sequence++;
            if(vc.sequence >= 65536) {
                vc.sequence -= 65536;
            }
        }
    }

    _setSpeaking(speaking) {
        for(let vc of this.voiceConnections.values()) {
            vc.setSpeaking(speaking);
        }
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
}

module.exports = SharedStream;
