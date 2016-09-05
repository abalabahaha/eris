"use strict";

const FFmpegBaseTransformer = require("./FFmpegBaseTransformer");

class FFmpegOggTransformer extends FFmpegBaseTransformer {
    constructor(connection, bitrate, frameDuration) {
        super(connection);

        this.outputArgs = [
            "-c:a", "libopus",
            "-b:a", "" + bitrate,
            "-vbr", "on",
            "-frame_duration", "" + frameDuration,
            "-f", "opus"
        ];
    }
}

module.exports = FFmpegOggTransformer;
