"use strict";

const GuildChannel = require("./GuildChannel");

/**
* Represents a store channel
* @extends GuildChannel
* @prop {Guild} guild The guild that owns the channel
* @prop {String} id The ID of the channel
* @prop {String} mention A string that mentions the channel
* @prop {String} name The name of the channel
* @prop {Boolean} nsfw Whether the channel is an NSFW channel or not
* @prop {String?} parentID The ID of the category this channel belongs to
* @prop {Number} position The position of the channel
* @prop {Collection<PermissionOverwrite>} permissionOverwrites Collection of PermissionOverwrites in this channel
* @prop {Number} type The type of the channel
*/
class StoreChannel extends GuildChannel {
}

module.exports = StoreChannel;
