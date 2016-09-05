"use strict";

const BaseTransformer = require("./BaseTransformer");

class VolumeTransformer extends BaseTransformer {
    constructor(connection) {
        super(connection);
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
        if(this._remainder)  {
            chunk = new Buffer([this._remainder, chunk]);
            this._remainder = null;
        }

        var buf;
        if(chunk.length & 1) {
            this._remainder = chunk.slice(chunk.length - 1);
            buf = new Buffer(chunk.length - 1);
        } else {
            buf = new Buffer(chunk.length);
        }
        if(buf.length === 0) {
            return cb();
        }

        for(var i = 0; i < buf.length - 1; i += 2) {
            // Bind transformed chunk to to 16 bit
            buf.writeInt16LE(Math.min(32767, Math.max(-32767, Math.floor(this.db * chunk.readInt16LE(i)))), i);
        }

        this.push(buf);
        cb();
    }
}

module.exports = VolumeTransformer;
