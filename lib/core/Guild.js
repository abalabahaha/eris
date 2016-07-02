"use strict";

const Bucket = require("../util/Bucket");
const Channel = require("./Channel");
const Collection = require("../util/Collection");
const Member = require("./Member");
const Role = require("./Role");

/**
* Represents a guild
* @prop {String} id The guild ID
* @prop {Number} createdAt Timestamp of guild creation
* @prop {String} name The guild name
* @prop {Number} verificationLevel The guild verification level
* @prop {String} region The guild region
* @prop {Channel} defaultChannel The default channel of the guild
* @prop {?String} icon The guild icon hash, or null if no icon
* @prop {String} afkChannelID The AFK voice channel ID
* @prop {Number} afkTimeout The AFK timeout in seconds
* @prop {Number} joinedAt Timestamp of when the bot account joined the guild
* @prop {String} ownerID The user ID to transfer server ownership to (bot user must be owner)
* @prop {?String} splash The guild splash image hash, or null if no splash (VIP only)
* @prop {Boolean} unavailable Whether the guild is unavailable or not
* @prop {Collection} channels Collection of Channels in the guild
* @prop {Collection} members Collection of Members in the guild
* @prop {Number} memberCount Number of members in the guild
* @prop {Collection} roles Collection of Roles in the guild
* @prop {Shard} shard The Shard that owns the guild
* @prop {Object[]} features An array of guild features
* @prop {Object[]} emojis An array of guild emojis
*/
class Guild {
    constructor(data, client) {
        this.id = data.id;
        this.createdAt = (+this.id / 4194304) + 1420070400000;
        this.shard = client.shards.get(client.guildShardMap[this.id]);
        this.unavailable = !!data.unavailable;
        if(this.unavailable) {
            return;
        }
        if(client.options.buckets) {
            client.buckets["bot:msg:guild:" + this.id] = new Bucket(5, 5000, client.options.sequencerWait);
            client.buckets["dmsg:" + this.id] = new Bucket(5, 1000, client.options.sequencerWait);
            client.buckets["bdmsg:" + this.id] = new Bucket(1, 1000, client.options.sequencerWait);
            client.buckets["guild_member:" + this.id] = new Bucket(10, 10000, client.options.sequencerWait);
            client.buckets["guild_member_nick:" + this.id] = new Bucket(1, 1000, client.options.sequencerWait);
        }
        this.joinedAt = data.joined_at;
        this.channels = new Collection(Channel);
        this.members = new Collection(Member);
        this.memberCount = data.member_count || data.members.length;
        this.roles = new Collection(Role);

        for(var channel of data.channels) {
            channel = this.channels.add(channel, this);
            client.channelGuildMap[channel.id] = this.id;
        }

        this.defaultChannel = this.channels.get(this.id);

        for(var role of data.roles) {
            this.roles.add(role);
        }

        if(data.members) {
            for(var member of data.members) {
                member.id = member.user.id;
                this.members.add(member, this);
            }
        }

        if(data.presences) {
            for(var presence of data.presences) {
                presence.id = presence.user.id;
                this.members.update(presence);
            }
        }

        if(data.voice_states) {
            if(client.options.selfbot && client.options.gatewayVersion >= 5) {
                this.pendingVoiceStates = data.voice_states || [];
            } else {
                for(var voiceState of data.voice_states) {
                    voiceState.id = voiceState.user_id;
                    channel = this.channels.get(voiceState.channel_id);
                    if(channel) {
                        channel.voiceMembers.add(this.members.update(voiceState));
                    } else { // Phantom voice states from connected users in deleted channels (╯°□°）╯︵ ┻━┻
                        client.emit("warn", "Phantom voice state received but channel not found | Guild: " + this.id + " | Channel: " + voiceState.channel_id);
                    }
                }
            }
        }
        this.update(data);
    }

    update(data) {
        this.name = data.name !== undefined ? data.name : this.name;
        this.verificationLevel = data.verification_level !== undefined ? data.verification_level : this.verificationLevel;
        this.splash = data.splash !== undefined ? data.splash : this.splash;
        this.region = data.region !== undefined ? data.region : this.region;
        this.ownerID = data.owner_id !== undefined ? data.owner_id : this.ownerID;
        this.icon = data.icon !== undefined ? data.icon : this.icon;
        this.features = data.features !== undefined ? data.features : this.features; // TODO parse features
        this.emojis = data.emojis !== undefined ? data.emojis : this.emojis; // TODO parse emojis
        this.afkChannelID = data.afk_channel_id !== undefined ? data.afk_channel_id : this.afkChannelID;
        this.afkTimeout = data.afk_timeout !== undefined ? data.afk_timeout : this.afkTimeout;
    }

    /**
    * Request all guild members from Discord
    */
    fetchAllMembers() {
        this.shard.getGuildMembers(this.id, Math.ceil(this.memberCount / 1000)); // TODO Promise with chunk timeout
    }
}

module.exports = Guild;
