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
const ReadableStream = require("stream").Readable;
const VolumeTransformer = require("./streams/VolumeTransformer");

var EventEmitter;
try {
    EventEmitter = require("eventemitter3");
} catch(err) {
    EventEmitter = require("events").EventEmitter;
}

class Piper extends EventEmitter {
    constructor(converterCommand, opus, pcmSize, frameSize, frameDuration) {
        super();

        this.reset();

        this.converterCommand = converterCommand;
        this.dataPackets = [];
        this.encoding = false;
        this.frameDuration = frameDuration;
        this.frameSize = frameSize;
        this.opus = opus;
        this.pcmSize = pcmSize;
    }

    encode(source, options) {
        if(this.streams.length) {
            this.stop();
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
        } else if(!(source instanceof ReadableStream)) {
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
                    this.streams.push(source = source.pipe(new FFmpegPCMTransformer(this.converterCommand)).once("error", (e) => this.stop(e)));
                }
                this.streams.push((this.volume = source = source.pipe(new VolumeTransformer().once("error", (e) => this.stop(e)))));
                this.streams.push(this.volume.pipe(new PCMOpusTransformer(this.opus, this.pcmSize, this.frameSize).once("error", (e) => this.stop(e))));
            } else {
                this.streams.push(source = source.pipe(new FFmpegOggTransformer(this.converterCommand, this.frameDuration)).once("error", (e) => this.stop(e)));
                this.streams.push(source.pipe(new OggOpusTransformer().once("error", (e) => this.stop(e))));
            }
        } else {
            return false; // TODO DCA, ogg/opus
        }

        this.streams[this.streams.length - 1].on("data", this.addDataPacket.bind(this));
        this.streams[this.streams.length - 1].once("finish", () => this.stop(null, source, true));

        this.emit("start");

        return (this.encoding = true);
    }

    stop(e, source, run) {
        if(source && !~this.streams.indexOf(source)) {
            return;
        }
        if(!this.encoding) {
            return;
        }
        this.encoding = false;

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

        this.streams[this.streams.length - 1].removeAllListeners("data");

        for(var stream of this.streams) {
            stream.unpipe();
        }

        this.reset();
        if(!run) {
            this.dataPackets = [];
        }
        this.emit("stop");
    }

    reset() {
        this.streams = [];
        this.volume = null;
    }

    addDataPacket(packet) {
        if(!this.encoding) {
            return;
        }
        this.addedPacket = true;
        if(this.dataPackets.push(packet) > 50) {
            this.streams[this.streams.length - 1].pause();
            this.throttleTimeout = setTimeout(() => this.streams[this.streams.length - 1].resume(), 20 * (50 / 2 - 1));
        }
    }

    setVolume(volume) {
        if(!this.volume) {
            throw new Error("Inline volume not initialized");
        }
        if(this.dataPackets.length > 0) { // Transform existing buffer
            var newDB = 10 * Math.log(1 + volume) / 6.931471805599453;
            this.dataPackets = this.dataPackets.map((packet) => {
                packet = this.opus.decode(packet);
                for(var i = 0, num; i < packet.length - 1; i += 2) {
                    num = ~~(newDB / this.volume.db * packet.readInt16LE(i));
                    packet.writeInt16LE(num >= 32767 ? 32767 : num <= -32767 ? -32767 : num, i);
                }
                return this.opus.encode(packet, 3840 / 2 / 2);
            });
        }
        this.volume.setVolume(volume);
    }

    getDataPacket() {
        return this.dataPackets.shift();
    }
}

module.exports = Piper;
