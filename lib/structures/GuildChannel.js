"use strict";

const Channel = require("./Channel");
const Permission = require("./Permission");
const Permissions = require("../Constants").Permissions;

/**
* Represents a guild channel. You also probably want to look at CategoryChannel, TextChannel, and VoiceChannel.
* @extends Channel
* @prop {String} id The ID of the channel
* @prop {String} mention A string that mentions the channel
* @prop {Guild} guild The guild that owns the channel
* @prop {Number} type The type of the channel
*/
class GuildChannel extends Channel {
    constructor(data, guild) {
        super(data);
        this.guild = guild;
    }

    /**
    * Get the channel-specific permissions of a member
    * @arg {String} memberID The ID of the member
    * @returns {Permission}
    */
    permissionsOf(memberID) {
        var member = this.guild.members.get(memberID);
        var permission = member.permission.allow;
        if(permission & Permissions.administrator) {
            return new Permission(Permissions.all);
        }
        var overwrite = this.permissionOverwrites.get(this.guild.id);
        if(overwrite) {
            permission = (permission & ~overwrite.deny) | overwrite.allow;
        }
        var deny = 0;
        var allow = 0;
        for(var roleID of member.roles) {
            if((overwrite = this.permissionOverwrites.get(roleID))) {
                deny |= overwrite.deny;
                allow |= overwrite.allow;
            }
        }
        permission = (permission & ~deny) | allow;
        overwrite = this.permissionOverwrites.get(memberID);
        if(overwrite) {
            permission = (permission & ~overwrite.deny) | overwrite.allow;
        }
        return new Permission(permission);
    }

    /**
    * Edit the channel's properties
    * @arg {Object} options The properties to edit
    * @arg {String} [options.name] The name of the channel
    * @arg {String} [options.topic] The topic of the channel (guild text channels only)
    * @arg {Number} [options.bitrate] The bitrate of the channel (guild voice channels only)
    * @arg {Number} [options.userLimit] The channel user limit (guild voice channels only)
    * @arg {Number?} [options.parentID] The ID of the parent channel category for this channel (guild text/voice channels only)
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<CategoryChannel | TextChannel | VoiceChannel>}
    */
    edit(options, reason) {
        return this.guild.shard.client.editChannel.call(this.guild.shard.client, this.id, options, reason);
    }

    /**
    * Edit the channel's position. Note that channel position numbers are lowest on top and highest at the bottom.
    * @arg {Number} position The new position of the channel
    * @returns {Promise}
    */
    editPosition(position) {
        return this.guild.shard.client.editChannelPosition.call(this.guild.shard.client, this.id, position);
    }

    /**
    * Delete the channel
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    delete(reason) {
        return this.guild.shard.client.deleteChannel.call(this.guild.shard.client, this.id, reason);
    }

    /**
    * Create a channel permission overwrite
    * @arg {String} overwriteID The ID of the overwritten user or role
    * @arg {Number} allow The permissions number for allowed permissions
    * @arg {Number} deny The permissions number for denied permissions
    * @arg {String} type The object type of the overwrite, either "member" or "role"
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<PermissionOverwrite>}
    */
    editPermission(overwriteID, allow, deny, type, reason) {
        return this.guild.shard.client.editChannelPermission.call(this.guild.shard.client, this.id, overwriteID, allow, deny, type, reason);
    }

    /**
    * Delete a channel permission overwrite
    * @arg {String} overwriteID The ID of the overwritten user or role
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    deletePermission(overwriteID, reason) {
        return this.guild.shard.client.deleteChannelPermission.call(this.guild.shard.client, this.id, overwriteID, reason);
    }
}

module.exports = GuildChannel;