"use strict";

const Channel = require("./Channel");
const Permission = require("./Permission");
const {Permissions} = require("../Constants");

/**
 * Represents a guild channel. You also probably want to look at CategoryChannel, NewsChannel, TextChannel, ThreadChannel, and TextVoiceChannel. See Channel for extra properties.
 * @extends Channel
 * @prop {Number?} flags Channel flags (see constants) (thread/forum channels only)
 * @prop {Guild} guild The guild that owns the channel
 * @prop {String} id The ID of the channel
 * @prop {String} name The name of the channel
 * @prop {String?} parentID The ID of the category this channel belongs to or the channel ID where the thread originated from (thread channels only)
 * @prop {Collection<PermissionOverwrite>} permissionOverwrites Collection of PermissionOverwrites in this channel
 * @prop {Number} position The position of the channel
 */
class GuildChannel extends Channel {
    constructor(data, client) {
        super(data, client);
        this.guild = client.guilds.get(data.guild_id) || {
            id: data.guild_id
        };

        this.update(data);
    }

    update(data) {
        if(data.type !== undefined) {
            this.type = data.type;
        }
        if(data.name !== undefined) {
            this.name = data.name;
        }
        if(data.parent_id !== undefined) {
            this.parentID = data.parent_id;
        }
        if(data.flags !== undefined) {
            this.flags = data.flags;
        }
    }

    /**
     * Delete the channel
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise}
     */
    delete(reason) {
        return this.client.deleteChannel.call(this.client, this.id, reason);
    }

    /**
     * Delete a channel permission overwrite
     * @arg {String} overwriteID The ID of the overwritten user or role
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise}
     */
    deletePermission(overwriteID, reason) {
        return this.client.deleteChannelPermission.call(this.client, this.id, overwriteID, reason);
    }

    /**
     * Edit the channel's properties
     * @arg {Object} options The properties to edit
     * @arg {Array<String>} [options.appliedTags] The IDs of the set of tags that have been applied to a thread in a forum channel (threads created in forum channels only, max 5)
     * @arg {Boolean} [options.archived] The archive status of the channel (thread channels only)
     * @arg {Number} [options.autoArchiveDuration] The duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080 (thread channels only)
     * @arg {Array<Object>} [options.availableTags] The available tags that can be applied to threads in a forum channel. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#forum-tag-object) for object structure (forum channels only, max 20)
     * @arg {Number} [options.bitrate] The bitrate of the channel (guild voice channels only)
     * @arg {Number} [options.defaultAutoArchiveDuration] The default duration of newly created threads in minutes to automatically archive the thread after inactivity (60, 1440, 4320, 10080) (text/news/forum channels only)
     * @arg {Number} [options.defaultForumLayout] The default forum layout type used to display posts in forum channels (forum channels only)
     * @arg {Object} [options.defaultReactionEmoji] The emoji to show in the add reaction button on a thread in a forum channel (forum channels only)
     * @arg {Number} [options.defaultSortOrder] The default sort order type used to order posts in forum channels (forum channels only)
     * @arg {Number} [options.defaultThreadRateLimitPerUser] The initial rateLimitPerUser to set on newly created threads in a channel (text/forum channels only)
     * @arg {Number} [options.flags] The flags for the channel combined as a bitfield (thread/forum channels only). Note: `PINNED` can only be set for threads in forum channels, and `REQUIRE_TAG` can only be set for forum channels
     * @arg {Boolean} [options.invitable] Whether non-moderators can add other non-moderators to the channel (private thread channels only)
     * @arg {Boolean} [options.locked] The lock status of the channel (thread channels only)
     * @arg {String} [options.name] The name of the channel
     * @arg {Boolean} [options.nsfw] The nsfw status of the channel
     * @arg {String?} [options.parentID] The ID of the parent channel category for this channel (guild text/voice channels only) or the channel ID where the thread originated from (thread channels only)
     * @arg {Array<Object>} [options.permissionOverwrites] An array containing permission overwrite objects
     * @arg {Number} [options.position] The sorting position of the channel
     * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (0-21600) (does not affect bots or users with manageMessages/manageChannel permissions) (text/voice/stage/forum channels only)
     * @arg {String?} [options.rtcRegion] The RTC region ID of the channel (automatic if `null`) (guild voice channels only)
     * @arg {String} [options.topic] The topic of the channel (guild text channels only)
     * @arg {Number} [options.userLimit] The channel user limit (guild voice channels only)
     * @arg {Number} [options.videoQualityMode] The camera video quality mode of the channel (guild voice channels only). `1` is auto, `2` is 720p
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<CategoryChannel | ForumChannel | NewsChannel | NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel | TextChannel | TextVoiceChannel>}
     */
    edit(options, reason) {
        return this.client.editChannel.call(this.client, this.id, options, reason);
    }

    /**
     * Create a channel permission overwrite
     * @arg {String} overwriteID The ID of the overwritten user or role
     * @arg {BigInt | Number} allow The permissions number for allowed permissions
     * @arg {BigInt | Number} deny The permissions number for denied permissions
     * @arg {Number} type The object type of the overwrite, either 1 for "member" or 0 for "role"
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<PermissionOverwrite>}
     */
    editPermission(overwriteID, allow, deny, type, reason) {
        return this.client.editChannelPermission.call(this.client, this.id, overwriteID, allow, deny, type, reason);
    }

    /**
     * Edit the channel's position. Note that channel position numbers are lowest on top and highest at the bottom.
     * @arg {Number} position The new position of the channel
     * @arg {Object} [options] Additional options when editing position
     * @arg {Boolean} [options.lockPermissions] Whether to sync the permissions with the new parent if moving to a new category
     * @arg {String} [options.parentID] The new parent ID (category channel) for the channel that is moved
     * @returns {Promise}
     */
    editPosition(position, options) {
        return this.client.editChannelPosition.call(this.client, this.id, position, options);
    }

    /**
     * Get the channel-specific permissions of a member
     * @arg {String | Member | Object} memberID The ID of the member or a Member object
     * @returns {Permission}
     */
    permissionsOf(memberID) {
        const member = typeof memberID === "string" ? this.guild.members.get(memberID) : memberID;
        let permission = this.guild.permissionsOf(member).allow;
        if(permission & Permissions.administrator) {
            return new Permission(Permissions.all);
        }
        const channel = this instanceof ThreadChannel ? this.guild.channels.get(this.parentID) : this;
        let overwrite = channel && channel.permissionOverwrites.get(this.guild.id);
        if(overwrite) {
            permission = (permission & ~overwrite.deny) | overwrite.allow;
        }
        let deny = 0n;
        let allow = 0n;
        for(const roleID of member.roles) {
            if((overwrite = channel && channel.permissionOverwrites.get(roleID))) {
                deny |= overwrite.deny;
                allow |= overwrite.allow;
            }
        }
        permission = (permission & ~deny) | allow;
        overwrite = channel && channel.permissionOverwrites.get(member.id);
        if(overwrite) {
            permission = (permission & ~overwrite.deny) | overwrite.allow;
        }
        return new Permission(permission);
    }

    toJSON(props = []) {
        return super.toJSON([
            "parentID",
            "flags",
            ...props
        ]);
    }
}

module.exports = GuildChannel;

const ThreadChannel = require("./ThreadChannel");
