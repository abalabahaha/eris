"use strict";

const {safeRequire} = require("../util/utils");
const EventEmitter = safeRequire("eventemitter3", "events");

/**
* Represents a voice data stream
* @extends EventEmitter
* @prop {String} type The targeted voice data type for the stream, either "opus" or "pcm"
*/
class VoiceDataStream extends EventEmitter {
    constructor(type) {
        super();
        this.type = type;
    }
}

module.exports = VoiceDataStream;
