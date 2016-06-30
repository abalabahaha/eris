"use strict";

const Permission = require("./Permission");
const Permissions = require("../Constants").Permissions;

/**
* Represents a server member
* @prop {String} id The member ID
* @prop {String} mention A string that mentions the member
* @prop {Guild} guild The guild the member is in
* @prop {Number} joinedAt Timestamp of when the member joined the guild
* @prop {String} status The member's status. Either "online", "idle", or "offline"
* @prop {?Object} game The active game the member is playing
* @prop {String} game.name The name of the active game
* @prop {Number} game.type The type of the active game (0 is default, 1 is Twitch, 2 is YouTube)
* @prop {String} game.url The url of the active game
* @prop {?String} sessionID The voice session ID of the member
* @prop {Boolean} mute Whether the member is server muted or not
* @prop {Boolean} deaf Whether the member is server deafened or not
* @prop {Boolean} suppress Whether the member is suppressed or not
* @prop {Boolean} selfMute Whether the member is self muted or not
* @prop {Boolean} selfDeaf Whether the member is self deafened or not
* @prop {?String} nick The server nickname of the member
* @prop {String[]} roles An array of role IDs this member is a part of
* @prop {?String} channelID The current voice channel ID of the member
* @prop {User} user The user object of the member
* @prop {Permission} permission The guild-wide permissions of the member
*/
class Member {
    constructor(data, guild) {
        this.id = data.id;
        this.guild = guild;
        this.user = this.guild.shard.client.users.get(data.id);
        if(!this.user && data.user) {
            this.user = this.guild.shard.client.users.add(data.user);
        }
        if(!this.user) {
            throw new Error("User associated with Member not found: " + data.id);
        }
        this.joinedAt = Date.parse(data.joined_at);
        this.update(data);
    }

    update(data) {
        this.status = data.status !== undefined ? data.status : this.status || "offline";
        this.game = data.game !== undefined ? data.game : this.game || null;
        this.sessionID = data.session_id !== undefined ? data.session_id : this.sessionID;
        this.mute = data.mute !== undefined ? data.mute : this.mute || false;
        this.deaf = data.deaf !== undefined ? data.deaf : this.deaf || false;
        this.suppress = data.suppress !== undefined ? data.suppress : this.suppress || false; // Do bots care about this
        this.selfMute = data.self_mute !== undefined ? data.self_mute : this.selfMute || false;
        this.selfDeaf = data.self_deaf !== undefined ? data.self_deaf : this.selfDeaf || false;
        this.nick = data.nick !== undefined ? data.nick : this.nick || null;
        if(data.roles !== undefined) {
            this.roles = data.roles;
        }
        this.channelID = data.channel_id !== undefined ? data.channel_id : this.channelID;
    }

    get permission() {
        if(this.id === this.guild.ownerID) {
            return new Permission(Permissions.all);
        } else {
            var permissions = this.guild.roles.get(this.guild.id).permissions.allow;
            for(var role of this.roles) {
                var perm = this.guild.roles.get(role).permissions.allow;
                if(perm & Permissions.administrator) {
                    permissions = Permissions.all;
                    break;
                } else {
                    permissions |= perm;
                }
            }
            return new Permission(permissions);
        }
    }

    get mention() {
        return `<@!${this.id}>`;
    }
}

module.exports = Member;
