"use strict";

const TextChannel = require("./TextChannel");

/**
* Represents a guild news channel
* @extends TextChannel
* @prop {String} id The ID of the channel
* @prop {String} mention A string that mentions the channel
* @prop {Number} type The type of the channel
* @prop {Guild} guild The guild that owns the channel
* @prop {String?} parentID The ID of the category this channel belongs to
* @prop {String} name The name of the channel
* @prop {Number} position The position of the channel
* @prop {Boolean} nsfw Whether the channel is an NSFW channel or not
* @prop {Collection<PermissionOverwrite>} permissionOverwrites Collection of PermissionOverwrites in this channel
* @prop {Collection<Message>} messages Collection of Messages in this channel
* @prop {String} lastMessageID The ID of the last message in this channel
* @prop {Number} lastPinTimestamp The timestamp of the last pinned message
* @prop {String?} topic The topic of the channel
* @prop {Number} rateLimitPerUser The ratelimit of the channel, in seconds. 0 means no ratelimit is enabled. Always 0 in NewsChannel
*/
class NewsChannel extends TextChannel {
    constructor(data, guild, messageLimit) {
        super(data, guild, messageLimit);
        this.rateLimitPerUser = 0;
        this.update(data);
    }

    update(data) {
        super.update(data);
    }
}

module.exports = NewsChannel;
