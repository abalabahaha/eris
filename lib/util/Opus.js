"use strict";

let NativeOpus;
let OpusScript;

module.exports.createOpus = function createOpus(samplingRate, channels, bitrate) {
    if(!NativeOpus && !OpusScript) {
        try {
            NativeOpus = require("@discordjs/opus");
        } catch(err) {
            try {
                OpusScript = require("opusscript");
            } catch(err) { // eslint-disable no-empty
            }
        }
    }

    let opus;
    if(NativeOpus) {
        opus = new NativeOpus.OpusEncoder(samplingRate, channels);
    } else if(OpusScript) {
        opus = new OpusScript(samplingRate, channels, OpusScript.Application.AUDIO);
    } else {
        throw new Error("No opus encoder found, playing non-opus audio will not work.");
    }

    if(opus.setBitrate) {
        opus.setBitrate(bitrate);
    } else if(opus.encoderCTL) {
        opus.encoderCTL(4002, bitrate);
    }

    return opus;
};
