"use strict";

const Base = require("./structures/Base");
const Channel = require("./structures/Channel");
const Collection = require("./util/Collection");
const Constants = require("./Constants");
const Endpoints = require("./rest/Endpoints");
const ExtendedUser = require("./structures/ExtendedUser");
const GroupChannel = require("./structures/GroupChannel");
const Guild = require("./structures/Guild");
const GuildAuditLogEntry = require("./structures/GuildAuditLogEntry");
const GuildIntegration = require("./structures/GuildIntegration");
const GuildPreview = require("./structures/GuildPreview");
const GuildTemplate = require("./structures/GuildTemplate");
const Invite = require("./structures/Invite");
const Member = require("./structures/Member");
const Message = require("./structures/Message");
const Permission = require("./structures/Permission");
const PrivateChannel = require("./structures/PrivateChannel");
const Relationship = require("./structures/Relationship");
const RequestHandler = require("./rest/RequestHandler");
const Role = require("./structures/Role");
const ShardManager = require("./gateway/ShardManager");
const UnavailableGuild = require("./structures/UnavailableGuild");
const User = require("./structures/User");
const VoiceConnectionManager = require("./voice/VoiceConnectionManager");

let EventEmitter;
try {
    EventEmitter = require("eventemitter3");
} catch(err) {
    EventEmitter = require("events");
}
let Erlpack;
try {
    Erlpack = require("erlpack");
} catch(err) { // eslint-disable no-empty
}
let ZlibSync;
try {
    ZlibSync = require("zlib-sync");
} catch(err) {
    try {
        ZlibSync = require("pako");
    } catch(err) { // eslint-disable no-empty
    }
}
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
* Represents the main Eris client
* @extends EventEmitter
* @prop {Object?} application Object containing the bot application's ID and its public flags
* @prop {Boolean} bot Whether the bot user belongs to an OAuth2 application
* @prop {Object} channelGuildMap Object mapping channel IDs to guild IDs
* @prop {String} gatewayURL The URL for the discord gateway
* @prop {Collection<GroupChannel>} groupChannels Collection of group channels the bot is in (user accounts only)
* @prop {Collection<Guild>} guilds Collection of guilds the bot is in
* @prop {Object} guildShardMap Object mapping guild IDs to shard IDs
* @prop {Object} notes Object mapping user IDs to user notes (user accounts only)
* @prop {Object} options Eris options
* @prop {Object} privateChannelMap Object mapping user IDs to private channel IDs
* @prop {Collection<PrivateChannel>} privateChannels Collection of private channels the bot is in
* @prop {Collection<Relationship>} relationships Collection of relationships the bot user has (user accounts only)
* @prop {RequestHandler} requestHandler The request handler the client will use
* @prop {Collection<Shard>} shards Collection of shards Eris is using
* @prop {Number} startTime Timestamp of bot ready event
* @prop {String} token The auth token
* @prop {Collection<UnavailableGuild>} unavailableGuilds Collection of unavailable guilds the bot is in
* @prop {Number} uptime How long in milliseconds the bot has been up for
* @prop {ExtendedUser} user The bot user
* @prop {Object} userGuildSettings Object mapping guild IDs to individual guild settings for the bot user (user accounts only)
* @prop {Collection<User>} users Collection of users the bot sees
* @prop {Object} userSettings Object containing the user account settings (user accounts only)
* @prop {Collection<VoiceConnection>} voiceConnections Extended collection of active VoiceConnections the bot has
*/
class Client extends EventEmitter {
    /**
    * Create a Client
    * @arg {String} token The auth token to use. Bot tokens should be prefixed with `Bot` (e.g. `Bot MTExIHlvdSAgdHJpZWQgMTEx.O5rKAA.dQw4w9WgXcQ_wpV-gGA4PSk_bm8`). Prefix-less bot tokens are [DEPRECATED]
    * @arg {Object} [options] Eris options (all options are optional)
    * @arg {Object} [options.agent] [DEPRECATED] A HTTPS Agent used to proxy requests. This option has been moved under `options.rest`
    * @arg {Object} [options.allowedMentions] A list of mentions to allow by default in createMessage/editMessage
    * @arg {Boolean} [options.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [options.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [options.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {Boolean} [options.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to
    * @arg {Boolean} [options.autoreconnect=true] Have Eris autoreconnect when connection is lost
    * @arg {Boolean} [options.compress=false] Whether to request WebSocket data to be compressed or not
    * @arg {Number} [options.connectionTimeout=30000] How long in milliseconds to wait for the connection to handshake with the server
    * @arg {String} [options.defaultImageFormat="jpg"] The default format to provide user avatars, guild icons, and group icons in. Can be "jpg", "png", "gif", or "webp"
    * @arg {Number} [options.defaultImageSize=128] The default size to return user avatars, guild icons, banners, splashes, and group icons. Can be any power of two between 16 and 2048. If the height and width are different, the width will be the value specified, and the height relative to that
    * @arg {Object} [options.disableEvents] If disableEvents[eventName] is true, the WS event will not be processed. This can cause significant performance increase on large bots. [A full list of the WS event names can be found on the docs reference page](/Eris/docs/reference#ws-event-names)
    * @arg {Number} [options.firstShardID=0] The ID of the first shard to run for this client
    * @arg {Boolean} [options.getAllUsers=false] Get all the users in every guild. Ready time will be severely delayed
    * @arg {Number} [options.guildCreateTimeout=2000] How long in milliseconds to wait for a GUILD_CREATE before "ready" is fired. Increase this value if you notice missing guilds
    * @arg {Boolean} [options.guildSubscriptions=true] If false, disables some guild subscription events, including typing and presence events. This will reduce processing load, but will also result in inconsistent member caching
    * @arg {Number | Array<String>} [options.intents] A list of intents, or raw bitmask value describing the intents to subscribe to. "presence" intent must be enabled on your application's page to be used.
    * @arg {Number} [options.largeThreshold=250] The maximum number of offline users per guild during initial guild data transmission
    * @arg {Number} [options.lastShardID=options.maxShards - 1] The ID of the last shard to run for this client
    * @arg {Number} [options.latencyThreshold=30000] [DEPRECATED] The average request latency at which Eris will start emitting latency errors. This option has been moved under `options.rest`
    * @arg {Number} [options.maxReconnectAttempts=Infinity] The maximum amount of times that the client is allowed to try to reconnect to Discord.
    * @arg {Number} [options.maxResumeAttempts=10] The maximum amount of times a shard can attempt to resume a session before considering that session invalid.
    * @arg {Number | String} [options.maxShards=1] The total number of shards you want to run. If "auto" Eris will use Discord's recommended shard count.
    * @arg {Number} [options.messageLimit=100] The maximum size of a channel message cache
    * @arg {Boolean} [options.opusOnly=false] Whether to suppress the Opus encoder not found error or not
    * @arg {Number} [options.ratelimiterOffset=0] [DEPRECATED] A number of milliseconds to offset the ratelimit timing calculations by. This option has been moved under `options.rest`
    * @arg {Function} [options.reconnectDelay] A function which returns how long the bot should wait until reconnecting to Discord.
    * @arg {Number} [options.requestTimeout=15000] A number of milliseconds before requests are considered timed out. This option will stop affecting REST in a future release; that behavior is [DEPRECATED] and replaced by `options.rest.requestTimeout`
    * @arg {Object} [options.rest] Options for the REST request handler
    * @arg {Object} [options.rest.agent] A HTTPS Agent used to proxy requests
    * @arg {String} [options.rest.baseURL] The base URL to use for API requests. Defaults to `/api/v${REST_VERSION}`
    * @arg {Boolean} [options.rest.decodeReasons=true] [DEPRECATED] Whether reasons should be decoded with `decodeURIComponent()` when making REST requests. This is true by default to mirror pre-0.15.0 behavior (where reasons were expected to be URI-encoded), and should be set to false once your bot code stops. Reasons will no longer be decoded in the future
    * @arg {Boolean} [options.rest.disableLatencyCompensation=false] Whether to disable the built-in latency compensator or not
    * @arg {String} [options.rest.domain="discord.com"] The domain to use for API requests
    * @arg {Number} [options.rest.latencyThreshold=30000] The average request latency at which Eris will start emitting latency errors
    * @arg {Number} [options.rest.ratelimiterOffset=0] A number of milliseconds to offset the ratelimit timing calculations by
    * @arg {Number} [options.rest.requestTimeout=15000] A number of milliseconds before REST requests are considered timed out
    * @arg {Boolean} [options.restMode=false] Whether to enable getting objects over REST. Even with this option enabled, it is recommended that you check the cache first before using REST
    * @arg {Boolean} [options.seedVoiceConnections=false] Whether to populate bot.voiceConnections with existing connections the bot account has during startup. Note that this will disconnect connections from other bot sessions
    * @arg {Object} [options.ws] An object of WebSocket options to pass to the shard WebSocket constructors
    */
    constructor(token, options) {
        super();

        this.options = Object.assign({
            allowedMentions: {
                users: true,
                roles: true
            },
            autoreconnect: true,
            compress: false,
            connectionTimeout: 30000,
            defaultImageFormat: "jpg",
            defaultImageSize: 128,
            disableEvents: {},
            firstShardID: 0,
            getAllUsers: false,
            guildCreateTimeout: 2000,
            guildSubscriptions: true,
            largeThreshold: 250,
            maxReconnectAttempts: Infinity,
            maxResumeAttempts: 10,
            maxShards: 1,
            messageLimit: 100,
            opusOnly: false,
            requestTimeout: 15000,
            rest: {},
            restMode: false,
            seedVoiceConnections: false,
            ws: {},
            reconnectDelay: (lastDelay, attempts) => Math.pow(attempts + 1, 0.7) * 20000
        }, options);
        this.options.allowedMentions = this._formatAllowedMentions(this.options.allowedMentions);
        if(this.options.lastShardID === undefined && this.options.maxShards !== "auto") {
            this.options.lastShardID = this.options.maxShards - 1;
        }
        if(typeof window !== "undefined" || !ZlibSync) {
            this.options.compress = false; // zlib does not like Blobs, Pako is not here
        }
        if(!Constants.ImageFormats.includes(this.options.defaultImageFormat.toLowerCase())) {
            throw new TypeError(`Invalid default image format: ${this.options.defaultImageFormat}`);
        }
        const defaultImageSize = this.options.defaultImageSize;
        if(defaultImageSize < Constants.ImageSizeBoundaries.MINIMUM || defaultImageSize > Constants.ImageSizeBoundaries.MAXIMUM || (defaultImageSize & (defaultImageSize - 1))) {
            throw new TypeError(`Invalid default image size: ${defaultImageSize}`);
        }
        // Set HTTP Agent on Websockets if not already set
        if(this.options.agent && !(this.options.ws && this.options.ws.agent)) {
            this.options.ws = this.options.ws || {};
            this.options.ws.agent = this.options.agent;
        }

        if(this.options.hasOwnProperty("intents")) {
            // Resolve intents option to the proper integer
            if(Array.isArray(this.options.intents)) {
                let bitmask = 0;
                for(const intent of this.options.intents) {
                    if(Constants.Intents[intent]) {
                        bitmask |= Constants.Intents[intent];
                    }
                }
                this.options.intents = bitmask;
            }

            // Ensure requesting all guild members isn't destined to fail
            if(this.options.getAllUsers && !(this.options.intents & Constants.Intents.guildMembers)) {
                throw new Error("Cannot request all members without guildMembers intent");
            }
        }

        Object.defineProperty(this, "_token", {
            configurable: true,
            enumerable: false,
            writable: true,
            value: token
        });

        this.requestHandler = new RequestHandler(this, this.options.rest);
        delete this.options.rest;

        this.ready = false;
        this.bot = this._token.startsWith("Bot ");
        this.startTime = 0;
        this.lastConnect = 0;
        this.channelGuildMap = {};
        this.shards = new ShardManager(this);
        this.groupChannels = new Collection(GroupChannel);
        this.guilds = new Collection(Guild);
        this.privateChannelMap = {};
        this.privateChannels = new Collection(PrivateChannel);
        this.guildShardMap = {};
        this.unavailableGuilds = new Collection(UnavailableGuild);
        this.relationships = new Collection(Relationship);
        this.users = new Collection(User);
        this.presence = {
            game: null,
            status: "offline"
        };
        this.userGuildSettings = [];
        this.userSettings = {};
        this.notes = {};
        this.voiceConnections = new VoiceConnectionManager();

        this.connect = this.connect.bind(this);
        this.lastReconnectDelay = 0;
        this.reconnectAttempts = 0;
    }

