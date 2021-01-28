"use strict";

const Base = require("./Base");
const Guild = require("./Guild");

/**
* Represents an invite. Some properties are only available when fetching invites from channels, which requires the Manage Channel permission.
* @prop {TextChannel | NewsChannel | VoiceChannel | GroupChannel | Object} channel Info on the invite channel
* @prop {String} channel.id The ID of the invite's channel
* @prop {String?} channel.name The name of the invite's channel
* @prop {Number} channel.type The type of the invite's channel
* @prop {String?} channel.icon The icon of a channel (group dm)
* @prop {String} code The invite code
* @prop {Number?} createdAt Timestamp of invite creation
* @prop {Guild?} guild Info on the invite guild
* @prop {User?} inviter The invite creator
* @prop {Number?} maxAge How long the invite lasts in seconds
* @prop {Number?} maxUses The max number of invite uses
* @prop {Number?} memberCount The **approximate** member count for the guild
* @prop {Number?} presenceCount The **approximate** presence count for the guild
* @prop {Boolean?} temporary Whether the invite grants temporary membership or not
* @prop {Number?} uses The number of invite uses
*/
class Invite extends Base {
    constructor(data, client) {
        super();
        this._client = client;
        this.code = data.code;
        if(data.guild && client.guilds.has(data.guild.id)) {
            this.channel = client.guilds.get(data.guild.id).channels.update(data.channel);
        } else {
            this.channel = data.channel;
        }
        if(data.guild) {
            if(client.guilds.has(data.guild.id)) {
                this.guild = client.guilds.update(data.guild, client);
            } else {
                this.guild = new Guild(data.guild, client);
            }
        }
        if(data.inviter) {
            this.inviter = client.users.add(data.inviter, client);
        }
        this.uses = data.uses !== undefined ? data.uses : null;
        this.maxUses = data.max_uses !== undefined ? data.max_uses : null;
        this.maxAge = data.max_age !== undefined ? data.max_age : null;
        this.temporary = data.temporary !== undefined ? data.temporary : null;
        this._createdAt = data.created_at !== undefined ? data.created_at : null;
        this.presenceCount = data.approximate_presence_count !== undefined ? data.approximate_presence_count : null;
        this.memberCount = data.approximate_member_count !== undefined ? data.approximate_member_count : null;
    }

    get createdAt() {
        return Date.parse(this._createdAt);
    }

    /**
    * Delete the invite
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    delete(reason) {
        return this._client.deleteInvite.call(this._client, this.code, reason);
    }

    toString() {
        return `[Invite ${this.code}]`;
    }

    toJSON(props = []) {
        return super.toJSON([
            "channel",
            "code",
            "createdAt",
            "guild",
            "maxAge",
            "maxUses",
            "memberCount",
            "presenceCount",
            "revoked",
            "temporary",
            "uses",
            ...props
        ]);
    }
}

module.exports = Invite;
