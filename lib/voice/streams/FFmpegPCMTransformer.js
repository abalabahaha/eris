"use strict";

const FFmpegDuplex = require("./FFmpegDuplex");

module.exports = function(options) {
    options = options || {};
    if(!options.command) {
        throw new Error("Invalid converter command");
    }
    if(options.samplingRate === undefined) {
        options.samplingRate = 48000;
    }
    return FFmpegDuplex.spawn(options.command, [
        "-analyzeduration", "0",
        "-loglevel", "8",
        "-i", "-",
        "-vn",
        "-f", "s16le",
        "-ar", "" + options.samplingRate,
        "-ac", "2",
        "-"
    ]);
};