    get uptime() {
        return this.startTime ? Date.now() - this.startTime : 0;
    }

    /**
    * [USER ACCOUNT] Accept an invite
    * @arg {String} inviteID The ID of the invite
    * @returns {Promise<Invite>}
    */
    acceptInvite(inviteID) {
        return this.requestHandler.request("POST", Endpoints.INVITE(inviteID), true).then((invite) => new Invite(invite, this));
    }

    /**
    * [USER ACCOUNT] Add a user to a group
    * @arg {String} groupID The ID of the target group
    * @arg {String} userID The ID of the target user
    * @returns {Promise}
    */
    addGroupRecipient(groupID, userID) {
        return this.requestHandler.request("PUT", Endpoints.CHANNEL_RECIPIENT(groupID, userID), true);
    }

    /**
    * Add a guild discovery subcategory
    * @param {String} guildID The ID of the guild
    * @param {String} categoryID The ID of the discovery category
    * @param {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Object>}
    */
    addGuildDiscoverySubcategory(guildID, categoryID, reason) {
        return this.requestHandler.request("POST", Endpoints.GUILD_DISCOVERY_CATEGORY(guildID, categoryID), true, {reason});
    }

    /**
    * Add a role to a guild member
    * @arg {String} guildID The ID of the guild
    * @arg {String} memberID The ID of the member
    * @arg {String} roleID The ID of the role
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    addGuildMemberRole(guildID, memberID, roleID, reason) {
        return this.requestHandler.request("PUT", Endpoints.GUILD_MEMBER_ROLE(guildID, memberID, roleID), true, {
            reason
        });
    }

    /**
    * Add a reaction to a message
    * @arg {String} channelID The ID of the channel
    * @arg {String} messageID The ID of the message
    * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
    * @arg {String} [userID="@me"] The ID of the user to react as. Passing this parameter is deprecated and will not be supported in future versions.
    * @returns {Promise}
    */
    addMessageReaction(channelID, messageID, reaction, userID) {
        if(userID !== undefined) {
            this.emit("warn", "[DEPRECATED] addMessageReaction() was called without an \"@me\" `userID` argument");
        }
        if(reaction === decodeURI(reaction)) {
            reaction = encodeURIComponent(reaction);
        }
        return this.requestHandler.request("PUT", Endpoints.CHANNEL_MESSAGE_REACTION_USER(channelID, messageID, reaction, userID || "@me"), true);
    }

    /**
    * [USER ACCOUNT] Create a relationship with a user
    * @arg {String} userID The ID of the target user
    * @arg {Boolean} [block=false] If true, block the user. Otherwise, add the user as a friend
    * @returns {Promise}
    */
    addRelationship(userID, block) {
        return this.requestHandler.request("PUT", Endpoints.USER_RELATIONSHIP("@me", userID), true, {
            type: block ? 2 : undefined
        });
    }

    /**
    * [USER ACCOUNT] Purchase a premium subscription (Nitro) for the current user
    * You must get a Stripe card token from the Stripe API for this to work
    * @arg {String} token The Stripe credit card token
    * @arg {String} plan The plan to purchase, either "premium_month" or "premium_year"
    * @returns {Promise}
    */
    addSelfPremiumSubscription(token, plan) {
        return this.requestHandler.request("PUT", Endpoints.USER_BILLING_PREMIUM_SUBSCRIPTION("@me"), true, {
            token: token,
            payment_gateway: "stripe",
            plan: plan
        });
    }

    /**
    * Ban a user from a guild
    * @arg {String} guildID The ID of the guild
    * @arg {String} userID The ID of the user
    * @arg {Number} [deleteMessageDays=0] Number of days to delete messages for, between 0-7 inclusive
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    banGuildMember(guildID, userID, deleteMessageDays, reason) {
        if(!isNaN(deleteMessageDays) && (deleteMessageDays < 0 || deleteMessageDays > 7)) {
            return Promise.reject(new Error(`Invalid deleteMessageDays value (${deleteMessageDays}), should be a number between 0-7 inclusive`));
        }
        return this.requestHandler.request("PUT", Endpoints.GUILD_BAN(guildID, userID), true, {
            delete_message_days: deleteMessageDays || 0,
            reason: reason
        });
    }

    /**
    * Closes a voice connection with a guild ID
    * @arg {String} guildID The ID of the guild
    */
    closeVoiceConnection(guildID) {
        this.shards.get(this.guildShardMap[guildID] || 0).sendWS(Constants.GatewayOPCodes.VOICE_STATE_UPDATE, {
            guild_id: guildID || null,
            channel_id: null,
            self_mute: false,
            self_deaf: false
        });
        this.voiceConnections.leave(guildID || "call");
    }

    /**
    * Tells all shards to connect.
    * @returns {Promise} Resolves when all shards are initialized
    */
    async connect() {
        try {
            const data = await (this.options.maxShards === "auto" ? this.getBotGateway() : this.getGateway());
            if(!data.url || (this.options.maxShards === "auto" && !data.shards)) {
                throw new Error("Invalid response from gateway REST call");
            }
            if(data.url.includes("?")) {
                data.url = data.url.substring(0, data.url.indexOf("?"));
            }
            if(!data.url.endsWith("/")) {
                data.url += "/";
            }
            this.gatewayURL = `${data.url}?v=${Constants.GATEWAY_VERSION}&encoding=${Erlpack ? "etf" : "json"}`;

            if(this.options.compress) {
                this.gatewayURL += "&compress=zlib-stream";
            }

            if(this.options.maxShards === "auto") {
                if(!data.shards) {
                    throw new Error("Failed to autoshard due to lack of data from Discord.");
                }
                this.options.maxShards = data.shards;
                if(this.options.lastShardID === undefined) {
                    this.options.lastShardID = data.shards - 1;
                }
            }

            for(let i = this.options.firstShardID; i <= this.options.lastShardID; ++i) {
                this.shards.spawn(i);
            }
        } catch(err) {
            if(!this.options.autoreconnect) {
                throw err;
            }
            const reconnectDelay = this.options.reconnectDelay(this.lastReconnectDelay, this.reconnectAttempts);
            await sleep(reconnectDelay);
            this.lastReconnectDelay = reconnectDelay;
            this.reconnectAttempts = this.reconnectAttempts + 1;
            return this.connect();
        }
    }

    /**
    * Create a channel in a guild
    * @arg {String} guildID The ID of the guild to create the channel in
    * @arg {String} name The name of the channel
    * @arg {String} [type=0] The type of the channel, either 0 (text), 2 (voice), or 4 (category)
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
    createChannel(guildID, name, type, reason, options = {}) {
        if(typeof options === "string") { // This used to be parentID, back-compat
            this.emit("warn", "[DEPRECATED] createChannel() was called with a string `options` argument");
            options = {
                parentID: options
            };
        }
        if(typeof reason === "string") { // Reason is deprecated, will be folded into options
            this.emit("warn", "[DEPRECATED] createChannel() was called with a string `reason` argument");
            options.reason = reason;
            reason = undefined;
        } else if(typeof reason === "object" && reason !== null) {
            options = reason;
            reason = undefined;
        }
        return this.requestHandler.request("POST", Endpoints.GUILD_CHANNELS(guildID), true, {
            name: name,
            type: type,
            bitrate: options.bitrate,
            nsfw: options.nsfw,
            parent_id: options.parentID,
            permission_overwrites: options.permissionOverwrites,
            rate_limit_per_user: options.rateLimitPerUser,
            reason: options.reason,
            topic: options.topic,
            user_limit: options.userLimit
        }).then((channel) => Channel.from(channel, this));
    }

    /**
    * Create an invite for a channel
    * @arg {String} channelID The ID of the channel
    * @arg {Object} [options] Invite generation options
    * @arg {Number} [options.maxAge] How long the invite should last in seconds
    * @arg {Number} [options.maxUses] How many uses the invite should last for
    * @arg {Boolean} [options.temporary] Whether the invite grants temporary membership or not
    * @arg {Boolean} [options.unique] Whether the invite is unique or not
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Invite>}
    */
    createChannelInvite(channelID, options = {}, reason) {
        return this.requestHandler.request("POST", Endpoints.CHANNEL_INVITES(channelID), true, {
            max_age: options.maxAge,
            max_uses: options.maxUses,
            temporary: options.temporary,
            unique: options.unique,
            reason: reason
        }).then((invite) => new Invite(invite, this));
    }

    /**
    * Create a channel webhook
    * @arg {String} channelID The ID of the channel to create the webhook in
    * @arg {Object} options Webhook options
    * @arg {String} options.name The default name
    * @arg {String} [options.avatar] The default avatar as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Object>} Resolves with a webhook object
    */
    createChannelWebhook(channelID, options, reason) {
        options.reason = reason;
        return this.requestHandler.request("POST", Endpoints.CHANNEL_WEBHOOKS(channelID), true, options);
    }

    /**
    * [USER ACCOUNT] Create a group channel with other users
    * @arg {Array<String>} userIDs The IDs of the other users
    * @returns {Promise<PrivateChannel>}
    */
    createGroupChannel(userIDs) {
        return this.requestHandler.request("POST", Endpoints.USER_CHANNELS("@me"), true, {
            recipients: userIDs,
            type: 3
        }).then((privateChannel) => new GroupChannel(privateChannel, this));
    }

    /**
    * Create a guild
    * @arg {String} name The name of the guild
    * @arg {Object} options The properties of the guild
    * @arg {String} [options.afkChannelID] The ID of the AFK voice channel
    * @arg {Number} [options.afkTimeout] The AFK timeout in seconds
    * @arg {Array<Object>} [options.channels] The new channels of the guild. IDs are placeholders which allow use of category channels.
    * @arg {Number} [options.defaultNotifications] The default notification settings for the guild. 0 is "All Messages", 1 is "Only @mentions".
    * @arg {Number} [options.explicitContentFilter] The level of the explicit content filter for messages/images in the guild. 0 disables message scanning, 1 enables scanning the messages of members without roles, 2 enables scanning for all messages.
    * @arg {String} [options.icon] The guild icon as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
    * @arg {String} [options.region] The region of the guild
    * @arg {Array<Object>} [options.roles] The new roles of the guild, the first one is the @everyone role. IDs are placeholders which allow channel overwrites.
    * @arg {String} [options.systemChannelID] The ID of the system channel
    * @arg {Number} [options.verificationLevel] The guild verification level
    * @returns {Promise<Guild>}
    */
    createGuild(name, options) {
        if(this.guilds.size > 9) {
            throw new Error("This method can't be used when in 10 or more guilds.");
        }

        return this.requestHandler.request("POST", Endpoints.GUILDS, true, {
            name: name,
            region: options.region,
            icon: options.icon,
            verification_level: options.verificationLevel,
            default_message_notifications: options.defaultNotifications,
            explicit_content_filter: options.explicitContentFilter,
            system_channel_id: options.systemChannelID,
            afk_channel_id: options.afkChannelID,
            afk_timeout: options.afkTimeout,
            roles: options.roles,
            channels: options.channels
        }).then((guild) => new Guild(guild, this));
    }

    /**
    * Create a guild emoji object
    * @arg {String} guildID The ID of the guild to create the emoji in
    * @arg {Object} options Emoji options
    * @arg {String} options.image The base 64 encoded string
    * @arg {String} options.name The name of emoji
    * @arg {Array} [options.roles] An array containing authorized role IDs
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Object>} A guild emoji object
    */
    createGuildEmoji(guildID, options, reason) {
        options.reason = reason;
        return this.requestHandler.request("POST", Endpoints.GUILD_EMOJIS(guildID), true, options);
    }

    /**
    * Create a guild based on a template. This can only be used with bots in less than 10 guilds
    * @arg {String} code The template code
    * @arg {String} name The name of the guild
    * @arg {String} [icon] The 128x128 icon as a base64 data URI
    * @returns {Promise<Guild>}
    */
    createGuildFromTemplate(code, name, icon) {
        return this.requestHandler.request("POST", Endpoints.GUILD_TEMPLATE(code), true, {
            name,
            icon
        }).then((guild) => new Guild(guild, this));
    }

