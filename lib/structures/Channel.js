"use strict";

const Base = require("./Base");

/**
* Represents a channel. You also probably want to look at CategoryChannel, GroupChannel, NewsChannel, PrivateChannel, TextChannel, and VoiceChannel.
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

    static from(data, extra) {
        switch(data.type) {
            case 0: {
                return new TextChannel(data, extra);
            }
            case 1: {
                return new PrivateChannel(data, extra);
            }
            case 2: {
                return new VoiceChannel(data, extra);
            }
            case 3: {
                return new GroupChannel(data, extra);
            }
            case 4: {
                return new CategoryChannel(data, extra);
            }
            case 5: {
                return new NewsChannel(data, extra);
            }
        }
        return new Channel(data);
    }

    toJSON() {
        const base = super.toJSON(true);
        for(const prop of ["type"]) {
            if(this[prop] !== undefined) {
                base[prop] = this[prop] && this[prop].toJSON ? this[prop].toJSON() : this[prop];
            }
        }
        return base;
    }
}

module.exports = Channel;

// Circular import
const CategoryChannel = require("./CategoryChannel");
const GroupChannel = require("./GroupChannel");
const NewsChannel = require("./NewsChannel");
const PrivateChannel = require("./PrivateChannel");
const TextChannel = require("./TextChannel");
const VoiceChannel = require("./VoiceChannel");
