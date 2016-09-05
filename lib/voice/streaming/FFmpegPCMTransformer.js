"use strict";

const FFmpegBaseTransformer = require("./FFmpegBaseTransformer");

class FFmpegPCMTransformer extends FFmpegBaseTransformer {
    constructor(connection) {
        super(connection);

        this.outputArgs = [
            "-f", "s16le",
            "-ar", "48000",
            "-ac", "2"
        ];
    }
}

module.exports = FFmpegPCMTransformer;