    /**
    * Create a template for a guild
    * @arg {String} guildID The ID of the guild
    * @arg {String} name The name of the template
    * @arg {String} [description] The description for the template
    * @returns {Promise<GuildTemplate>}
    */
    createGuildTemplate(guildID, name, description) {
        return this.requestHandler.request("POST", Endpoints.GUILD_TEMPLATES(guildID), true, {
            name,
            description
        }).then((template) => new GuildTemplate(template, this));
    }

    /**
    * Create a message in a channel
    * Note: If you want to DM someone, the user ID is **not** the DM channel ID. use Client.getDMChannel() to get the DM channel for a user
    * @arg {String} channelID The ID of the channel
    * @arg {String | Object} content A string or object. If an object is passed:
    * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {Boolean} [content.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to.
    * @arg {String} content.content A content string
    * @arg {Object} [content.embed] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {String} [content.messageReferenceID] The ID of the message should be replied to. The reference message cannot be a system message.
    * @arg {Boolean} [content.tts] Set the message TTS flag
    * @arg {Object | Array<Object>} [file] A file object (or an Array of them)
    * @arg {Buffer} file.file A buffer containing file data
    * @arg {String} file.name What to name the file
    * @returns {Promise<Message>}
    */
    createMessage(channelID, content, file) {
        if(content !== undefined) {
            if(typeof content !== "object" || content === null) {
                content = {
                    content: "" + content
                };
            } else if(content.content !== undefined && typeof content.content !== "string") {
                content.content = "" + content.content;
            } else if(content.content === undefined && !content.embed && !file) {
                return Promise.reject(new Error("No content, file, or embed"));
            }
            content.allowed_mentions = this._formatAllowedMentions(content.allowedMentions);
            if(content.messageReferenceID) {
                content.message_reference = {message_id: content.messageReferenceID};
            }
        } else if(!file) {
            return Promise.reject(new Error("No content, file, or embed"));
        }
        return this.requestHandler.request("POST", Endpoints.CHANNEL_MESSAGES(channelID), true, content, file).then((message) => new Message(message, this));
    }

    /**
    * Create a guild role
    * @arg {String} guildID The ID of the guild to create the role in
    * @arg {Object|Role} [options] An object or Role containing the properties to set
    * @arg {Number} [options.color] The hex color of the role, in number form (ex: 0x3d15b3 or 4040115)
    * @arg {Boolean} [options.hoist] Whether to hoist the role in the user list or not
    * @arg {Boolean} [options.mentionable] Whether the role is mentionable or not
    * @arg {String} [options.name] The name of the role
    * @arg {Number} [options.permissions] The role permissions number
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Role>}
    */
    createRole(guildID, options, reason) {
        return this.requestHandler.request("POST", Endpoints.GUILD_ROLES(guildID), true, {
            name: options.name,
            permissions: options.permissions instanceof Permission ? options.permissions.allow : options.permissions,
            color: options.color,
            hoist: options.hoist,
            mentionable: options.mentionable,
            reason: reason
        }).then((role) => {
            const guild = this.guilds.get(guildID);
            if(guild) {
                return guild.roles.add(role, guild);
            } else {
                return new Role(role);
            }
        });
    }

    /**
     * Crosspost (publish) a message to subscribed channels
     * @arg {String} channelID The ID of the NewsChannel
     * @arg {String} messageID The ID of the message
     * @returns {Promise<Message>}
     */
    crosspostMessage(channelID, messageID) {
        return this.requestHandler.request("POST", Endpoints.CHANNEL_CROSSPOST(channelID, messageID), true).then((message) => new Message(message, this));
    }

    /**
    * Delete a guild channel, or leave a private or group channel
    * @arg {String} channelID The ID of the channel
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    deleteChannel(channelID, reason) {
        return this.requestHandler.request("DELETE", Endpoints.CHANNEL(channelID), true, {
            reason
        });
    }

    /**
    * Delete a channel permission overwrite
    * @arg {String} channelID The ID of the channel
    * @arg {String} overwriteID The ID of the overwritten user or role
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    deleteChannelPermission(channelID, overwriteID, reason) {
        return this.requestHandler.request("DELETE", Endpoints.CHANNEL_PERMISSION(channelID, overwriteID), true, {
            reason
        });
    }

    /**
    * Delete a guild (bot user must be owner)
    * @arg {String} guildID The ID of the guild
    * @returns {Promise}
    */
    deleteGuild(guildID) {
        return this.requestHandler.request("DELETE", Endpoints.GUILD(guildID), true);
    }

    /**
    * Delete a guild discovery subcategory
    * @param {String} guildID The ID of the guild
    * @param {String} categoryID The ID of the discovery category
    * @param {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    deleteGuildDiscoverySubcategory(guildID, categoryID, reason) {
        return this.requestHandler.request("DELETE", Endpoints.GUILD_DISCOVERY_CATEGORY(guildID, categoryID), true, {reason});
    }

    /**
    * Delete a guild emoji object
    * @arg {String} guildID The ID of the guild to delete the emoji in
    * @arg {String} emojiID The ID of the emoji
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    deleteGuildEmoji(guildID, emojiID, reason) {
        return this.requestHandler.request("DELETE", Endpoints.GUILD_EMOJI(guildID, emojiID), true, {
            reason
        });
    }

    /**
    * Delete a guild integration
    * @arg {String} guildID The ID of the guild
    * @arg {String} integrationID The ID of the integration
    * @returns {Promise}
    */
    deleteGuildIntegration(guildID, integrationID) {
        return this.requestHandler.request("DELETE", Endpoints.GUILD_INTEGRATION(guildID, integrationID), true);
    }

    /**
    * Delete a guild template
    * @arg {String} guildID The ID of the guild
    * @arg {String} code The template code
    * @returns {Promise<GuildTemplate>}
    */
    deleteGuildTemplate(guildID, code) {
        return this.requestHandler.request("DELETE", Endpoints.GUILD_TEMPLATE_GUILD(guildID, code), true).then((template) => new GuildTemplate(template, this));
    }

    /**
    * Delete an invite
    * @arg {String} inviteID The ID of the invite
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    deleteInvite(inviteID, reason) {
        return this.requestHandler.request("DELETE", Endpoints.INVITE(inviteID), true, {
            reason
        });
    }

    /**
    * Delete a message
    * @arg {String} channelID The ID of the channel
    * @arg {String} messageID The ID of the message
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    deleteMessage(channelID, messageID, reason) {
        return this.requestHandler.request("DELETE", Endpoints.CHANNEL_MESSAGE(channelID, messageID), true, {
            reason
        });
    }

    /**
    * Bulk delete messages (bot accounts only)
    * @arg {String} channelID The ID of the channel
    * @arg {Array<String>} messageIDs Array of message IDs to delete
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    deleteMessages(channelID, messageIDs, reason) {
        if(messageIDs.length === 0) {
            return Promise.resolve();
        }
        if(messageIDs.length === 1) {
            return this.deleteMessage(channelID, messageIDs[0]);
        }

        const oldestAllowedSnowflake = (Date.now() - 1421280000000) * 4194304;
        const invalidMessage = messageIDs.find((messageID) => messageID < oldestAllowedSnowflake);
        if(invalidMessage) {
            return Promise.reject(new Error(`Message ${invalidMessage} is more than 2 weeks old.`));
        }

        if(messageIDs.length > 100) {
            return this.requestHandler.request("POST", Endpoints.CHANNEL_BULK_DELETE(channelID), true, {
                messages: messageIDs.splice(0, 100),
                reason: reason
            }).then(() => this.deleteMessages(channelID, messageIDs));
        }
        return this.requestHandler.request("POST", Endpoints.CHANNEL_BULK_DELETE(channelID), true, {
            messages: messageIDs,
            reason: reason
        });
    }

    /**
    * Delete a guild role
    * @arg {String} guildID The ID of the guild to create the role in
    * @arg {String} roleID The ID of the role
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    deleteRole(guildID, roleID, reason) {
        return this.requestHandler.request("DELETE", Endpoints.GUILD_ROLE(guildID, roleID), true, {
            reason
        });
    }

    /**
    * [USER ACCOUNT] Delete a connection for the current user
    * @arg {String} platform The connection platform (e.g. "twitch", "reddit")
    * @arg {String} id The connection ID
    * @returns {Promise}
    */
    deleteSelfConnection(platform, id) {
        return this.requestHandler.request("DELETE", Endpoints.USER_CONNECTION_PLATFORM("@me", platform, id), true);
    }

    /**
    * [USER ACCOUNT] Cancel the premium subscription (Nitro) for the current user
    * @returns {Promise}
    */
    deleteSelfPremiumSubscription() {
        return this.requestHandler.request("DELETE", Endpoints.USER_BILLING_PREMIUM_SUBSCRIPTION("@me"), true);
    }

    /**
    * [USER ACCOUNT] Delete the current user's note for another user
    * @returns {Promise}
    */
    deleteUserNote(userID) {
        return this.requestHandler.request("DELETE", Endpoints.USER_NOTE("@me", userID), true);
    }

    /**
    * Delete a webhook
    * @arg {String} webhookID The ID of the webhook
    * @arg {String} [token] The token of the webhook, used instead of the Bot Authorization token
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    deleteWebhook(webhookID, token, reason) {
        return this.requestHandler.request("DELETE", token ? Endpoints.WEBHOOK_TOKEN(webhookID, token) : Endpoints.WEBHOOK(webhookID), !token, {
            reason
        });
    }

    /**
    * Delete a webhook message
    * @arg {String} webhookID
    * @arg {String} token
    * @arg {String} messageID
    * @returns {Promise}
    */
    deleteWebhookMessage(webhookID, token, messageID) {
        return this.requestHandler.request("DELETE", Endpoints.WEBHOOK_MESSAGE(webhookID, token, messageID), false);
    }

    /**
    * [USER ACCOUNT] Disable TOTP authentication for the current user
    * @arg {String} code The timed auth code for the current user
    * @returns {Promise<Object>} An object containing the user's new authorization token
    */
    disableSelfMFATOTP(code) {
        return this.requestHandler.request("POST", Endpoints.USER_MFA_TOTP_DISABLE("@me"), true, {
            code
        }).then((data) => {
            if(data.token) {
                this._token = data.token;
            }
        });
    }

    /**
    * Disconnects all shards
    * @arg {Object?} [options] Shard disconnect options
    * @arg {String | Boolean} [options.reconnect] false means destroy everything, true means you want to reconnect in the future, "auto" will autoreconnect
    */
    disconnect(options) {
        this.ready = false;
        this.shards.forEach((shard) => {
            shard.disconnect(options);
        });
        this.shards.connectQueue = [];
    }

    /**
    * Update the bot's AFK status. Setting this to true will enable push notifications for userbots.
    * @arg {Boolean} afk Whether the bot user is AFK or not
    */
    editAFK(afk) {
        this.presence.afk = !!afk;

        this.shards.forEach((shard) => {
            shard.editAFK(afk);
        });
    }

    /**
    * Edit a channel's properties
    * @arg {String} channelID The ID of the channel
    * @arg {Object} options The properties to edit
    * @arg {Number} [options.bitrate] The bitrate of the channel (guild voice channels only)
    * @arg {String} [options.icon] The icon of the channel as a base64 data URI (group channels only). Note: base64 strings alone are not base64 data URI strings
    * @arg {String} [options.name] The name of the channel
    * @arg {Boolean} [options.nsfw] The nsfw status of the channel (guild channels only)
    * @arg {String} [options.ownerID] The ID of the channel owner (group channels only)
    * @arg {String?} [options.parentID] The ID of the parent channel category for this channel (guild text/voice channels only)
    * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (does not affect bots or users with manageMessages/manageChannel permissions) (guild text channels only)
    * @arg {String} [options.topic] The topic of the channel (guild text channels only)
    * @arg {Number} [options.userLimit] The channel user limit (guild voice channels only)
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<CategoryChannel | GroupChannel | TextChannel | VoiceChannel | NewsChannel>}
    */
    editChannel(channelID, options, reason) {
        return this.requestHandler.request("PATCH", Endpoints.CHANNEL(channelID), true, {
            bitrate: options.bitrate,
            icon: options.icon,
            name: options.name,
            nsfw: options.nsfw,
            owner_id: options.ownerID,
            parent_id: options.parentID,
            rate_limit_per_user: options.rateLimitPerUser,
            topic: options.topic,
            user_limit: options.userLimit,
            reason: reason
        }).then((channel) => Channel.from(channel, this));
    }

