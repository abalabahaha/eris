let NativeOpus;
try {
    NativeOpus = require("@discordjs/opus");
} catch(err) { // eslint-disable no-empty
}
let OpusScript;
try {
    OpusScript = require("opusscript");
} catch(err) { // eslint-disable no-empty
}


module.exports.createOpus = function createOpus(samplingRate, channels, bitrate) {
    if(NativeOpus) {
        return new NativeOpus.OpusEncoder(samplingRate, channels);
    }

    if(OpusScript) {
        const opus = new OpusScript(samplingRate, channels, OpusScript.Application.AUDIO);

        if(opus.setBitrate) {
            opus.setBitrate(bitrate);
        } else if(opus.encoderCTL) {
            opus.encoderCTL(4002, bitrate);
        }

        return opus;
    }

    throw new Error("No opus encoder found, playing non-opus audio will not work.");
};
