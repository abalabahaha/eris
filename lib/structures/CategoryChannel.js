"use strict";

const Collection = require("../util/Collection");
const GuildChannel = require("./GuildChannel");
const PermissionOverwrite = require("./PermissionOverwrite");

/**
* Represents a guild category channel. See GuildChannel for more properties and methods.
* @extends GuildChannel
* @prop {Collection<GuildChannel>} channels A collection of guild channels that are part of this category
* @prop {Collection<PermissionOverwrite>} permissionOverwrites Collection of PermissionOverwrites in this channel
* @prop {Number} position The position of the channel
*/
class CategoryChannel extends GuildChannel {
    constructor(data, client) {
        super(data, client);
        this.update(data);
    }

    update(data) {
        super.update(data);
        if(data.permission_overwrites) {
            this.permissionOverwrites = new Collection(PermissionOverwrite);
            data.permission_overwrites.forEach((overwrite) => {
                this.permissionOverwrites.add(overwrite);
            });
        }
        if(data.position !== undefined) {
            this.position = data.position;
        }
    }

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