    /**
    * Create a channel permission overwrite
    * @arg {String} channelID The ID of channel
    * @arg {String} overwriteID The ID of the overwritten user or role (everyone role ID = guild ID)
    * @arg {Number} allow The permissions number for allowed permissions
    * @arg {Number} deny The permissions number for denied permissions
    * @arg {String} type The object type of the overwrite, either "member" or "role"
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    editChannelPermission(channelID, overwriteID, allow, deny, type, reason) {
        return this.requestHandler.request("PUT", Endpoints.CHANNEL_PERMISSION(channelID, overwriteID), true, {
            allow,
            deny,
            type,
            reason
        });
    }

    /**
    * Edit a guild channel's position. Note that channel position numbers are lowest on top and highest at the bottom.
    * @arg {String} channelID The ID of the channel
    * @arg {Number} position The new position of the channel
    * @arg {Object} [options] Additional options when editing position
    * @arg {Boolean} [options.lockPermissions] Whether to sync the permissions with the new parent if moving to a new category
    * @arg {String} [options.parentID] The new parent ID (category channel) for the channel that is moved
    * @returns {Promise}
    */
    editChannelPosition(channelID, position, options = {}) {
        let channels = this.guilds.get(this.channelGuildMap[channelID]).channels;
        const channel = channels.get(channelID);
        if(!channel) {
            return Promise.reject(new Error(`Channel ${channelID} not found`));
        }
        if(channel.position === position) {
            return Promise.resolve();
        }
        const min = Math.min(position, channel.position);
        const max = Math.max(position, channel.position);
        channels = channels.filter((chan) => {
            return chan.type === channel.type
                && min <= chan.position
                && chan.position <= max
                && chan.id !== channelID;
        }).sort((a, b) => a.position - b.position);
        if(position > channel.position) {
            channels.push(channel);
        } else {
            channels.unshift(channel);
        }
        return this.requestHandler.request("PATCH", Endpoints.GUILD_CHANNELS(this.channelGuildMap[channelID]), true, channels.map((channel, index) => ({
            id: channel.id,
            position: index + min,
            lock_permissions: options.lockPermissions,
            parent_id: options.parentID
        })));
    }

    /**
    * Edit a guild
    * @arg {String} guildID The ID of the guild
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
    * @arg {String} [options.ownerID] The ID of the user to transfer server ownership to (bot user must be owner)
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
    editGuild(guildID, options, reason) {
        return this.requestHandler.request("PATCH", Endpoints.GUILD(guildID), true, {
            name: options.name,
            region: options.region,
            icon: options.icon,
            verification_level: options.verificationLevel,
            default_message_notifications: options.defaultNotifications,
            explicit_content_filter: options.explicitContentFilter,
            system_channel_id: options.systemChannelID,
            system_channel_flags: options.systemChannelFlags,
            rules_channel_id: options.rulesChannelID,
            public_updates_channel_id: options.publicUpdatesChannelID,
            preferred_locale: options.preferredLocale,
            afk_channel_id: options.afkChannelID,
            afk_timeout: options.afkTimeout,
            owner_id: options.ownerID,
            splash: options.splash,
            banner: options.banner,
            description: options.description,
            discovery_splash: options.discoverySplash,
            features: options.features,
            reason: reason
        }).then((guild) => new Guild(guild, this));
    }

    /**
    * Edit a guild's discovery data
    * @param {String} guildID The ID of the guild
    * @param {Object} [options] The guild discovery data
    * @param {String} [options.primaryCategoryID] The primary discovery category ID
    * @param {Array<String>} [options.keywords] The discovery keywords (max 10)
    * @param {Boolean} [options.emojiDiscoverabilityEnabled] Whether guild info should be shown when emoji info is loaded
    * @param {String} [options.reason] The reason to be displayed in audit logs
    * @returns {Promise<Object>} The updated guild's discovery object
    */
    editGuildDiscovery(guildID, options = {}) {
        return this.requestHandler.request("PATCH", Endpoints.GUILD_DISCOVERY(guildID), true, {
            primary_category_id: options.primaryCategoryID,
            keywords: options.keywords,
            emoji_discoverability_enabled: options.emojiDiscoverabilityEnabled,
            reason: options.reason
        });
    }

    /**
    * Edit a guild emoji object
    * @arg {String} guildID The ID of the guild to edit the emoji in
    * @arg {String} emojiID The ID of the emoji you want to modify
    * @arg {Object} options Emoji options
    * @arg {String} [options.name] The name of emoji
    * @arg {Array} [options.roles] An array containing authorized role IDs
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Object>} A guild emoji object
    */
    editGuildEmoji(guildID, emojiID, options, reason) {
        options.reason = reason;
        return this.requestHandler.request("PATCH", Endpoints.GUILD_EMOJI(guildID, emojiID), true, options);
    }

    /**
    * Edit a guild integration
    * @arg {String} guildID The ID of the guild
    * @arg {String} integrationID The ID of the integration
    * @arg {Object} options The properties to edit
    * @arg {String} [options.enableEmoticons] Whether to enable integration emoticons or not
    * @arg {String} [options.expireBehavior] What to do when a user's subscription runs out
    * @arg {String} [options.expireGracePeriod] How long before the integration's role is removed from an unsubscribed user
    * @returns {Promise}
    */
    editGuildIntegration(guildID, integrationID, options) {
        return this.requestHandler.request("PATCH", Endpoints.GUILD_INTEGRATION(guildID, integrationID), true, {
            expire_behavior: options.expireBehavior,
            expire_grace_period: options.expireGracePeriod,
            enable_emoticons: options.enableEmoticons
        });
    }

    /**
    * Edit a guild member
    * @arg {String} guildID The ID of the guild
    * @arg {String} memberID The ID of the member
    * @arg {Object} options The properties to edit
    * @arg {String} [options.channelID] The ID of the voice channel to move the member to (must be in voice)
    * @arg {Boolean} [options.deaf] Server deafen the member
    * @arg {Boolean} [options.mute] Server mute the member
    * @arg {String} [options.nick] Set the member's server nickname, "" to remove
    * @arg {Array<String>} [options.roles] The array of role IDs the member should have
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    editGuildMember(guildID, memberID, options, reason) {
        return this.requestHandler.request("PATCH", Endpoints.GUILD_MEMBER(guildID, memberID), true, {
            roles: options.roles && options.roles.filter((roleID, index) => options.roles.indexOf(roleID) === index),
            nick: options.nick,
            mute: options.mute,
            deaf: options.deaf,
            channel_id: options.channelID,
            reason: reason
        });
    }

    /**
    * Edit a guild template
    * @arg {String} guildID The ID of the guild
    * @arg {String} code The template code
    * @arg {Object} options The properties to edit
    * @arg {String} [options.name] The name of the template
    * @arg {String?} [options.description] The description for the template. Set to `null` to remove the description
    * @returns {Promise<GuildTemplate>}
    */
    editGuildTemplate(guildID, code, options) {
        return this.requestHandler.request("PATCH", Endpoints.GUILD_TEMPLATE_GUILD(guildID, code), true, options).then((template) => new GuildTemplate(template, this));
    }

    /**
    * Modify a guild's widget
    * @arg {String} guildID The ID of the guild
    * @arg {Object} options The widget object to modify (https://discord.com/developers/docs/resources/guild#modify-guild-widget)
    * @returns {Promise<Object>} A guild widget object
    */
    editGuildWidget(guildID, options) {
        return this.requestHandler.request("PATCH", Endpoints.GUILD_WIDGET(guildID), true, options);
    }

    /**
    * Edit a message
    * @arg {String} channelID The ID of the channel
    * @arg {String} messageID The ID of the message
    * @arg {String | Array | Object} content A string, array of strings, or object. If an object is passed:
    * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {String} content.content A content string
    * @arg {Object} [content.embed] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Number} [content.flags] A number representing the flags to apply to the message. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#message-object-message-flags) for flags reference
    * @returns {Promise<Message>}
    */
    editMessage(channelID, messageID, content) {
        if(content !== undefined) {
            if(typeof content !== "object" || content === null) {
                content = {
                    content: "" + content
                };
            } else if(content.content !== undefined && typeof content.content !== "string") {
                content.content = "" + content.content;
            } else if(content.content === undefined && !content.embed && content.flags === undefined) {
                return Promise.reject(new Error("No content, embed or flags"));
            }
            if(content.content !== undefined || content.embed || content.allowedMentions) {
                content.allowed_mentions = this._formatAllowedMentions(content.allowedMentions);
            }
        }
        return this.requestHandler.request("PATCH", Endpoints.CHANNEL_MESSAGE(channelID, messageID), true, content).then((message) => new Message(message, this));
    }

    /**
    * Edit the bot's nickname in a guild
    * @arg {String} guildID The ID of the guild
    * @arg {String} nick The nickname
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    editNickname(guildID, nick, reason) {
        return this.requestHandler.request("PATCH", Endpoints.GUILD_MEMBER_NICK(guildID, "@me"), true, {
            nick,
            reason
        });
    }

    /**
    * Edit a guild role
    * @arg {String} guildID The ID of the guild the role is in
    * @arg {String} roleID The ID of the role
    * @arg {Object} options The properties to edit
    * @arg {Number} [options.color] The hex color of the role, in number form (ex: 0x3da5b3 or 4040115)
    * @arg {Boolean} [options.hoist] Whether to hoist the role in the user list or not
    * @arg {Boolean} [options.mentionable] Whether the role is mentionable or not
    * @arg {String} [options.name] The name of the role
    * @arg {Number} [options.permissions] The role permissions number
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Role>}
    */
    editRole(guildID, roleID, options, reason) {
        options.reason = reason;
        return this.requestHandler.request("PATCH", Endpoints.GUILD_ROLE(guildID, roleID), true, options).then((role) => new Role(role, this.guilds.get(guildID)));
    }

    /**
    * Edit a guild role's position. Note that role position numbers are highest on top and lowest at the bottom.
    * @arg {String} guildID The ID of the guild the role is in
    * @arg {String} roleID The ID of the role
    * @arg {Number} position The new position of the role
    * @returns {Promise}
    */
    editRolePosition(guildID, roleID, position) {
        if(guildID === roleID) {
            return Promise.reject(new Error("Cannot move default role"));
        }
        let roles = this.guilds.get(guildID).roles;
        const role = roles.get(roleID);
        if(!role) {
            return Promise.reject(new Error(`Role ${roleID} not found`));
        }
        if(role.position === position) {
            return Promise.resolve();
        }
        const min = Math.min(position, role.position);
        const max = Math.max(position, role.position);
        roles = roles.filter((role) => min <= role.position && role.position <= max && role.id !== roleID).sort((a, b) => a.position - b.position);
        if(position > role.position) {
            roles.push(role);
        } else {
            roles.unshift(role);
        }
        return this.requestHandler.request("PATCH", Endpoints.GUILD_ROLES(guildID), true, roles.map((role, index) => ({
            id: role.id,
            position: index + min
        })));
    }

    /**
    * Edit properties of the bot user
    * @arg {Object} options The properties to edit
    * @arg {String} [options.username] The new username
    * @arg {String} [options.avatar] The new avatar as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
    * @returns {Promise<ExtendedUser>}
    */
    editSelf(options) {
        return this.requestHandler.request("PATCH", Endpoints.USER("@me"), true, options).then((data) => new ExtendedUser(data, this));
    }

    /**
    * [USER ACCOUNT] Edit a connection for the current user
    * @arg {String} platform The connection platform (e.g. "twitch", "reddit")
    * @arg {String} id The connection ID
    * @arg {Object} data The connection data
    * @arg {Boolean} [data.friendSync] Whether to sync friends from the connection or not
    * @arg {Number} [data.visibility] The visibility level for the connection. 0 = hidden, 1 = shown on profile
    * @returns {Promise<Object>} The updated connection data
    */
    editSelfConnection(platform, id, data) {
        return this.requestHandler.request("PATCH", Endpoints.USER_CONNECTION_PLATFORM("@me", platform, id), true, {
            visibility: data.visibility,
            friend_sync: data.friendSync
        });
    }

