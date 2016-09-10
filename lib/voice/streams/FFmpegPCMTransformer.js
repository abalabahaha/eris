"use strict";

const FFmpegDuplex = require("./FFmpegDuplex");

module.exports = function(converterCommand) {
    return FFmpegDuplex.spawn(converterCommand, [
        "-analyzeduration", "0",
        "-vn",
        "-loglevel", "warning",
        "-i", "-",
        "-f", "s16le",
        "-ar", "48000",
        "-ac", "2",
        "-"
    ]);
};
