"use strict";

const FFmpegDuplex = require("./FFmpegDuplex");

module.exports = function(options) {
    options = options || {};
    if(!options.command) {
        throw new Error("Invalid converter command");
    }
    if(options.frameDuration === undefined) {
        options.frameDuration = 60;
    }
    var inputArgs = [
        "-analyzeduration", "0",
        "-loglevel", "8"
    ];
    if(options.format === "pcm") {
        inputArgs = inputArgs.concat(
            "-f", "s16le",
            "-ar", "48000",
            "-ac", "2"
        );
    }
    inputArgs = inputArgs.concat(
        "-i", "-",
        "-vn"
    );
    var outputArgs = [
        "-c:a", "libopus",
        "-vbr", "on",
        "-frame_duration", "" + options.frameDuration,
        "-f", "ogg",
        "-"
    ];
    return FFmpegDuplex.spawn(options.command, inputArgs.concat(options.encoderArgs || [], outputArgs));
};
