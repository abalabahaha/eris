"use strict";

const BaseTransformer = require("./BaseTransformer");

class PCMOpusTransformer extends BaseTransformer {
    constructor(connection, pcmSize, frameSize) {
        super(connection);

        this.pcmSize = pcmSize;
        this.frameSize = frameSize;
    }

    process(buffer, forced) {
        if(buffer.length - buffer._index < this.pcmSize) {
            if(!forced) {
                return true;
            } else {
                var scratchBuffer = new Buffer(this.pcmSize);
                scratchBuffer.fill(0);
                buffer.copy(scratchBuffer);
                buffer = scratchBuffer;
            }
        }

        buffer._index += this.pcmSize;

        this.push(this._connection.shard.client.opus.encode(buffer.slice(buffer._index - this.pcmSize, buffer._index), this.frameSize));
    }

    _transform(chunk, enc, cb) {
        if(this._remainder)  {
            chunk = Buffer.concat([this._remainder, chunk]);
            this._remainder = null;
        }

        if(chunk.length < this.pcmSize) {
            this._remainder = chunk;
            return cb();
        }

        chunk._index = 0;

        while(chunk._index + this.pcmSize < chunk.length) {
            var offset = chunk._index;
            var ret = this.process(chunk);
            if(ret) {
                this._remainder = chunk.slice(offset);
                return setTimeout(() => cb(), 10);
            }
        }

        if(chunk._index < chunk.length) {
            this._remainder = chunk.slice(chunk._index);
        }

        setTimeout(() => cb(), 10);
    }

    onFinish() {
        if(this._remainder) {
            this._remainder._index = 0;

            while(this._remainder._index < this._remainder.length) {
                var ret = this.process(this._remainder, true);
                if(ret) {
                    break;
                }
            }
            this._remainder = null;
        }
    }
}

module.exports = PCMOpusTransformer;