    /**
    * [USER ACCOUNT] Edit settings for the current user
    * @arg {Object} data The user settings data
    * @arg {Boolean} [data.convertEmoticons] Whether to convert emoticons or not (e.g. :D => 😄)
    * @arg {Boolean} [data.detectPlatformAccounts] Whether to automatically detect accounts from other platforms or not (Blizzard, Skype, etc.)
    * @arg {Boolean} [data.developerMode] Whether to enable developer mode or not
    * @arg {Boolean} [data.enableTTSCommand] Whether to respect usage of the TTS command or not
    * @arg {Object} [data.friendSourceFlags] An object representing allowed friend request sources
    * @arg {Boolean} [data.friendSourceFlags.all] Whether to allow friends requests from anywhere or not
    * @arg {Boolean} [data.friendSourceFlags.mutualFriends] Whether to allow friend requests from people with mutual friends or not
    * @arg {Boolean} [data.friendSourceFlags.mutualGuilds] Whether to allow friend requests from people in mutual guilds or not
    * @arg {Array<String>} [data.guildPositions] An ordered array of guild IDs representing the guild list order in the Discord client
    * @arg {Boolean} [data.inlineAttachmentMedia] Whether to show attachment previews or not
    * @arg {Boolean} [data.inlineEmbedMedia] Whether to show embed images or not
    * @arg {String} [data.locale] The locale to use for the Discord UI
    * @arg {Boolean} [data.messageDisplayCompact] Whether to use compact mode or not
    * @arg {Boolean} [data.renderEmbeds] Whether to show embeds or not
    * @arg {Boolean} [data.renderReactions] Whether to show reactions or not
    * @arg {Array<String>} [data.restrictedGuilds] An array of guild IDs where direct messages from guild members are disallowed
    * @arg {Boolean} [data.showCurrentGame] Whether to set the user's status to the current game or not
    * @arg {String} [data.status] The status of the user, either "invisible", "dnd", "away", or "online"
    * @arg {String} [data.theme] The theme to use for the Discord UI, either "dark" or "light"
    * @returns {Promise<Object>} The user's settings data.
    */
    editSelfSettings(data) {
        let friendSourceFlags = undefined;
        if(data.friendSourceFlags) {
            friendSourceFlags = {};
            if(data.friendSourceFlags.all) {
                friendSourceFlags.all = true;
            }
            if(data.friendSourceFlags.mutualFriends) {
                friendSourceFlags.mutual_friends = true;
            }
            if(data.friendSourceFlags.mutualGuilds) {
                friendSourceFlags.mutual_guilds = true;
            }
        }
        return this.requestHandler.request("PATCH", Endpoints.USER_SETTINGS("@me"), true, {
            convert_emoticons: data.convertEmoticons,
            detect_platform_accounts: data.detectPlatformAccounts,
            developer_mode: data.developerMode,
            enable_tts_command: data.enableTTSCommand,
            friend_source_flags: friendSourceFlags,
            guild_positions: data.guildPositions,
            inline_attachment_media: data.inlineAttachmentMedia,
            inline_embed_media: data.inlineEmbedMedia,
            locale: data.locale,
            message_display_compact: data.messageDisplayCompact,
            render_embeds: data.renderEmbeds,
            render_reactions: data.renderReactions,
            restricted_guilds: data.restrictedGuilds,
            show_current_game: data.showCurrentGame,
            status: data.status,
            theme: data.theme
        });
    }

    /**
    * Update the bot's status on all guilds
    * @arg {String} [status] Sets the bot's status, either "online", "idle", "dnd", or "invisible"
    * @arg {Object} [game] Sets the bot's active game, null to clear
    * @arg {String} game.name Sets the name of the bot's active game
    * @arg {Number} [game.type] The type of game. 0 is playing, 1 is streaming (Twitch only), 2 is listening, 3 is watching, 5 is competing in
    * @arg {String} [game.url] Sets the url of the shard's active game
    */
    editStatus(status, game) {
        if(game === undefined && typeof status === "object") {
            game = status;
            status = undefined;
        }
        if(status) {
            this.presence.status = status;
        }
        if(game !== undefined) {
            this.presence.game = game;
        }

        this.shards.forEach((shard) => {
            shard.editStatus(status, game);
        });
    }

    /**
    * [USER ACCOUNT] Edit the current user's note for another user
    * @arg {String} userID The ID of the target user
    * @arg {String} note The note
    * @returns {Promise}
    */
    editUserNote(userID, note) {
        return this.requestHandler.request("PUT", Endpoints.USER_NOTE("@me", userID), true, {
            note
        });
    }

    /**
    * Edit a webhook
    * @arg {String} webhookID The ID of the webhook
    * @arg {Object} options Webhook options
    * @arg {String} [options.name] The new default name
    * @arg {String} [options.avatar] The new default avatar as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
    * @arg {String} [options.channelID] The new channel ID where webhooks should be sent to
    * @arg {String} [token] The token of the webhook, used instead of the Bot Authorization token
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Object>} Resolves with a webhook object
    */
    editWebhook(webhookID, options, token, reason) {
        return this.requestHandler.request("PATCH", token ? Endpoints.WEBHOOK_TOKEN(webhookID, token) : Endpoints.WEBHOOK(webhookID), !token, {
            name: options.name,
            avatar: options.avatar,
            channel_id: options.channelID,
            reason: reason
        });
    }

    /**
    * Edit a webhook message
    * @arg {String} webhookID The ID of the webhook
    * @arg {String} token The token of the webhook
    * @arg {String} messageID The ID of the message
    * @arg {Object} options Webhook message edit options
    * @arg {String} [options.content=""] A content string
    * @arg {Array<Object>} [options.embeds] An array of Discord embeds
    * @returns {Promise<Message>}
    */
    editWebhookMessage(webhookID, token, messageID, options) {
        if(!options.content && !options.embeds) {
            return Promise.reject(new Error("No content or embeds"));
        }
        return this.requestHandler.request("PATCH", Endpoints.WEBHOOK_MESSAGE(webhookID, token, messageID), false, options).then((response) => new Message(response, this));
    }

    /**
    * [USER ACCOUNT] Enable TOTP authentication for the current user
    * @arg {String} secret The TOTP secret used to generate the auth code
    * @arg {String} code The timed auth code for the current user
    * @returns {Promise<Object>} An object containing the user's new authorization token and backup codes
    */
    enableSelfMFATOTP(secret, code) {
        return this.requestHandler.request("POST", Endpoints.USER_MFA_TOTP_ENABLE("@me"), true, {
            secret,
            code
        }).then((data) => {
            if(data.token) {
                this._token = data.token;
            }
        });
    }

    /**
    * Execute a slack-style webhook
    * @arg {String} webhookID The ID of the webhook
    * @arg {String} token The token of the webhook
    * @arg {Object} options Slack webhook options
    * @arg {Boolean} [options.auth=false] Whether or not to authenticate with the bot token.
    * @arg {Boolean} [options.wait=false] Whether to wait for the server to confirm the message create or not
    * @returns {Promise}
    */
    executeSlackWebhook(webhookID, token, options) {
        const wait = !!options.wait;
        options.wait = undefined;
        const auth = !!options.auth;
        options.auth = undefined;
        return this.requestHandler.request("POST", Endpoints.WEBHOOK_TOKEN_SLACK(webhookID, token) + (wait ? "?wait=true" : ""), auth, options);
    }

    /**
    * Execute a webhook
    * @arg {String} webhookID The ID of the webhook
    * @arg {String} token The token of the webhook
    * @arg {Object} options Webhook execution options
    * @arg {Object} [options.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [options.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [options.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [options.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {Boolean} [options.auth=false] Whether or not to authenticate with the bot token.
    * @arg {String} [options.avatarURL] A URL for a custom avatar, defaults to webhook default avatar if not specified
    * @arg {String} [options.content=""] A content string
    * @arg {Array<Object>} [options.embeds] An array of Discord embeds
    * @arg {Object | Array<Object>} [options.file] A file object (or an Array of them)
    * @arg {Buffer} options.file.file A buffer containing file data
    * @arg {String} options.file.name What to name the file
    * @arg {Boolean} [options.tts=false] Whether the message should be a TTS message or not
    * @arg {String} [options.username] A custom username, defaults to webhook default username if not specified
    * @arg {Boolean} [options.wait=false] Whether to wait for the server to confirm the message create or not
    * @returns {Promise<Message?>}
    */
    executeWebhook(webhookID, token, options) {
        if(!options.content && !options.file && !options.embeds) {
            return Promise.reject(new Error("No content, file, or embeds"));
        }
        return this.requestHandler.request("POST", Endpoints.WEBHOOK_TOKEN(webhookID, token) + (options.wait ? "?wait=true" : ""), !!options.auth, {
            content: options.content,
            embeds: options.embeds,
            username: options.username,
            avatar_url: options.avatarURL,
            tts: options.tts,
            allowed_mentions: this._formatAllowedMentions(options.allowedMentions)
        }, options.file).then((response) => options.wait ? new Message(response, this) : undefined);
    }

    /**
     * Follow a NewsChannel in another channel. This creates a webhook in the target channel
     * @arg {String} channelID The ID of the NewsChannel
     * @arg {String} webhookChannelID The ID of the target channel
     * @returns {Object} An object containing the NewsChannel's ID and the new webhook's ID
     */
    followChannel(channelID, webhookChannelID) {
        return this.requestHandler.request("POST", Endpoints.CHANNEL_FOLLOW(channelID), true, {webhook_channel_id: webhookChannelID});
    }

    /**
    * Get general and bot-specific info on connecting to the Discord gateway (e.g. connection ratelimit)
    * @returns {Promise<Object>} Resolves with an object containing gateway connection info
    */
    getBotGateway() {
        if(!this._token.startsWith("Bot ")) {
            this._token = "Bot " + this._token;
        }
        return this.requestHandler.request("GET", Endpoints.GATEWAY_BOT, true);
    }

    /**
    * Get a Channel object from a channel ID
    * @arg {String} channelID The ID of the channel
    * @returns {CategoryChannel | GroupChannel | PrivateChannel | TextChannel | VoiceChannel | NewsChannel}
    */
    getChannel(channelID) {
        if(!channelID) {
            throw new Error(`Invalid channel ID: ${channelID}`);
        }

        if(this.channelGuildMap[channelID] && this.guilds.get(this.channelGuildMap[channelID])) {
            return this.guilds.get(this.channelGuildMap[channelID]).channels.get(channelID);
        }
        return this.privateChannels.get(channelID) || this.groupChannels.get(channelID);
    }

    /**
    * Get all invites in a channel
    * @arg {String} channelID The ID of the channel
    * @returns {Promise<Array<Invite>>}
    */
    getChannelInvites(channelID) {
        return this.requestHandler.request("GET", Endpoints.CHANNEL_INVITES(channelID), true).then((invites) => invites.map((invite) => new Invite(invite, this)));
    }

    /**
    * Get all the webhooks in a channel
    * @arg {String} channelID The ID of the channel to get webhooks for
    * @returns {Promise<Array<Object>>} Resolves with an array of webhook objects
    */
    getChannelWebhooks(channelID) {
        return this.requestHandler.request("GET", Endpoints.CHANNEL_WEBHOOKS(channelID), true);
    }

    /**
    * Get a list of discovery categories
    * @returns {Promise<Array<Object>>}
    */
    getDiscoveryCategories() {
        return this.requestHandler.request("GET", Endpoints.DISCOVERY_CATEGORIES, true);
    }

    /**
    * Get a DM channel with a user, or create one if it does not exist
    * @arg {String} userID The ID of the user
    * @returns {Promise<PrivateChannel>}
    */
    getDMChannel(userID) {
        if(this.privateChannelMap[userID]) {
            return Promise.resolve(this.privateChannels.get(this.privateChannelMap[userID]));
        }
        return this.requestHandler.request("POST", Endpoints.USER_CHANNELS("@me"), true, {
            recipients: [userID],
            type: 1
        }).then((privateChannel) => new PrivateChannel(privateChannel, this));
    }

    /**
    * Get a guild from the guild's emoji ID
    * @param {String} emojiID The ID of the emoji
    * @returns {Promise<Guild>}
    */
    getEmojiGuild(emojiID) {
        return this.requestHandler.request("GET", Endpoints.CUSTOM_EMOJI_GUILD(emojiID), true).then((result) => new Guild(result, this));
    }

    /**
    * Get info on connecting to the Discord gateway
    * @returns {Promise<Object>} Resolves with an object containing gateway connection info
    */
    getGateway() {
        return this.requestHandler.request("GET", Endpoints.GATEWAY);
    }

