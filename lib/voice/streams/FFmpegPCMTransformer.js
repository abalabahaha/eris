"use strict";

const FFmpegDuplex = require("./FFmpegDuplex");

module.exports = function(options) {
    options = options || {};
    if(!options.command) {
        throw new Error("Invalid converter command");
    }
    return FFmpegDuplex.spawn(options.command, [
        "-analyzeduration", "0",
        "-loglevel", "warning",
        "-i", "-",
        "-vn",
        "-f", "s16le",
        "-ar", "48000",
        "-ac", "2",
        "-"
    ]);
};
