"use strict";

const FFmpegDuplex = require("./FFmpegDuplex");

module.exports = function(converterCommand, frameDuration) {
    return FFmpegDuplex.spawn(converterCommand, [
        "-analyzeduration", "0",
        "-vn",
        "-loglevel", "warning",
        "-i", "-",
        "-c:a", "libopus",
        // "-b:a", "" + bitrate,
        "-vbr", "on",
        "-frame_duration", "" + frameDuration,
        "-f", "opus",
        "-"
    ]);
};
