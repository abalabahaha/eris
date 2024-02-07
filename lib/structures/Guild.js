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
const GuildScheduledEvent = require("./GuildScheduledEvent");
const {Permissions} = require("../Constants");
const StageInstance = require("./StageInstance");
const ThreadChannel = require("./ThreadChannel");

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
 * @prop {Number?} emojiCount The number of emojis in the guild
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
 * @prop {Number?} maxStageVideoChannelUsers The max number of users allowed in a stage video channel
 * @prop {Number?} maxVideoChannelUsers The max number of users allowed in a video channel
 * @prop {Number} memberCount Number of members in the guild
 * @prop {Collection<Member>} members Collection of Members in the guild
 * @prop {String} name The name of the guild
 * @prop {Boolean} nsfw [DEPRECATED] Whether the guild is designated as NSFW by Discord
 * @prop {Number} nsfwLevel The guild NSFW level designated by Discord
 * @prop {String} ownerID The ID of the user that is the guild owner
 * @prop {String} preferredLocale Preferred "COMMUNITY" guild language used in server discovery and notices from Discord
 * @prop {Boolean} premiumProgressBarEnabled If the boost progress bar is enabled
 * @prop {Number?} premiumSubscriptionCount The total number of users currently boosting this guild
 * @prop {Number} premiumTier Nitro boost level of the guild
 * @prop {Object?} primaryCategory The guild's primary discovery category
 * @prop {Number?} primaryCategoryID The guild's primary discovery category ID
 * @prop {String?} publicUpdatesChannelID ID of the guild's updates channel if the guild has "COMMUNITY" features
 * @prop {Collection<Role>} roles Collection of Roles in the guild
 * @prop {String?} rulesChannelID The channel where "COMMUNITY" guilds display rules and/or guidelines
 * @prop {String?} safetyAlertsChannelID The channel ID where admins and moderators of Community guilds receive safety alerts from Discord
 * @prop {Shard} shard The Shard that owns the guild
 * @prop {String?} splash The hash of the guild splash image, or null if no splash (VIP only)
 * @prop {String?} splashURL The URL of the guild's splash image
 * @prop {Collection<StageInstance>} stageInstances Collection of stage instances in the guild
 * @prop {Array<Object>?} stickers An array of guild sticker objects
 * @prop {Number} systemChannelFlags The flags for the system channel
 * @prop {String?} systemChannelID The ID of the default channel for system messages (built-in join messages and boost messages)
 * @prop {Collection<ThreadChannel>} threads Collection of threads that the current user has permission to view
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
        this.shard = client.shards.get(client.guildShardMap[this.id] || (Base.getDiscordEpoch(data.id) % client.options.maxShards) || 0);
        this.unavailable = !!data.unavailable;
        this.joinedAt = Date.parse(data.joined_at);
        this.voiceStates = new Collection(VoiceState);
        this.channels = new Collection(GuildChannel);
        this.threads = new Collection(ThreadChannel);
        this.members = new Collection(Member);
        this.events = new Collection(GuildScheduledEvent);
        this.stageInstances = new Collection(StageInstance);
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

        if(data.threads) {
            for(const threadData of data.threads) {
                threadData.guild_id = this.id;
                const channel = Channel.from(threadData, client);
                channel.guild = this;
                this.threads.add(channel, client);
                client.threadGuildMap[channel.id] = this.id;
            }
        }

        if(data.members) {
            for(const member of data.members) {
                member.id = member.user.id;
                this.members.add(member, this);
            }
        }

        if(data.stage_instances) {
            for(const stageInstance of data.stage_instances) {
                stageInstance.guild_id = this.id;
                this.stageInstances.add(stageInstance, client);
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
        if(data.owner_id !== undefined) {
            this.ownerID = data.owner_id;
        }
        if(data.icon !== undefined) {
            this.icon = data.icon;
        }
        if(data.icon_hash !== undefined) {
            this.icon = data.icon_hash;
        }
        if(data.features !== undefined) {
            this.features = data.features;
        }
        if(data.emojis !== undefined) {
            this.emojis = data.emojis;
        }
        if(data.stickers !== undefined) {
            this.stickers = data.stickers;
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
        if(data.premium_progress_bar_enabled !== undefined) {
            this.premiumProgressBarEnabled = data.premium_progress_bar_enabled;
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
        if(data.max_stage_video_channel_users !== undefined) {
            this.maxStageVideoChannelUsers = data.max_stage_video_channel_users;
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
        if(data.nsfw_level !== undefined) {
            this.nsfwLevel = data.nsfw_level;
        }
        if(data.safety_alerts_channel_id !== undefined) {
            this.safetyAlertsChannelID = data.safety_alerts_channel_id;
        }
    }

    get bannerURL() {
        return this.banner ? this._client._formatImage(Endpoints.BANNER(this.id, this.banner)) : null;
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
     * Add a user to the guild
     * @arg {String} userID The ID of the user
     * @arg {String} accessToken The access token of the user
     * @arg {Object} [options] Options for adding the user
     * @arg {Boolean} [options.deaf] Whether the user should be deafened
     * @arg {Boolean} [options.mute] Whether the user should be muted
     * @arg {String} [options.nick] The user's nickname
     * @arg {Array<String>} [options.roles] Array of role IDs to add to the user
     */
    addMember(userID, accessToken, options = {}) {
        return this._client.addGuildMember.call(this._client, this.id, userID, accessToken, options);
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
     * @arg {Number} [options.deleteMessageDays=0] [DEPRECATED] Number of days to delete messages for, between 0-7 inclusive
     * @arg {Number} [options.deleteMessageSeconds=0] Number of seconds to delete messages for, between 0 and 604,800 inclusive
     * @arg {String} [options.reason] The reason to be displayed in audit logs
     * @arg {String} [reason] [DEPRECATED] The reason to be displayed in audit logs
     * @returns {Promise}
     */
    banMember(userID, options, reason) {
        return this._client.banGuildMember.call(this._client, this.id, userID, options, reason);
    }

    /**
     * Bulk create/edit the guild application commands
     * @arg {Array<Object>} commands An array of command objects
     * @arg {BigInt | Number | String | Permission?} commands[].defaultMemberPermissions The default permissions the user must have to use the command
     * @arg {Boolean} [commands[].defaultPermission=true] [DEPRECATED] Whether the command is enabled by default when the application is added to a guild. Replaced by `defaultMemberPermissions`
     * @arg {String} [commands[].description] The command description, required for `CHAT_INPUT` commands
     * @arg {Object?} [commands[].descriptionLocalizations] Localization directory with keys in [available locales](https://discord.dev/reference#locales) for the command description
     * @arg {String} [commands[].id] The command ID, if known
     * @arg {String} commands[].name The command name
     * @arg {Object?} [commands[].nameLocalizations] Localization directory with keys in [available locales](https://discord.dev/reference#locales) for the command name
     * @arg {Boolean} [commands[].nsfw=false] Whether the command is age-restricted
     * @arg {Array<Object>} [commands[].options] The application command [options](https://discord.dev/interactions/application-commands#application-command-object-application-command-option-structure)
     * @arg {Number} [commands[].type=1] The command type, either `1` for `CHAT_INPUT`, `2` for `USER` or `3` for `MESSAGE`
     * @returns {Promise<Array<ApplicationCommand>>} Resolves with the overwritten application commands
     */
    bulkEditCommands(commands) {
        return this._client.bulkEditGuildCommands.call(this._client, this.id, commands);
    }

    /**
     * Create an auto moderation rule
     * @arg {Object} options The rule to create
     * @arg {Array<Object>} options.actions The [actions](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object) done when the rule is violated
     * @arg {Boolean} [options.enabled=false] If the rule is enabled, false by default
     * @arg {Number} options.eventType The [event type](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-event-types) for the rule
     * @arg {Array<String>} [options.exemptChannels] Any channels where this rule does not apply
     * @arg {Array<String>} [options.exemptRoles] Any roles to which this rule does not apply
     * @arg {String} options.name The name of the rule
     * @arg {Object} [options.triggerMetadata] The [trigger metadata](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata) for the rule
     * @arg {Number} options.triggerType The [trigger type](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-types) of the rule
     * @arg {String} [options.reason] The reason to be displayed in audit logs
     * @returns {Promise<Object>}
     */
    createAutoModerationRule(options) {
        return this._client.createAutoModerationRule.call(this._client, this.id, options);
    }

    /**
     * Create a channel in the guild
     * @arg {String} name The name of the channel
     * @arg {Number} [type=0] The type of the channel, either 0 (text), 2 (voice), 4 (category), 5 (news), 13 (stage), or 15 (forum)
     * @arg {Object | String} [options] The properties the channel should have. If `options` is a string, it will be treated as `options.parentID` (see below). Passing a string is deprecated and will not be supported in future versions.
     * @arg {Array<Object>} [options.availableTags] The available tags that can be applied to threads in a forum channel. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#forum-tag-object) for object structure (forum channels only, max 20)
     * @arg {Number} [options.bitrate] The bitrate of the channel (voice channels only)
     * @arg {Number} [options.defaultAutoArchiveDuration] The default duration of newly created threads in minutes to automatically archive the thread after inactivity (60, 1440, 4320, 10080) (text/news/forum channels only)
     * @arg {Number} [options.defaultForumLayout] The default forum layout type used to display posts in forum channels (forum channels only)
     * @arg {Object} [options.defaultReactionEmoji] The emoji to show in the add reaction button on a thread in a forum channel (forum channels only)
     * @arg {Number} [options.defaultSortOrder] The default sort order type used to order posts in forum channels (forum channels only)
     * @arg {Number} [options.defaultThreadRateLimitPerUser] The initial rateLimitPerUser to set on newly created threads in a channel (text/forum channels only)
     * @arg {Boolean} [options.nsfw] The nsfw status of the channel
     * @arg {String?} [options.parentID] The ID of the parent category channel for this channel
     * @arg {Array<Object>} [options.permissionOverwrites] An array containing permission overwrite objects
     * @arg {Number} [options.position] The sorting position of the channel
     * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (0-21600) (does not affect bots or users with manageMessages/manageChannel permissions) (text/voice/stage/forum channels only)
     * @arg {String} [options.reason] The reason to be displayed in audit logs
     * @arg {String} [options.topic] The topic of the channel (text channels only)
     * @arg {Number} [options.userLimit] The channel user limit (voice channels only)
     * @returns {Promise<CategoryChannel | ForumChannel | TextChannel | TextVoiceChannel>}
     */
    createChannel(name, type, reason, options) {
        return this._client.createChannel.call(this._client, this.id, name, type, reason, options);
    }

    /**
     * Create a guild application command
     * @arg {Object} command A command object
     * @arg {BigInt | Number | String | Permission?} command.defaultMemberPermissions The default permissions the user must have to use the command
     * @arg {Boolean} [command.defaultPermission=true] [DEPRECATED] Whether the command is enabled by default when the application is added to a guild. Replaced by `defaultMemberPermissions`
     * @arg {String} [command.description] The command description, required for `CHAT_INPUT` commands
     * @arg {Object?} [command.descriptionLocalizations] Localization directory with keys in [available locales](https://discord.dev/reference#locales) for the command description
     * @arg {String} command.name The command name
     * @arg {Object?} [command.nameLocalizations] Localization directory with keys in [available locales](https://discord.dev/reference#locales) for the command name
     * @arg {Boolean} [command.nsfw=false] Whether the command is age-restricted
     * @arg {Array<Object>} [command.options] The application command [options](https://discord.dev/interactions/application-commands#application-command-object-application-command-option-structure)
     * @arg {Number} [command.type=1] The command type, either `1` for `CHAT_INPUT`, `2` for `USER` or `3` for `MESSAGE`
     * @returns {Promise<ApplicationCommand>} Resolves with the created application command
     */
    createCommand(command) {
        return this._client.createGuildCommand.call(this._client, this.id, command);
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
     * @arg {Object | Role} [options] An object or Role containing the properties to set
     * @arg {Number} [options.color] The hex color of the role, in number form (ex: 0x3d15b3 or 4040115)
     * @arg {Boolean} [options.hoist] Whether to hoist the role in the user list or not
     * @arg {String} [options.icon] The role icon as a base64 data URI
     * @arg {Boolean} [options.mentionable] Whether the role is mentionable or not
     * @arg {String} [options.name] The name of the role
     * @arg {BigInt | Number | String | Permission} [options.permissions] The role permissions
     * @arg {String} [options.unicodeEmoji] The role's unicode emoji
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<Role>}
     */
    createRole(options, reason) {
        return this._client.createRole.call(this._client, this.id, options, reason);
    }

    /**
     * Create a guild scheduled event
     * @arg {Object} event The event to be created
     * @arg {String} [event.channelID] The channel ID of the event. This is optional if `entityType` is `3` (external)
     * @arg {String} [event.description] The description of the event
     * @arg {Object} [event.entityMetadata] The entity metadata for the scheduled event. This is required if `entityType` is `3` (external)
     * @arg {String} [event.entityMetadata.location] Location of the event
     * @arg {Number} event.entityType The [entity type](https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-types) of the scheduled event
     * @arg {String} [event.image] Base 64 encoded image for the scheduled event
     * @arg {String} event.name The name of the event
     * @arg {String} event.privacyLevel The privacy level of the event
     * @arg {Date} [event.scheduledEndTime] The time when the event is scheduled to end. This is required if `entityType` is `3` (external)
     * @arg {Date} event.scheduledStartTime The time the event will start
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<GuildScheduledEvent>}
     */
    createScheduledEvent(event, reason) {
        return this._client.createGuildScheduledEvent.call(this._client, this.id, event, reason);
    }

    /**
     * Create a guild sticker
     * @arg {Object} options Sticker options
     * @arg {String} [options.description] The description of the sticker
     * @arg {Object} options.file A file object
     * @arg {Buffer} options.file.file A buffer containing file data
     * @arg {String} options.file.name What to name the file
     * @arg {String} options.name The name of the sticker
     * @arg {String} options.tags The Discord name of a unicode emoji representing the sticker's expression
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<Object>} A sticker object
     */
    createSticker(options, reason) {
        return this._client.createGuildSticker.call(this._client, this.id, options, reason);
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
     * Delete an auto moderation rule
     * @arg {String} ruleID The ID of the rule to delete
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise}
     */
    deleteAutoModerationRule(ruleID, reason) {
        return this._client.deleteAutoModerationRule.call(this._client, this.id, ruleID, reason);
    }

    /**
     * Delete a guild application command
     * @arg {String} commandID The command id
     * @returns {Promise} Resolves with a promise object
     */
    deleteCommand(commandID) {
        return this._client.deleteGuildCommand.call(this._client, this.id, commandID);
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
     * Delete a guild scheduled event
     * @arg {String} eventID The ID of the event
     * @returns {Promise}
     */
    deleteScheduledEvent(eventID) {
        return this._client.deleteGuildScheduledEvent.call(this._client, this.id, eventID);
    }

    /**
     * Delete a guild sticker
     * @arg {String} stickerID The ID of the sticker
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise}
     */
    deleteSticker(stickerID, reason) {
        return this._client.deleteGuildSticker.call(this._client, this.id, stickerID, reason);
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
     * @returns {String?}
     */
    dynamicBannerURL(format, size) {
        return this.banner ? this._client._formatImage(Endpoints.BANNER(this.id, this.banner), format, size) : null;
    }

    /**
     * Get the guild's discovery splash with the given format and size
     * @arg {String} [format] The filetype of the icon ("jpg", "jpeg", "png", "gif", or "webp")
     * @arg {Number} [size] The size of the icon (any power of two between 16 and 4096)
     * @returns {String?}
     */
    dynamicDiscoverySplashURL(format, size) {
        return this.discoverySplash ? this._client._formatImage(Endpoints.GUILD_DISCOVERY_SPLASH(this.id, this.discoverySplash), format, size) : null;
    }

    /**
     * Get the guild's icon with the given format and size
     * @arg {String} [format] The filetype of the icon ("jpg", "jpeg", "png", "gif", or "webp")
     * @arg {Number} [size] The size of the icon (any power of two between 16 and 4096)
     * @returns {String?}
     */
    dynamicIconURL(format, size) {
        return this.icon ? this._client._formatImage(Endpoints.GUILD_ICON(this.id, this.icon), format, size) : null;
    }

    /**
     * Get the guild's splash with the given format and size
     * @arg {String} [format] The filetype of the icon ("jpg", "jpeg", "png", "gif", or "webp")
     * @arg {Number} [size] The size of the icon (any power of two between 16 and 4096)
     * @returns {String?}
     */
    dynamicSplashURL(format, size) {
        return this.splash ? this._client._formatImage(Endpoints.GUILD_SPLASH(this.id, this.splash), format, size) : null;
    }

    /**
     * Edit the guild
     * @arg {Object} options The properties to edit
     * @arg {String?} [options.afkChannelID] The ID of the AFK voice channel
     * @arg {Number} [options.afkTimeout] The AFK timeout in seconds
     * @arg {String?} [options.banner] The guild banner image as a base64 data URI (VIP only). Note: base64 strings alone are not base64 data URI strings
     * @arg {Number?} [options.defaultNotifications] The default notification settings for the guild. 0 is "All Messages", 1 is "Only @mentions".
     * @arg {String?} [options.description] The description for the guild (VIP only)
     * @arg {String?} [options.discoverySplash] The guild discovery splash image as a base64 data URI (VIP only). Note: base64 strings alone are not base64 data URI strings
     * @arg {Number?} [options.explicitContentFilter] The level of the explicit content filter for messages/images in the guild. 0 disables message scanning, 1 enables scanning the messages of members without roles, 2 enables scanning for all messages.
     * @arg {Array<String>} [options.features] The enabled features for the guild. Note that only certain features can be toggled with the API
     * @arg {String?} [options.icon] The guild icon as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
     * @arg {String} [options.name] The name of the guild
     * @arg {String} [options.ownerID] The ID of the member to transfer guild ownership to (bot user must be owner)
     * @arg {String?} [options.preferredLocale] Preferred "COMMUNITY" guild language used in server discovery and notices from Discord
     * @arg {String?} [options.publicUpdatesChannelID] The ID of the channel where admins and moderators of "COMMUNITY" guilds receive notices from Discord
     * @arg {String?} [options.rulesChannelID] The ID of the channel where "COMMUNITY" guilds display rules and/or guidelines
     * @arg {String?} [options.safetyAlertsChannelID] The ID of the channel where admins and moderators of Community guilds receive safety alerts from Discord
     * @arg {String?} [options.splash] The guild splash image as a base64 data URI (VIP only). Note: base64 strings alone are not base64 data URI strings
     * @arg {Number} [options.systemChannelFlags] The flags for the system channel
     * @arg {String?} [options.systemChannelID] The ID of the system channel
     * @arg {Number?} [options.verificationLevel] The guild verification level
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<Guild>}
     */
    edit(options, reason) {
        return this._client.editGuild.call(this._client, this.id, options, reason);
    }

    /**
     * Edit an existing auto moderation rule
     * @arg {String} ruleID The ID of the rule to edit
     * @arg {Object} options The rule to create
     * @arg {Array<Object>} [options.actions] The [actions](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object) done when the rule is violated
     * @arg {Boolean} [options.enabled=false] If the rule is enabled, false by default
     * @arg {Number} [options.eventType] The [event type](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-event-types) for the rule
     * @arg {Array<String>} [options.exemptChannels] Any channels where this rule does not apply
     * @arg {Array<String>} [options.exemptRoles] Any roles to which this rule does not apply
     * @arg {String} [options.name] The name of the rule
     * @arg {Object} [options.triggerMetadata] The [trigger metadata](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata) for the rule
     * @arg {Number} [options.triggerType] The [trigger type](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-types) of the rule
     * @arg {String} [options.reason] The reason to be displayed in audit logs
     * @returns {Promise<Object>}
     */
    editAutoModerationRule(ruleID, options) {
        return this._client.editAutoModerationRule.call(this._client, this.id, ruleID, options);
    }

    /**
     * Edit multiple channels' positions. Note that channel position numbers are grouped by type (category, text, voice), then sorted in ascending order (lowest number is on top).
     * @arg {Array<Object>} channelPositions An array of [ChannelPosition](https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions)
     * @arg {String} channelPositions[].id The ID of the channel
     * @arg {Boolean} [channelPositions[].lockPermissions] Whether to sync the channel's permissions with the new parent, if changing parents
     * @arg {String} [channelPositions[].parentID] The new parent ID (category channel) for the channel that is moved. For each request, only one channel can change parents
     * @arg {Number} channelPositions[].position The new position of the channel
     * @returns {Promise}
     */
    editChannelPositions(channelPositions) {
        return this._client.editChannelPositions.call(this._client, this.id, channelPositions);
    }

    /**
     * Edit a guild application command
     * @arg {String} commandID The command ID
     * @arg {Object} command A command object
     * @arg {BigInt | Number | String | Permission?} [command.defaultMemberPermissions] The default permissions the user must have to use the command
     * @arg {Boolean} [command.defaultPermission] [DEPRECATED] Whether the command is enabled by default when the application is added to a guild. Replaced by `defaultMemberPermissions`
     * @arg {String} [command.description] The command description, required for `CHAT_INPUT` commands
     * @arg {Object?} [command.descriptionLocalizations] Localization directory with keys in [available locales](https://discord.dev/reference#locales) for the command description
     * @arg {String} [command.name] The command name
     * @arg {Object?} [command.nameLocalizations] Localization directory with keys in [available locales](https://discord.dev/reference#locales) for the command name
     * @arg {Boolean} [command.nsfw] Whether the command is age-restricted
     * @arg {Array<Object>} [command.options] The application command [options](https://discord.dev/interactions/application-commands#application-command-object-application-command-option-structure)
     * @returns {Promise<ApplicationCommand>} Resolves with the edited application command
     */
    editCommand(commandID, command) {
        return this._client.editGuildCommand.call(this._client, this.id, commandID, command);
    }

    /**
     * Edits command permissions for a specific command in a guild.
     * Note: You can only add up to 10 permission overwrites for a command.
     * @arg {String} commandID The command id
     * @arg {Array<Object>} permissions An array of [permissions objects](https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permissions-structure)
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<Object>} Resolves with a [GuildApplicationCommandPermissions](https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-guild-application-command-permissions-structure) object.
     */
    editCommandPermissions(commandID, permissions, reason) {
        return this._client.editCommandPermissions.call(this._client, this.id, commandID, permissions, reason);
    }

    /**
     * Edit the guild's discovery data
     * @arg {Object} [options] The guild discovery data
     * @arg {Boolean} [options.emojiDiscoverabilityEnabled] Whether guild info should be shown when emoji info is loaded
     * @arg {Array<String>} [options.keywords] The discovery keywords (max 10)
     * @arg {String} [options.primaryCategoryID] The primary discovery category ID
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
     * @arg {String} memberID The ID of the member (use "@me" to edit the current bot user)
     * @arg {Object} options The properties to edit
     * @arg {String?} [options.channelID] The ID of the voice channel to move the member to (must be in voice). Set to `null` to disconnect the member
     * @arg {Date?} [options.communicationDisabledUntil] When the user's timeout should expire. Set to `null` to instantly remove timeout
     * @arg {Boolean} [options.deaf] Server deafen the member
     * @arg {Number} [options.flags] The user's flags - `OR` the `BYPASSES_VERIFICATION` flag (4) to make the member exempt from verification requirements, `NAND` the flag to make the member not exempt
     * @arg {Boolean} [options.mute] Server mute the member
     * @arg {String} [options.nick] Set the member's guild nickname, "" to remove
     * @arg {Array<String>} [options.roles] The array of role IDs the member should have
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<Member>}
     */
    editMember(memberID, options, reason) {
        return this._client.editGuildMember.call(this._client, this.id, memberID, options, reason);
    }

    /**
     * Edit the guild's MFA level (multi-factor authentication). Note: The bot account must be the owner of the guild to be able to edit the MFA status.
     * @arg {Number} level The new MFA level, `0` to disable MFA, `1` to enable it
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<Object>} An object containing a `level` (Number) key, indicating the new MFA level
     */
    editMFALevel(level, reason) {
        return this._client.editGuildMFALevel.call(this._client, this.id, level, reason);
    }

    /**
     * [DEPRECATED] Edit the bot's nickname in the guild
     * @arg {String} nick The nickname
     * @returns {Promise}
     */
    editNickname(nick) {
        return this._client.editNickname.call(this._client, this.id, nick);
    }

    /**
     * Edit the guild's onboarding settings
     * @arg {Object} options The properties to edit
     * @arg {Array<String>} options.defaultChannelIDs The ID of channels that members are opted into automatically
     * @arg {Boolean} options.enabled Whether onboarding should be enabled or not for the guild
     * @arg {Number} options.mode The onboarding mode, `0` for default, `1` for advanced
     * @arg {Array<Object>} options.prompts The [prompts](https://discord.dev/resources/guild#guild-onboarding-object-onboarding-prompt-structure) shown during the onboarding process
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<Object>} The guild's [onboarding settings](https://discord.dev/resources/guild#guild-onboarding-object)
     */
    editOnboarding(options, reason) {
        return this._client.editGuildOnboarding.call(this._client, this.id, options, reason);
    }

    /**
     * Edit the guild role
     * @arg {String} roleID The ID of the role
     * @arg {Object} options The properties to edit
     * @arg {Number} [options.color] The hex color of the role, in number form (ex: 0x3da5b3 or 4040115)
     * @arg {Boolean} [options.hoist] Whether to hoist the role in the user list or not
     * @arg {String} [options.icon] The role icon as a base64 data URI
     * @arg {Boolean} [options.mentionable] Whether the role is mentionable or not
     * @arg {String} [options.name] The name of the role
     * @arg {BigInt | Number | String | Permission} [options.permissions] The role permissions
     * @arg {String} [options.unicodeEmoji] The role's unicode emoji
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<Role>}
     */
    editRole(roleID, options, reason) {
        return this._client.editRole.call(this._client, this.id, roleID, options, reason);
    }

    /**
     * Edit this scheduled event
     * @arg {String} eventID The guild scheduled event ID
     * @arg {Object} event The new guild scheduled event object
     * @arg {String} [event.channelID] The channel ID of the event. If updating `entityType` to `3` (external), this **must** be set to `null`
     * @arg {String} [event.description] The description of the event
     * @arg {Object} [event.entityMetadata] The entity metadata for the scheduled event. This is required if updating `entityType` to `3` (external)
     * @arg {String} [event.entityMetadata.location] Location of the event. This is required if updating `entityType` to `3` (external)
     * @arg {Number} [event.entityType] The [entity type](https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-types) of the scheduled event
     * @arg {String} [event.image] Base 64 encoded image for the event
     * @arg {String} [event.name] The name of the event
     * @arg {String} [event.privacyLevel] The privacy level of the event
     * @arg {Date} [event.scheduledEndTime] The time when the scheduled event is scheduled to end. This is required if updating `entityType` to `3` (external)
     * @arg {Date} [event.scheduledStartTime] The time the event will start
     * @arg {Number} [event.status] The [status](https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-status) of the scheduled event
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<GuildScheduledEvent>}
     */
    editScheduledEvent(eventID, event, reason) {
        return this._client.editGuildScheduledEvent.call(this._client, this.id, eventID, event, reason);
    }

    /**
     * Edit a guild sticker
     * @arg {String} stickerID The ID of the sticker
     * @arg {Object} options The properties to edit
     * @arg {String} [options.description] The description of the sticker
     * @arg {String} [options.name] The name of the sticker
     * @arg {String} [options.tags] The Discord name of a unicode emoji representing the sticker's expression
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<Object>} A sticker object
     */
    editSticker(stickerID, options, reason) {
        return this._client.editGuildSticker.call(this._client, this.id, stickerID, options, reason);
    }

    /**
     * Edit a guild template
     * @arg {String} code The template code
     * @arg {Object} options The properties to edit
     * @arg {String?} [options.description] The desription for the template. Set to `null` to remove the description
     * @arg {String} [options.name] The name of the template
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
     * Update a user's voice state - See [caveats](https://discord.com/developers/docs/resources/guild#modify-user-voice-state-caveats)
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
     * @arg {Boolean} [options.enabled] Whether the guild widget is enabled
     * @arg {String?} [options.channelID] The channel ID for the guild widget
     * @arg {String?} [options.reason] The reason to be displayed in audit logs
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
     * Get all active threads in this guild
     * @returns {Promise<Object>} An object containing an array of `threads` and an array of `members`
     */
    getActiveThreads() {
        return this._client.getActiveGuildThreads.call(this._client, this.id);
    }

    /**
     * Get the audit log for the guild
     * @arg {Object} [options] Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
     * @arg {Number} [options.actionType] Filter entries by action type
     * @arg {String} [options.before] Get entries before this entry ID
     * @arg {Number} [options.limit=50] The maximum number of entries to return
     * @arg {String} [options.userID] Filter entries by the user that performed the action
     * @returns {Promise<{entries: Array<GuildAuditLogEntry>, integrations: Array<PartialIntegration>, threads: Array<NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel>, users: Array<User>, webhooks: Array<Webhook>}>}
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
     * @returns {Promise<{entries: Array<GuildAuditLogEntry>, integrations: Array<PartialIntegration>, threads: Array<NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel>, users: Array<User>, webhooks: Array<Webhook>}>}
     */
    getAuditLogs(limit, before, actionType, userID) {
        return this._client.getGuildAuditLogs.call(this._client, this.id, limit, before, actionType, userID);
    }

    /**
     * Get an existing auto moderation rule
     * @arg {String} guildID The ID of the guild to get the rule from
     * @arg {String} ruleID The ID of the rule to get
     * @returns {Promise<Object>}
     */
    getAutoModerationRule(ruleID) {
        return this._client.getAutoModerationRule.call(this._client, this.id, ruleID);
    }

    /**
     * Get a guild's auto moderation rules
     * @arg {String} guildID The ID of the guild to get the rules of
     * @returns {Promise<Array<Object>>}
     */
    getAutoModerationRules() {
        return this._client.getAutoModerationRules.call(this._client, this.id);
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
     * @arg {Object} [options] Options for the request
     * @arg {String} [options.after] Only get users after given user ID
     * @arg {String} [options.before] Only get users before given user ID
     * @arg {Number} [options.limit=1000] The maximum number of users to return
     * @returns {Promise<Array<Object>>} Resolves with an array of { reason: String, user: User }
     */
    getBans(options) {
        return this._client.getGuildBans.call(this._client, this.id, options);
    }

    /**
     * Get a guild application command
     * @arg {String} commandID The command id
     * @returns {Promise<Object>} Resolves with a command object
     */
    getCommand(commandID) {
        return this._client.getGuildCommand.call(this._client, this.id, commandID);
    }

    /**
     * Get the a guild's application command permissions
     * @arg {String} commandID The command id
     * @returns {Promise<Object>} Resolves with a guild application command permissions object.
     */
    getCommandPermissions(commandID) {
        return this._client.getCommandPermissions.call(this._client, this.id, commandID);
    }

    /**
     * Get the guild's application commands
     * @returns {Promise<Array<Object>>} Resolves with an array of command objects
     */
    getCommands() {
        return this._client.getGuildCommands.call(this._client, this.id);
    }

    /**
     * Get the guild's discovery object
     * @returns {Promise<Object>}
     */
    getDiscovery() {
        return this._client.getGuildDiscovery.call(this._client, this.id);
    }

    /**
     * Get the all of a guild's application command permissions
     * @returns {Promise<Array<Object>>} Resolves with an array of guild application command permissions objects.
     */
    getGuildCommandPermissions() {
        return this._client.getGuildCommandPermissions.call(this._client, this.id);
    }

    /**
     * Get a list of integrations for the guild
     * @returns {Promise<Array<GuildIntegration>>}
     */
    getIntegrations() {
        return this._client.getGuildIntegrations.call(this._client, this.id);
    }

    /**
     * Get all invites in the guild
     * @returns {Promise<Array<Invite>>}
     */
    getInvites() {
        return this._client.getGuildInvites.call(this._client, this.id);
    }

    /**
     * Get the guild's onboarding settings
     * @returns {Promise<Object>} The guild's [onboarding settings](https://discord.dev/resources/guild#guild-onboarding-object)
     */
    getOnboarding() {
        return this._client.getGuildOnboarding.call(this._client, this.id);
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
     * @returns {Promise<Array<CategoryChannel | ForumChannel | NewsChannel | StageChannel | TextChannel> | TextVoiceChannel>}
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
     * Get a guild scheduled event via the REST API. REST mode is required to use this endpoint.
     * @arg {String} eventID The ID of the guild scheduled event
     * @arg {Object} [options] Options for the request
     * @arg {Boolean} [options.withUserCount] Whether to include the number of users subscribed to the event
     * @returns {Promise<GuildScheduledEvent>}
     */
    getRESTScheduledEvent(eventID, options) {
        return this._client.getRESTGuildScheduledEvent.call(this._client, this.id, eventID, options);
    }

    /**
     * Get a guild sticker via the REST API. REST mode is required to use this endpoint.
     * @arg {String} stickerID The ID of the sticker
     * @returns {Promise<Object>} A sticker object
     */
    getRESTSticker(stickerID) {
        return this._client.getRESTGuildSticker.call(this._client, this.id, stickerID);
    }

    /**
     * Get a guild's stickers via the REST API. REST mode is required to use this endpoint.
     * @returns {Promise<Array<Object>>} An array of guild sticker objects
     */
    getRESTStickers() {
        return this._client.getRESTGuildStickers.call(this._client, this.id);
    }

    /**
     * Get the guild's scheduled events
     * @arg {Object} [options] Options for the request
     * @arg {Boolean} [options.withUserCount] Whether to include the number of users subscribed to each event
     * @returns {Promise<Array<GuildScheduledEvent>>}
     */
    getScheduledEvents(options) {
        return this._client.getGuildScheduledEvents.call(this._client, this.id, options);
    }

    /**
     * Get a list of users subscribed to a guild scheduled event
     * @arg {String} eventID The ID of the event
     * @arg {Object} [options] Options for the request
     * @arg {String} [options.after] Get users after this user ID. If `options.before` is provided, this will be ignored. Fetching users in between `before` and `after` is not supported
     * @arg {String} [options.before] Get users before this user ID
     * @arg {Number} [options.limit=100] The number of users to get (max 100). Pagination will only work if one of `options.after` or `options.after` is also provided
     * @arg {Boolean} [options.withMember] Include guild member data
     * @returns {Promise<Array<{guildScheduledEventID: String, member?: Member, user: User}>}
     */
    getScheduledEventUsers(eventID, options) {
        return this._client.getGuildScheduledEventUsers.call(this._client, this.id, eventID, options);
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
     * Get a guild's widget image
     * @arg {String} [style="shield"] The style of widget image
     * @returns {String} The image URL of widget image
     */
    getWidgetImageURL(style) {
        return this._client.getGuildWidgetImageURL.call(this._client, this.id, style);
    }

    /**
     * Get a guild's widget settings object
     * @returns {Promise<Object>} A guild widget settings object
     */
    getWidgetSettings() {
        return this._client.getGuildWidgetSettings.call(this._client, this.id);
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
     * @arg {String | Member | Object} memberID The ID of the member or a Member object
     * @returns {Permission}
     */
    permissionsOf(memberID) {
        const member = typeof memberID === "string" ? this.members.get(memberID) : memberID;
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
            "premiumProgressBarEnabled",
            "premiumSubscriptionCount",
            "premiumTier",
            "primaryCategory",
            "primaryCategoryID",
            "publicUpdatesChannelID",
            "roles",
            "rulesChannelID",
            "splash",
            "stickers",
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
