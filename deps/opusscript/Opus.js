"use strict";

const opusscript_native = require("./opusscript_native.js");

const OpusApplication = {
    VOIP: 2048,
    AUDIO: 2049,
    RESTRICTED_LOWDELAY: 2051
};
const OpusError = {
    "0": "OK",
    "-1": "Bad argument",
    "-2": "Buffer too small",
    "-3": "Internal error",
    "-4": "Invalid packet",
    "-5": "Unimplemented",
    "-6": "Invalid state",
    "-7": "Memory allocation fail"
};
const VALID_SAMPLING_RATES = [8000, 12000, 16000, 24000, 48000];
const MAX_PACKET_SIZE = 1276 * 3;
const SET_BITRATE_REQUEST = 4002;

class OpusScript {
    constructor(samplingRate, channels, application, frameDuration, bitrate) {
        if(!~VALID_SAMPLING_RATES.indexOf(samplingRate)) {
            throw new RangeError(`${samplingRate} is an invalid sampling rate.`);
        }
        this.samplingRate = samplingRate;

        this.frameDuration = frameDuration || 20;
        if(this.frameDuration % 2.5 !== 0) {
            throw new RangeError(`${this.frameDuration} is an invalid frame duration.`);
        }

        this.channels = channels || 1;
        this.application = application || OpusApplication.AUDIO;
        this.frameSize = this.samplingRate * this.frameDuration / 1000;

        this.handler = new opusscript_native.OpusScriptHandler(this.samplingRate, this.channels, this.application);

        this.setBitrate(bitrate);

        this.inPCMLength = this.frameSize * this.channels * 2;
        this.inPCMPointer = opusscript_native._malloc(this.inPCMLength);
        this.inPCM = opusscript_native.HEAPU16.subarray(this.inPCMPointer, this.inPCMPointer + this.inPCMLength);

        this.inOpusPointer = opusscript_native._malloc(MAX_PACKET_SIZE);
        this.inOpus = opusscript_native.HEAPU8.subarray(this.inOpusPointer, this.inOpusPointer + MAX_PACKET_SIZE);

        this.outOpusPointer = opusscript_native._malloc(MAX_PACKET_SIZE);
        this.outOpus = opusscript_native.HEAPU8.subarray(this.outOpusPointer, this.outOpusPointer + MAX_PACKET_SIZE);

        this.outPCMLength = this.frameSize * this.channels * 2;
        this.outPCMPointer = opusscript_native._malloc(this.outPCMLength);
        this.outPCM = opusscript_native.HEAPU16.subarray(this.outPCMPointer, this.outPCMPointer + this.outPCMLength);
    }

    setBitrate(bitrate) {
        this.bitrate = bitrate || 64000;
        opusscript_native.setValue(this.bitratePointer, this.bitrate, "i32");
        var errCode = opusscript_native._opus_encoder_ctl(this.handler, SET_BITRATE_REQUEST, this.bitratePointer);
        if(errCode < 0) {
            throw new Error("Failed to set bitrate: " + OpusError["" + opusscript_native.getValue(errCode, "i32")]);
        }
    }

    encode(buffer, frameSize) {
        if(buffer.length > this.inPCMLength) {
            throw new RangeError("Buffer is too large");
        }

        this.inPCM.set(buffer);

        var len = this.handler._encode(this.inPCM.byteOffset, buffer.length, this.outOpusPointer, frameSize);
        if(len < 0) {
            throw new Error("Encode error: " + OpusError["" + opusscript_native.getValue(len, "i32")]);
        }

        return new Buffer(this.outOpus.subarray(0, len));
    }

    decode(buffer) {
        if(buffer.length > MAX_PACKET_SIZE) {
            throw new RangeError("Buffer is too large");
        }

        this.inOpus.set(buffer);

        var len = this.handler._decode(this.inOpusPointer, buffer.length, this.outPCM.byteOffset);
        if(len < 0) {
            throw new Error("Decode error: " + OpusError["" + len]);
        }

        return new Buffer(this.outPCM.subarray(0, len * this.channels * 2));
    }
}

OpusScript.Application = OpusApplication;
OpusScript.Error = OpusError;
OpusScript.VALID_SAMPLING_RATES = VALID_SAMPLING_RATES;
OpusScript.MAX_PACKET_SIZE = MAX_PACKET_SIZE;

module.exports = OpusScript;
