"use strict";

const Channel = require("./Channel");
const Collection = require("../util/Collection");
const GuildChannel = require("./GuildChannel");
const PermissionOverwrite = require("./PermissionOverwrite");

/**
* Represents a guild category channel
* @extends GuildChannel
* @prop {String} id The ID of the channel
* @prop {String} mention A string that mentions the channel
* @prop {Guild} guild The guild that owns the channel
* @prop {String?} parentID The ID of the category this channel belongs to
* @prop {Number} type The type of the channel
* @prop {String} name The name of the channel
* @prop {Number} position The position of the channel
* @prop {Collection<Channel>?} channels A collection of guild channels that are part of this category
* @prop {Boolean} nsfw Whether the channel is an NSFW channel or not
*/
class CategoryChannel extends GuildChannel {
    constructor(data, guild) {
        super(data, guild);
        this.channels = new Collection(Channel);
        guild.channels.forEach((channel) => {
            if(channel.parentID === this.id) {
                this.channels.add(channel);
            }
        });
        this.update(data);
    }

    update(data) {
        this.name = data.name !== undefined ? data.name : this.name;
        this.position = data.position !== undefined ? data.position : this.position;
        this.parentID = data.parent_id !== undefined ? data.parent_id : this.parentID;
        this.nsfw = (this.name.length === 4 ? this.name === "nsfw" : this.name.startsWith("nsfw-")) || data.nsfw;
        if(data.permission_overwrites) {
            this.permissionOverwrites = new Collection(PermissionOverwrite);
            data.permission_overwrites.forEach((overwrite) => {
                this.permissionOverwrites.add(overwrite);
            });
        }
    }
}

module.exports = CategoryChannel;
