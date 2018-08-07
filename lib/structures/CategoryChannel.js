"use strict";

const Channel = require("./Channel");
const Collection = require("../util/Collection");
const GuildChannel = require("./GuildChannel");

/**
* Represents a guild category channel
* @extends GuildChannel
* @prop {String} id The ID of the channel
* @prop {String} mention A string that mentions the channel
* @prop {Number} type The type of the channel
* @prop {Guild} guild The guild that owns the channel
* @prop {String?} parentID The ID of the category this channel belongs to
* @prop {String} name The name of the channel
* @prop {Number} position The position of the channel
* @prop {Boolean} nsfw Whether the channel is an NSFW channel or not
* @prop {Collection<PermissionOverwrite>} permissionOverwrites Collection of PermissionOverwrites in this channel
* @prop {Collection<Channel>?} channels A collection of guild channels that are part of this category
*/
class CategoryChannel extends GuildChannel {
    constructor(data, guild) {
        super(data, guild);
        this.channels = new Collection(Channel);
        if(guild) {
            guild.channels.forEach((channel) => {
                if(channel.parentID === this.id) {
                    this.channels.add(channel);
                }
            });
        }

        this.update(data);
    }

    toJSON() {
        const base = super.toJSON(true);
        for(const prop of ["channels"]) {
            if(this[prop] !== undefined) {
                base[prop] = this[prop] && this[prop].toJSON ? this[prop].toJSON() : this[prop];
            }
        }
        return base;
    }
}

module.exports = CategoryChannel;
