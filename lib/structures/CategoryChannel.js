"use strict";

const Collection = require("../util/Collection");
const GuildChannel = require("./GuildChannel");

/**
* Represents a guild category channel. See GuildChannel for more properties and methods.
* @extends GuildChannel
* @prop {Collection<GuildChannel>} channels A collection of guild channels that are part of this category
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
