"use strict";

const Base = require("./Base");

/**
* Represents an invite. Some properties are only available when fetching invites from channels, which requires the Manage Channel permission.
* @prop {String} code The invite code
* @prop {Object} channel Info on the invite channel
* @prop {String} channel.id The ID of the invite's channel
* @prop {String?} channel.name The name of the invite's channel
* @prop {Number} channel.type The type of the invite's channel
* @prop {String?} channel.icon The icon of a channel (group dm)
* @prop {Object?} guild Info on the invite guild
* @prop {String} guild.id The ID of the invite's guild
* @prop {String} guild.name The name of the invite's guild
* @prop {String?} guild.splash The hash of the invite splash screen
* @prop {String?} guild.banner The hash of the guild banner
* @prop {String?} guild.description The description of the invite's guild
* @prop {String?} guild.icon The hash of the guild icon
* @prop {String[]} guild.features An array of the invite's guild's features
* @prop {Number?} guild.verificationLevel The verification level of the invite's guild
* @prop {String?} guild.vanityUrlCode The vanity url of the invite's guild
* @prop {User?} inviter The invite creator
* @prop {Number?} uses The number of invite uses
* @prop {Number?} maxUses The max number of invite uses
* @prop {Number?} maxAge How long the invite lasts in seconds
* @prop {Boolean?} temporary Whether the invite grants temporary membership or not
* @prop {Number?} createdAt Timestamp of invite creation
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
                id: data.guild.id,
                name: data.guild.name,
                splash: data.guild.splash,
                banner: data.guild.banner,
                description: data.guild.description,
                icon: data.guild.icon,
                features: data.guild.features,
                verificationLevel: data.guild.verification_level,
                vanityUrlCode: data.guild.vanity_url_code
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
