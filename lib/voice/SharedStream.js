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

        this.speaking = false;

        this._send = this._send.bind(this);
    }

    /**
    * Add a voice connection to the shared stream
    * @arg {VoiceConnection} connection The voice connection to add
    */
    add(_connection) {
        var connection = this.voiceConnections.add(_connection);
        connection.setSpeaking(this.speaking);
        return connection;
    }

    /**
    * Remove a voice connection from the shared stream
    * @arg {VoiceConnection} connection The voice connection to remove
    */
    remove(_connection) {
        return this.voiceConnections.remove(_connection);
    }

    /**
    * Play an audio or video resource. If playing from a non-opus resource, FFMPEG should be compiled with --enable-libopus for best performance. If playing from HTTPS, FFMPEG must be compiled with --enable-openssl
    * @arg {ReadableStream | String} resource The audio or video resource, either a ReadableStream, URL, or file path
    * @arg {Object} [options] Music options
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

        this.ended = false;
        this.current = {
            startTime: 0, // later
            playTime: 0,
            pausedTimestamp: 0,
            pausedTime: 0,
            bufferingTicks: 0,
            options: options,
            timeout: null
        };

        this.playing = true;

        this.emit("start");

        this._send();
    }

    _send() {
        if(!this.piper.encoding && this.piper.dataPacketCount === 0) {
            return this.stopPlaying();
        }

        this._incrementTimestamps(this.current.options.frameSize);

        this._incrementSequences();

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
                this.current.buffer = SILENCE;
            } else {
                this.current.pausedTime += 4 * this.current.options.frameDuration;
                this._incrementTimestamps(3 * this.current.options.frameSize);
                this.current.timeout = setTimeout(this._send, 4 * this.current.options.frameDuration);
                return;
            }
        } else {
            return this.stopPlaying();
        }

        this.voiceConnections.forEach((connection) => {
            if(connection.ready) {
                connection._sendPacket(connection._createPacket(this.current.buffer));
            }
        });
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
        if(this.current.timeout) {
            clearTimeout(this.current.timeout);
            this.current.timeout = null;
        }
        this.current = null;
        this.piper.stop();
        this.piper.resetPackets();

        this.setSpeaking(this.playing = false);
        // for(var i = 0; i < 5; i++) {
        //     this.timestamp += this.frameSize;
        //     if(this.timestamp >= 4294967295) {
        //         this.timestamp -= 4294967295;
        //     }

        //     if(++this.sequence >= 65536) {
        //         this.sequence -= 65536;
        //     }

        //     this._sendPacket(this._createPacket(SILENCE));
        // }

        /**
        * Fired when the voice connection finishes playing a stream
        * @event VoiceConnection#end
        */
        this.emit("end");
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

    setSpeaking(speaking) {
        if(this.speaking == speaking) {
            return;
        }
        this.speaking = !!speaking;
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
