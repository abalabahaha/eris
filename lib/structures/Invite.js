"use strict";

/**
* Represents an invite. The nullable properties will be null if the bot user does not have manage channel or manage server permissions for the invite's channel/server.
* @prop {String} code The invite code
* @prop {Object} channel Info on the invite channel
* @prop {String} channel.id The ID of the invite's channel
* @prop {String} channel.name The name of the invite's channel
* @prop {Object} guild Info on the invite guild
* @prop {String} guild.id The ID of the invite's guild
* @prop {String} guild.name The name of the invite's guild
* @prop {String?} guild.splashHash The hash of the invite splash screen
* @prop {User?} inviter The invite creator
* @prop {Number?} uses The number of invite uses
* @prop {Number?} maxUses The max number of invite uses
* @prop {Number?} maxAge How long the invite lasts in seconds
* @prop {Boolean?} temporary Whether the invite is temporary or not
* @prop {Number?} createdAt Timestamp of invite creation
* @prop {Boolean?} revoked Whether the invite was revoked or not
*/
class Invite {
    constructor(data, client) {
        this._client = client;
        this.code = data.code;
        this.channel = data.channel;
        this.guild = {
            splashHash: data.guild.splash_hash,
            id: data.guild.id,
            name: data.guild.name
        };
        if(data.inviter) {
            this.inviter = client.users.add(data.inviter, client);
        }
        this.uses = data.uses !== undefined ? data.uses : null;
        this.maxUses = data.max_uses !== undefined ? data.max_uses : null;
        this.maxAge = data.max_age !== undefined ? data.max_age : null;
        this.temporary = data.temporary !== undefined ? data.temporary : null;
        this.createdAt = data.created_at !== undefined ? data.created_at : null;
        this.revoked = data.revoked !== undefined ? data.revoked : null;
    }

    /**
    * Delete the invite
    * @returns {Promise}
    */
    delete() {
        return this._client.deleteInvite.call(this._client, this.code);
    }
}

module.exports = Invite;