    /**
    * Get the audit logs for a guild
    * @arg {String} guildID The ID of the guild to get audit logs for
    * @arg {Number} [limit=50] The maximum number of entries to return
    * @arg {String} [before] Get entries before this entry ID
    * @arg {Number} [actionType] Filter entries by action type
    * @arg {String} [userID] Filter entries by the user that performed the action
    * @returns {Promise<Object>} Resolves with {users: User[], entries: GuildAuditLogEntry[], integrations: PartialIntegration[], webhooks: Webhook[]}
    */
    getGuildAuditLogs(guildID, limit, before, actionType, userID) {
        return this.requestHandler.request("GET", Endpoints.GUILD_AUDIT_LOGS(guildID), true, {
            limit: limit || 50,
            before: before,
            action_type: actionType,
            user_id: userID
        }).then((data) => {
            const guild = this.guilds.get(guildID);
            return {
                users: data.users.map((user) => this.users.add(user, this)),
                entries: data.audit_log_entries.map((entry) => new GuildAuditLogEntry(entry, guild)),
                integrations: data.integrations.map((integration) => new GuildIntegration(integration, guild)),
                webhooks: data.webhooks
            };
        });
    }

    /**
    * Get a ban from the ban list of a guild
    * @arg {String} guildID The ID of the guild
    * @arg {String} userID The ID of the banned user
    * @returns {Promise<Object>} Resolves with {reason: String, user: User}
    */
    getGuildBan(guildID, userID) {
        return this.requestHandler.request("GET", Endpoints.GUILD_BAN(guildID, userID), true).then((ban) => {
            ban.user = new User(ban.user, this);
            return ban;
        });
    }

    /**
    * Get the ban list of a guild
    * @arg {String} guildID The ID of the guild
    * @returns {Promise<Array<Object>>} Resolves with an array of {reason: String, user: User}
    */
    getGuildBans(guildID) {
        return this.requestHandler.request("GET", Endpoints.GUILD_BANS(guildID), true).then((bans) => {
            bans.forEach((ban) => {
                ban.user = new User(ban.user, this);
            });
            return bans;
        });
    }

    /**
    * Get a guild's discovery object
    * @param {String} guildID The ID of the guild
    * @returns {Promise<Object>}
    */
    getGuildDiscovery(guildID) {
        return this.requestHandler.request("GET", Endpoints.GUILD_DISCOVERY(guildID), true);
    }

    /**
    * [DEPRECATED] Get a guild's embed object
    * @arg {String} guildID The ID of the guild
    * @returns {Promise<Object>} A guild embed object
    */
    getGuildEmbed(guildID) {
        return this.requestHandler.request("GET", Endpoints.GUILD_EMBED(guildID), true);
    }

    /**
    * Get a list of integrations for a guild
    * @arg {String} guildID The ID of the guild
    * @arg {Object} [options] Options for getting integrations
    * @arg {Object} [options.includeApplications=false] Whether or not to include bot and OAuth2 webhook integrations
    * @returns {Promise<GuildIntegration[]>}
    */
    getGuildIntegrations(guildID, options = {}) {
        const guild = this.guilds.get(guildID);
        return this.requestHandler.request("GET", Endpoints.GUILD_INTEGRATIONS(guildID), true, {
            include_applications: options.inclueApplications || false
        }).then((integrations) => integrations.map((integration) => new GuildIntegration(integration, guild)));
    }

    /**
    * Get all invites in a guild
    * @arg {String} guildID The ID of the guild
    * @returns {Promise<Array<Invite>>}
    */
    getGuildInvites(guildID) {
        return this.requestHandler.request("GET", Endpoints.GUILD_INVITES(guildID), true).then((invites) => invites.map((invite) => new Invite(invite, this)));
    }

    /**
    * Get a guild preview for a guild. Only available for community guilds.
    * @arg {String} guildID The ID of the guild
    * @returns {Promise<Object>}
    */
    getGuildPreview(guildID) {
        return this.requestHandler.request("GET", Endpoints.GUILD_PREVIEW(guildID), true).then((data) => new GuildPreview(data, this));
    }

    /**
    * Get a guild template
    * @param {String} code The template code
    * @returns {Promise<GuildTemplate>}
    */
    getGuildTemplate(code) {
        return this.requestHandler.request("GET", Endpoints.GUILD_TEMPLATE(code), true).then((template) => new GuildTemplate(template, this));
    }

    /**
    * Get a guild's templates
    * @param {String} guildID The ID of the guild
    * @returns {Promise<Array<GuildTemplate>>}
    */
    getGuildTemplates(guildID) {
        return this.requestHandler.request("GET", Endpoints.GUILD_TEMPLATES(guildID), true).then((templates) => templates.map((t) => new GuildTemplate(t, this)));
    }

    /**
    * Returns the vanity url of the guild
    * @arg {String} guildID The ID of the guild
    * @returns {Promise}
    */
    getGuildVanity(guildID) {
        return this.requestHandler.request("GET", Endpoints.GUILD_VANITY_URL(guildID), true);
    }

    /**
    * Get all the webhooks in a guild
    * @arg {String} guildID The ID of the guild to get webhooks for
    * @returns {Promise<Array<Object>>} Resolves with an array of webhook objects
    */
    getGuildWebhooks(guildID) {
        return this.requestHandler.request("GET", Endpoints.GUILD_WEBHOOKS(guildID), true);
    }

    /**
    * Get a guild's widget object
    * @arg {String} guildID The ID of the guild
    * @returns {Promise<Object>} A guild widget object
    */
    getGuildWidget(guildID) {
        return this.requestHandler.request("GET", Endpoints.GUILD_WIDGET(guildID), true);
    }

    /**
    * Get info on an invite
    * @arg {String} inviteID The ID of the invite
    * @arg {Boolean} [withCounts] Whether to fetch additional invite info or not (approximate member counts, approximate presences, channel counts, etc.)
    * @returns {Promise<Invite>}
    */
    getInvite(inviteID, withCounts) {
        return this.requestHandler.request("GET", Endpoints.INVITE(inviteID), true, {
            with_counts: withCounts
        }).then((invite) => new Invite(invite, this));
    }

    /**
    * Get a previous message in a channel
    * @arg {String} channelID The ID of the channel
    * @arg {String} messageID The ID of the message
    * @returns {Promise<Message>}
    */
    getMessage(channelID, messageID) {
        return this.requestHandler.request("GET", Endpoints.CHANNEL_MESSAGE(channelID, messageID), true).then((message) => new Message(message, this));
    }

    /**
    * Get a list of users who reacted with a specific reaction
    * @arg {String} channelID The ID of the channel
    * @arg {String} messageID The ID of the message
    * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
    * @arg {Number} [limit=100] The maximum number of users to get
    * @arg {String} [before] Get users before this user ID
    * @arg {String} [after] Get users after this user ID
    * @returns {Promise<Array<User>>}
    */
    getMessageReaction(channelID, messageID, reaction, limit, before, after) {
        if(reaction === decodeURI(reaction)) {
            reaction = encodeURIComponent(reaction);
        }
        return this.requestHandler.request("GET", Endpoints.CHANNEL_MESSAGE_REACTION(channelID, messageID, reaction), true, {
            limit: limit || 100,
            before: before,
            after: after
        }).then((users) => users.map((user) => new User(user, this)));
    }

    /**
    * Get previous messages in a channel
    * @arg {String} channelID The ID of the channel
    * @arg {Number} [limit=50] The max number of messages to get
    * @arg {String} [before] Get messages before this message ID
    * @arg {String} [after] Get messages after this message ID
    * @arg {String} [around] Get messages around this message ID (does not work with limit > 100)
    * @returns {Promise<Array<Message>>}
    */
    async getMessages(channelID, limit = 50, before, after, around) {
        if(limit && limit > 100) {
            let logs = [];
            const get = async (_before, _after) => {
                const messages = await this.requestHandler.request("GET", Endpoints.CHANNEL_MESSAGES(channelID), true, {
                    limit: 100,
                    before: _before || undefined,
                    after: _after || undefined
                });
                if(limit <= messages.length) {
                    return (_after ? messages.slice(messages.length - limit, messages.length).map((message) => new Message(message, this)).concat(logs) : logs.concat(messages.slice(0, limit).map((message) => new Message(message, this))));
                }
                limit -= messages.length;
                logs = (_after ? messages.map((message) => new Message(message, this)).concat(logs) : logs.concat(messages.map((message) => new Message(message, this))));
                if(messages.length < 100) {
                    return logs;
                }
                this.emit("debug", `Getting ${limit} more messages during getMessages for ${channelID}: ${_before} ${_after}`, -1);
                return get((_before || !_after) && messages[messages.length - 1].id, _after && messages[0].id);
            };
            return get(before, after);
        }
        const messages = await this.requestHandler.request("GET", Endpoints.CHANNEL_MESSAGES(channelID), true, {
            limit,
            before,
            after,
            around
        });
        return messages.map((message) => {
            try {
                return new Message(message, this);
            } catch(err) {
                this.emit("error", `Error creating message from channel messages\n${err.stack}\n${JSON.stringify(messages)}`);
                return null;
            }
        });
    }

    /**
    * Get data on an OAuth2 application
    * @arg {String} [appID="@me"] The client ID of the application to get data for (user accounts only). "@me" refers to the logged in user's own application
    * @returns {Promise<Object>} The bot's application data. Refer to [the official Discord API documentation entry](https://discord.com/developers/docs/topics/oauth2#get-current-application-information) for object structure
    */
    getOAuthApplication(appID) {
        return this.requestHandler.request("GET", Endpoints.OAUTH2_APPLICATION(appID || "@me"), true);
    }

    /**
    * Get all the pins in a channel
    * @arg {String} channelID The ID of the channel
    * @returns {Promise<Array<Message>>}
    */
    getPins(channelID) {
        return this.requestHandler.request("GET", Endpoints.CHANNEL_PINS(channelID), true).then((messages) => messages.map((message) => new Message(message, this)));
    }

    /**
    * Get the prune count for a guild
    * @arg {String} guildID The ID of the guild
    * @arg {Number} [options] The options to use to get number of prune members
    * @arg {Number} [options.days=7] The number of days of inactivity to prune for
    * @arg {Array<String>} [options.includeRoles] An array of role IDs that members must have to be considered for pruning
    * @returns {Promise<Number>} Resolves with the number of members that would be pruned
    */
    getPruneCount(guildID, options = {}) {
        return this.requestHandler.request("GET", Endpoints.GUILD_PRUNE(guildID), true, {
            days: options.days,
            include_roles: options.includeRoles
        }).then((data) => data.pruned);
    }

    /**
    * Get a channel's data via the REST API. REST mode is required to use this endpoint.
    * @arg {String} channelID The ID of the channel
    * @returns {Promise<CategoryChannel | GroupChannel | PrivateChannel | TextChannel | VoiceChannel | NewsChannel>}
    */
    getRESTChannel(channelID) {
        if(!this.options.restMode) {
            return Promise.reject(new Error("Eris REST mode is not enabled"));
        }
        return this.requestHandler.request("GET", Endpoints.CHANNEL(channelID), true)
            .then((channel) => Channel.from(channel, this));
    }

    /**
    * Get a guild's data via the REST API. REST mode is required to use this endpoint.
    * @arg {String} guildID The ID of the guild
    * @arg {Boolean} [withCounts=false] Whether the guild object will have approximateMemberCount and approximatePresenceCount
    * @returns {Promise<Guild>}
    */
    getRESTGuild(guildID, withCounts = false) {
        if(!this.options.restMode) {
            return Promise.reject(new Error("Eris REST mode is not enabled"));
        }
        return this.requestHandler.request("GET", Endpoints.GUILD(guildID), true, {
            with_counts: withCounts
        }).then((guild) => new Guild(guild, this));
    }

    /**
    * Get a guild's channels via the REST API. REST mode is required to use this endpoint.
    * @arg {String} guildID The ID of the guild
    * @returns {Promise<(CategoryChannel[] | TextChannel[] | VoiceChannel[] | NewsChannel[])>}
    */
    getRESTGuildChannels(guildID) {
        if(!this.options.restMode) {
            return Promise.reject(new Error("Eris REST mode is not enabled"));
        }
        return this.requestHandler.request("GET", Endpoints.GUILD_CHANNELS(guildID), true)
            .then((channels) => channels.map((channel) => Channel.from(channel, this)));
    }

    /**
    * Get a guild emoji via the REST API. REST mode is required to use this endpoint.
    * @arg {String} guildID The ID of the guild
    * @arg {String} emojiID The ID of the emoji
    * @returns {Promise<Object>} An emoji object
    */
    getRESTGuildEmoji(guildID, emojiID) {
        if(!this.options.restMode) {
            return Promise.reject(new Error("Eris REST mode is not enabled"));
        }
        return this.requestHandler.request("GET", Endpoints.GUILD_EMOJI(guildID, emojiID), true);
    }

