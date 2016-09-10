"use strict";

const TransformStream = require("stream").Transform;

class PCMOpusTransformer extends TransformStream {
    constructor(opus, pcmSize, frameSize) {
        super({
            highWaterMark: 0
        });

        this.opus = opus;
        this.pcmSize = pcmSize;
        this.frameSize = frameSize;

        this._remainder = null;
    }

    _transform(chunk, enc, cb) {
        if(this._remainder) {
            chunk = Buffer.concat([this._remainder, chunk]);
            this._remainder = null;
        }

        if(chunk.length < this.pcmSize) {
            this._remainder = chunk;
            return cb();
        }

        chunk._index = 0;

        while(chunk._index + this.pcmSize < chunk.length) {
            chunk._index += this.pcmSize;
            this.push(this.opus.encode(chunk.slice(chunk._index - this.pcmSize, chunk._index), this.frameSize));
        }

        if(chunk._index < chunk.length) {
            this._remainder = chunk.slice(chunk._index);
        }

        cb();
    }

    _flush(cb) {
        if(this._remainder) {
            var buf = new Buffer(this.pcmSize);
            this._remainder.copy(buf);
            this.push(this.opus.encode(buf, this.pcmSize / 2 / 2));
            this._remainder = null;
        }
        cb();
    }
}

module.exports = PCMOpusTransformer;
