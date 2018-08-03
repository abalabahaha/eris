"use strict";

const Base = require("./Base");

/**
* Represents an invite. The nullable properties will be null if the bot user does not have manage channel or manage server permissions for the invite's channel/server.
* @prop {String} code The invite code
* @prop {Object} channel Info on the invite channel
* @prop {String} channel.id The ID of the invite's channel
* @prop {String} channel.name The name of the invite's channel
* @prop {Object?} guild Info on the invite guild
* @prop {String} guild.id The ID of the invite's guild
* @prop {String} guild.name The name of the invite's guild
* @prop {String?} guild.splash The hash of the invite splash screen
* @prop {String?} guild.icon The hash of the guild icon
* @prop {Number?} guild.textChannelCount The number of text channels in the guild
* @prop {Number?} guild.voiceChannelCount The number of voice channels in the guild
* @prop {User?} inviter The invite creator
* @prop {Number?} uses The number of invite uses
* @prop {Number?} maxUses The max number of invite uses
* @prop {Number?} maxAge How long the invite lasts in seconds
* @prop {Boolean?} temporary Whether the invite is temporary or not
* @prop {Number?} createdAt Timestamp of invite creation
* @prop {Boolean?} revoked Whether the invite was revoked or not
* @prop {Number?} presenceCount The **approximate** presence count for the guild
* @prop {Number?} memberCount The **approximate** member count for the guild
*/
class Invite extends Base {
    constructor(data, client) {
        super();
        this._client = client;
        this.code = data.code;
        this.channel = data.channel;
        if(data.guild) {
            this.guild = {
                splash: data.guild.splash,
                icon: data.guild.icon,
                id: data.guild.id,
                name: data.guild.name,
                textChannelCount: data.guild.text_channel_count !== undefined ? data.guild.text_channel_count : null,
                voiceChannelCount: data.guild.voice_channel_count !== undefined ? data.guild.voice_channel_count : null
            };
        }
        if(data.inviter) {
            this.inviter = client.users.add(data.inviter, client);
        }
        this.uses = data.uses !== undefined ? data.uses : null;
        this.maxUses = data.max_uses !== undefined ? data.max_uses : null;
        this.maxAge = data.max_age !== undefined ? data.max_age : null;
        this.temporary = data.temporary !== undefined ? data.temporary : null;
        this._createdAt = data.created_at !== undefined ? data.created_at : null;
        this.revoked = data.revoked !== undefined ? data.revoked : null;
        this.presenceCount = data.approximate_presence_count !== undefined ? data.approximate_presence_count : null;
        this.memberCount = data.approximate_member_count !== undefined ? data.approximate_member_count : null;
    }

    get createdAt() {
        return this._createdAt;
    }

    /**
    * Delete the invite
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    delete(reason) {
        return this._client.deleteInvite.call(this._client, this.code, reason);
    }

    toJSON() {
        const base = super.toJSON(true);
        for(const prop of ["channel", "code", "createdAt", "guild", "maxAge", "maxUses", "memberCount", "presenceCount", "revoked", "temporary", "uses"]) {
            if(this[prop] !== undefined) {
                base[prop] = this[prop] && this[prop].toJSON ? this[prop].toJSON() : this[prop];
            }
        }
        return base;
    }
}

module.exports = Invite;
