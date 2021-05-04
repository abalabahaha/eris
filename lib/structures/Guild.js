"use strict";

const Base = require("./Base");
const Channel = require("./Channel");
const Endpoints = require("../rest/Endpoints");
const Collection = require("../util/Collection");
const GuildChannel = require("./GuildChannel");
const Member = require("./Member");
const Role = require("./Role");
const VoiceState = require("./VoiceState");
const Permission = require("./Permission");
const {Permissions} = require("../Constants");

/**
* Represents a guild
* @prop {String?} afkChannelID The ID of the AFK voice channel
* @prop {Number} afkTimeout The AFK timeout in seconds
* @prop {String?} applicationID The application ID of the guild creator if it is bot-created
* @prop {Number?} approximateMemberCount The approximate number of members in the guild (REST only)
* @prop {Number?} approximatePresenceCount The approximate number of presences in the guild (REST only)
* @prop {Boolean?} autoRemoved Whether the guild was automatically removed from Discovery
* @prop {String?} banner The hash of the guild banner image, or null if no banner (VIP only)
* @prop {String?} bannerURL The URL of the guild's banner image
* @prop {Array<Object>?} categories The guild's discovery categories
* @prop {Collection<GuildChannel>} channels Collection of Channels in the guild
* @prop {Number} createdAt Timestamp of the guild's creation
* @prop {Number} defaultNotifications The default notification settings for the guild. 0 is "All Messages", 1 is "Only @mentions"
* @prop {String?} description The description for the guild (VIP only)
* @prop {String?} discoverySplash The has of the guild discovery splash image, or null if no discovery splash
* @prop {String?} discoverySplashURL The URL of the guild's discovery splash image
* @prop {Number?} emojiCount The number of emojis on the guild
* @prop {Array<Object>} emojis An array of guild emoji objects
* @prop {Number} explicitContentFilter The explicit content filter level for the guild. 0 is off, 1 is on for people without roles, 2 is on for all
* @prop {Array<String>} features An array of guild feature strings
* @prop {String?} icon The hash of the guild icon, or null if no icon
* @prop {String?} iconURL The URL of the guild's icon
* @prop {String} id The ID of the guild
* @prop {Number} joinedAt Timestamp of when the bot account joined the guild
* @prop {Array<String>?} keywords The guild's discovery keywords
* @prop {Boolean} large Whether the guild is "large" by "some Discord standard"
* @prop {Number} mfaLevel The admin 2FA level for the guild. 0 is not required, 1 is required
* @prop {Number?} maxMembers The maximum amount of members for the guild
* @prop {Number} maxPresences The maximum number of people that can be online in a guild at once (returned from REST API only)
* @prop {Number?} maxVideoChannelUsers The max number of users allowed in a video channel
* @prop {Number} memberCount Number of members in the guild
* @prop {Collection<Member>} members Collection of Members in the guild
* @prop {String} name The name of the guild
* @prop {Boolean} nsfw Whether the guild is designated as NSFW by Discord
* @prop {String} ownerID The ID of the user that is the guild owner
* @prop {String} preferredLocale Preferred "COMMUNITY" guild language used in server discovery and notices from Discord
* @prop {Number?} premiumSubscriptionCount The total number of users currently boosting this guild
* @prop {Number} premiumTier Nitro boost level of the guild
* @prop {Object?} primaryCategory The guild's primary discovery category
* @prop {Number?} primaryCategoryID The guild's primary discovery category ID
* @prop {String?} publicUpdatesChannelID ID of the guild's updates channel if the guild has "COMMUNITY" features
* @prop {String} region The region of the guild
* @prop {Collection<Role>} roles Collection of Roles in the guild
* @prop {String?} rulesChannelID The channel where "COMMUNITY" guilds display rules and/or guidelines
* @prop {Shard} shard The Shard that owns the guild
* @prop {String?} splash The hash of the guild splash image, or null if no splash (VIP only)
* @prop {String?} splashURL The URL of the guild's splash image
* @prop {Number} systemChannelFlags The flags for the system channel
* @prop {String?} systemChannelID The ID of the default channel for system messages (built-in join messages and boost messages)
* @prop {Boolean} unavailable Whether the guild is unavailable or not
* @prop {String?} vanityURL The vanity URL of the guild (VIP only)
* @prop {Number} verificationLevel The guild verification level
* @prop {Collection<VoiceState>} voiceStates Collection of voice states in the guild
* @prop {Object?} welcomeScreen The welcome screen of a Community guild, shown to new members
* @prop {Object} welcomeScreen.description The description in the welcome screen
* @prop {Array<Object>} welcomeScreen.welcomeChannels The list of channels in the welcome screens. Each channels have the following properties: `channelID`, `description`, `emojiID`, `emojiName`. `emojiID` and `emojiName` properties can be null.
* @prop {Number?} widgetChannelID The channel id that the widget will generate an invite to. REST only.
* @prop {Boolean?} widgetEnabled Whether the guild widget is enabled. REST only.
*/
class Guild extends Base {
    constructor(data, client) {
        super(data.id);
        this._client = client;
        this.shard = client.shards.get(client.guildShardMap[this.id]);
        this.unavailable = !!data.unavailable;
        this.joinedAt = Date.parse(data.joined_at);
        this.voiceStates = new Collection(VoiceState);
        this.channels = new Collection(GuildChannel);
        this.members = new Collection(Member);
        this.memberCount = data.member_count;
        this.roles = new Collection(Role);
        this.applicationID = data.application_id;

        if(data.widget_enabled !== undefined) {
            this.widgetEnabled = data.widget_enabled;
        }
        if(data.widget_channel_id !== undefined) {
            this.widgetChannelID = data.widget_channel_id;
        }

        if(data.approximate_member_count !== undefined) {
            this.approximateMemberCount = data.approximate_member_count;
        }
        if(data.approximate_presence_count !== undefined) {
            this.approximatePresenceCount = data.approximate_presence_count;
        }

        if(data.auto_removed !== undefined) {
            this.autoRemoved = data.auto_removed;
        }
        if(data.emoji_count !== undefined) {
            this.emojiCount = data.emoji_count;
        }
        if(data.primary_category_id !== undefined) {
            this.primaryCategoryID = data.primary_category_id;
        }
        if(data.primary_category) {
            this.primaryCategory = data.primary_category;
        }
        if(data.categories !== undefined) {
            this.categories = data.categories;
        }
        if(data.keywords !== undefined) {
            this.keywords = data.keywords;
        }

        if(data.roles) {
            for(const role of data.roles) {
                this.roles.add(role, this);
            }
        }

        if(data.channels) {
            for(const channelData of data.channels) {
                channelData.guild_id = this.id;
                const channel = Channel.from(channelData, client);
                channel.guild = this;
                this.channels.add(channel, client);
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
                        const channel = this.channels.get(voiceState.channel_id);
                        const member = this.members.update(voiceState);
                        if(channel && channel.voiceMembers) {
                            channel.voiceMembers.add(member);
                        }
                    } catch(err) {
                        client.emit("error", err, this.shard.id);
                        continue;
                    }
                    if(client.options.seedVoiceConnections && voiceState.id === client.user.id && !client.voiceConnections.get(this.id)) {
                        process.nextTick(() => this._client.joinVoiceChannel(voiceState.channel_id));
                    }
                }
            }
        }
        this.update(data);
    }

    update(data) {
        if(data.name !== undefined) {
            this.name = data.name;
        }
        if(data.verification_level !== undefined) {
            this.verificationLevel = data.verification_level;
        }
        if(data.splash !== undefined) {
            this.splash = data.splash;
        }
        if(data.discovery_splash !== undefined) {
            this.discoverySplash = data.discovery_splash;
        }
        if(data.banner !== undefined) {
            this.banner = data.banner;
        }
        if(data.region !== undefined) {
            this.region = data.region;
        }
        if(data.owner_id !== undefined) {
            this.ownerID = data.owner_id;
        }
        if(data.icon !== undefined) {
            this.icon = data.icon;
        }
        if(data.features !== undefined) {
            this.features = data.features;
        }
        if(data.emojis !== undefined) {
            this.emojis = data.emojis;
        }
        if(data.afk_channel_id !== undefined) {
            this.afkChannelID = data.afk_channel_id;
        }
        if(data.afk_timeout !== undefined) {
            this.afkTimeout = data.afk_timeout;
        }
        if(data.default_message_notifications !== undefined) {
            this.defaultNotifications = data.default_message_notifications;
        }
        if(data.mfa_level !== undefined) {
            this.mfaLevel = data.mfa_level;
        }
        if(data.large !== undefined) {
            this.large = data.large;
        }
        if(data.max_presences !== undefined) {
            this.maxPresences = data.max_presences;
        }
        if(data.explicit_content_filter !== undefined) {
            this.explicitContentFilter = data.explicit_content_filter;
        }
        if(data.system_channel_id !== undefined) {
            this.systemChannelID = data.system_channel_id;
        }
        if(data.system_channel_flags !== undefined) {
            this.systemChannelFlags = data.system_channel_flags;
        }
        if(data.premium_tier !== undefined) {
            this.premiumTier = data.premium_tier;
        }
        if(data.premium_subscription_count !== undefined) {
            this.premiumSubscriptionCount = data.premium_subscription_count;
        }
        if(data.vanity_url_code !== undefined) {
            this.vanityURL = data.vanity_url_code;
        }
        if(data.preferred_locale !== undefined) {
            this.preferredLocale = data.preferred_locale;
        }
        if(data.description !== undefined) {
            this.description = data.description;
        }
        if(data.max_members !== undefined) {
            this.maxMembers = data.max_members;
        }
        if(data.public_updates_channel_id !== undefined) {
            this.publicUpdatesChannelID = data.public_updates_channel_id;
        }
        if(data.rules_channel_id !== undefined) {
            this.rulesChannelID = data.rules_channel_id;
        }
        if(data.max_video_channel_users !== undefined) {
            this.maxVideoChannelUsers = data.max_video_channel_users;
        }
        if(data.welcome_screen !== undefined) {
            this.welcomeScreen = {
                description: data.welcome_screen.description,
                welcomeChannels: data.welcome_screen.welcome_channels && data.welcome_screen.welcome_channels.map((c) => {
                    return {
                        channelID: c.channel,
                        description: c.description,
                        emojiID: c.emoji_id,
                        emojiName: c.emoji_name
                    };
                })
            };
        }
        if(data.nsfw !== undefined) {
            this.nsfw = data.nsfw;
        }
    }

    get bannerURL() {
        return this.banner ? this._client._formatImage(Endpoints.GUILD_BANNER(this.id, this.banner)) : null;
    }

    get iconURL() {
        return this.icon ? this._client._formatImage(Endpoints.GUILD_ICON(this.id, this.icon)) : null;
    }

    get splashURL() {
        return this.splash ? this._client._formatImage(Endpoints.GUILD_SPLASH(this.id, this.splash)) : null;
    }

    get discoverySplashURL() {
        return this.discoverySplash ? this._client._formatImage(Endpoints.GUILD_DISCOVERY_SPLASH(this.id, this.discoverySplash)) : null;
    }

    /**
    * Add a discovery subcategory
    * @arg {String} categoryID The ID of the discovery category
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Object>}
    */
    addDiscoverySubcategory(categoryID, reason) {
        return this._client.addGuildDiscoverySubcategory.call(this._client, this.id, categoryID, reason);
    }

    /**
    * Add a role to a guild member
    * @arg {String} memberID The ID of the member
    * @arg {String} roleID The ID of the role
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    addMemberRole(memberID, roleID, reason) {
        return this._client.addGuildMemberRole.call(this._client, this.id, memberID, roleID, reason);
    }

    /**
    * Ban a user from the guild
    * @arg {String} userID The ID of the member
    * @arg {Number} [deleteMessageDays=0] Number of days to delete messages for, between 0-7 inclusive
    * @arg {String} [reason] Reason for the ban
    * @returns {Promise}
    */
    banMember(userID, deleteMessageDays, reason) {
        return this._client.banGuildMember.call(this._client, this.id, userID, deleteMessageDays, reason);
    }

    /**
    * Create a channel in the guild
    * @arg {String} name The name of the channel
    * @arg {Number} [type=0] The type of the channel, either 0 (text), 2 (voice), 4 (category), 5 (news) or 13 (stage)
    * @arg {Object | String} [options] The properties the channel should have. If `options` is a string, it will be treated as `options.parentID` (see below). Passing a string is deprecated and will not be supported in future versions.
    * @arg {Number} [options.bitrate] The bitrate of the channel (voice channels only)
    * @arg {Boolean} [options.nsfw] The nsfw status of the channel
    * @arg {String?} [options.parentID] The ID of the parent category channel for this channel
    * @arg {Array} [options.permissionOverwrites] An array containing permission overwrite objects
    * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (does not affect bots or users with manageMessages/manageChannel permissions) (text channels only)
    * @arg {String} [options.reason] The reason to be displayed in audit logs
    * @arg {String} [options.topic] The topic of the channel (text channels only)
    * @arg {Number} [options.userLimit] The channel user limit (voice channels only)
    * @returns {Promise<CategoryChannel | TextChannel | VoiceChannel>}
    */
    createChannel(name, type, reason, options) {
        return this._client.createChannel.call(this._client, this.id, name, type, reason, options);
    }

    /**
    * Create a emoji in the guild
    * @arg {Object} options Emoji options
    * @arg {String} options.image The base 64 encoded string
    * @arg {String} options.name The name of emoji
    * @arg {Array} [options.roles] An array containing authorized role IDs
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Object>} A guild emoji object
    */
    createEmoji(options, reason) {
        return this._client.createGuildEmoji.call(this._client, this.id, options, reason);
    }

    /**
    * Create a guild role
    * @arg {Object|Role} [options] An object or Role containing the properties to set
    * @arg {Number} [options.color] The hex color of the role, in number form (ex: 0x3d15b3 or 4040115)
    * @arg {Boolean} [options.hoist] Whether to hoist the role in the user list or not
    * @arg {Boolean} [options.mentionable] Whether the role is mentionable or not
    * @arg {String} [options.name] The name of the role
    * @arg {Number} [options.permissions] The role permissions number
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Role>}
    */
    createRole(options, reason) {
        return this._client.createRole.call(this._client, this.id, options, reason);
    }

    /**
    * Create a template for this guild
    * @arg {String} name The name of the template
    * @arg {String} [description] The description for the template
    * @returns {Promise<GuildTemplate>}
    */
    createTemplate(name, description) {
        return this._client.createGuildTemplate.call(this._client, this.id, name, description);
    }

    /**
    * Delete the guild (bot user must be owner)
    * @returns {Promise}
    */
    delete() {
        return this._client.deleteGuild.call(this._client, this.id);
    }

    /**
    * Delete a discovery subcategory
    * @arg {String} categoryID The ID of the discovery category
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    deleteDiscoverySubcategory(categoryID, reason) {
        return this._client.addGuildDiscoverySubcategory.call(this._client, this.id, categoryID, reason);
    }

    /**
    * Delete a emoji in the guild
    * @arg {String} emojiID The ID of the emoji
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    deleteEmoji(emojiID, reason) {
        return this._client.deleteGuildEmoji.call(this._client, this.id, emojiID, reason);
    }

    /**
    * Delete a guild integration
    * @arg {String} integrationID The ID of the integration
    * @returns {Promise}
    */
    deleteIntegration(integrationID) {
        return this._client.deleteGuildIntegration.call(this._client, this.id, integrationID);
    }

    /**
    * Delete a role
    * @arg {String} roleID The ID of the role
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    deleteRole(roleID, reason) {
        return this._client.deleteRole.call(this._client, this.id, roleID, reason);
    }

    /**
    * Delete a guild template
    * @arg {String} code The template code
    * @returns {Promise<GuildTemplate>}
    */
    deleteTemplate(code) {
        return this._client.deleteGuildTemplate.call(this._client, this.id, code);
    }

    /**
    * Get the guild's banner with the given format and size
    * @arg {String} [format] The filetype of the icon ("jpg", "jpeg", "png", "gif", or "webp")
    * @arg {Number} [size] The size of the icon (any power of two between 16 and 4096)
    */
    dynamicBannerURL(format, size) {
        return this.banner ? this._client._formatImage(Endpoints.GUILD_BANNER(this.id, this.banner), format, size) : null;
    }

    /**
     * Get the guild's discovery splash with the given format and size
     * @arg {String} [format] The filetype of the icon ("jpg", "jpeg", "png", "gif", or "webp")
     * @arg {Number} [size] The size of the icon (any power of two between 16 and 4096)
     */
    dynamicDiscoverySplashURL(format, size) {
        return this.discoverySplash ? this._client._formatImage(Endpoints.GUILD_DISCOVERY_SPLASH(this.id, this.discoverySplash), format, size) : null;
    }

    /**
    * Get the guild's icon with the given format and size
    * @arg {String} [format] The filetype of the icon ("jpg", "jpeg", "png", "gif", or "webp")
    * @arg {Number} [size] The size of the icon (any power of two between 16 and 4096)
    */
    dynamicIconURL(format, size) {
        return this.icon ? this._client._formatImage(Endpoints.GUILD_ICON(this.id, this.icon), format, size) : null;
    }

    /**
    * Get the guild's splash with the given format and size
    * @arg {String} [format] The filetype of the icon ("jpg", "jpeg", "png", "gif", or "webp")
    * @arg {Number} [size] The size of the icon (any power of two between 16 and 4096)
    */
    dynamicSplashURL(format, size) {
        return this.splash ? this._client._formatImage(Endpoints.GUILD_SPLASH(this.id, this.splash), format, size) : null;
    }

    /**
    * Edit the guild
    * @arg {Object} options The properties to edit
    * @arg {String} [options.afkChannelID] The ID of the AFK voice channel
    * @arg {Number} [options.afkTimeout] The AFK timeout in seconds
    * @arg {String} [options.banner] The guild banner image as a base64 data URI (VIP only). Note: base64 strings alone are not base64 data URI strings
    * @arg {Number} [options.defaultNotifications] The default notification settings for the guild. 0 is "All Messages", 1 is "Only @mentions".
    * @arg {String} [options.description] The description for the guild (VIP only)
    * @arg {String} [options.discoverySplash] The guild discovery splash image as a base64 data URI (VIP only). Note: base64 strings alone are not base64 data URI strings
    * @arg {Number} [options.explicitContentFilter] The level of the explicit content filter for messages/images in the guild. 0 disables message scanning, 1 enables scanning the messages of members without roles, 2 enables scanning for all messages.
    * @arg {Array<String>} [options.features] The enabled features for the guild. Note that only certain features can be toggled with the API
    * @arg {String} [options.icon] The guild icon as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
    * @arg {String} [options.name] The name of the guild
    * @arg {String} [options.ownerID] The ID of the member to transfer guild ownership to (bot user must be owner)
    * @arg {String} [options.preferredLocale] Preferred "COMMUNITY" guild language used in server discovery and notices from Discord
    * @arg {String} [options.publicUpdatesChannelID] The id of the channel where admins and moderators of "COMMUNITY" guilds receive notices from Discord
    * @arg {String} [options.region] The region of the guild
    * @arg {String} [options.rulesChannelID] The id of the channel where "COMMUNITY" guilds display rules and/or guidelines
    * @arg {String} [options.splash] The guild splash image as a base64 data URI (VIP only). Note: base64 strings alone are not base64 data URI strings
    * @arg {Number} [options.systemChannelFlags] The flags for the system channel
    * @arg {String} [options.systemChannelID] The ID of the system channel
    * @arg {Number} [options.verificationLevel] The guild verification level
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Guild>}
    */
    edit(options, reason) {
        return this._client.editGuild.call(this._client, this.id, options, reason);
    }

    /**
    * Edit the guild's discovery data
    * @arg {Object} [options] The guild discovery data
    * @arg {String} [options.primaryCategoryID] The primary discovery category ID
    * @arg {Array<String>} [options.keywords] The discovery keywords (max 10)
    * @arg {Boolean} [options.emojiDiscoverabilityEnabled] Whether guild info should be shown when emoji info is loaded
    * @arg {String} [options.reason] The reason to be displayed in audit logs
    * @returns {Promise<Object>} The updated discovery object
    */
    editDiscovery(options) {
        return this._client.editGuildDiscovery.call(this._client, this.id, options);
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
        return this._client.editGuildEmoji.call(this._client, this.id, emojiID, options, reason);
    }

    /**
    * Edit a guild integration
    * @arg {String} integrationID The ID of the integration
    * @arg {Object} options The properties to edit
    * @arg {String} [options.enableEmoticons] Whether to enable integration emoticons or not
    * @arg {String} [options.expireBehavior] What to do when a user's subscription runs out
    * @arg {String} [options.expireGracePeriod] How long before the integration's role is removed from an unsubscribed user
    * @returns {Promise}
    */
    editIntegration(integrationID, options) {
        return this._client.editGuildIntegration.call(this._client, this.id, integrationID, options);
    }

    /**
    * Edit a guild member
    * @arg {String} memberID The ID of the member
    * @arg {Object} options The properties to edit
    * @arg {String} [options.channelID] The ID of the voice channel to move the member to (must be in voice)
    * @arg {Boolean} [options.deaf] Server deafen the member
    * @arg {Boolean} [options.mute] Server mute the member
    * @arg {String} [options.nick] Set the member's guild nickname, "" to remove
    * @arg {Array<String>} [options.roles] The array of role IDs the member should have
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    editMember(memberID, options, reason) {
        return this._client.editGuildMember.call(this._client, this.id, memberID, options, reason);
    }

    /**
    * Edit the bot's nickname in the guild
    * @arg {String} nick The nickname
    * @returns {Promise}
    */
    editNickname(nick) {
        return this._client.editNickname.call(this._client, this.id, nick);
    }

    /**
    * Edit the guild role
    * @arg {String} roleID The ID of the role
    * @arg {Object} options The properties to edit
    * @arg {Number} [options.color] The hex color of the role, in number form (ex: 0x3da5b3 or 4040115)
    * @arg {Boolean} [options.hoist] Whether to hoist the role in the user list or not
    * @arg {Boolean} [options.mentionable] Whether the role is mentionable or not
    * @arg {String} [options.name] The name of the role
    * @arg {BigInt | Number} [options.permissions] The role permissions number
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Role>}
    */
    editRole(roleID, options, reason) {
        return this._client.editRole.call(this._client, this.id, roleID, options, reason);
    }

    /**
    * Edit a guild template
    * @arg {String} code The template code
    * @arg {Object} options The properties to edit
    * @arg {String} [options.name] The name of the template
    * @arg {String?} [options.description] The desription for the template. Set to `null` to remove the description
    * @returns {Promise<GuildTemplate>}
    */
    editTemplate(code, options) {
        return this._client.editGuildTemplate.call(this._client, this.id, code, options);
    }

    /**
    * Modify the guild's vanity code
    * @arg {String?} code The new vanity code
    * @returns {Promise<Object>}
    */
    editVanity(code) {
        return this._client.editGuildVanity.call(this._client, this.id, code);
    }

    /**
    * Update a user's voice state - See [caveats](https://discord.com/developers/docs/resources/guild#update-others-voice-state-caveats)
    * @arg {Object} options The properties to edit
    * @arg {String} options.channelID The ID of the channel the user is currently in
    * @arg {Date?} [options.requestToSpeakTimestamp] Sets the user's request to speak - this can only be used when the `userID` param is "@me"
    * @arg {Boolean} [options.suppress] Toggles the user's suppress state
    * @arg {String} [userID="@me"] The user ID of the user to update
    * @returns {Promise}
    */
    editVoiceState(options, userID) {
        return this._client.editGuildVoiceState.call(this._client, this.id, options, userID);
    }

    /**
    * Edit the guild welcome screen
    * @arg {Object} [options] The properties to edit
    * @arg {String?} [options.description] The description in the welcome screen
    * @arg {Boolean} [options.enabled] Whether the welcome screen is enabled
    * @arg {Array<Object>} [options.welcomeChannels] The list of channels in the welcome screen as an array
    * @arg {String} options.welcomeChannels[].channelID The channel ID of the welcome channel
    * @arg {String} options.welcomeChannels[].description The description of the welcome channel
    * @arg {String?} options.welcomeChannels[].emojiID The emoji ID of the welcome channel
    * @arg {String?} options.welcomeChannels[].emojiName The emoji name of the welcome channel
    * @returns {Promise<Object>}
    */
    editWelcomeScreen(options) {
        return this._client.editGuildWelcomeScreen.call(this._client, this.id, options);
    }

    /**
    * Modify a guild's widget
    * @arg {Object} options The widget object to modify (https://discord.com/developers/docs/resources/guild#modify-guild-widget)
    * @returns {Promise<Object>} A guild widget object
    */
    editWidget(options) {
        return this._client.editGuildWidget.call(this._client, this.id, options);
    }

    /**
    * Request all guild members from Discord
    * @arg {Number} [timeout] The number of milliseconds to wait before resolving early. Defaults to the `requestTimeout` client option
    * @returns {Promise<Number>} Resolves with the total number of fetched members.
    */
    fetchAllMembers(timeout) {
        return this.fetchMembers({
            timeout
        }).then((m) => m.length);
    }

    /**
    * Request specific guild members through the gateway connection
    * @arg {Object} [options] Options for fetching the members
    * @arg {Number} [options.limit] The maximum number of members to fetch
    * @arg {Boolean} [options.presences] Whether to request member presences or not. When using intents, the `GUILD_PRESENCES` intent is required.
    * @arg {String} [options.query] The query used for looking up the members. When using intents, `GUILD_MEMBERS` is required to fetch all members.
    * @arg {Number} [options.timeout] The number of milliseconds to wait before resolving early. Defaults to the `requestTimeout` client option
    * @arg {Array<String>} [options.userIDs] The IDs of members to fetch
    * @returns {Promise<Array<Member>>} Resolves with the fetched members.
    */
    fetchMembers(options) {
        return this.shard.requestGuildMembers(this.id, options);
    }

    /**
    * Get the audit log for the guild
    * @arg {Object} [options] Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
    * @arg {Number} [options.actionType] Filter entries by action type
    * @arg {String} [options.before] Get entries before this entry ID
    * @arg {Number} [options.limit=50] The maximum number of entries to return
    * @arg {String} [options.userID] Filter entries by the user that performed the action
    * @returns {Promise<{users: User[], entries: GuildAuditLogEntry[], integrations: PartialIntegration[], webhooks: Webhook[]}>}
    */
    getAuditLog(options) {
        return this._client.getGuildAuditLog.call(this._client, this.id, options);
    }

    /**
    * [DEPRECATED] Get the audit log for a guild. Use `getAuditLog` instead
    * @arg {Number} [limit=50] The maximum number of entries to return
    * @arg {String} [before] Get entries before this entry ID
    * @arg {Number} [actionType] Filter entries by action type
    * @arg {String} [userID] Filter entries by the user that performed the action
    * @returns {Promise<{users: User[], entries: GuildAuditLogEntry[], integrations: PartialIntegration[], webhooks: Webhook[]}>}
    */
    getAuditLogs(limit, before, actionType, userID) {
        return this._client.getGuildAuditLogs.call(this._client, this.id, limit, before, actionType, userID);
    }

    /**
    * Get a ban from the ban list of a guild
    * @arg {String} userID The ID of the banned user
    * @returns {Promise<Object>} Resolves with {reason: String, user: User}
    */
    getBan(userID) {
        return this._client.getGuildBan.call(this._client, this.id, userID);
    }

    /**
    * Get the ban list of the guild
    * @returns {Promise<Array<Object>>} Resolves with an array of {reason: String, user: User}
    */
    getBans() {
        return this._client.getGuildBans.call(this._client, this.id);
    }


    /**
     * Get the guild's discovery object
     * @returns {Promise<Object>}
     */
    getDiscovery() {
        return this._client.getGuildDiscovery.call(this._client, this.id);
    }

    /**
    * [DEPRECATED] Get a guild's embed object
    * @returns {Promise<Object>} A guild embed object
    */
    getEmbed() {
        return this._client.getGuildEmbed.call(this._client, this.id);
    }

    /**
    * Get a list of integrations for the guild
    * @arg {Object} [options] Options for getting integrations
    * @arg {Object} [options.includeApplications=false] Whether or not to include bot and OAuth2 webhook integrations
    * @returns {Promise<GuildIntegration[]>}
    */
    getIntegrations(options) {
        return this._client.getGuildIntegrations.call(this._client, this.id, options);
    }

    /**
    * Get all invites in the guild
    * @returns {Promise<Array<Invite>>}
    */
    getInvites() {
        return this._client.getGuildInvites.call(this._client, this.id);
    }

    /**
    * Get the prune count for the guild
    * @arg {Number} [options] The options to use to get number of prune members
    * @arg {Number} [options.days=7] The number of days of inactivity to prune for
    * @arg {Array<String>} [options.includeRoles] An array of role IDs that members must have to be considered for pruning
    * @returns {Promise<Number>} Resolves with the number of members that would be pruned
    */
    getPruneCount(options) {
        return this._client.getPruneCount.call(this._client, this.id, options);
    }

    /**
    * Get a guild's channels via the REST API. REST mode is required to use this endpoint.
    * @returns {Promise<CategoryChannel[] | TextChannel[] | VoiceChannel[]>}
    */
    getRESTChannels() {
        return this._client.getRESTGuildChannels.call(this._client, this.id);
    }

    /**
    * Get a guild emoji via the REST API. REST mode is required to use this endpoint.
    * @arg {String} emojiID The ID of the emoji
    * @returns {Promise<Object>} An emoji object
    */
    getRESTEmoji(emojiID) {
        return this._client.getRESTGuildEmoji.call(this._client, this.id, emojiID);
    }

    /**
    * Get a guild's emojis via the REST API. REST mode is required to use this endpoint.
    * @returns {Promise<Array<Object>>} An array of guild emoji objects
    */
    getRESTEmojis() {
        return this._client.getRESTGuildEmojis.call(this._client, this.id);
    }

    /**
    * Get a guild's members via the REST API. REST mode is required to use this endpoint.
    * @arg {String} memberID The ID of the member
    * @returns {Promise<Member>}
    */
    getRESTMember(memberID) {
        return this._client.getRESTGuildMember.call(this._client, this.id, memberID);
    }

    /**
    * Get a guild's members via the REST API. REST mode is required to use this endpoint.
    * @arg {Object} [options] Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
    * @arg {String} [options.after] The highest user ID of the previous page
    * @arg {Number} [options.limit=1] The max number of members to get (1 to 1000)
    * @arg {String} [after] [DEPRECATED] The highest user ID of the previous page
    * @returns {Promise<Array<Member>>}
    */
    getRESTMembers(options, after) {
        return this._client.getRESTGuildMembers.call(this._client, this.id, options, after);
    }

    /**
    * Get a guild's roles via the REST API. REST mode is required to use this endpoint.
    * @returns {Promise<Array<Role>>}
    */
    getRESTRoles() {
        return this._client.getRESTGuildRoles.call(this._client, this.id);
    }

    /**
    * Get the guild's templates
    * @returns {Promise<Array<GuildTemplate>>}
    */
    getTemplates() {
        return this._client.getGuildTemplates.call(this._client, this.id);
    }

    /**
    * Returns the vanity url of the guild
    * @returns {Promise}
    */
    getVanity() {
        return this._client.getGuildVanity.call(this._client, this.id);
    }

    /**
    * Get possible voice regions for a guild
    * @returns {Promise<Array<Object>>} Resolves with an array of voice region objects
    */
    getVoiceRegions() {
        return this._client.getVoiceRegions.call(this._client, this.id);
    }

    /**
    * Get all the webhooks in the guild
    * @returns {Promise<Array<Object>>} Resolves with an array of webhook objects
    */
    getWebhooks() {
        return this._client.getGuildWebhooks.call(this._client, this.id);
    }

    /**
    * Get the welcome screen of the Community guild, shown to new members
    * @returns {Promise<Object>}
    */
    getWelcomeScreen() {
        return this._client.getGuildWelcomeScreen.call(this._client, this.id);
    }

    /**
    * Get a guild's widget object
    * @returns {Promise<Object>} A guild widget object
    */
    getWidget() {
        return this._client.getGuildWidget.call(this._client, this.id);
    }

    /**
    * Kick a member from the guild
    * @arg {String} userID The ID of the member
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    kickMember(userID, reason) {
        return this._client.kickGuildMember.call(this._client, this.id, userID, reason);
    }

    /**
    * Leave the guild
    * @returns {Promise}
    */
    leave() {
        return this._client.leaveGuild.call(this._client, this.id);
    }

    /**
    * Leaves the voice channel in this guild
    */
    leaveVoiceChannel() {
        this._client.closeVoiceConnection.call(this._client, this.id);
    }

    /**
    * Get the guild permissions of a member
    * @arg {String | Member} memberID The ID of the member or a Member instance
    * @returns {Permission}
    */
    permissionsOf(memberID) {
        const member = memberID instanceof Member ? memberID : this.members.get(memberID);
        if(member.id === this.ownerID) {
            return new Permission(Permissions.all);
        } else {
            let permissions = this.roles.get(this.id).permissions.allow;
            if(permissions & Permissions.administrator) {
                return new Permission(Permissions.all);
            }
            for(let role of member.roles) {
                role = this.roles.get(role);
                if(!role) {
                    continue;
                }

                const {allow: perm} = role.permissions;
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

    /**
    * Begin pruning the guild
    * @arg {Number} [options] The options to pass to prune members
    * @arg {Boolean} [options.computePruneCount=true] Whether or not the number of pruned members should be returned. Discord discourages setting this to true for larger guilds
    * @arg {Number} [options.days=7] The number of days of inactivity to prune for
    * @arg {Array<String>} [options.includeRoles] An array of role IDs that members must have to be considered for pruning
    * @arg {String} [options.reason] The reason to be displayed in audit logs
    * @returns {Promise<Number>} Resolves with the number of pruned members
    */
    pruneMembers(options) {
        return this._client.pruneMembers.call(this._client, this.id, options);
    }

    /**
    * Remove a role from a guild member
    * @arg {String} memberID The ID of the member
    * @arg {String} roleID The ID of the role
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    removeMemberRole(memberID, roleID, reason) {
        return this._client.removeGuildMemberRole.call(this._client, this.id, memberID, roleID, reason);
    }

    /**
    * Search for guild members by partial nickname/username
    * @arg {String} query The query string to match username(s) and nickname(s) against
    * @arg {Number} [limit=1] The maximum number of members you want returned, capped at 100
    * @returns {Promise<Array<Member>>}
    */
    searchMembers(query, limit) {
        return this._client.searchGuildMembers.call(this._client, this.id, query, limit);
    }

    /**
    * Force a guild integration to sync
    * @arg {String} integrationID The ID of the integration
    * @returns {Promise}
    */
    syncIntegration(integrationID) {
        return this._client.syncGuildIntegration.call(this._client, this.id, integrationID);
    }

    /**
    * Force a guild template to sync
    * @arg {String} code The template code
    * @returns {Promise<GuildTemplate>}
    */
    syncTemplate(code) {
        return this._client.syncGuildTemplate.call(this._client, this.id, code);
    }

    /**
    * Unban a user from the guild
    * @arg {String} userID The ID of the member
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    unbanMember(userID, reason) {
        return this._client.unbanGuildMember.call(this._client, this.id, userID, reason);
    }

    toJSON(props = []) {
        return super.toJSON([
            "afkChannelID",
            "afkTimeout",
            "applicationID",
            "approximateMemberCount",
            "approximatePresenceCount",
            "autoRemoved",
            "banner",
            "categories",
            "channels",
            "defaultNotifications",
            "description",
            "discoverySplash",
            "emojiCount",
            "emojis",
            "explicitContentFilter",
            "features",
            "icon",
            "joinedAt",
            "keywords",
            "large",
            "maxMembers",
            "maxPresences",
            "maxVideoChannelUsers",
            "memberCount",
            "members",
            "mfaLevel",
            "name",
            "ownerID",
            "pendingVoiceStates",
            "preferredLocale",
            "premiumSubscriptionCount",
            "premiumTier",
            "primaryCategory",
            "primaryCategoryID",
            "publicUpdatesChannelID",
            "region",
            "roles",
            "rulesChannelID",
            "splash",
            "systemChannelFlags",
            "systemChannelID",
            "unavailable",
            "vanityURL",
            "verificationLevel",
            "voiceStates",
            "welcomeScreen",
            "widgetChannelID",
            "widgetEnabled",
            ...props
        ]);
    }
}

module.exports = Guild;
