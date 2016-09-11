"use strict";

const FFmpegDuplex = require("./FFmpegDuplex");

module.exports = function(converterCommand, frameDuration, format) {
    var args = [
        "-analyzeduration", "0",
        "-loglevel", "warning"
    ];
    if(format === "pcm") {
        args = args.concat(
            "-f", "s16le",
            "-ar", "48000",
            "-ac", "2"
        );
    }
    args = args.concat(
        "-i", "-",
        "-vn",
        "-c:a", "libopus",
        // "-b:a", "" + bitrate,
        "-vbr", "on",
        "-frame_duration", "" + frameDuration,
        "-f", "ogg",
        "-"
    );
    return FFmpegDuplex.spawn(converterCommand, args);
};
