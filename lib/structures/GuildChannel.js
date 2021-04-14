"use strict";

const Channel = require("./Channel");
const Collection = require("../util/Collection");
const Member = require("./Member");
const Permission = require("./Permission");
const {Permissions} = require("../Constants");
const PermissionOverwrite = require("./PermissionOverwrite");

/**
* Represents a guild channel. You also probably want to look at CategoryChannel, NewsChannel, StoreChannel, TextChannel, and VoiceChannel. See Channel for extra properties.
* @extends Channel
* @prop {Guild} guild The guild that owns the channel
* @prop {String} id The ID of the channel
* @prop {String} name The name of the channel
* @prop {Boolean} nsfw Whether the channel is an NSFW channel or not
* @prop {String?} parentID The ID of the category this channel belongs to
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
        if(data.position !== undefined) {
            this.position = data.position;
        }
        if(data.parent_id !== undefined) {
            this.parentID = data.parent_id;
        }
        this.nsfw = data.nsfw;
        if(data.permission_overwrites) {
            this.permissionOverwrites = new Collection(PermissionOverwrite);
            data.permission_overwrites.forEach((overwrite) => {
                this.permissionOverwrites.add(overwrite);
            });
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
    * @arg {String} [options.name] The name of the channel
    * @arg {String} [options.topic] The topic of the channel (guild text channels only)
    * @arg {Number} [options.bitrate] The bitrate of the channel (guild voice channels only)
    * @arg {Number} [options.userLimit] The channel user limit (guild voice channels only)
    * @arg {Number} [options.videoQualityMode] The camera video quality mode of the channel (guild voice channels only). `1` is auto, `2` is 720p
    * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (does not affect bots or users with manageMessages/manageChannel permissions) (guild text channels only)
    * @arg {String?} [options.rtcRegion] The RTC region ID of the channel (automatic if `null`) (guild voice channels only)
    * @arg {Boolean} [options.nsfw] The nsfw status of the channel
    * @arg {Number?} [options.parentID] The ID of the parent channel category for this channel (guild text/voice channels only)
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<CategoryChannel | TextChannel | VoiceChannel | NewsChannel>}
    */
    edit(options, reason) {
        return this.client.editChannel.call(this.client, this.id, options, reason);
    }

    /**
    * Create a channel permission overwrite
    * @arg {String} overwriteID The ID of the overwritten user or role
    * @arg {BigInt | Number} allow The permissions number for allowed permissions
    * @arg {BigInt | Number} deny The permissions number for denied permissions
    * @arg {String} type The object type of the overwrite, either "member" or "role"
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
    * @arg {String | Member} memberID The ID of the member or a Member instance
    * @returns {Permission}
    */
    permissionsOf(memberID) {
        const member = memberID instanceof Member ? memberID : this.guild.members.get(memberID);
        let permission = this.guild.permissionsOf(member).allow;
        if(permission & Permissions.administrator) {
            return new Permission(Permissions.all);
        }
        let overwrite = this.permissionOverwrites.get(this.guild.id);
        if(overwrite) {
            permission = (permission & ~overwrite.deny) | overwrite.allow;
        }
        let deny = 0n;
        let allow = 0n;
        for(const roleID of member.roles) {
            if((overwrite = this.permissionOverwrites.get(roleID))) {
                deny |= overwrite.deny;
                allow |= overwrite.allow;
            }
        }
        permission = (permission & ~deny) | allow;
        overwrite = this.permissionOverwrites.get(member.id);
        if(overwrite) {
            permission = (permission & ~overwrite.deny) | overwrite.allow;
        }
        return new Permission(permission);
    }

    toJSON(props = []) {
        return super.toJSON([
            "name",
            "nsfw",
            "parentID",
            "permissionOverwrites",
            "position",
            ...props
        ]);
    }
}

module.exports = GuildChannel;
