"use strict";

const Channel = require("./Channel");
const Collection = require("../util/Collection");
const Member = require("./Member");
const Permission = require("./Permission");
const Permissions = require("../Constants").Permissions;
const PermissionOverwrite = require("./PermissionOverwrite");

/**
* Represents a guild voice channel
* @extends Channel
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
class VoiceChannel extends Channel {
    constructor(data, guild) {
        super(data);
        this.guild = guild;
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
    * @arg {Number} [options.bitrate] The bitrate of the channel
    * @arg {Number} [options.userLimit] The channel user limit
    * @arg {Number?} [options.parentID] The ID of the parent channel category for this channel
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<VoiceChannel>}
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
