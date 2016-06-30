"use strict";

const User = require("./User");

/**
* Represents an invite
* @prop {String} code The invite code
* @prop {?String} xkcdpass The xkcdpass version of the code
* @prop {Object} channel Info on the invite channel
* @prop {String} channel.id The channel id
* @prop {String} channel.name The channel name
* @prop {Object} guild Info on the invite guild
* @prop {String} guild.id The guild id
* @prop {String} guild.name The guild name
* @prop {String} guild.splashHash The hash of the invite splash screen
* @prop {?User} inviter The invite creator
* @prop {?Number} uses The number of invite uses
* @prop {?Number} maxUses The max number of invite uses
* @prop {?Number} maxAge How long the invite lasts in seconds
* @prop {?Boolean} temporary Whether the invite is temporary or not
* @prop {?Number} createdAt Timestamp of invite creation
* @prop {?Boolean} revoked Whether the invite was revoked or not
*/
class Invite {
    constructor(data) {
        this.code = data.code;
        this.xkcdpass = data.xkcdpass;
        this.channel = data.channel;
        this.guild = {
            splashHash: data.guild.splash_hash,
            id: data.guild.id,
            name: data.guild.name
        };
        if(data.inviter) {
            this.inviter = new User(data.inviter);
        }
        this.uses = data.uses;
        this.maxUses = data.max_uses;
        this.maxAge = data.max_age;
        this.temporary = data.temporary;
        this.createdAt = data.created_at;
        this.revoked = data.revoked;
    }
}

module.exports = Invite;