    /**
    * Get a guild's emojis via the REST API. REST mode is required to use this endpoint.
    * @arg {String} guildID The ID of the guild
    * @returns {Promise<Array<Object>>} An array of guild emoji objects
    */
    getRESTGuildEmojis(guildID) {
        if(!this.options.restMode) {
            return Promise.reject(new Error("Eris REST mode is not enabled"));
        }
        return this.requestHandler.request("GET", Endpoints.GUILD_EMOJIS(guildID), true);
    }

    /**
    * Get a guild's members via the REST API. REST mode is required to use this endpoint.
    * @arg {String} guildID The ID of the guild
    * @arg {String} memberID The ID of the member
    * @returns {Promise<Member>}
    */
    getRESTGuildMember(guildID, memberID) {
        if(!this.options.restMode) {
            return Promise.reject(new Error("Eris REST mode is not enabled"));
        }
        return this.requestHandler.request("GET", Endpoints.GUILD_MEMBER(guildID, memberID), true).then((member) => new Member(member, this.guilds.get(guildID), this));
    }

    /**
    * Get a guild's members via the REST API. REST mode is required to use this endpoint.
    * @arg {String} guildID The ID of the guild
    * @arg {Number} [limit=1] The max number of members to get (1 to 1000)
    * @arg {String} [after] The highest user ID of the previous page
    * @returns {Promise<Array<Member>>}
    */
    getRESTGuildMembers(guildID, limit, after) {
        if(!this.options.restMode) {
            return Promise.reject(new Error("Eris REST mode is not enabled"));
        }
        return this.requestHandler.request("GET", Endpoints.GUILD_MEMBERS(guildID), true, {
            limit,
            after
        }).then((members) => members.map((member) => new Member(member, this.guilds.get(guildID), this)));
    }

    /**
    * Get a guild's roles via the REST API. REST mode is required to use this endpoint.
    * @arg {String} guildID The ID of the guild
    * @returns {Promise<Array<Role>>}
    */
    getRESTGuildRoles(guildID) {
        if(!this.options.restMode) {
            return Promise.reject(new Error("Eris REST mode is not enabled"));
        }
        return this.requestHandler.request("GET", Endpoints.GUILD_ROLES(guildID), true).then((roles) => roles.map((role) => new Role(role, null)));
    }

    /**
    * Get a list of the user's guilds via the REST API. REST mode is required to use this endpoint.
    * @arg {Number} [limit=100] The max number of guilds to get (1 to 1000)
    * @arg {String} [before] The lowest guild ID of the next page
    * @arg {String} [after] The highest guild ID of the previous page
    * @returns {Promise<Array<Guild>>}
    */
    getRESTGuilds(limit, before, after) {
        if(!this.options.restMode) {
            return Promise.reject(new Error("Eris REST mode is not enabled"));
        }
        return this.requestHandler.request("GET", Endpoints.USER_GUILDS("@me"), true, {
            limit,
            before,
            after
        }).then((guilds) => guilds.map((guild) => new Guild(guild, this)));
    }

    /**
    * Get a user's data via the REST API. REST mode is required to use this endpoint.
    * @arg {String} userID The ID of the user
    * @returns {Promise<User>}
    */
    getRESTUser(userID) {
        if(!this.options.restMode) {
            return Promise.reject(new Error("Eris REST mode is not enabled"));
        }
        return this.requestHandler.request("GET", Endpoints.USER(userID), true).then((user) => new User(user, this));
    }

    /**
    * Get properties of the bot user
    * @returns {Promise<ExtendedUser>}
    */
    getSelf() {
        return this.requestHandler.request("GET", Endpoints.USER("@me"), true).then((data) => new ExtendedUser(data, this));
    }

    /**
    * [USER ACCOUNT] Get the billing info for the current user
    * @returns {Promise<Object>} The user's billing info
    */
    getSelfBilling() {
        return this.requestHandler.request("GET", Endpoints.USER_BILLING("@me"), true);
    }

    /**
    * [USER ACCOUNT] Get the connections for the current user
    * @returns {Promise<Object>} The user's connections
    */
    getSelfConnections() {
        return this.requestHandler.request("GET", Endpoints.USER_CONNECTIONS("@me"), true);
    }

    /**
    * [USER ACCOUNT] Get the MFA backup codes for the current user
    * @arg {String} password The password for the current user
    * @arg {Boolean} [regenerate] Whether to regenerate the MFA backup codes or not
    * @returns {Promise<Object>} The user's MFA codes
    */
    getSelfMFACodes(password, regenerate) {
        return this.requestHandler.request("POST", Endpoints.USER_MFA_CODES("@me"), true, {
            password: password,
            regenerate: !!regenerate
        });
    }

    /**
    * [USER ACCOUNT] Get the payment history for the current user
    * @returns {Promise<Object>} The user's payment history
    */
    getSelfPayments() {
        return this.requestHandler.request("GET", Endpoints.USER_BILLING_PAYMENTS("@me"), true);
    }

    /**
    * [USER ACCOUNT] Get settings for the current user
    * @returns {Promise<Object>} The user's settings data.
    */
    getSelfSettings() {
        return this.requestHandler.request("GET", Endpoints.USER_SETTINGS("@me"), true);
    }

    /**
    * [USER ACCOUNT] Get profile data for a user
    * @arg {String} userID The ID of the target user
    * @returns {Promise<Object>} The user's profile data.
    */
    getUserProfile(userID) {
        return this.requestHandler.request("GET", Endpoints.USER_PROFILE(userID), true);
    }

    /**
    * Get a list of general/guild-specific voice regions
    * @arg {String} [guildID] The ID of the guild
    * @returns {Promise<Array<Object>>} Resolves with an array of voice region objects
    */
    getVoiceRegions(guildID) {
        return guildID ? this.requestHandler.request("GET", Endpoints.GUILD_VOICE_REGIONS(guildID), true) : this.requestHandler.request("GET", Endpoints.VOICE_REGIONS, true);
    }

    /**
    * Get a webhook
    * @arg {String} webhookID The ID of the webhook
    * @arg {String} [token] The token of the webhook, used instead of the Bot Authorization token
    * @returns {Promise<Object>} Resolves with a webhook object
    */
    getWebhook(webhookID, token) {
        return this.requestHandler.request("GET", token ? Endpoints.WEBHOOK_TOKEN(webhookID, token) : Endpoints.WEBHOOK(webhookID), !token);
    }

    /**
    * Join a voice channel. If joining a group call, the voice connection ID will be stored in voiceConnections as "call". Otherwise, it will be the guild ID
    * @arg {String} channelID The ID of the voice channel
    * @arg {Object} [options] VoiceConnection constructor options
    * @arg {Object} [options.opusOnly] Skip opus encoder initialization. You should not enable this unless you know what you are doing
    * @arg {Object} [options.shared] Whether the VoiceConnection will be part of a SharedStream or not
    * @returns {Promise<VoiceConnection>} Resolves with a VoiceConnection
    */
    joinVoiceChannel(channelID, options = {}) {
        const channel = this.getChannel(channelID);
        if(!channel) {
            return Promise.reject(new Error("Channel not found"));
        }
        if(channel.guild && !(channel.permissionsOf(this.user.id).allow & Constants.Permissions.voiceConnect)) {
            return Promise.reject(new Error("Insufficient permission to connect to voice channel"));
        }
        this.shards.get(this.guildShardMap[this.channelGuildMap[channelID]] || 0).sendWS(Constants.GatewayOPCodes.VOICE_STATE_UPDATE, {
            guild_id: this.channelGuildMap[channelID] || null,
            channel_id: channelID || null,
            self_mute: false,
            self_deaf: false
        });
        if(options.opusOnly === undefined) {
            options.opusOnly = this.options.opusOnly;
        }
        return this.voiceConnections.join(this.channelGuildMap[channelID] || "call", channelID, options);
    }

    /**
    * Kick a user from a guild
    * @arg {String} guildID The ID of the guild
    * @arg {String} userID The ID of the user
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    kickGuildMember(guildID, userID, reason) {
        return this.requestHandler.request("DELETE", Endpoints.GUILD_MEMBER(guildID, userID), true, {
            reason
        });
    }

    /**
    * Leave a guild
    * @arg {String} guildID The ID of the guild
    * @returns {Promise}
    */
    leaveGuild(guildID) {
        return this.requestHandler.request("DELETE", Endpoints.USER_GUILD("@me", guildID), true);
    }

    /**
    * Leaves a voice channel
    * @arg {String} channelID The ID of the voice channel
    */
    leaveVoiceChannel(channelID) {
        if(!channelID || !this.channelGuildMap[channelID]) {
            return;
        }
        this.closeVoiceConnection(this.channelGuildMap[channelID]);
    }

    /**
    * Pin a message
    * @arg {String} channelID The ID of the channel
    * @arg {String} messageID The ID of the message
    * @returns {Promise}
    */
    pinMessage(channelID, messageID) {
        return this.requestHandler.request("PUT", Endpoints.CHANNEL_PIN(channelID, messageID), true);
    }

    /**
    * Begin pruning a guild
    * @arg {String} guildID The ID of the guild
    * @arg {Number} [options] The options to pass to prune members
    * @arg {Boolean} [options.computePruneCount=true] Whether or not the number of pruned members should be returned. Discord discourages setting this to true for larger guilds
    * @arg {Number} [options.days=7] The number of days of inactivity to prune for
    * @arg {Array<String>} [options.includeRoles] An array of role IDs that members must have to be considered for pruning
    * @arg {String} [options.reason] The reason to be displayed in audit logs
    * @returns {Promise<Number?>} If computePruneCount was true, resolves with the number of pruned members
    */
    pruneMembers(guildID, options = {}) {
        return this.requestHandler.request("POST", Endpoints.GUILD_PRUNE(guildID), true, {
            days: options.days,
            compute_prune_count: options.computePruneCount,
            include_roles: options.includeRoles,
            reason: options.reason
        }).then((data) => data.pruned);
    }

    /**
    * Purge previous messages in a channel with an optional filter (bot accounts only)
    * @arg {String} channelID The ID of the channel
    * @arg {Number} limit The max number of messages to search through, -1 for no limit
    * @arg {Function} [filter] Optional filter function that returns a boolean when passed a Message object
    * @arg {String} [before] Get messages before this message ID
    * @arg {String} [after] Get messages after this message ID
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Number>} Resolves with the number of messages deleted
    */
    async purgeChannel(channelID, limit, filter, before, after, reason) {
        if(typeof filter === "string") {
            filter = (msg) => msg.content.includes(filter);
        }
        if(limit !== -1 && limit <= 0) {
            return 0;
        }
        const toDelete = [];
        let deleted = 0;
        let done = false;
        const checkToDelete = async () => {
            const messageIDs = (done && toDelete) || (toDelete.length >= 100 && toDelete.splice(0, 100));
            if(messageIDs) {
                deleted += messageIDs.length;
                await this.deleteMessages(channelID, messageIDs, reason);
                if(done) {
                    return deleted;
                }
                await sleep(1000);
                return checkToDelete();
            } else if(done) {
                return deleted;
            } else {
                await sleep(250);
                return checkToDelete();
            }
        };
        const del = async (_before, _after) => {
            const messages = await this.getMessages(channelID, 100, _before, _after);
            if(limit !== -1 && limit <= 0) {
                done = true;
                return;
            }
            for(const message of messages) {
                if(limit !== -1 && limit <= 0) {
                    break;
                }
                if(message.timestamp < Date.now() - 1209600000) { // 14d * 24h * 60m * 60s * 1000ms
                    done = true;
                    return;
                }
                if(!filter || filter(message)) {
                    toDelete.push(message.id);
                }
                if(limit !== -1) {
                    limit--;
                }
            }
            if((limit !== -1 && limit <= 0) || messages.length < 100) {
                done = true;
                return;
            }
            await del((_before || !_after) && messages[messages.length - 1].id, _after && messages[0].id);
        };
        await del(before, after);
        return checkToDelete();
    }

    /**
    * [USER ACCOUNT] Remove a user from a group
    * @arg {String} groupID The ID of the target group
    * @arg {String} userID The ID of the target user
    * @returns {Promise}
    */
    removeGroupRecipient(groupID, userID) {
        return this.requestHandler.request("DELETE", Endpoints.CHANNEL_RECIPIENT(groupID, userID), true);
    }

