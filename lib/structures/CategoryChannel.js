"use strict";

const Collection = require("../util/Collection");
const GuildChannel = require("./GuildChannel");

/**
* Represents a guild category channel
* @extends GuildChannel
* @prop {Collection<GuildChannel>} channels A collection of guild channels that are part of this category
* @prop {Client} client The client that initialized the channel
* @prop {Number} createdAt Timestamp of the channel's creation
* @prop {Guild} guild The guild that owns the channel
* @prop {String} id The ID of the channel
* @prop {String} mention A string that mentions the channel
* @prop {String} name The name of the channel
* @prop {Boolean} nsfw Whether the channel is an NSFW channel or not
* @prop {String?} parentID The ID of the category this channel belongs to
* @prop {Collection<PermissionOverwrite>} permissionOverwrites Collection of PermissionOverwrites in this channel
* @prop {Number} position The position of the channel
* @prop {Number} type The type of the channel
*/
class CategoryChannel extends GuildChannel {
    get channels() {
        const channels = new Collection(GuildChannel);
        if(this.guild && this.guild.channels) {
            for(const channel of this.guild.channels.values()) {
                if(channel.parentID === this.id) {
                    channels.add(channel);
                }
            }
        }
        return channels;
    }
}

module.exports = CategoryChannel;
