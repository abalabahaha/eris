"use strict";

const TransformStream = require("stream").Transform;

class VolumeTransformer extends TransformStream {
    constructor() {
        super();
        this.setVolume(1.0);
    }

    setVolume(volume) {
        if(isNaN(volume) || (volume = +volume) < 0) {
            throw new Error("Invalid volume level: " + volume);
        }
        this.volume = volume;
        this.db = 10 * Math.log(1 + this.volume) / 6.931471805599453;
    }

    _transform(chunk, enc, cb) {
        var buf = new Buffer(chunk.length);

        for(var i = 0; i < buf.length - 1; i += 2) {
            // Bind transformed chunk to to 16 bit
            buf.writeInt16LE(Math.min(32767, Math.max(-32767, Math.floor(this.db * chunk.readInt16LE(i)))), i);
        }

        this.push(buf);
        cb();
    }

    attach(stream) {
        if(this.attached) {
            this.unattach();
        }
        this.attached = stream;

        stream.on("error", () => this.unattach());
        stream.on("end", () => this.unattach());

        stream.pipe(this);
    }

    unattach() {
        if(this.attached) {
            this.attached.unpipe(this);
        }
        this.attached = null;
    }
}

module.exports = VolumeTransformer;