    /**
    * Remove a role from a guild member
    * @arg {String} guildID The ID of the guild
    * @arg {String} memberID The ID of the member
    * @arg {String} roleID The ID of the role
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    removeGuildMemberRole(guildID, memberID, roleID, reason) {
        return this.requestHandler.request("DELETE", Endpoints.GUILD_MEMBER_ROLE(guildID, memberID, roleID), true, {
            reason
        });
    }

    /**
    * Remove a reaction from a message
    * @arg {String} channelID The ID of the channel
    * @arg {String} messageID The ID of the message
    * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
    * @arg {String} [userID="@me"] The ID of the user to remove the reaction for
    * @returns {Promise}
    */
    removeMessageReaction(channelID, messageID, reaction, userID) {
        if(reaction === decodeURI(reaction)) {
            reaction = encodeURIComponent(reaction);
        }
        return this.requestHandler.request("DELETE", Endpoints.CHANNEL_MESSAGE_REACTION_USER(channelID, messageID, reaction, userID || "@me"), true);
    }

    /**
    * Remove all reactions from a message for a single emoji.
    * @arg {String} channelID The ID of the channel
    * @arg {String} messageID The ID of the message
    * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
    * @returns {Promise}
    */
    removeMessageReactionEmoji(channelID, messageID, reaction) {
        if(reaction === decodeURI(reaction)) {
            reaction = encodeURIComponent(reaction);
        }
        return this.requestHandler.request("DELETE", Endpoints.CHANNEL_MESSAGE_REACTION(channelID, messageID, reaction), true);
    }

    /**
    * Remove all reactions from a message
    * @arg {String} channelID The ID of the channel
    * @arg {String} messageID The ID of the message
    * @returns {Promise}
    */
    removeMessageReactions(channelID, messageID) {
        return this.requestHandler.request("DELETE", Endpoints.CHANNEL_MESSAGE_REACTIONS(channelID, messageID), true);
    }

    /**
    * [USER ACCOUNT] Remove a relationship with a user
    * @arg {String} userID The ID of the target user
    * @returns {Promise}
    */
    removeRelationship(userID) {
        return this.requestHandler.request("DELETE", Endpoints.USER_RELATIONSHIP("@me", userID), true);
    }

    /**
    * [USER ACCOUNT] Search a channel's messages
    * @arg {String} channelID The ID of the channel
    * @arg {Object} query Search parameters
    * @arg {String} [query.attachmentExtensions] Filter results by attachment extension
    * @arg {String} [query.attachmentFilename] Filter results by attachment filename
    * @arg {String} [query.authorID] Filter results by an author ID
    * @arg {String} [query.content] Filter results by a content string
    * @arg {Number} [query.contextSize=2] How many context messages around each result to return.
    * @arg {String} [query.embedProviders] Filter results by embed provider
    * @arg {String} [query.embedTypes] Filter results by embed type
    * @arg {String} [query.has] Only return messages with an "attachment", "embed", or "link"
    * @arg {Number} [query.limit=25] How many messages to return, 1 <= limit <= 25
    * @arg {String} [query.maxID] The maximum message ID to return results for
    * @arg {String} [query.minID] The minimum message ID to return results for
    * @arg {Number} [query.offset=0] The query index of the first message to be returned, 0 <= offset <= 5000
    * @arg {String} [query.sortBy="timestamp"] What to sort by, either "timestamp" or "relevance"
    * @arg {String} [query.sortOrder="desc"] What order to sort by, either "asc" or "desc"
    * For example, if you searched for `6` and contextSize was 2, `[4, 5, 6, 7, 8]` would be returned
    * @returns {Promise<Object>} A search result object. The object will have a `totalResults` key and `results` key.
    * Each entry in the result array is an array of Message objects.
    * In each array, the message where `Message.hit === true` is the matched message, while the other messages are context messages.
    * Sample return: ```
    * {
    *     totalResults: 2,
    *     results: [
    *         [Message, Message, Message (Message.hit = true), Message],
    *         [Message, Message, Message (Message.hit = true), Message, Message]
    *     ]
    * }
    * ```
    */
    searchChannelMessages(channelID, query) {
        return this.requestHandler.request("GET", Endpoints.CHANNEL_MESSAGES_SEARCH(channelID), true, {
            sort_by: query.sortBy,
            sort_order: query.sortOrder,
            content: query.content,
            author_id: query.authorID,
            min_id: query.minID,
            max_id: query.maxID,
            limit: query.limit,
            offset: query.offset,
            context_size: query.contextSize,
            has: query.has,
            embed_providers: query.embedProviders,
            embed_types: query.embedTypes,
            attachment_extensions: query.attachmentExtensions,
            attachment_filename: query.attachmentFilename
        }).then((results) => ({
            totalResults: results.total_results,
            results: results.messages && results.messages.map((result) => result.map((message) => new Message(message, this)))
        }));
    }

    /**
    * Search for guild members by partial nickname/username
    * @arg {String} guildID The ID of the guild
    * @arg {String} query The query string to match username(s) and nickname(s) against
    * @arg {Number} [limit=1] The maximum number of members you want returned, capped at 100
    * @returns {Promise<Array<Member>>}
    */
    searchGuildMembers(guildID, query, limit) {
        return this.requestHandler.request("GET", Endpoints.GUILD_MEMBERS_SEARCH(guildID), true, {
            query,
            limit
        }).then((members) => {
            const guild = this.guilds.get(guildID);
            return members.map((member) => new Member(member, guild, this));
        });
    }

    /**
    * [USER ACCOUNT] Search a guild's messages
    * @arg {String} guildID The ID of the guild
    * @arg {Object} query Search parameters
    * @arg {String} [query.attachmentExtensions] Filter results by attachment extension
    * @arg {String} [query.attachmentFilename] Filter results by attachment filename
    * @arg {String} [query.authorID] Filter results by an author ID
    * @arg {Array<String>} [query.channelIDs] Filter results by channel ID
    * @arg {String} [query.content] Filter results by a content string
    * @arg {Number} [query.contextSize=2] How many context messages around each result to return.
    * @arg {String} [query.embedProviders] Filter results by embed provider
    * @arg {String} [query.embedTypes] Filter results by embed type
    * @arg {String} [query.has] Only return messages with an "attachment", "embed", or "link"
    * @arg {Number} [query.limit=25] How many messages to return, 1 <= limit <= 25
    * @arg {String} [query.minID] The minimum message ID to return results for
    * @arg {String} [query.maxID] The maximum message ID to return results for
    * @arg {Number} [query.offset=0] The query index of the first message to be returned, 0 <= offset <= 5000
    * @arg {String} [query.sortBy="timestamp"] What to sort by, either "timestamp" or "relevance"
    * @arg {String} [query.sortOrder="desc"] What order to sort by, either "asc" or "desc"
    * For example, if you searched for `6` and contextSize was 2, `[4, 5, 6, 7, 8]` would be returned
    * @returns {Promise<Object>} A search result object. The object will have a `totalResults` key and `results` key.
    * Each entry in the result array is an array of Message objects.
    * In each array, the message where `Message.hit === true` is the matched message, while the other messages are context messages.
    * Sample return: ```
    * {
    *     totalResults: 2,
    *     results: [
    *         [Message, Message, Message (Message.hit = true), Message],
    *         [Message, Message, Message (Message.hit = true), Message, Message]
    *     ]
    * }
    * ```
    */
    searchGuildMessages(guildID, query) {
        return this.requestHandler.request("GET", Endpoints.GUILD_MESSAGES_SEARCH(guildID), true, {
            sort_by: query.sortBy,
            sort_order: query.sortOrder,
            content: query.content,
            author_id: query.authorID,
            min_id: query.minID,
            max_id: query.maxID,
            limit: query.limit,
            offset: query.offset,
            context_size: query.contextSize,
            has: query.has,
            embed_providers: query.embedProviders,
            embed_types: query.embedTypes,
            attachment_extensions: query.attachmentExtensions,
            attachment_filename: query.attachmentFilename,
            channel_id: query.channelIDs
        }).then((results) => ({
            totalResults: results.total_results,
            results: results.messages && results.messages.map((result) => result.map((message) => new Message(message, this)))
        }));
    }

    /**
    * Send typing status in a channel
    * @arg {String} channelID The ID of the channel
    * @returns {Promise}
    */
    sendChannelTyping(channelID) {
        return this.requestHandler.request("POST", Endpoints.CHANNEL_TYPING(channelID), true);
    }

    /**
    * Force a guild integration to sync
    * @arg {String} guildID The ID of the guild
    * @arg {String} integrationID The ID of the integration
    * @returns {Promise}
    */
    syncGuildIntegration(guildID, integrationID) {
        return this.requestHandler.request("POST", Endpoints.GUILD_INTEGRATION_SYNC(guildID, integrationID), true);
    }

    /**
    * Force a guild template to sync
    * @param {String} guildID The ID of the guild
    * @param {String} code The template code
    * @returns {Promise<GuildTemplate>}
    */
    syncGuildTemplate(guildID, code) {
        return this.requestHandler.request("PUT", Endpoints.GUILD_TEMPLATE_GUILD(guildID, code), true).then((template) => new GuildTemplate(template, this));
    }

    /**
    * Unban a user from a guild
    * @arg {String} guildID The ID of the guild
    * @arg {String} userID The ID of the user
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    unbanGuildMember(guildID, userID, reason) {
        return this.requestHandler.request("DELETE", Endpoints.GUILD_BAN(guildID, userID), true, {
            reason
        });
    }

    /**
    * Unpin a message
    * @arg {String} channelID The ID of the channel
    * @arg {String} messageID The ID of the message
    * @returns {Promise}
    */
    unpinMessage(channelID, messageID) {
        return this.requestHandler.request("DELETE", Endpoints.CHANNEL_PIN(channelID, messageID), true);
    }

    /**
    * Validate discovery search term
    * @param {String} term The search term to check
    * @returns {Promise<Object>} An object with a `valid` field which is `true` when valid and `false` when invalid
    */
    validateDiscoverySearchTerm(term) {
        return this.requestHandler.request("GET", Endpoints.DISCOVERY_VALIDATION + `?term=${encodeURI(term)}`, true);
    }

    _formatAllowedMentions(allowed) {
        if(!allowed) {
            return this.options.allowedMentions;
        }
        const result = {
            parse: []
        };
        if(allowed.everyone) {
            result.parse.push("everyone");
        }
        if(allowed.roles === true) {
            result.parse.push("roles");
        } else if(Array.isArray(allowed.roles)) {
            if(allowed.roles.length > 100) {
                throw new Error("Allowed role mentions cannot exceed 100.");
            }
            result.roles = allowed.roles;
        }
        if(allowed.users === true) {
            result.parse.push("users");
        } else if(Array.isArray(allowed.users)) {
            if(allowed.users.length > 100) {
                throw new Error("Allowed user mentions cannot exceed 100.");
            }
            result.users = allowed.users;
        }
        if(allowed.repliedUser !== undefined) {
            result.replied_user = allowed.repliedUser;
        }
        return result;
    }

    _formatImage(url, format, size) {
        if(!format || !Constants.ImageFormats.includes(format.toLowerCase())) {
            format = url.includes("/a_") ? "gif": this.options.defaultImageFormat;
        }
        if(!size || size < Constants.ImageSizeBoundaries.MINIMUM || size > Constants.ImageSizeBoundaries.MAXIMUM || (size & (size - 1))) {
            size = this.options.defaultImageSize;
        }
        return `${Endpoints.CDN_URL}${url}.${format}?size=${size}`;
    }

    toString() {
        return `[Client ${this.user.id}]`;
    }

    toJSON(props = []) {
        return Base.prototype.toJSON.call(this, [
            "options",
            "requestHandler",
            "ready",
            "bot",
            "startTime",
            "lastConnect",
            "channelGuildMap",
            "shards",
            "gatewayURL",
            "groupChannels",
            "guilds",
            "privateChannelMap",
            "privateChannels",
            "guildShardMap",
            "unavailableGuilds",
            "relationships",
            "users",
            "presence",
            "userGuildSettings",
            "userSettings",
            "notes",
            "voiceConnections",
            "lastReconnectDelay",
            "reconnectAttempts",
            "application",
            ...props
        ]);
    }
}

module.exports = Client;
