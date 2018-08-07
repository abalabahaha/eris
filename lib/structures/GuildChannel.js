"use strict";

const Channel = require("./Channel");
const Collection = require("../util/Collection");
const Permission = require("./Permission");
const Permissions = require("../Constants").Permissions;
const PermissionOverwrite = require("./PermissionOverwrite");

/**
* Represents a guild channel. You also probably want to look at CategoryChannel, TextChannel, and VoiceChannel.
* @extends Channel
* @prop {String} id The ID of the channel
* @prop {String} mention A string that mentions the channel
* @prop {Number} type The type of the channel
* @prop {Guild} guild The guild that owns the channel
* @prop {String?} parentID The ID of the category this channel belongs to
* @prop {String} name The name of the channel
* @prop {Number} position The position of the channel
* @prop {Boolean} nsfw Whether the channel is an NSFW channel or not
* @prop {Collection<PermissionOverwrite>} permissionOverwrites Collection of PermissionOverwrites in this channel
*/
class GuildChannel extends Channel {
    constructor(data, guild) {
        super(data);
        if (!guild && data.guild_id) {
            this.guild = {
                id: data.guild_id
            };
        } else {
            this.guild = guild;
        }

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

    /**
    * Get the channel-specific permissions of a member
    * @arg {String} memberID The ID of the member
    * @returns {Permission}
    */
    permissionsOf(memberID) {
        const member = this.guild.members.get(memberID);
        let permission = member.permission.allow;
        if(permission & Permissions.administrator) {
            return new Permission(Permissions.all);
        }
        let overwrite = this.permissionOverwrites.get(this.guild.id);
        if(overwrite) {
            permission = (permission & ~overwrite.deny) | overwrite.allow;
        }
        let deny = 0;
        let allow = 0;
        for(const roleID of member.roles) {
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

    toJSON() {
        const base = super.toJSON(true);
        for(const prop of ["name", "nsfw", "parentID", "permissionOverwrites", "position"]) {
            if(this[prop] !== undefined) {
                base[prop] = this[prop] && this[prop].toJSON ? this[prop].toJSON() : this[prop];
            }
        }
        return base;
    }
}

module.exports = GuildChannel;
