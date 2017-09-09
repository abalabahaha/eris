"use strict";

const GuildChannel = require("./GuildChannel");
const Collection = require("../util/Collection");

/**
* Represents a guild category channel
* @extends GuildChannel
* @prop {Collection<GuildChannel>?} channels A collection of guild channels that are part of this category
*/
class CategoryChannel extends GuildChannel {
    constructor(data, guild) {
        super(data, guild);

        this.channels = new Collection(GuildChannel);

        guild.channels.forEach((channel) => {
            if(channel.parentID === this.id) {
                this.channels.add(channel);
            }
        });
    }
}

module.exports = CategoryChannel;
