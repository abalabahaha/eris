"use strict";

const BaseTransformer = require("./BaseTransformer");

class DCAOpusTransformer extends BaseTransformer {
    constructor(connection, pcmSize, frameSize) {
        super(connection);

        this.pcmSize = pcmSize;
        this.frameSize = frameSize;
    }

    process(buffer) {
        if(buffer.length - buffer._index < 2) {
            return true;
        }

        var opusLen = buffer.readUInt16LE(buffer._index);
        buffer._index += 2;

        if(buffer.length - buffer._index < opusLen) {
            return false;
        }

        buffer._index += opusLen;
        return buffer.slice(buffer._index - opusLen, buffer._index);
    }

    _transform(chunk, enc, cb) {
        if(this._remainder)  {
            chunk = new Buffer([this._remainder, chunk]);
            this._remainder = null;
        }

        chunk._index = 0;

        while(chunk._index < chunk.length) {
            var offset = chunk._index;
            var ret = this.process(chunk);
            if(ret) {
                this._remainder = chunk.slice(offset);
                if(ret instanceof Error) {
                    return setTimeout(() => cb(ret), 10);
                }
                break;
            }
        }

        setTimeout(() => cb(), 10);
    }

    attach(stream) {
        super.attach(stream);

        var dcaVersion = this._source.read(4);
        if(dcaVersion[0] !== 68 || dcaVersion[1] !== 67 || dcaVersion[2] !== 65) { // DCA0 or invalid
            this._source.unshift(dcaVersion);
        } else if(dcaVersion[3] === 49) { // DCA1
            var jsonLength = this._source.read(4).readInt32LE(0);
            var jsonMetadata = this._source.read(jsonLength);
            this.emit("debug", jsonMetadata);
        } else {
            this.emit("error", new Error("Unsupported DCA version: " + dcaVersion.toString()));
        }
    }
}

module.exports = DCAOpusTransformer;
