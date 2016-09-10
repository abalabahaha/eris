"use strict";

const CDN_URL = require("../Constants").Endpoints.CDN_URL;
const GuildChannel = require("./GuildChannel");
const Collection = require("../util/Collection");
const Member = require("./Member");
const Role = require("./Role");

/**
* Represents a guild
* @prop {String} id The ID of the guild
* @prop {Number} createdAt Timestamp of guild creation
* @prop {String} name The name of the guild
* @prop {Number} verificationLevel The guild verification level
* @prop {String} region The region of the guild
* @prop {GuildChannel} defaultChannel The default channel of the guild
* @prop {String?} icon The hash of the guild icon, or null if no icon
* @prop {String} afkChannelID The ID of the AFK voice channel
* @prop {Number} afkTimeout The AFK timeout in seconds
* @prop {Number} defaultNotifications The default notification settings for the guild. 0 is "All Messages", 1 is "Only @mentions"
* @prop {Number} mfaLevel The admin 2FA level for the server. 0 is not required, 1 is required
* @prop {Number} joinedAt Timestamp of when the bot account joined the guild
* @prop {String} ownerID The ID of the user that is the guild owner
* @prop {String?} splash The hash of the guild splash image, or null if no splash (VIP only)
* @prop {Boolean} unavailable Whether the guild is unavailable or not
* @prop {Collection<GuildChannel>} channels Collection of Channels in the guild
* @prop {Collection<Member>} members Collection of Members in the guild
* @prop {Number} memberCount Number of members in the guild
* @prop {Collection<Role>} roles Collection of Roles in the guild
* @prop {Shard} shard The Shard that owns the guild
* @prop {Object[]} features An array of guild features
* @prop {Object[]} emojis An array of guild emojis
* @prop {String?} iconURL The URL of the guild's icon
*/
class Guild {
    constructor(data, client) {
        this.id = data.id;
        this.createdAt = (this.id / 4194304) + 1420070400000;
        this.shard = client.shards.get(client.guildShardMap[this.id]);
        this.unavailable = !!data.unavailable;
        if(this.unavailable) {
            return;
        }
        this.joinedAt = Date.parse(data.joined_at);
        this.channels = new Collection(GuildChannel);
        this.members = new Collection(Member);
        this.memberCount = data.member_count || data.members.length;
        this.roles = new Collection(Role);

        for(var channel of data.channels) {
            channel = this.channels.add(channel, this);
            client.channelGuildMap[channel.id] = this.id;
        }

        this.defaultChannel = this.channels.get(this.id);

        for(var role of data.roles) {
            this.roles.add(role, this);
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
            if(!client.bot && client.options.gatewayVersion >= 5) {
                this.pendingVoiceStates = data.voice_states || [];
            } else {
                for(var voiceState of data.voice_states) {
                    voiceState.id = voiceState.user_id;
                    this.channels.get(voiceState.channel_id).voiceMembers.add(this.members.update(voiceState));
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
        this.defaultNotifications = data.default_message_notifications !== undefined ? data.default_message_notifications : this.defaultNotifications;
        this.mfaLevel = data.mfa_level !== undefined ? data.mfa_level : this.mfaLevel;
    }

    /**
    * Request all guild members from Discord
    */
    fetchAllMembers() {
        this.shard.getGuildMembers(this.id, Math.ceil(this.memberCount / 1000)); // TODO Promise with chunk timeout
    }

    get iconURL() {
        return this.icon ? `${CDN_URL}/icons/${this.id}/${this.icon}.jpg` : null;
    }

    get splashURL() {
        return this.splash ? `${CDN_URL}/splashes/${this.id}/${this.splash}.jpg` : null;
    }

    /**
    * Create a channel in the guild
    * @arg {String} name The name of the channel
    * @arg {String} [type=0] The type of the channel, either 0 or 2 ("text" or "voice" respectively in gateway 5 and under)
    * @returns {Promise<GuildChannel>}
    */
    createChannel() {
        return this.shard.client.createChannel.apply(this.shard.client, [this.id].concat(arguments));
    }

    /**
    * Create a guild role
    * @returns {Promise<Role>}
    */
    createRole() {
        return this.shard.client.createRole.apply(this.shard.client, [this.id].concat(arguments));
    }

    /**
    * Get the prune count for the guild
    * @arg {Number} days The number of days of inactivity to prune for
    * @returns {Promise<Number>} Resolves with the number of users that would be pruned
    */
    getPruneCount() {
        return this.shard.client.getPruneCount.apply(this.shard.client, [this.id].concat(arguments));
    }

    /**
    * Begin pruning the guild
    * @arg {Number} days The number of days of inactivity to prune for
    * @returns {Promise<Number>} Resolves with the number of pruned users
    */
    pruneMembers() {
        return this.shard.client.pruneMembers.apply(this.shard.client, [this.id].concat(arguments));
    }

    /**
    * Get possible voice reigons for a guild
    * @returns {Promise<Object[]>} Resolves with an array of voice region objects
    */
    getVoiceRegions() {
        return this.shard.client.getVoiceRegions.apply(this.shard.client, [this.id].concat(arguments));
    }

    /**
    * Delete a role
    * @arg {String} roleID The ID of the role
    * @returns {Promise}
    */
    deleteRole() {
        return this.shard.client.deleteRole.apply(this.shard.client, [this.id].concat(arguments));
    }

    /**
    * Get a list of integrations for the guild
    * @returns {Promise<GuildIntegration[]>}
    */
    getIntegrations() {
        return this.shard.client.getGuildIntegrations.apply(this.shard.client, [this.id].concat(arguments));
    }

    /**
    * Edit a guild integration
    * @arg {String} integrationID The ID of the integration
    * @arg {Object} options The properties to edit
    * @arg {String} [options.expireBehavior] What to do when a user's subscription runs out
    * @arg {String} [options.expireGracePeriod] How long before the integration's role is removed from an unsubscribed user
    * @arg {String} [options.enableEmoticons] Whether to enable integration emoticons or not
    * @returns {Promise}
    */
    editIntegration() {
        return this.shard.client.editGuildIntegration.apply(this.shard.client, [this.id].concat(arguments));
    }

    /**
    * Force a guild integration to sync
    * @arg {String} integrationID The ID of the integration
    * @returns {Promise}
    */
    syncIntegration() {
        return this.shard.client.syncGuildIntegration.apply(this.shard.client, [this.id].concat(arguments));
    }

    /**
    * Delete a guild integration
    * @arg {String} integrationID The ID of the integration
    * @returns {Promise}
    */
    deleteIntegration() {
        return this.shard.client.deleteGuildIntegration.apply(this.shard.client, [this.id].concat(arguments));
    }

    /**
    * Get all invites in the guild
    * @returns {Promise<Invite[]>}
    */
    getInvites() {
        return this.shard.client.getGuildInvites.apply(this.shard.client, [this.id].concat(arguments));
    }

    /**
    * Edit a guild member
    * @arg {String} userID The ID of the user
    * @arg {Object} options The properties to edit
    * @arg {String[]} [options.roles] The array of role IDs the user should have
    * @arg {String} [options.nick] Set the user's server nickname, "" to remove
    * @arg {Boolean} [options.mute] Server mute the user
    * @arg {Boolean} [options.deaf] Server deafen the user
    * @arg {String} [options.channelID] The ID of the voice channel to move the user to (must be in voice)
    * @returns {Promise}
    */
    editGuildMember() {
        return this.shard.client.editGuildMember.apply(this.shard.client, [this.id].concat(arguments));
    }

    /**
    * Remove (kick) a member from the guild
    * @arg {String} userID The ID of the user
    * @returns {Promise}
    */
    deleteGuildMember() {
        return this.shard.client.deleteGuildMember.apply(this.shard.client, [this.id].concat(arguments));
    }

    /**
    * Ban a user from the guild
    * @arg {String} userID The ID of the user
    * @arg {Number} [deleteMessageDays=0] Number of days to delete messages for
    * @returns {Promise}
    */
    banMember() {
        return this.shard.client.banGuildMember.apply(this.shard.client, [this.id].concat(arguments));
    }

    /**
    * Unban a user from the guild
    * @arg {String} userID The ID of the user
    * @returns {Promise}
    */
    unbanMember() {
        return this.shard.client.unbanGuildMember.apply(this.shard.client, [this.id].concat(arguments));
    }

    /**
    * Edit the guild
    * @arg {Object} options The properties to edit
    * @arg {String} [options.name] The ID of the guild
    * @arg {String} [options.region] The region of the guild
    * @arg {String} [options.icon] The guild icon as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
    * @arg {Number} [options.verificationLevel] The guild verification level
    * @arg {String} [options.afkChannelID] The ID of the AFK voice channel
    * @arg {Number} [options.afkTimeout] The AFK timeout in seconds
    * @arg {String} [options.ownerID] The ID of the user to transfer server ownership to (bot user must be owner)
    * @arg {String} [options.splash] The guild splash image as a base64 data URI (VIP only). Note: base64 strings alone are not base64 data URI strings
    * @returns {Promise<Guild>}
    */
    edit() {
        return this.shard.client.editGuild.apply(this.shard.client, [this.id].concat(arguments));
    }

    /**
    * Delete the guild (bot user must be owner)
    * @returns {Promise}
    */
    delete() {
        return this.shard.client.deleteGuild.apply(this.shard.client, [this.id].concat(arguments));
    }

    /**
    * Leave the guild
    * @returns {Promise}
    */
    leave() {
        return this.shard.client.leaveGuild.apply(this.shard.client, [this.id].concat(arguments));
    }

    /**
    * Get the ban list of the guild
    * @returns {Promise<User[]>}
    */
    getBans() {
        return this.shard.client.getGuildBans.apply(this.shard.client, [this.id].concat(arguments));
    }

    /**
    * Edit the bot's nickname in the guild
    * @arg {String} nick The nickname
    * @returns {Promise}
    */
    editNickname( nick) {
        return this.shard.client.editNickname.apply(this.shard.client, [this.id].concat(arguments));
    }
}

module.exports = Guild;
