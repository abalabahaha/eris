"use strict";

/**
* Represents a channel
* @prop {String} id The ID of the channel
* @prop {Number} createdAt Timestamp of channel creation
*/
class Channel {
    constructor(data) {
        this.id = data.id;
        this.createdAt = (this.id / 4194304) + 1420070400000;
        this.type = data.type;
    }
}

module.exports = Channel;