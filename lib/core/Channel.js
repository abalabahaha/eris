"use strict";

const Collection = require("../util/Collection");
const Member = require("./Member");
const Message = require("./Message");
const Permission = require("./Permission");
const Permissions = require("../Constants").Permissions;
const PermissionOverwrite = require("./PermissionOverwrite");

/**
* Represents a guild channel
* @prop {String} id The channel ID
* @prop {Number} createdAt Timestamp of channel creation
* @prop {Guild} guild The guild that owns the channel
* @prop {Collection} messages Collection of Messages in this channel
* @prop {String} lastMessageID The ID of the last message in this channel
* @prop {Collection} permissionOverwrites Collection of PermissionOverwrites in this channel
* @prop {String} type The channel type, either "text" or "voice"
* @prop {String} name The channel name
* @prop {Number} position The channel position
* @prop {?String} topic The channel topic (text channels only)
* @prop {?Number} bitrate The channel bitrate (voice channels only)
* @prop {?Collection} voiceMembers Collection of Members in this channel (voice channels only)
*/
class Channel {
    constructor(data, guild) {
        this.id = data.id;
        this.createdAt = (+this.id / 4194304) + 1420070400000;
        this.guild = guild || null;
        this.type = data.type;
        if(this.type === 0 || this.type === "text") {
            this.messages = new Collection(Message, guild.shard.client.options.messageLimit);
            this.lastMessageID = data.last_message_id;
        } else {
            this.voiceMembers = new Collection(Member);
        }
        this.update(data);
    }

    update(data) {
        this.name = data.name !== undefined ? data.name : this.name;
        this.topic = data.topic !== undefined ? data.topic : this.topic;
        this.position = data.position !== undefined ? data.position : this.position;
        this.bitrate = data.bitrate !== undefined ? data.bitrate : this.bitrate;
        if(data.permission_overwrites) {
            this.permissionOverwrites = new Collection(PermissionOverwrite);
            data.permission_overwrites.forEach((overwrite) => {
                this.permissionOverwrites.add(overwrite);
            });
        }
    }

    /**
    * Get the channel-specific permissions of a member
    * @arg {String} memberID The member ID
    * @returns {Permission}
    */
    permissionsOf(memberID) {
        var permission = this.guild.members.get(memberID).permission.allow;
        if(permission & Permissions.administrator) {
            return new Permission(Permissions.all);
        }
        var deny = 0;
        var allow = 0;
        for(var overwrite of this.permissionOverwrites) {
            if(overwrite[1].type === "role") {
                deny |= overwrite[1].deny;
                allow |= overwrite[1].allow;
            }
        }
        permission = (permission & ~deny) | allow;
        var memberOverwrite = this.permissionOverwrites.get(memberID);
        if(memberOverwrite) {
            permission = (permission & ~memberOverwrite.deny) | memberOverwrite.allow;
        }
        return new Permission(permission);
    }
}

module.exports = Channel;