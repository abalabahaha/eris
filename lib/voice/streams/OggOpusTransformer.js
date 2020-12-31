"use strict";

const BaseTransformer = require("./BaseTransformer");

class OggOpusTransformer extends BaseTransformer {
    constructor(options = {}) {
        super(options);

        this._remainder = null;
        this._bitstream = null;
    }

    process(buffer) {
        if(buffer.length - buffer._index <= 26) {
            return true;
        }

        if(buffer.toString("utf8", buffer._index, buffer._index + 4) !== "OggS") {
            return new Error("Invalid OGG magic string: " + buffer.toString("utf8", buffer._index, buffer._index + 4));
        }

        const typeFlag = buffer.readUInt8(buffer._index + 5);
        if(typeFlag === 1) {
            return new Error("OGG continued page not supported");
        }

        const bitstream = buffer.readUInt32BE(buffer._index + 14);

        buffer._index += 26;

        const segmentCount = buffer.readUInt8(buffer._index);
        if(buffer.length - buffer._index - 1 < segmentCount) {
            return true;
        }

        const segments = [];
        let size = 0;
        let byte = 0;
        let total = 0;
        let i = 0;
        for(; i < segmentCount; i++) {
            byte = buffer.readUInt8(++buffer._index);
            if(byte < 255) {
                segments.push(size + byte);
                size = 0;
            } else {
                size += byte;
            }
            total += byte;
        }

        ++buffer._index;

        if(buffer.length - buffer._index < total) {
            return true;
        }

        for(let segment of segments) {
            buffer._index += segment;
            byte = (segment = buffer.subarray(buffer._index - segment, buffer._index)).toString("utf8", 0, 8);
            if(this.head) {
                if(byte === "OpusTags") {
                    this.emit("debug", segment.toString());
                } else if(bitstream === this._bitstream) {
                    this.push(segment);
                }
            } else if(byte === "OpusHead") {
                this._bitstream = bitstream;
                this.emit("debug", (this.head = segment.toString()));
            } else {
                this.emit("debug", "Invalid codec: " + byte);
            }
        }
    }

    _final() {
        if(!this._bitstream) {
            this.emit("error", new Error("No Opus stream was found"));
        }
    }

    _transform(chunk, enc, cb) {
        if(this._remainder)  {
            chunk = Buffer.concat([this._remainder, chunk]);
            this._remainder = null;
        }

        chunk._index = 0;

        while(chunk._index < chunk.length) {
            const offset = chunk._index;
            const ret = this.process(chunk);
            if(ret) {
                this._remainder = chunk.subarray(offset);
                if(ret instanceof Error) {
                    this.emit("error", ret);
                }
                cb();
                return;
            }
        }

        this.setTransformCB(cb);
    }
}

module.exports = OggOpusTransformer;
