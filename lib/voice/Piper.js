"use strict";

const DCAOpusTransformer = require("./streams/DCAOpusTransformer");
const FFmpegOggTransformer = require("./streams/FFmpegOggTransformer");
const FFmpegPCMTransformer = require("./streams/FFmpegPCMTransformer");
const FS = require("fs");
const HTTP = require("http");
const HTTPS = require("https");
const OggOpusTransformer = require("./streams/OggOpusTransformer");
const PassThroughStream = require("stream").PassThrough;
const PCMOpusTransformer = require("./streams/PCMOpusTransformer");
const Stream = require("stream").Stream;
const VolumeTransformer = require("./streams/VolumeTransformer");

var EventEmitter;
try {
    EventEmitter = require("eventemitter3");
} catch(err) {
    EventEmitter = require("events").EventEmitter;
}

class Piper extends EventEmitter {
    constructor(converterCommand, opus) {
        super();

        this.reset();

        this.converterCommand = converterCommand;
        this._dataPackets = [];
        this.encoding = false;
        this.libopus = true;
        this.opus = opus;
        this.volumeLevel = 1;

        // setInterval(() => console.log(this._dataPackets.length), 500);
    }

    encode(source, options) {
        if(this.encoding || this.streams.length) {
            return false;
        }

        if(typeof source === "string") {
            if(source.startsWith("http://") || source.startsWith("https://")) {
                var passThrough = new PassThroughStream();
                if(source.startsWith("http://")) {
                    HTTP.get(source, (res) => res.pipe(passThrough)).once("error", (e) => this.stop(e));
                } else {
                    HTTPS.get(source, (res) => res.pipe(passThrough)).once("error", (e) => this.stop(e));
                }
                source = passThrough;
            } else {
                try {
                    FS.statSync(source);
                } catch(err) {
                    if(err.code === "ENOENT") {
                        this.emit("error", new Error("That file does not exist."));
                    } else {
                        this.emit("error", new Error("An error occured trying to access that file."));
                    }
                    return false;
                }
                source = FS.createReadStream(source);
            }
        } else if(!(source instanceof Stream) || !source.pipe) {
            return false;
        }

        this.streams.push(source.once("error", (e) => this.stop(e)));

        if(options.format === "dca") {
            this.streams.push(source.pipe(new DCAOpusTransformer().once("error", (e) => this.stop(e))));
        } else if(options.format === "ogg") {
            this.streams.push(source.pipe(new OggOpusTransformer().once("error", (e) => this.stop(e))));
        } else if(!options.format || options.format === "pcm") {
            if(options.inlineVolume) {
                if(!options.format) {
                    if(!this.converterCommand) {
                        return false;
                    }
                    this.streams.push(source = source.pipe(new FFmpegPCMTransformer({
                        command: this.converterCommand,
                        encoderArgs: options.encoderArgs
                    })).once("error", (e) => this.stop(e)));
                }
                this.streams.push((this.volume = source = source.pipe(new VolumeTransformer()).once("error", (e) => this.stop(e))));
                this.volume.setVolume(this.volumeLevel);
                this.streams.push(this.volume.pipe(new PCMOpusTransformer({
                    opus: this.opus,
                    frameSize: options.frameSize,
                    pcmSize: options.pcmSize
                })).once("error", (e) => this.stop(e)));
            } else {
                if(this.libopus) {
                    this.streams.push(source = source.pipe(new FFmpegOggTransformer({
                        command: this.converterCommand,
                        encoderArgs: options.encoderArgs,
                        format: options.format,
                        frameDuration: options.frameDuration
                    })).once("error", (e) => this.stop(e)));
                    this.streams.push(source.pipe(new OggOpusTransformer()).once("error", (e) => this.stop(e)));
                } else {
                    this.streams.push(source = source.pipe(new FFmpegPCMTransformer({
                        command: this.converterCommand,
                        encoderArgs: options.encoderArgs
                    })).once("error", (e) => this.stop(e)));
                    this.streams.push(source.pipe(new PCMOpusTransformer({
                        opus: this.opus,
                        frameSize: options.frameSize,
                        pcmSize: options.pcmSize
                    })).once("error", (e) => this.stop(e)));
                }
            }
        } else {
            return false;
        }

        this._endStream = this.streams[this.streams.length - 1];
        this._endStream.manualCB = true;

        this._endStream.on("data", this.addDataPacket.bind(this));
        this._endStream.once("finish", () => this.stop(null, source));

        this.emit("start");

        return (this.encoding = true);
    }

    stop(e, source) {
        if(source && !~this.streams.indexOf(source)) {
            return;
        }

        if(e) {
            this.emit("error", e);
        }

        if(this.throttleTimeout) {
            clearTimeout(this.throttleTimeout);
            this.throttleTimeout = null;
        }

        if(this.streams.length === 0) {
            return;
        }

        if(this._endStream) {
            this._endStream.removeAllListeners("data");
        }

        for(var stream of this.streams) {
            if(typeof stream.destroy === "function") {
                stream.destroy();
            } else {
                stream.unpipe();
            }
        }

        this.reset();
        if(this.encoding) {
            this.encoding = false;
            this.emit("stop");
        }
    }

    reset() {
        this.streams = [];
        this._endStream = null;
        this.volume = null;
    }

    resetPackets() {
        this._dataPackets = [];
    }

    addDataPacket(packet) {
        if(!this.encoding) {
            return;
        }
        if(this._dataPackets.push(packet) < 30 && this._endStream) {
            process.nextTick(() => this._endStream && this._endStream.transformCB());
        }
    }

    setVolume(volume) {
        this.volumeLevel = volume;
        if(!this.volume) {
            return;
        }
        var oldDB = this.volume.db;
        this.volume.setVolume(volume);
        if(this._dataPackets.length > 0) { // Transform existing buffer
            var newDBFactor = 10 * Math.log(1 + volume) / 6.931471805599453 / oldDB;
            this._dataPackets = this._dataPackets.map((packet) => {
                packet = this.opus.decode(packet);
                for(var i = 0, num; i < packet.length - 1; i += 2) {
                    num = ~~(newDBFactor * packet.readInt16LE(i));
                    packet.writeInt16LE(num >= 32767 ? 32767 : num <= -32767 ? -32767 : num, i);
                }
                return this.opus.encode(packet, 3840 / 2 / 2);
            });
        }
    }

    getDataPacket() {
        if(this._dataPackets.length < 15 && this._endStream) {
            this._endStream.transformCB();
        }
        return this._dataPackets.shift();
    }

    get dataPacketCount() {
        return this._dataPackets.length;
    }
}

module.exports = Piper;
