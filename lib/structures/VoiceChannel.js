"use strict";

const Collection = require("../util/Collection");
const GuildChannel = require("./GuildChannel");
const Member = require("./Member");
const PermissionOverwrite = require("./PermissionOverwrite");

/**
* Represents a guild voice channel
* @extends GuildChannel
* @prop {String} id The ID of the channel
* @prop {String} mention A string that mentions the channel
* @prop {Guild} guild The guild that owns the channel
* @prop {String?} parentID The ID of the category this channel belongs to
* @prop {Collection<PermissionOverwrite>} permissionOverwrites Collection of PermissionOverwrites in this channel
* @prop {Number} type The type of the channel
* @prop {String} name The name of the channel
* @prop {Number} position The position of the channel
* @prop {Number?} bitrate The bitrate of the channel
* @prop {Number?} userLimit The max number of users that can join the channel
* @prop {Collection<Member>?} voiceMembers Collection of Members in this channel
*/
class VoiceChannel extends GuildChannel {
    constructor(data, guild) {
        super(data, guild);
        this.voiceMembers = new Collection(Member);
        this.update(data);
    }

    update(data) {
        this.name = data.name !== undefined ? data.name : this.name;
        this.position = data.position !== undefined ? data.position : this.position;
        this.bitrate = data.bitrate !== undefined ? data.bitrate : this.bitrate;
        this.userLimit = data.user_limit !== undefined ? data.user_limit : this.userLimit;
        this.parentID = data.parent_id !== undefined ? data.parent_id : this.parentID;
        if(data.permission_overwrites) {
            this.permissionOverwrites = new Collection(PermissionOverwrite);
            data.permission_overwrites.forEach((overwrite) => {
                this.permissionOverwrites.add(overwrite);
            });
        }
    }

    /**
    * Get all invites in the channel
    * @returns {Promise<Invite[]>}
    */
    getInvites() {
        return this.guild.shard.client.getChannelInvites.call(this.guild.shard.client, this.id);
    }

    /**
    * Create an invite for the channel
    * @arg {Object} [options] Invite generation options
    * @arg {Number} [options.maxAge] How long the invite should last in seconds
    * @arg {Number} [options.maxUses] How many uses the invite should last for
    * @arg {Boolean} [options.temporary] Whether the invite is temporary or not
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Invite>}
    */
    createInvite(options, reason) {
        return this.guild.shard.client.createChannelInvite.call(this.guild.shard.client, this.id, options, reason);
    }

    /**
    * Joins the channel.
    * @arg {Object} [options] VoiceConnection constructor options
    * @arg {Object} [options.shared] Whether the VoiceConnection will be part of a SharedStream or not
    * @arg {Object} [options.opusOnly] Skip opus encoder initialization. You should not enable this unless you know what you are doing
    * @returns {Promise<VoiceConnection>} Resolves with a VoiceConnection
    */
    join(options) {
        return this.guild.shard.client.joinVoiceChannel.call(this.guild.shard.client, this.id, options);
    }

    /**
    * Leaves the channel.
    */
    leave() {
        return this.guild.shard.client.leaveVoiceChannel.call(this.guild.shard.client, this.id);
    }
}

module.exports = VoiceChannel;
