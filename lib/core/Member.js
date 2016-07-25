"use strict";

const Permission = require("./Permission");
const Permissions = require("../Constants").Permissions;
const VoiceState = require("./VoiceState");

/**
* Represents a server member
* @prop {String} id The ID of the member
* @prop {String} mention A string that mentions the member
* @prop {Guild} guild The guild the member is in
* @prop {Number} joinedAt Timestamp of when the member joined the guild
* @prop {String} status The member's status. Either "online", "idle", or "offline"
* @prop {Object?} game The active game the member is playing
* @prop {String} game.name The name of the active game
* @prop {Number} game.type The type of the active game (0 is default, 1 is Twitch, 2 is YouTube)
* @prop {String} game.url The url of the active game
* @prop {VoiceState?} voiceState The voice state of the member
* @prop {String?} nick The server nickname of the member
* @prop {String[]} roles An array of role IDs this member is a part of
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
        this.voiceState = null;
        this.joinedAt = Date.parse(data.joined_at);
        this.update(data);
    }

    update(data) {
        this.status = data.status !== undefined ? data.status : this.status || "offline";
        this.game = data.game !== undefined ? data.game : this.game || null;

        if(data.session_id !== undefined) {
            if(this.voiceState) {
                this.voiceState.update(data);
            } else {
                this.voiceState = new VoiceState(data);
            }
        }

        this.nick = data.nick !== undefined ? data.nick : this.nick || null;
        if(data.roles !== undefined) {
            this.roles = data.roles;
        }
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
