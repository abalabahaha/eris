"use strict";

const Base = require("./Base");

/**
* Represents a channel. You also probably want to look at CategoryChannel, GroupChannel, PrivateChannel, TextChannel, and VoiceChannel.
* @prop {String} id The ID of the channel
* @prop {String} mention A string that mentions the channel
* @prop {Number} type The type of the channel
* @prop {Number} createdAt Timestamp of the channel's creation
*/
class Channel extends Base {
    constructor(data) {
        super(data.id);
        this.type = data.type;
    }

    get mention() {
        return `<#${this.id}>`;
    }

    toJSON() {
        var base = super.toJSON(true);
        for(var prop of ["type"]) {
            base[prop] = this[prop] && this[prop].toJSON ? this[prop].toJSON() : this[prop];
        }
        return base;
    }
}

module.exports = Channel;
