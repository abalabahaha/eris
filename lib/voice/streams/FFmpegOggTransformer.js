"use strict";

const FFmpegDuplex = require("./FFmpegDuplex");

module.exports = function(options) {
    options = options || {};
    if(!options.command) {
        throw new Error("Invalid converter command");
    }
    if(options.frameDuration === undefined) {
        options.frameDuration = "60";
    }
    var args = [
        "-analyzeduration", "0",
        "-loglevel", "info"
    ];
    if(options.format === "pcm") {
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
        "-frame_duration", "" + options.frameDuration,
        "-f", "ogg",
        "-"
    );
    return FFmpegDuplex.spawn(options.command, args);
};
