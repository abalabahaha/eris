"use strict";

const Base = require("./Base");
const CategoryChannel = require("./CategoryChannel");
const CDN_URL = require("../rest/Endpoints").CDN_URL;
const Channel = require("./Channel");
const Constants = require("../Constants");
const Collection = require("../util/Collection");
const Member = require("./Member");
const Role = require("./Role");
const TextChannel = require("./TextChannel");
const VoiceChannel = require("./VoiceChannel");

/**
* Represents a guild
* @prop {String} id The ID of the guild
* @prop {Number} createdAt Timestamp of the guild's creation
* @prop {String} name The name of the guild
* @prop {Number} verificationLevel The guild verification level
* @prop {String} region The region of the guild
* @prop {String?} icon The hash of the guild icon, or null if no icon
* @prop {String?} afkChannelID The ID of the AFK voice channel
* @prop {Number} afkTimeout The AFK timeout in seconds
* @prop {Number} defaultNotifications The default notification settings for the guild. 0 is "All Messages", 1 is "Only @mentions"
* @prop {Number} mfaLevel The admin 2FA level for the guild. 0 is not required, 1 is required
* @prop {Number} joinedAt Timestamp of when the bot account joined the guild
* @prop {String} ownerID The ID of the user that is the guild owner
* @prop {String?} systemChannelID The ID of the default channel for system messages (built-in join messages)
* @prop {String?} splash The hash of the guild splash image, or null if no splash (VIP only)
* @prop {Boolean} unavailable Whether the guild is unavailable or not
* @prop {Boolean} large Whether the guild is "large" by "some Discord standard"
* @prop {Number} maxPresences The maximum number of people that can be online in a guild at once (returned from REST API only)
* @prop {Collection<Channel>} channels Collection of Channels in the guild
* @prop {Collection<Member>} members Collection of Members in the guild
* @prop {Number} memberCount Number of members in the guild
* @prop {Collection<Role>} roles Collection of Roles in the guild
* @prop {Shard} shard The Shard that owns the guild
* @prop {String[]} features An array of guild feature strings
* @prop {Object[]} emojis An array of guild emoji objects
* @prop {String?} iconURL The URL of the guild's icon
* @prop {Number} explicitContentFilter The explicit content filter level for the guild. 0 is off, 1 is on for people without roles, 2 is on for all
*/
class Guild extends Base {
    constructor(data, client) {
        super(data.id);
        this.shard = client.shards.get(client.guildShardMap[this.id]);
        this.unavailable = !!data.unavailable;
        this.joinedAt = Date.parse(data.joined_at);
        this.channels = new Collection(Channel);
        this.members = new Collection(Member);
        this.memberCount = data.member_count;
        this.roles = new Collection(Role);

        if(data.roles) {
            for(const role of data.roles) {
                this.roles.add(role, this);
            }
        }

        if(data.channels) {
            for(let channel of data.channels) {
                if(channel.type === 0) {
                    channel = this.channels.add(new TextChannel(channel, this), this);
                } else if(channel.type === 2) {
                    channel = this.channels.add(new VoiceChannel(channel, this), this);
                } else if(channel.type === 4) {
                    channel = this.channels.add(new CategoryChannel(channel, this), this);
                } else {
                    channel = this.channels.add(channel, this);
                }
                if(channel.parentID && this.channels.get(channel.parentID)) {
                    this.channels.get(channel.parentID).channels.add(channel);
                }
                client.channelGuildMap[channel.id] = this.id;
            }
        }

        if(data.members) {
            for(const member of data.members) {
                member.id = member.user.id;
                this.members.add(member, this);
            }
        }

        if(data.presences) {
            for(const presence of data.presences) {
                if(!this.members.get(presence.user.id)) {
                    let userData = client.users.get(presence.user.id);
                    if(userData) {
                        userData = `{username: ${userData.username}, id: ${userData.id}, discriminator: ${userData.discriminator}}`;
                    }
                    client.emit("debug", `Presence without member. ${presence.user.id}. In global user cache: ${userData}. ` + JSON.stringify(presence), this.shard.id);
                    continue;
                }
                presence.id = presence.user.id;
                this.members.update(presence);
            }
        }

        if(data.voice_states) {
            if(!client.bot) {
                this.pendingVoiceStates = data.voice_states;
            } else {
                for(const voiceState of data.voice_states) {
                    if(!this.members.get(voiceState.user_id)) {
                        continue;
                    }
                    voiceState.id = voiceState.user_id;
                    try {
                        this.channels.get(voiceState.channel_id).voiceMembers.add(this.members.update(voiceState));
                    } catch(err) {
                        client.emit("error", err, this.shard.id);
                        continue;
                    }
                    if(client.options.seedVoiceConnections && voiceState.id === client.user.id && !client.voiceConnections.get(this.id)) {
                        process.nextTick(() => this.shard.client.joinVoiceChannel(voiceState.channel_id, false));
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
        this.features = data.features !== undefined ? data.features : this.features;
        this.emojis = data.emojis !== undefined ? data.emojis : this.emojis;
        this.afkChannelID = data.afk_channel_id !== undefined ? data.afk_channel_id : this.afkChannelID;
        this.afkTimeout = data.afk_timeout !== undefined ? data.afk_timeout : this.afkTimeout;
        this.defaultNotifications = data.default_message_notifications !== undefined ? data.default_message_notifications : this.defaultNotifications;
        this.mfaLevel = data.mfa_level !== undefined ? data.mfa_level : this.mfaLevel;
        this.large = data.large !== undefined ? data.large : this.large;
        this.maxPresences = data.max_presences !== undefined ? data.max_presences : this.maxPresences;
        this.explicitContentFilter = data.explicit_content_filter !== undefined ? data.explicit_content_filter : this.explicitContentFilter;
        this.systemChannelID = data.system_channel_id !== undefined ? data.system_channel_id : this.systemChannelID;
    }

    /**
    * Request all guild members from Discord
    */
    fetchAllMembers() {
        this.shard.getGuildMembers(this.id, Math.ceil(this.memberCount / 1000)); // TODO Promise with chunk timeout
    }

    get iconURL() {
        return this.icon ? `${CDN_URL}/icons/${this.id}/${this.icon}.${this.shard.client.options.defaultImageFormat}?size=${this.shard.client.options.defaultImageSize}` : null;
    }

    /**
    * Get the guild's icon with the given format and size
    * @arg {String} [format] The filetype of the icon ("jpg", "png", "gif", or "webp")
    * @arg {Number} [size] The size of the icon (128, 256, 512, 1024, 2048)
    */
    dynamicIconURL(format, size) {
        if(!format || !Constants.ImageFormats.includes(format.toLowerCase())) {
            format = this.shard.client.options.defaultImageFormat;
        }
        if(size < 16 || size > 1024 || (size & (size - 1))) {
             size = this.shard.client.options.defaultImageSize;
        }
        return this.icon ? `${CDN_URL}/icons/${this.id}/${this.icon}.${format}?size=${size}` : null;
    }

    get splashURL() {
        return this.splash ? `${CDN_URL}/splashes/${this.id}/${this.splash}.jpg` : null;
    }

    /**
    * Create a channel in the guild
    * @arg {String} name The name of the channel
    * @arg {String} [type=0] The type of the channel, either 0 or 2
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @arg {String} [parentID] ID of the parent category for a channel
    * @returns {Promise<CategoryChannel | TextChannel | VoiceChannel>}
    */
    createChannel(name, type, reason, parentID) {
        return this.shard.client.createChannel.call(this.shard.client, this.id, name, type, reason, parentID);
    }

    /**
    * Create a emoji in the guild
    * @arg {Object} options Emoji options
    * @arg {String} options.name The name of emoji
    * @arg {String} options.image The base 64 encoded string
    * @arg {Array} [options.roles] An array containing authorized role IDs
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Object>} A guild emoji object
    */
    createEmoji(options, reason) {
        return this.shard.client.createGuildEmoji.call(this.shard.client, this.id, options, reason);
    }

    /**
    * Edit a emoji in the guild
    * @arg {String} emojiID The ID of the emoji you want to modify
    * @arg {Object} options Emoji options
    * @arg {String} [options.name] The name of emoji
    * @arg {Array} [options.roles] An array containing authorized role IDs
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Object>} A guild emoji object
    */
    editEmoji(emojiID, options, reason) {
        return this.shard.client.editGuildEmoji.call(this.shard.client, this.id, emojiID, options, reason);
    }

    /**
    * Delete a emoji in the guild
    * @arg {String} emojiID The ID of the emoji
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    deleteEmoji(emojiID, reason) {
        return this.shard.client.deleteGuildEmoji.call(this.shard.client, this.id, emojiID, reason);
    }

    /**
    * Create a guild role
    * @arg {Object} [options] The properties to set
    * @arg {String} [options.name] The name of the role
    * @arg {Number} [options.permissions] The role permissions number
    * @arg {Number} [options.color] The hex color of the role, in number form (ex: 0x3d15b3 or 4040115)
    * @arg {Boolean} [options.hoist] Whether to hoist the role in the user list or not
    * @arg {Boolean} [options.mentionable] Whether the role is mentionable or not
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Role>}
    */
    createRole(options, reason) {
        return this.shard.client.createRole.call(this.shard.client, this.id, options, reason);
    }

    /**
    * Get the prune count for the guild
    * @arg {Number} days The number of days of inactivity to prune for
    * @returns {Promise<Number>} Resolves with the number of users that would be pruned
    */
    getPruneCount(days) {
        return this.shard.client.getPruneCount.call(this.shard.client, this.id, days);
    }

    /**
    * Begin pruning the guild
    * @arg {Number} days The number of days of inactivity to prune for
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Number>} Resolves with the number of pruned users
    */
    pruneMembers(days, reason) {
        return this.shard.client.pruneMembers.call(this.shard.client, this.id, days, reason);
    }

    /**
    * Get a guild's channels via the REST API. REST mode is required to use this endpoint.
    * @returns {Promise<(CategoryChannel[] | TextChannel[] | VoiceChannel[])>}
    */
    getRESTChannels() {
        return this.shard.client.getRESTGuildChannels.call(this.shard.client, this.id);
    }

    /**
    * Get a guild's emojis via the REST API. REST mode is required to use this endpoint.
    * @returns {Promise<Object[]>} An array of guild emoji objects
    */
    getRESTEmojis() {
        return this.shard.client.getRESTGuildEmojis.call(this.shard.client, this.id);
    }

    /**
    * Get a guild emoji via the REST API. REST mode is required to use this endpoint.
    * @arg {String} emojiID The ID of the emoji
    * @returns {Promise<Object>} An emoji object
    */
    getRESTEmoji(emojiID) {
        return this.shard.client.getRESTGuildEmoji.call(this.shard.client, this.id, emojiID);
    }

    /**
    * Get a guild's members via the REST API. REST mode is required to use this endpoint.
    * @arg {Number} [limit=1] The max number of members to get (1 to 1000)
    * @arg {String} [after] The highest user ID of the previous page
    * @returns {Promise<Member[]>}
    */
    getRESTMembers(limit, after) {
        return this.shard.client.getRESTGuildMembers.call(this.shard.client, this.id, limit, after);
    }

    /**
    * Get a guild's members via the REST API. REST mode is required to use this endpoint.
    * @arg {String} memberID The ID of the member
    * @returns {Promise<Member>}
    */
    getRESTMember(memberID) {
        return this.shard.client.getRESTGuildMember.call(this.shard.client, this.id, memberID);
    }

    /**
    * Get a guild's roles via the REST API. REST mode is required to use this endpoint.
    * @returns {Promise<Role[]>}
    */
    getRESTRoles() {
        return this.shard.client.getRESTGuildRoles.call(this.shard.client, this.id);
    }

    /**
    * Get a guild's embed object
    * @returns {Promise<Object>} A guild embed object
    */
    getEmbed() {
        return this.shard.client.getGuildEmbed.call(this.shard.client, this.id);
    }

    /**
    * Get possible voice reigons for a guild
    * @returns {Promise<Object[]>} Resolves with an array of voice region objects
    */
    getVoiceRegions() {
        return this.shard.client.getVoiceRegions.call(this.shard.client, this.id);
    }

    /**
     * Leaves the voice channel in this guild
     */
    leaveVoiceChannel() {
        this.shard.client.closeVoiceConnection.call(this.shard.client, this.id);
    }

    /**
    * Edit the guild role
    * @arg {String} roleID The ID of the role
    * @arg {Object} options The properties to edit
    * @arg {String} [options.name] The name of the role
    * @arg {Number} [options.permissions] The role permissions number
    * @arg {Number} [options.color] The hex color of the role, in number form (ex: 0x3da5b3 or 4040115)
    * @arg {Boolean} [options.hoist] Whether to hoist the role in the user list or not
    * @arg {Boolean} [options.mentionable] Whether the role is mentionable or not
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Role>}
    */
    editRole(roleID, options, reason) {
        return this.shard.client.editRole.call(this.shard.client, this.id, roleID, options, reason);
    }

    /**
    * Delete a role
    * @arg {String} roleID The ID of the role
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    deleteRole(roleID, reason) {
        return this.shard.client.deleteRole.call(this.shard.client, this.id, roleID, reason);
    }

    /**
    * Get the audit logs for a guild
    * @arg {Number} [limit=50] The maximum number of entries to return
    * @arg {String} [before] Get entries before this entry ID
    * @arg {Number} [actionType] Filter entries by action type
    * @returns {Promise<Object>} Resolves with an Object containing `users` and `audit_log_entries` keys
    */
    getAuditLogs(limit, before, actionType) {
        return this.shard.client.getGuildAuditLogs.call(this.shard.client, this.id, limit, before, actionType);
    }

    /**
    * Get a list of integrations for the guild
    * @returns {Promise<GuildIntegration[]>}
    */
    getIntegrations() {
        return this.shard.client.getGuildIntegrations.call(this.shard.client, this.id);
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
    editIntegration(integrationID, options) {
        return this.shard.client.editGuildIntegration.call(this.shard.client, this.id, integrationID, options);
    }

    /**
    * Force a guild integration to sync
    * @arg {String} integrationID The ID of the integration
    * @returns {Promise}
    */
    syncIntegration(integrationID) {
        return this.shard.client.syncGuildIntegration.call(this.shard.client, this.id, integrationID);
    }

    /**
    * Delete a guild integration
    * @arg {String} integrationID The ID of the integration
    * @returns {Promise}
    */
    deleteIntegration(integrationID) {
        return this.shard.client.deleteGuildIntegration.call(this.shard.client, this.id, integrationID);
    }

    /**
    * Get all invites in the guild
    * @returns {Promise<Invite[]>}
    */
    getInvites() {
        return this.shard.client.getGuildInvites.call(this.shard.client, this.id);
    }

    /**
    * Edit a guild member
    * @arg {String} memberID The ID of the member
    * @arg {Object} options The properties to edit
    * @arg {String[]} [options.roles] The array of role IDs the member should have
    * @arg {String} [options.nick] Set the member's guild nickname, "" to remove
    * @arg {Boolean} [options.mute] Server mute the member
    * @arg {Boolean} [options.deaf] Server deafen the member
    * @arg {String} [options.channelID] The ID of the voice channel to move the member to (must be in voice)
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    editMember(memberID, options, reason) {
        return this.shard.client.editGuildMember.call(this.shard.client, this.id, memberID, options, reason);
    }

    /**
    * Add a role to a guild member
    * @arg {String} memberID The ID of the member
    * @arg {String} roleID The ID of the role
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    addMemberRole(memberID, roleID, reason) {
        return this.shard.client.addGuildMemberRole.call(this.shard.client, this.id, memberID, roleID, reason);
    }

    /**
    * Remve a role from a guild member
    * @arg {String} memberID The ID of the member
    * @arg {String} roleID The ID of the role
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    removeMemberRole(memberID, roleID, reason) {
        return this.shard.client.removeGuildMemberRole.call(this.shard.client, this.id, memberID, roleID, reason);
    }

    /**
    * Kick a member from the guild
    * @arg {String} userID The ID of the member
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    kickMember(userID, reason) {
        return this.shard.client.kickGuildMember.call(this.shard.client, this.id, userID, reason);
    }

    /**
    * Ban a user from the guild
    * @arg {String} userID The ID of the member
    * @arg {Number} [deleteMessageDays=0] Number of days to delete messages for
    * @arg {String} [reason] Reason for the ban
    * @returns {Promise}
    */
    banMember(userID, deleteMessageDays, reason) {
        return this.shard.client.banGuildMember.call(this.shard.client, this.id, userID, deleteMessageDays, reason);
    }

    /**
    * Unban a user from the guild
    * @arg {String} userID The ID of the member
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    unbanMember(userID, reason) {
        return this.shard.client.unbanGuildMember.call(this.shard.client, this.id, userID, reason);
    }

    /**
    * Edit the guild
    * @arg {Object} options The properties to edit
    * @arg {String} [options.name] The ID of the guild
    * @arg {String} [options.region] The region of the guild
    * @arg {String} [options.icon] The guild icon as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
    * @arg {Number} [options.verificationLevel] The guild verification level
    * @arg {Number} [options.defaultNotifications] The default notification settings for the guild. 0 is "All Messages", 1 is "Only @mentions".
    * @arg {String} [options.afkChannelID] The ID of the AFK voice channel
    * @arg {Number} [options.afkTimeout] The AFK timeout in seconds
    * @arg {String} [options.ownerID] The ID of the member to transfer guild ownership to (bot user must be owner)
    * @arg {String} [options.splash] The guild splash image as a base64 data URI (VIP only). Note: base64 strings alone are not base64 data URI strings
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Guild>}
    */
    edit(options, reason) {
        return this.shard.client.editGuild.call(this.shard.client, this.id, options, reason);
    }

    /**
    * Delete the guild (bot user must be owner)
    * @returns {Promise}
    */
    delete() {
        return this.shard.client.deleteGuild.call(this.shard.client, this.id);
    }

    /**
    * Leave the guild
    * @returns {Promise}
    */
    leave() {
        return this.shard.client.leaveGuild.call(this.shard.client, this.id);
    }

    /**
    * Get the ban list of the guild
    * @returns {Promise<User[]>} Resolves with an array of {reason: String, user: User}
    */
    getBans() {
        return this.shard.client.getGuildBans.call(this.shard.client, this.id);
    }

    /**
    * Get a ban from the ban list of a guild
    * @arg {String} userID The ID of the banned user
    * @returns {Promise<Object>} Resolves with {reason: String, user: User}
    */
    getBan(userID) {
        return this.shard.client.getGuildBan.call(this.shard.client, this.id, userID);
    }

    /**
    * Edit the bot's nickname in the guild
    * @arg {String} nick The nickname
    * @returns {Promise}
    */
    editNickname(nick) {
        return this.shard.client.editNickname.call(this.shard.client, this.id, nick);
    }

    /**
    * Get all the webhooks in the guild
    * @returns {Promise<Object[]>} Resolves with an array of webhook objects
    */
    getWebhooks() {
        return this.shard.client.getGuildWebhooks.call(this.shard.client, this.id);
    }

    toJSON() {
        const base = super.toJSON(true);
        for(const prop of ["afkChannelID", "afkTimeout", "channels", "defaultNotifications", "emojis", "explicitContentFilter", "features", "icon", "joinedAt", "large", "maxPresences", "memberCount", "members", "mfaLevel", "name", "ownerID", "region", "roles", "splash", "unavailable", "verificationLevel"]) {
            if(this[prop] !== undefined) {
                base[prop] = this[prop] && this[prop].toJSON ? this[prop].toJSON() : this[prop];
            }
        }
        return base;
    }
}

module.exports = Guild;
