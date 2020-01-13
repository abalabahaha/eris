let NodeOpus;
try {
    NodeOpus = require("node-opus");
} catch(err) { // eslint-disable no-empty
}
let OpusScript;
try {
    OpusScript = require("opusscript");
} catch(err) { // eslint-disable no-empty
}


module.exports.createOpus = function createOpus (samplingRate, channels, bitrate) {
    let opus;

    if(NodeOpus) {
        opus = new NodeOpus.OpusEncoder(samplingRate, channels);
    } else if(OpusScript) {
        opus = new OpusScript(samplingRate, channels, OpusScript.Application.AUDIO);
        if(opus.setBitrate) {
            opus.setBitrate(bitrate);
        } else if(opus.encoderCTL) {
            opus.encoderCTL(4002, bitrate);
        }
    } else {
        throw new Error("No opus encoder found, playing non-opus audio will not work.");
    }
    return opus;
};
