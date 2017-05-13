"use strict";

const Base = require("./Base");

/**
* Represents a guild audit log entry thing
* TODO: doc this thing!1!
*/
class GuildAuditLogEntry extends Base {
    constructor(data, guild) {
        super(data.id);
        this.guild = guild;

        this.actionType = data.action_type;
        this.reason = data.reason || null;
        this.user = guild.shard.client.users.get(data.user_id);
        this.before = null;
        this.after = null;
        if(data.changes) {
            this.before = {};
            this.after = {};
            data.changes.forEach((change) => {
                if(change.old_value != undefined) {
                    this.before[change.key] = change.old_value;
                }
                if(change.new_value != undefined) {
                    this.after[change.key] = change.new_value;
                }
            });
        }

        if(data.target_id) {
            this.targetID = data.target_id;
        }
        if(data.options) {
            if(data.options.count) {
                this.count = +data.options.count;
            }
            if(data.options.channel_id) {
                this.channel = guild.channels.get(data.options.channel_id);
            }
            if(data.options.delete_member_days) {
                this.deleteMemberDays = +data.options.delete_member_days;
                this.membersRemoved = +data.options.members_removed;
            }
            if(data.options.type) {
                if(data.options.type === "member") {
                    this.member = guild.members.get(data.options.id) || {
                        id: data.options.id
                    };
                } else if(data.options.type === "role") {
                    this.role = guild.roles.get(data.options.id) || {
                        id: data.options.id,
                        name: data.options.role_name
                    };
                }
            }
        }
    }

    get target() { // pay more, get less
        if(this.actionType < 10) { // Guild
            return this.guild || {
                id: this.targetID
            };
        } else if(this.actionType < 20) { // Channel
            return this.guild && this.guild.channels.get(this.targetID) || {
                id: this.targetID
            };
        } else if(this.actionType < 30) { // Member
            return this.guild && this.guild.members.get(this.targetID) || {
                id: this.targetID,
                user: this.guild.shard.client.users.get(this.targetID)
            };
        } else if(this.actionType < 40) { // Role
            return this.guild && this.guild.roles.get(this.targetID) || {
                id: this.targetID
            };
        } else if(this.actionType < 50) { // Invite
            return this.guild && this.guild.channels.get(this.targetID) || {
                id: this.targetID
            };
        } else if(this.actionType < 60) { // Webhook
            return null; // Go get the webhook yourself
        } else if(this.actionType < 70) { // Emoji
            return this.guild && this.guild.emojis.find((emoji) => emoji.id === this.targetID) || {
                id: this.targetID
            };
        } else if(this.actionType < 80) { // Message
            return this.guild && this.guild.shard.client.users.get(this.targetID);
        } else {
            throw new Error("Unrecognized action type: " + this.actionType);
        }
    }
}

module.exports = GuildAuditLogEntry;