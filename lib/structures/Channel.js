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

    static from(data, client) {
        switch(data.type) {
            case 0: {
                return new TextChannel(data, client);
            }
            case 1: {
                return new PrivateChannel(data, client);
            }
            case 2: {
                return new VoiceChannel(data, client);
            }
            case 3: {
                return new GroupChannel(data, client);
            }
            case 4: {
                return new CategoryChannel(data, client);
            }
            case 5: {
                return new NewsChannel(data, client);
            }
            case 6: {
                return new StoreChannel(data, client);
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
const StoreChannel = require("./StoreChannel");
const TextChannel = require("./TextChannel");
const VoiceChannel = require("./VoiceChannel");
