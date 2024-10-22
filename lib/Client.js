"use strict";

const ApplicationCommand = require("./structures/ApplicationCommand");
const Base = require("./structures/Base");
const Channel = require("./structures/Channel");
const Collection = require("./util/Collection");
const Constants = require("./Constants");
const emitDeprecation = require("./util/emitDeprecation");
const Endpoints = require("./rest/Endpoints");
const ExtendedUser = require("./structures/ExtendedUser");
const GroupChannel = require("./structures/GroupChannel");
const Guild = require("./structures/Guild");
const GuildAuditLogEntry = require("./structures/GuildAuditLogEntry");
const GuildIntegration = require("./structures/GuildIntegration");
const GuildPreview = require("./structures/GuildPreview");
const GuildTemplate = require("./structures/GuildTemplate");
const GuildScheduledEvent = require("./structures/GuildScheduledEvent");
const Invite = require("./structures/Invite");
const Member = require("./structures/Member");
const Message = require("./structures/Message");
const Permission = require("./structures/Permission");
const DMChannel = require("./structures/DMChannel");
const RequestHandler = require("./rest/RequestHandler");
const Role = require("./structures/Role");
const ShardManager = require("./gateway/ShardManager");
const SoundboardSound = require("./structures/SoundboardSound");
const StageInstance = require("./structures/StageInstance");
const ThreadMember = require("./structures/ThreadMember");
const UnavailableGuild = require("./structures/UnavailableGuild");
const User = require("./structures/User");
const VoiceConnectionManager = require("./voice/VoiceConnectionManager");

let EventEmitter;
try {
  EventEmitter = require("eventemitter3");
} catch {
  EventEmitter = require("events");
}
let Erlpack;
try {
  Erlpack = require("erlpack");
} catch {} // eslint-disable-line no-empty
let ZlibSync;
try {
  ZlibSync = require("zlib-sync");
} catch {
  try {
    ZlibSync = require("pako");
  } catch {} // eslint-disable-line no-empty
}
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Represents the main Eris client
 * @extends EventEmitter
 * @prop {Object?} application Object containing the bot application's ID and its public flags
 * @prop {Boolean} bot Whether the bot user belongs to an OAuth2 application
 * @prop {Object} channelGuildMap Object mapping channel IDs to guild IDs
 * @prop {Object} dmChannelMap Object mapping user IDs to private channel IDs
 * @prop {Collection<DMChannel>} dmChannels Collection of private channels the bot is in
 * @prop {String} gatewayURL The URL for the discord gateway
 * @prop {Collection<Guild>} guilds Collection of guilds the bot is in
 * @prop {Object} guildShardMap Object mapping guild IDs to shard IDs
 * @prop {Object} options Eris options
 * @prop {RequestHandler} requestHandler The request handler the client will use
 * @prop {Collection<Shard>} shards Collection of shards Eris is using
 * @prop {Number} startTime Timestamp of bot ready event
 * @prop {Object} threadGuildMap Object mapping thread channel IDs to guild IDs
 * @prop {Collection<UnavailableGuild>} unavailableGuilds Collection of unavailable guilds the bot is in
 * @prop {Number} uptime How long in milliseconds the bot has been up for
 * @prop {ExtendedUser} user The bot user
 * @prop {Collection<User>} users Collection of users the bot sees
 * @prop {Collection<VoiceConnection>} voiceConnections Extended collection of active VoiceConnections the bot has
 */
class Client extends EventEmitter {
  /**
   * Create a Client
   * @arg {String} token The auth token to use. Bot tokens should be prefixed with `Bot` (e.g. `Bot MTExIHlvdSAgdHJpZWQgMTEx.O5rKAA.dQw4w9WgXcQ_wpV-gGA4PSk_bm8`). Prefix-less bot tokens are [DEPRECATED]
   * @arg {Object} options Eris client options
   * @arg {Object} [options.agent] [DEPRECATED] A HTTPS Agent used to proxy requests. This option has been moved under `options.rest`
   * @arg {Object} [options.allowedMentions] A list of mentions to allow by default in createMessage/editMessage
   * @arg {Boolean} [options.allowedMentions.everyone] Whether or not to allow @everyone/@here
   * @arg {Boolean} [options.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to
   * @arg {Boolean | Array<String>} [options.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow
   * @arg {Boolean | Array<String>} [options.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow
   * @arg {Boolean} [options.autoreconnect=true] Have Eris autoreconnect when connection is lost
   * @arg {Boolean} [options.compress=false] Whether to request WebSocket data to be compressed or not
   * @arg {Number} [options.connectionTimeout=30000] How long in milliseconds to wait for the connection to handshake with the server
   * @arg {String} [options.defaultImageFormat="jpg"] The default format to provide user avatars, guild icons, and group icons in. Can be "jpg", "png", "gif", or "webp"
   * @arg {Number} [options.defaultImageSize=128] The default size to return user avatars, guild icons, banners, splashes, and group icons. Can be any power of two between 16 and 2048. If the height and width are different, the width will be the value specified, and the height relative to that
   * @arg {Object} [options.disableEvents] If disableEvents[eventName] is true, the WS event will not be processed. This can cause significant performance increase on large bots. [A full list of the WS event names can be found on the docs reference page](/Eris/docs/reference#ws-event-names)
   * @arg {Number} [options.firstShardID=0] The ID of the first shard to run for this client
   * @arg {Boolean} [options.getAllUsers=false] Get all the users in every guild. Ready time will be severely delayed
   * @arg {Number} [options.guildCreateTimeout=2000] How long in milliseconds to wait for a GUILD_CREATE before "ready" is fired. Increase this value if you notice missing guilds
   * @arg {Number | Array<String|Number>} [options.intents] A list of [intent names](/Eris/docs/reference), pre-shifted intent numbers to add, or a raw bitmask value describing the intents to subscribe to. Some intents, like `guildPresences` and `guildMembers`, must be enabled on your application's page to be used. By default, all non-privileged intents are enabled
   * @arg {Number} [options.largeThreshold=250] The maximum number of offline users per guild during initial guild data transmission
   * @arg {Number} [options.lastShardID=options.maxShards - 1] The ID of the last shard to run for this client
   * @arg {Number} [options.latencyThreshold=30000] [DEPRECATED] The average request latency at which Eris will start emitting latency errors. This option has been moved under `options.rest`
   * @arg {Number} [options.maxReconnectAttempts=Infinity] The maximum amount of times that the client is allowed to try to reconnect to Discord
   * @arg {Number} [options.maxResumeAttempts=10] The maximum amount of times a shard can attempt to resume a session before considering that session invalid
   * @arg {Number | String} [options.maxShards=1] The total number of shards you want to run. If "auto" Eris will use Discord's recommended shard count
   * @arg {Number} [options.messageLimit=100] The maximum size of a channel message cache
   * @arg {Boolean} [options.opusOnly=false] Whether to suppress the Opus encoder not found error or not
   * @arg {Number} [options.ratelimiterOffset=0] [DEPRECATED] A number of milliseconds to offset the ratelimit timing calculations by. This option has been moved under `options.rest`
   * @arg {Function} [options.reconnectDelay] A function which returns how long the bot should wait until reconnecting to Discord
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
   * @arg {Number | String} [options.shardConcurrency="auto"] The number of shards that can start simultaneously. If "auto" Eris will use Discord's recommended shard concurrency
   * @arg {Object} [options.ws] An object of WebSocket options to pass to the shard WebSocket constructors
   */
  constructor(token, options) {
    super();

    this.options = Object.assign({
      allowedMentions: {
        users: true,
        roles: true,
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
      intents: Constants.Intents.allNonPrivileged,
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
      shardConcurrency: "auto",
      ws: {},
      reconnectDelay: (lastDelay, attempts) => Math.pow(attempts + 1, 0.7) * 20000,
    }, options);
    this.options.allowedMentions = this._formatAllowedMentions(this.options.allowedMentions);
    if (this.options.lastShardID === undefined && this.options.maxShards !== "auto") {
      this.options.lastShardID = this.options.maxShards - 1;
    }
    if (typeof window !== "undefined" || !ZlibSync) {
      this.options.compress = false; // zlib does not like Blobs, Pako is not here
    }
    if (!Constants.ImageFormats.includes(this.options.defaultImageFormat.toLowerCase())) {
      throw new TypeError(`Invalid default image format: ${this.options.defaultImageFormat}`);
    }
    const defaultImageSize = this.options.defaultImageSize;
    if (defaultImageSize < Constants.ImageSizeBoundaries.MINIMUM || defaultImageSize > Constants.ImageSizeBoundaries.MAXIMUM || (defaultImageSize & (defaultImageSize - 1))) {
      throw new TypeError(`Invalid default image size: ${defaultImageSize}`);
    }
    // Set HTTP Agent on Websockets if not already set
    if (this.options.agent && !(this.options.ws && this.options.ws.agent)) {
      this.options.ws = this.options.ws || {};
      this.options.ws.agent = this.options.agent;
    }

    if (this.options.hasOwnProperty("intents")) {
      // Resolve intents option to the proper integer
      if (Array.isArray(this.options.intents)) {
        let bitmask = 0;
        for (const intent of this.options.intents) {
          if (typeof intent === "number") {
            bitmask |= intent;
          } else if (Constants.Intents[intent]) {
            bitmask |= Constants.Intents[intent];
          } else {
            this.emit("warn", `Unknown intent: ${intent}`);
          }
        }
        this.options.intents = bitmask;
      }

      // Ensure requesting all guild members isn't destined to fail
      if (this.options.getAllUsers && !(this.options.intents & Constants.Intents.guildMembers)) {
        throw new Error("Cannot request all members without guildMembers intent");
      }
    }

    Object.defineProperty(this, "_token", {
      configurable: true,
      enumerable: false,
      writable: true,
      value: token,
    });

    this.requestHandler = new RequestHandler(this, this.options.rest);
    delete this.options.rest;

    const shardManagerOptions = {};
    if (typeof this.options.shardConcurrency === "number") {
      shardManagerOptions.concurrency = this.options.shardConcurrency;
    }
    this.shards = new ShardManager(this, shardManagerOptions);

    this.ready = false;
    this.bot = this._token.startsWith("Bot ");
    this.startTime = 0;
    this.lastConnect = 0;
    this.channelGuildMap = {};
    this.threadGuildMap = {};
    this.guilds = new Collection(Guild);
    this.dmChannelMap = {};
    this.dmChannels = new Collection(DMChannel);
    this.guildShardMap = {};
    this.unavailableGuilds = new Collection(UnavailableGuild);
    this.users = new Collection(User);
    this.presence = {
      activities: null,
      afk: false,
      since: null,
      status: "offline",
    };
    this.voiceConnections = new VoiceConnectionManager();

    this.connect = this.connect.bind(this);
    this.lastReconnectDelay = 0;
    this.reconnectAttempts = 0;
  }

  get privateChannelMap() {
    emitDeprecation("PRIVATE_CHANNEL");
    return this.dmChannelMap;
  }

  get privateChannels() {
    emitDeprecation("PRIVATE_CHANNEL");
    return this.dmChannels;
  }

  get uptime() {
    return this.startTime ? Date.now() - this.startTime : 0;
  }

  /**
   * Add a user to a group channel
   * @arg {String} groupID The ID of the target group
   * @arg {String} userID The ID of the user to add
   * @arg {Object} options The options for adding the user
   * @arg {String} options.accessToken The access token of the user to add. Requires having been authorized with the `gdm.join` scope
   * @arg {String} [options.nick] The nickname to give the user
   * @returns {Promise}
   */
  addGroupRecipient(groupID, userID, options) {
    options.access_token = options.accessToken;
    return this.requestHandler.request("PUT", Endpoints.CHANNEL_RECIPIENT(groupID, userID), true, options);
  }

  /**
   * Add a guild discovery subcategory
   * @arg {String} guildID The ID of the guild
   * @arg {String} categoryID The ID of the discovery category
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Object>}
   */
  addGuildDiscoverySubcategory(guildID, categoryID, reason) {
    return this.requestHandler.request("POST", Endpoints.GUILD_DISCOVERY_CATEGORY(guildID, categoryID), true, { reason });
  }

  /**
   * Add a member to a guild
   * @arg {String} guildID The ID of the guild
   * @arg {String} userID The ID of the user
   * @arg {String} accessToken The access token of the user
   * @arg {Object} [options] Options for adding the member
   * @arg {Boolean} [options.deaf] Whether the member should be deafened
   * @arg {Boolean} [options.mute] Whether the member should be muted
   * @arg {String} [options.nick] The nickname of the member
   * @arg {Array<String>} [options.roles] Array of role IDs to add to the member
   * @returns {Promise}
   */
  addGuildMember(guildID, userID, accessToken, options = {}) {
    return this.requestHandler.request("PUT", Endpoints.GUILD_MEMBER(guildID, userID), true, {
      access_token: accessToken,
      nick: options.nick,
      roles: options.roles,
      mute: options.mute,
      deaf: options.deaf,
    });
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
      reason,
    });
  }

  /**
   * Add a reaction to a message
   * @arg {String} channelID The ID of the channel
   * @arg {String} messageID The ID of the message
   * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
   * @returns {Promise}
   */
  addMessageReaction(channelID, messageID, reaction) {
    if (reaction === decodeURI(reaction)) {
      reaction = encodeURIComponent(reaction);
    }
    return this.requestHandler.request("PUT", Endpoints.CHANNEL_MESSAGE_REACTION_USER(channelID, messageID, reaction, "@me"), true);
  }

  /**
   * Ban a user from a guild
   * @arg {String} guildID The ID of the guild
   * @arg {String} userID The ID of the user
   * @arg {Number} [options.deleteMessageDays=0] [DEPRECATED] Number of days to delete messages for, between 0-7 inclusive
   * @arg {Number} [options.deleteMessageSeconds=0] Number of seconds to delete messages for, between 0 and 604800 inclusive
   * @arg {String} [options.reason] The reason to be displayed in audit logs
   * @arg {String} [reason] [DEPRECATED] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  banGuildMember(guildID, userID, options, reason) {
    if (!options || typeof options !== "object") {
      options = {
        deleteMessageDays: options,
      };
    }
    if (reason !== undefined) {
      options.reason = reason;
    }
    if (options.deleteMessageDays && !isNaN(options.deleteMessageDays) && !Object.hasOwnProperty.call(options, "deleteMessageSeconds")) {
      options.deleteMessageSeconds = options.deleteMessageDays * 24 * 60 * 60;
      emitDeprecation("DELETE_MESSAGE_DAYS");
      this.emit("warn", "[DEPRECATED] banGuildMember() was called with the deleteMessageDays argument");
    }
    return this.requestHandler.request("PUT", Endpoints.GUILD_BAN(guildID, userID), true, {
      delete_message_seconds: options.deleteMessageSeconds || 0,
      reason: options.reason,
    });
  }

  /**
   * Bulk ban users from a guild - Note: Requires both BAN_MEMBERS and MANAGE_GUILD permissions
   * @arg {String} guildID The ID of the guild
   * @arg {Object} options Options for banning the users
   * @arg {Array<String>} options.userIDs Array of user IDs to ban
   * @arg {Number} [options.deleteMessageSeconds=0] Number of seconds to delete messages for each user, between 0 and 604800 inclusive
   * @arg {String} [options.reason] The reason to be displayed in audit logs
   * @returns {Promise<Object>} An object with 2 arrays - `banned_users` with the IDs of the successfully banned users, and `failed_users` with the IDs of any users who could not be banned or were already banned
   */
  bulkBanGuildMembers(guildID, options) {
    return this.requestHandler.request("POST", Endpoints.GUILD_BULK_BAN(guildID), true, {
      user_ids: options.userIDs,
      delete_message_seconds: options.deleteMessageSeconds || 0,
      reason: options.reason,
    });
  }

  /**
   * Bulk create/edit global application commands
   * @arg {Array<Object>} commands An array of command objects
   * @arg {BigInt | Number | String | Permission?} commands[].defaultMemberPermissions The default permissions the user must have to use the command
   * @arg {Boolean} [commands[].defaultPermission=true] [DEPRECATED] Whether the command is enabled by default when the application is added to a guild. Replaced by `defaultMemberPermissions`
   * @arg {String} [commands[].description] The command description, required for `CHAT_INPUT` commands
   * @arg {Object?} [commands[].descriptionLocalizations] Localization directory with keys in [available locales](https://discord.dev/reference#locales) for the command description
   * @arg {Boolean?} [commands[].dmPermission=true] Whether the command is available in DMs with the app
   * @arg {String} [commands[].id] The command ID, if known
   * @arg {String} commands[].name The command name
   * @arg {Object?} [commands[].nameLocalizations] Localization directory with keys in [available locales](https://discord.dev/reference#locales) for the command name
   * @arg {Boolean} [commands[].nsfw=false] Whether the command is age-restricted
   * @arg {Array<Object>} [commands[].options] The application command [options](https://discord.dev/interactions/application-commands#application-command-object-application-command-option-structure)
   * @arg {Number} [commands[].type=1] The command type, either `1` for `CHAT_INPUT`, `2` for `USER` or `3` for `MESSAGE`
   * @returns {Promise<Array<ApplicationCommand>>} Resolves with the overwritten application commands
   */
  bulkEditCommands(commands) {
    for (const command of commands) {
      if (command.name !== undefined) {
        if (command.type === 1 || command.type === undefined) {
          command.name = command.name.toLowerCase();
          if (!command.name.match(/^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u)) {
            throw new Error("Slash Command names must match the regular expression \"^[-_\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$\"");
          }
        }
      }
      if (command.defaultPermission !== undefined) {
        emitDeprecation("DEFAULT_PERMISSION");
        this.emit("warn", "[DEPRECATED] bulkEditCommands() was called with a `defaultPermission` parameter. This has been replaced with `defaultMemberPermissions`");
        command.default_permission = command.defaultPermission;
      }
      if (command.defaultMemberPermissions !== undefined) {
        command.default_member_permissions = command.defaultMemberPermissions === null ? null : String(command.defaultMemberPermissions.allow || command.defaultMemberPermissions);
      }
      command.dm_permission = command.dmPermission;
    }
    return this.requestHandler.request("PUT", Endpoints.COMMANDS(this.application.id), true, commands).then((commands) => commands.map((command) => new ApplicationCommand(command, this)));
  }

  /**
   * Bulk create/edit guild application commands
   * @arg {String} guildID The ID of the guild
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
  bulkEditGuildCommands(guildID, commands) {
    for (const command of commands) {
      if (command.name !== undefined) {
        if (command.type === 1 || command.type === undefined) {
          command.name = command.name.toLowerCase();
          if (!command.name.match(/^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u)) {
            throw new Error("Slash Command names must match the regular expression \"^[-_\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$\"");
          }
        }
      }
      if (command.defaultMemberPermissions !== undefined) {
        command.default_member_permissions = command.defaultMemberPermissions === null ? null : String(command.defaultMemberPermissions.allow || command.defaultMemberPermissions);
      }
      if (command.defaultPermission !== undefined) {
        emitDeprecation("DEFAULT_PERMISSION");
        this.emit("warn", "[DEPRECATED] bulkEditGuildCommands() was called with a `defaultPermission` parameter. This has been replaced with `defaultMemberPermissions`");
        command.default_permission = command.defaultPermission;
      }
    }
    return this.requestHandler.request("PUT", Endpoints.GUILD_COMMANDS(this.application.id, guildID), true, commands).then((commands) => commands.map((command) => new ApplicationCommand(command, this)));
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
      self_deaf: false,
    });
    this.voiceConnections.leave(guildID);
  }

  /**
   * Tells all shards to connect. This will call `getBotGateway()`, which is ratelimited.
   * @returns {Promise} Resolves when all shards are initialized
   */
  async connect() {
    if (typeof this._token !== "string") {
      throw new Error(`Invalid token "${this._token}"`);
    }
    try {
      const data = await (this.options.maxShards === "auto" || (this.options.shardConcurrency === "auto" && this.bot) ? this.getBotGateway() : this.getGateway());
      if (!data.url || (this.options.maxShards === "auto" && !data.shards)) {
        throw new Error("Invalid response from gateway REST call");
      }
      if (data.url.includes("?")) {
        data.url = data.url.substring(0, data.url.indexOf("?"));
      }
      if (!data.url.endsWith("/")) {
        data.url += "/";
      }
      this.gatewayURL = `${data.url}?v=${Constants.GATEWAY_VERSION}&encoding=${Erlpack ? "etf" : "json"}`;

      if (this.options.compress) {
        this.gatewayURL += "&compress=zlib-stream";
      }

      if (this.options.maxShards === "auto") {
        if (!data.shards) {
          throw new Error("Failed to autoshard due to lack of data from Discord.");
        }
        this.options.maxShards = data.shards;
        if (this.options.lastShardID === undefined) {
          this.options.lastShardID = data.shards - 1;
        }
      }

      if (this.options.shardConcurrency === "auto" && data.session_start_limit && typeof data.session_start_limit.max_concurrency === "number") {
        this.shards.setConcurrency(data.session_start_limit.max_concurrency);
      }

      for (let i = this.options.firstShardID; i <= this.options.lastShardID; ++i) {
        this.shards.spawn(i);
      }
    } catch (err) {
      if (!this.options.autoreconnect) {
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
   * Create an auto moderation rule
   * @arg {String} guildID the ID of the guild to create the rule in
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
  createAutoModerationRule(guildID, options) {
    return this.requestHandler.request("POST", Endpoints.AUTO_MODERATION_RULES(guildID), true, {
      actions: options.actions,
      enabled: options.enabled,
      event_type: options.eventType,
      exempt_channels: options.exemptChannels,
      exempt_roles: options.exemptRoles,
      name: options.name,
      trigger_metadata: options.triggerMetadata,
      trigger_type: options.triggerType,
    });
  }

  /**
   * Create a channel in a guild
   * @arg {String} guildID The ID of the guild to create the channel in
   * @arg {String} name The name of the channel
   * @arg {Number} [type=0] The type of the channel, either 0 (text), 2 (voice), 4 (category), 5 (news), 13 (stage), or 15 (forum)
   * @arg {Object | String} [options] The properties the channel should have. If `options` is a string, it will be treated as `options.parentID` (see below). Passing a string is deprecated and will not be supported in future versions.
   * @arg {Array<Object>} [options.availableTags] The available tags that can be applied to threads in a forum/media channel. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#forum-tag-object) for object structure (forum/media channels only, max 20)
   * @arg {Number} [options.bitrate] The bitrate of the channel (voice channels only)
   * @arg {Number} [options.defaultAutoArchiveDuration] The default duration of newly created threads in minutes to automatically archive the thread after inactivity (60, 1440, 4320, 10080) (text/news/forum/media channels only)
   * @arg {Number} [options.defaultForumLayout] The default forum layout type used to display posts in forum channels (forum channels only)
   * @arg {Object} [options.defaultReactionEmoji] The emoji to show in the add reaction button on a thread in a forum/media channel (forum/media channels only)
   * @arg {Number} [options.defaultSortOrder] The default sort order type used to order posts in forum/media channels (forum/media channels only)
   * @arg {Number} [options.defaultThreadRateLimitPerUser] The initial rateLimitPerUser to set on newly created threads in a channel (text/forum/media channels only)
   * @arg {Boolean} [options.nsfw] The nsfw status of the channel
   * @arg {String?} [options.parentID] The ID of the parent category channel for this channel
   * @arg {Array<Object>} [options.permissionOverwrites] An array containing permission overwrite objects
   * @arg {Number} [options.position] The sorting position of the channel
   * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (0-21600) (does not affect bots or users with manageMessages/manageChannel permissions) (text/voice/stage/forum/media channels only)
   * @arg {String} [options.reason] The reason to be displayed in audit logs
   * @arg {String} [options.topic] The topic of the channel (text channels only)
   * @arg {Number} [options.userLimit] The channel user limit (voice channels only)
   * @returns {Promise<CategoryChannel | ForumChannel | TextChannel | VoiceChannel>}
   */
  createChannel(guildID, name, type, reason, options = {}) {
    if (typeof options === "string") { // This used to be parentID, back-compat
      emitDeprecation("CREATE_CHANNEL_OPTIONS");
      this.emit("warn", "[DEPRECATED] createChannel() was called with a string `options` argument");
      options = {
        parentID: options,
      };
    }
    if (typeof reason === "string") { // Reason is deprecated, will be folded into options
      emitDeprecation("CREATE_CHANNEL_OPTIONS");
      this.emit("warn", "[DEPRECATED] createChannel() was called with a string `reason` argument");
      options.reason = reason;
      reason = undefined;
    } else if (typeof reason === "object" && reason !== null) {
      options = reason;
      reason = undefined;
    }
    return this.requestHandler.request("POST", Endpoints.GUILD_CHANNELS(guildID), true, {
      name: name,
      type: type,
      available_tags: options.availableTags,
      bitrate: options.bitrate,
      default_auto_archive_duration: options.defaultAutoArchiveDuration,
      default_forum_layout: options.defaultForumLayout,
      default_reaction_emoji: options.defaultReactionEmoji,
      default_sort_order: options.defaultSortOrder,
      default_thread_rate_limit_per_user: options.defaultThreadRateLimitPerUser,
      nsfw: options.nsfw,
      parent_id: options.parentID,
      permission_overwrites: options.permissionOverwrites,
      position: options.position,
      rate_limit_per_user: options.rateLimitPerUser,
      reason: options.reason,
      topic: options.topic,
      user_limit: options.userLimit,
    }).then((channel) => Channel.from(channel, this));
  }

  /**
   * Create an invite for a channel
   * @arg {String} channelID The ID of the channel
   * @arg {Object} [options] Invite generation options
   * @arg {Number} [options.maxAge] How long the invite should last in seconds
   * @arg {Number} [options.maxUses] How many uses the invite should last for
   * @arg {String} [options.targetApplicationID] The target application id
   * @arg {Number} [options.targetType] The type of the target application
   * @arg {String} [options.targetUserID] The ID of the user whose stream should be displayed for the invite (`options.targetType` must be `1`)
   * @arg {Boolean} [options.temporary] Whether the invite grants temporary membership or not
   * @arg {Boolean} [options.unique] Whether the invite is unique or not
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Invite>}
   */
  createChannelInvite(channelID, options = {}, reason) {
    return this.requestHandler.request("POST", Endpoints.CHANNEL_INVITES(channelID), true, {
      max_age: options.maxAge,
      max_uses: options.maxUses,
      target_application_id: options.targetApplicationID,
      target_type: options.targetType,
      target_user_id: options.targetUserID,
      temporary: options.temporary,
      unique: options.unique,
      reason: reason,
    }).then((invite) => new Invite(invite, this));
  }

  /**
   * Create a channel webhook
   * @arg {String} channelID The ID of the channel to create the webhook in
   * @arg {Object} options Webhook options
   * @arg {String?} [options.avatar] The default avatar as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
   * @arg {String} options.name The default name
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Object>} Resolves with a webhook object
   */
  createChannelWebhook(channelID, options, reason) {
    options.reason = reason;
    return this.requestHandler.request("POST", Endpoints.CHANNEL_WEBHOOKS(channelID), true, options);
  }

  /**
   * Create a global application command
   * @arg {Object} command A command object
   * @arg {Number[]?} [command.contexts] Configure if the command is a user-installable GUILD=0 BOT_DM=1 PRIVATE=2 [more info](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-context-types)
   * @arg {BigInt | Number | String | Permission?} command.defaultMemberPermissions The default permissions the user must have to use the command
   * @arg {Boolean} [command.defaultPermission=true] [DEPRECATED] Whether the command is enabled by default when the application is added to a guild. Replaced by `defaultMemberPermissions`
   * @arg {String} [command.description] The command description, required for `CHAT_INPUT` commands
   * @arg {Object?} [command.descriptionLocalizations] Localization directory with keys in [available locales](https://discord.dev/reference#locales) for the command description
   * @arg {Boolean?} [command.dmPermission=true] Whether the command is available in DMs with the app
   * @arg {Number[]?} [command.integrationTypes] Configure the installation state of the slash command GUILD_INSTALL=0 USER_INSTALL=1 [more info](https://discord.com/developers/docs/resources/application#application-object-application-integration-types)
   * @arg {String} command.name The command name
   * @arg {Object?} [command.nameLocalizations] Localization directory with keys in [available locales](https://discord.dev/reference#locales) for the command name
   * @arg {Boolean} [command.nsfw=false] Whether the command is age-restricted
   * @arg {Array<Object>} [command.options] The application command [options](https://discord.dev/interactions/application-commands#application-command-object-application-command-option-structure)
   * @arg {Number} [command.type=1] The command type, either `1` for `CHAT_INPUT`, `2` for `USER` or `3` for `MESSAGE`
   * @returns {Promise<ApplicationCommand>} Resolves with the created application command
   */
  createCommand(command) {
    if (command.name !== undefined) {
      if (command.type === 1 || command.type === undefined) {
        command.name = command.name.toLowerCase();
        if (!command.name.match(/^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u)) {
          throw new Error("Slash Command names must match the regular expression \"^[-_\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$\"");
        }
      }
    }
    if (command.defaultMemberPermissions !== undefined) {
      command.default_member_permissions = command.defaultMemberPermissions === null ? null : String(command.defaultMemberPermissions.allow || command.defaultMemberPermissions);
    }
    if (command.defaultPermission !== undefined) {
      emitDeprecation("DEFAULT_PERMISSION");
      this.emit("warn", "[DEPRECATED] createCommand() was called with a `defaultPermission` parameter. This has been replaced with `defaultMemberPermissions`");
      command.default_permission = command.defaultPermission;
    }
    command.dm_permission = command.dmPermission;
    command.integration_types = command.integrationTypes;
    return this.requestHandler.request("POST", Endpoints.COMMANDS(this.application.id), true, command).then((command) => new ApplicationCommand(command, this));
  }

  /**
   * Create a group channel with other users
   * @arg  {Object} options The options for the group channel
   * @arg {Array<String>} options.acessTokens The OAuth2 access tokens of the users to add to the group. Requires them to have been authorized with the `gdm.join` scope
   * @arg {Object} [options.nicks] An object with user IDs as keys for nicknames to give the users
   * @returns {Promise<GroupChannel>}
   */
  createGroupChannel(options) {
    return this.requestHandler.request("POST", Endpoints.USER_CHANNELS("@me"), true, {
      access_tokens: options.accessTokens,
      nicks: options.nicks,
    }).then((groupChannel) => new GroupChannel(groupChannel, this));
  }

  /**
   * Create a guild
   * @arg {String} name The name of the guild
   * @arg {Object} [options] The properties of the guild
   * @arg {String} [options.afkChannelID] The ID of the AFK voice channel
   * @arg {Number} [options.afkTimeout] The AFK timeout in seconds
   * @arg {Array<Object>} [options.channels] The new channels of the guild. IDs are placeholders which allow use of category channels.
   * @arg {Number} [options.defaultNotifications] The default notification settings for the guild. 0 is "All Messages", 1 is "Only @mentions".
   * @arg {Number} [options.explicitContentFilter] The level of the explicit content filter for messages/images in the guild. 0 disables message scanning, 1 enables scanning the messages of members without roles, 2 enables scanning for all messages.
   * @arg {String} [options.icon] The guild icon as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
   * @arg {Array<Object>} [options.roles] The new roles of the guild, the first one is the @everyone role. IDs are placeholders which allow channel overwrites.
   * @arg {String} [options.systemChannelID] The ID of the system channel
   * @arg {Number} [options.verificationLevel] The guild verification level
   * @returns {Promise<Guild>}
   */
  createGuild(name, options = {}) {
    if (this.guilds.size > 9) {
      throw new Error("This method can't be used when in 10 or more guilds.");
    }

    return this.requestHandler.request("POST", Endpoints.GUILDS, true, {
      name: name,
      icon: options.icon,
      verification_level: options.verificationLevel,
      default_message_notifications: options.defaultNotifications,
      explicit_content_filter: options.explicitContentFilter,
      system_channel_id: options.systemChannelID,
      afk_channel_id: options.afkChannelID,
      afk_timeout: options.afkTimeout,
      roles: options.roles,
      channels: options.channels,
    }).then((guild) => new Guild(guild, this));
  }

  /**
   * Create a guild application command
   * @arg {String} guildID The ID of the guild
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
  createGuildCommand(guildID, command) {
    if (command.name !== undefined) {
      if (command.type === 1 || command.type === undefined) {
        command.name = command.name.toLowerCase();
        if (!command.name.match(/^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u)) {
          throw new Error("Slash Command names must match the regular expression \"^[-_\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$\"");
        }
      }
    }
    if (command.defaultMemberPermissions !== undefined) {
      command.default_member_permissions = command.defaultMemberPermissions === null ? null : String(command.defaultMemberPermissions.allow || command.defaultMemberPermissions);
    }
    if (command.defaultPermission !== undefined) {
      emitDeprecation("DEFAULT_PERMISSION");
      this.emit("warn", "[DEPRECATED] createGuildCommand() was called with a `defaultPermission` parameter. This has been replaced with `defaultMemberPermissions`");
      command.default_permission = command.defaultPermission;
    }
    return this.requestHandler.request("POST", Endpoints.GUILD_COMMANDS(this.application.id, guildID), true, command).then((command) => new ApplicationCommand(command, this));
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
      icon,
    }).then((guild) => new Guild(guild, this));
  }

  /**
   * Create a guild scheduled event
   * @arg {String} guildID The guild ID where the event will be created
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
  createGuildScheduledEvent(guildID, event, reason) {
    return this.requestHandler.request("POST", Endpoints.GUILD_SCHEDULED_EVENTS(guildID), true, {
      channel_id: event.channelID,
      description: event.description,
      entity_metadata: event.entityMetadata,
      entity_type: event.entityType,
      image: event.image,
      name: event.name,
      privacy_level: event.privacyLevel,
      scheduled_end_time: event.scheduledEndTime,
      scheduled_start_time: event.scheduledStartTime,
      reason: reason,
    }).then((data) => new GuildScheduledEvent(data, this));
  }

  /**
   * Create a guild soundboard sound
   * @arg {String} guildID The guild ID where the sound will be created
   * @arg {Object} sound The sound to be created
   * @arg {String?} [sound.emojiID] The ID of the relating custom emoji (mutually exclusive with sound.emojiName)
   * @arg {String?} [sound.emojiName] The name of the relating default emoji (mutually exclusive with sound.emojiID)
   * @arg {String} sound.name The name of the soundboard sound (2-32 characters)
   * @arg {String} sound.sound The base 64 encoded mp3/ogg sound data
   * @arg {Number?} [sound.volume=1] The volume of the soundboard sound, between 0 and 1
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<SoundboardSound>}
   */
  createGuildSoundboardSound(guildID, sound, reason) {
    sound.emoji_id = sound.emojiID;
    sound.emoji_name = sound.emojiName;
    sound.reason = reason;
    return this.requestHandler.request("POST", Endpoints.SOUNDBOARD_SOUNDS_GUILD(guildID), true, sound).then((sound) => new SoundboardSound(sound, this));
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
  createGuildSticker(guildID, options, reason) {
    return this.requestHandler.request("POST", Endpoints.GUILD_STICKERS(guildID), true, {
      description: options.description || "",
      name: options.name,
      tags: options.tags,
      reason: reason,
    }, options.file);
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
      description,
    }).then((template) => new GuildTemplate(template, this));
  }

  /**
   * Respond to the interaction with a message
   * Note: Use webhooks if you have already responded with an interaction response.
   * @arg {String} interactionID The interaction ID.
   * @arg {String} interactionToken The interaction Token.
   * @arg {Object} options The options object.
   * @arg {Object} [options.data] The data to send with the response. For response types 4 and 7, see [here](https://discord.dev/interactions/receiving-and-responding#interaction-response-object-messages). For response type 8, see [here](https://discord.dev/interactions/receiving-and-responding#interaction-response-object-autocomplete). For response type 9, see [here](https://discord.dev/interactions/receiving-and-responding#interaction-response-object-modal)
   * @arg {Number} options.type The response type to send. See [the official Discord API documentation entry](https://discord.dev/interactions/receiving-and-responding#interaction-response-object-interaction-callback-type) for valid types
   * @arg {Object | Array<Object>} [file] A file object (or an Array of them)
   * @arg {Buffer} file.file A buffer containing file data
   * @arg {String} file.name What to name the file
   * @returns {Promise}
   */
  createInteractionResponse(interactionID, interactionToken, options, file) {
    if (options.data && options.data.embed) {
      if (!options.data.embeds) {
        options.data.embeds = [];
      }
      options.data.embeds.push(options.data.embed);
    }
    if (options.data && options.data.allowedMentions) {
      options.data.allowed_mentions = this._formatAllowedMentions(options.data.allowedMentions);
    }
    if (file) {
      options = { payload_json: options };
    }
    return this.requestHandler.request("POST", Endpoints.INTERACTION_RESPOND(interactionID, interactionToken), true, options, file, "/interactions/:id/:token/callback");
  }

  /**
   * Create a message in a channel
   * Note: If you want to DM someone, the user ID is **not** the DM channel ID. use Client.getDMChannel() to get the DM channel for a user
   * @arg {String} channelID The ID of the channel
   * @arg {String | Object} content A string or object. If an object is passed:
   * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
   * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here
   * @arg {Boolean} [content.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to
   * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow
   * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow
   * @arg {Array<Object>} [content.attachments] An array of attachment objects with the filename and description
   * @arg {String} [content.attachments[].description] The description of the file
   * @arg {String} [content.attachments[].filename] The name of the file
   * @arg {Number} content.attachments[].id The index of the file
   * @arg {Array<Object>} [content.components] An array of component objects
   * @arg {String} [content.components[].custom_id] The ID of the component (type 2 style 0-4 and type 3,5,6,7,8 only)
   * @arg {Boolean} [content.components[].disabled] Whether the component is disabled (type 2 and 3,5,6,7,8 only)
   * @arg {Object} [content.components[].emoji] The emoji to be displayed in the component (type 2)
   * @arg {String} [content.components[].label] The label to be displayed in the component (type 2)
   * @arg {Array<Object>} [content.components[].default_values] default values for the component (type 5,6,7,8 only)
   * @arg {String} [content.components[].default_values[].id] id of a user, role, or channel
   * @arg {String} [content.components[].default_values[].type] type of value that id represents (user, role, or channel)
   * @arg {Number} [content.components[].max_values] The maximum number of items that can be chosen (1-25, default 1)
   * @arg {Number} [content.components[].min_values] The minimum number of items that must be chosen (0-25, default 1)
   * @arg {Array<Object>} [content.components[].options] The options for this component (type 3 only)
   * @arg {Boolean} [content.components[].options[].default] Whether this option should be the default value selected
   * @arg {String} [content.components[].options[].description] The description for this option
   * @arg {Object} [content.components[].options[].emoji] The emoji to be displayed in this option
   * @arg {String} content.components[].options[].label The label for this option
   * @arg {Number | String} content.components[].options[].value The value for this option
   * @arg {String} [content.components[].placeholder] The placeholder text for the component when no option is selected (type 3,5,6,7,8 only)
   * @arg {Number} [content.components[].style] The style of the component (type 2 only) - If 0-4, `custom_id` is required; if 5, `url` is required
   * @arg {Number} content.components[].type The type of component - If 1, it is a collection and a `components` array (nested) is required; if 2, it is a button; if 3, it is a string select; if 5, it is a user select; if 6, it is a role select; if 7, it is a mentionable select; if 8, it is a channel select
   * @arg {String} [content.components[].url] The URL that the component should open for users (type 2 style 5 only)
   * @arg {String} [content.content] A content string
   * @arg {Object} [content.embed] [DEPRECATED] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @arg {Array<Object>} [content.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @arg {Boolean} [content.enforceNonce] If true and `content.nonce` is present, if multiple messages are sent with the same nonce within a few minutes of each other, that message will be returned and no new message created
   * @arg {Object} [content.messageReference] The message reference, used when replying to or forwarding messages
   * @arg {String} [content.messageReference.channelID] The channel ID of the referenced message. Required when forwarding messages
   * @arg {Boolean} [content.messageReference.failIfNotExists=true] Whether to throw an error if the message reference doesn't exist. If false, and the referenced message doesn't exist, the message is created without a referenced message
   * @arg {String} [content.messageReference.guildID] The guild ID of the referenced message
   * @arg {String} content.messageReference.messageID The message ID of the referenced message. This cannot reference a system message
   * @arg {String} [content.messageReference.type=0] The type of reference. Either `0` (REPLY) or `1` (FORWARDED). Will become required in the future
   * @arg {String} [content.messageReferenceID] [DEPRECATED] The ID of the message should be replied to. Use `messageReference` instead
   * @arg {String | Number} [content.nonce] A nonce value which will also appear in the messageCreate event
   * @arg {Object} [content.poll] A poll object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/poll#poll-object) for object structure
   * @arg {Array<String>} [content.stickerIDs] An array of IDs corresponding to stickers to send
   * @arg {Boolean} [content.tts] Set the message TTS flag
   * @arg {Object | Array<Object>} [file] A file object (or an Array of them)
   * @arg {Buffer} file.file A buffer containing file data
   * @arg {String} file.name What to name the file
   * @returns {Promise<Message>}
   */
  createMessage(channelID, content, file) {
    if (content !== undefined) {
      if (typeof content !== "object" || content === null) {
        content = {
          content: "" + content,
        };
      } else if (content.content !== undefined && typeof content.content !== "string") {
        content.content = "" + content.content;
      } else if (content.embed) {
        if (!content.embeds) {
          content.embeds = [];
        }
        content.embeds.push(content.embed);
      }
      content.allowed_mentions = this._formatAllowedMentions(content.allowedMentions);
      content.enforce_nonce = content.enforceNonce;
      content.sticker_ids = content.stickerIDs;
      if (content.messageReference) {
        content.message_reference = content.messageReference;
        if (content.messageReference.messageID !== undefined) {
          content.message_reference.message_id = content.messageReference.messageID;
          content.messageReference.messageID = undefined;
        }
        if (content.messageReference.channelID !== undefined) {
          content.message_reference.channel_id = content.messageReference.channelID;
          content.messageReference.channelID = undefined;
        }
        if (content.messageReference.guildID !== undefined) {
          content.message_reference.guild_id = content.messageReference.guildID;
          content.messageReference.guildID = undefined;
        }
        if (content.messageReference.failIfNotExists !== undefined) {
          content.message_reference.fail_if_not_exists = content.messageReference.failIfNotExists;
          content.messageReference.failIfNotExists = undefined;
        }
      } else if (content.messageReferenceID) {
        emitDeprecation("MESSAGE_REFERENCE");
        this.emit("warn", "[DEPRECATED] content.messageReferenceID is deprecated. Use content.messageReference instead");
        content.message_reference = { message_id: content.messageReferenceID };
      }
      if (file) {
        content = { payload_json: content };
      }
    }
    return this.requestHandler.request("POST", Endpoints.CHANNEL_MESSAGES(channelID), true, content, file).then((message) => new Message(message, this));
  }

  /**
   * Create a guild role
   * @arg {String} guildID The ID of the guild to create the role in
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
  createRole(guildID, options, reason) {
    if (options.permissions !== undefined) {
      options.permissions = options.permissions instanceof Permission ? String(options.permissions.allow) : String(options.permissions);
    }
    return this.requestHandler.request("POST", Endpoints.GUILD_ROLES(guildID), true, {
      name: options.name,
      permissions: options.permissions,
      color: options.color,
      hoist: options.hoist,
      icon: options.icon,
      mentionable: options.mentionable,
      unicode_emoji: options.unicodeEmoji,
      reason: reason,
    }).then((role) => {
      const guild = this.guilds.get(guildID);
      if (guild) {
        return guild.roles.add(role, guild);
      } else {
        return new Role(role);
      }
    });
  }

  /**
   * Create a stage instance
   * @arg {String} channelID The ID of the stage channel to create the instance in
   * @arg {Object} options The stage instance options
   * @arg {Number} [options.privacyLevel] The privacy level of the stage instance. 1 is public, 2 is guild only
   * @arg {String} options.topic The stage instance topic
   * @returns {Promise<StageInstance>}
   */
  createStageInstance(channelID, options) {
    return this.requestHandler.request("POST", Endpoints.STAGE_INSTANCES, true, {
      channel_id: channelID,
      privacy_level: options.privacyLevel,
      topic: options.topic,
    }).then((instance) => new StageInstance(instance, this));
  }

  /**
   * Create a thread in a channel
   * @arg {String} channelID The ID of the channel
   * @arg {Object} options The thread options
   * @arg {Array<String>} [options.appliedTags] The IDs of the set of tags that have been applied to a thread in a forum/media channel (threads created in forum/media channels only, max 5)
   * @arg {Number} [options.autoArchiveDuration] The duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080
   * @arg {Boolean} [options.invitable] Whether non-moderators can add other non-moderators to the thread (private threads only)
   * @arg {Object} [options.message] The message to create with the thread (only use when creating a thread inside of a thread-only channel). Note: When creating a forum/media channel thread, you must provide at least one of `content`, `embeds`, `stickerIDs`, `components`, or `files`
   * @arg {Object} [options.message.allowedMentions] A list of mentions to allow (overrides default)
   * @arg {Boolean} [options.message.allowedMentions.everyone] Whether or not to allow @everyone/@here
   * @arg {Boolean} [options.message.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to
   * @arg {Boolean | Array<String>} [options.message.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow
   * @arg {Boolean | Array<String>} [options.message.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow
   * @arg {Array<Object>} [options.message.attachments] An array of attachment objects with the filename and description
   * @arg {String} [options.message.attachments[].description] The description of the file
   * @arg {String} [options.message.attachments[].filename] The name of the file
   * @arg {Number} options.message.attachments[].id The index of the file
   * @arg {Array<Object>} [options.message.components] An array of component objects
   * @arg {String} [options.message.components[].custom_id] The ID of the component (type 2 style 0-4 and type 3,5,6,7,8 only)
   * @arg {Boolean} [options.message.components[].disabled] Whether the component is disabled (type 2 and 3,5,6,7,8 only)
   * @arg {Object} [options.message.components[].emoji] The emoji to be displayed in the component (type 2)
   * @arg {String} [options.message.components[].label] The label to be displayed in the component (type 2)
   * @arg {Array<Object>} [options.components[].default_values] default values for the component (type 5,6,7,8 only)
   * @arg {String} [options.components[].default_values[].id] id of a user, role, or channel
   * @arg {String} [options.components[].default_values[].type] type of value that id represents (user, role, or channel)
   * @arg {Number} [options.message.components[].max_values] The maximum number of items that can be chosen (1-25, default 1)
   * @arg {Number} [options.message.components[].min_values] The minimum number of items that must be chosen (0-25, default 1)
   * @arg {Array<Object>} [options.message.components[].options] The options for this component (type 3 only)
   * @arg {Boolean} [options.message.components[].options[].default] Whether this option should be the default value selected
   * @arg {String} [options.message.components[].options[].description] The description for this option
   * @arg {Object} [options.message.components[].options[].emoji] The emoji to be displayed in this option
   * @arg {String} options.message.components[].options[].label The label for this option
   * @arg {Number | String} options.message.components[].options[].value The value for this option
   * @arg {String} [options.message.components[].placeholder] The placeholder text for the component when no option is selected (type 3,5,6,7,8 only)
   * @arg {Number} [options.message.components[].style] The style of the component (type 2 only) - If 0-4, `custom_id` is required; if 5, `url` is required
   * @arg {Number} options.components[].type The type of component - If 1, it is a collection and a `components` array (nested) is required; if 2, it is a button; if 3, it is a string select; if 5, it is a user select; if 6, it is a role select; if 7, it is a mentionable select; if 8, it is a channel select
   * @arg {String} [options.message.components[].url] The URL that the component should open for users (type 2 style 5 only)
   * @arg {String} [options.message.content] A string containing the message content
   * @arg {Array<Object>} [options.message.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @arg {Array<String>} [options.message.stickerIDs] An array of IDs corresponding to stickers to send
   * @arg {String} options.name The thread channel name
   * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (0-21600) (does not affect bots or users with manageMessages/manageChannel permissions)
   * @arg {String} [options.reason] The reason to be displayed in audit logs
   * @arg {Number} [options.type] The channel type of the thread to create. Either `10` (announcement thread, announcement channels only), `11` (public thread) or `12` (private thread). Note: Not required when creating a thread inside of a forum/media channel, it will always be public
   * @arg {Object | Array<Object>} [file] A file object (or an Array of them). Only use when creating a thread inside of a forum/media channel
   * @arg {Buffer} file.file A buffer containing file data
   * @arg {String} file.name What to name the file
   * @returns {Promise<NewsThreadChannel | PublicThreadChannel | PrivateThreadChannel>}
   */
  createThread(channelID, options, file) {
    if (options.message) {
      options.message.allowed_mentions = this._formatAllowedMentions(options.message.allowedMentions);
      options.message.sticker_ids = options.message.stickerIDs;
    }
    let payload = {
      applied_tags: options.appliedTags,
      auto_archive_duration: options.autoArchiveDuration,
      invitable: options.invitable,
      message: options.message,
      name: options.name,
      rate_limit_per_user: options.rateLimitPerUser,
      reason: options.reason,
      type: options.type,
    };
    if (file) {
      payload = { payload_json: payload };
    }
    return this.requestHandler.request("POST", Endpoints.THREAD_WITHOUT_MESSAGE(channelID), true, payload, file).then((channel) => Channel.from(channel, this));
  }

  /**
   * Create a thread with an existing message
   * @arg {String} channelID The ID of the channel
   * @arg {String} messageID The ID of the message to create the thread from
   * @arg {Object} options The thread options
   * @arg {Number} [options.autoArchiveDuration] Duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080
   * @arg {String} options.name The thread channel name
   * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (0-21600) (does not affect bots or users with manageMessages/manageChannel permissions)
   * @arg {String} [options.reason] The reason to be displayed in audit logs
   * @returns {Promise<NewsThreadChannel | PublicThreadChannel>}
   */
  createThreadWithMessage(channelID, messageID, options) {
    return this.requestHandler.request("POST", Endpoints.THREAD_WITH_MESSAGE(channelID, messageID), true, {
      auto_archive_duration: options.autoArchiveDuration,
      name: options.name,
      rate_limit_per_user: options.rateLimitPerUser,
      reason: options.reason,
    }).then((channel) => Channel.from(channel, this));
  }

  /**
   * [DEPRECATED] Create a thread without an existing message. Use `createThread` instead
   * @arg {String} channelID The ID of the channel
   * @arg {Object} options The thread options
   * @arg {Number} [options.autoArchiveDuration] Duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080
   * @arg {Boolean} [options.invitable] Whether non-moderators can add other non-moderators to the thread (private threads only)
   * @arg {String} options.name The thread channel name
   * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (0-21600) (does not affect bots or users with manageMessages/manageChannel permissions)
   * @arg {String} [options.reason] The reason to be displayed in audit logs
   * @arg {Number} [options.type] The channel type of the thread to create. Either `10` (announcement thread, announcement channels only), `11` (public thread) or `12` (private thread)
   * @returns {Promise<NewsThreadChannel | PublicThreadChannel | PrivateThreadChannel>}
   */
  createThreadWithoutMessage(channelID, options) {
    emitDeprecation("CREATE_THREAD_WITHOUT_MESSAGE");
    this.emit("warn", "[DEPRECATED] createThreadWithoutMessage() is deprecated. Use createThread() instead.");
    return this.requestHandler.request("POST", Endpoints.THREAD_WITHOUT_MESSAGE(channelID), true, {
      auto_archive_duration: options.autoArchiveDuration,
      invitable: options.invitable,
      name: options.name,
      type: options.type,
    }).then((channel) => Channel.from(channel, this));
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
   * Delete an auto moderation rule
   * @arg {String} guildID The guildID to delete the rule from
   * @arg {String} ruleID The ID of the rule to delete
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  deleteAutoModerationRule(guildID, ruleID, reason) {
    return this.requestHandler.request("DELETE", Endpoints.AUTO_MODERATION_RULE(guildID, ruleID), true, {
      reason,
    });
  }

  /**
   * Delete a guild channel, or leave a DM channel
   * @arg {String} channelID The ID of the channel
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<CateogryChannel | DMChannel | GroupChannel | NewsChannel | StageChannel | TextChannel | VoiceChannel>}
   */
  deleteChannel(channelID, reason) {
    return this.requestHandler.request("DELETE", Endpoints.CHANNEL(channelID), true, {
      reason,
    }).then((channel) => Channel.from(channel, this));
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
      reason,
    });
  }

  /**
   * Delete a global application command
   * @arg {String} commandID The command id
   * @returns {Promise}
   */
  deleteCommand(commandID) {
    if (!commandID) {
      throw new Error("You must provide an id of the command to delete.");
    }
    return this.requestHandler.request("DELETE", Endpoints.COMMAND(this.application.id, commandID), true);
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
   * Delete a guild application command
   * @arg {String} guildID The guild ID
   * @arg {String} commandID The command id
   * @returns {Promise}
   */
  deleteGuildCommand(guildID, commandID) {
    if (!guildID) {
      throw new Error("You must provide an id of the guild which the command is in.");
    }
    if (!commandID) {
      throw new Error("You must provide an id of the command to delete.");
    }
    return this.requestHandler.request("DELETE", Endpoints.GUILD_COMMAND(this.application.id, guildID, commandID), true);
  }

  /**
   * Delete a guild discovery subcategory
   * @arg {String} guildID The ID of the guild
   * @arg {String} categoryID The ID of the discovery category
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  deleteGuildDiscoverySubcategory(guildID, categoryID, reason) {
    return this.requestHandler.request("DELETE", Endpoints.GUILD_DISCOVERY_CATEGORY(guildID, categoryID), true, { reason });
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
      reason,
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
   * Delete a guild scheduled event
   * @arg {String} guildID The ID of the guild
   * @arg {String} eventID The ID of the event
   * @returns {Promise}
   */
  deleteGuildScheduledEvent(guildID, eventID) {
    return this.requestHandler.request("DELETE", Endpoints.GUILD_SCHEDULED_EVENT(guildID, eventID), true);
  }

  /**
   * Delete a guild soundboard sound
   * @arg {String} guildID The ID of the guild
   * @arg {String} soundID The ID of the soundboard sound
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  deleteGuildSoundboardSound(guildID, soundID, reason) {
    return this.requestHandler.request("DELETE", Endpoints.SOUNDBOARD_SOUND_GUILD(guildID, soundID), true, { reason });
  }

  /**
   * Delete a guild sticker
   * @arg {String} guildID The ID of the guild
   * @arg {String} stickerID The ID of the sticker
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  deleteGuildSticker(guildID, stickerID, reason) {
    return this.requestHandler.request("DELETE", Endpoints.GUILD_STICKER(guildID, stickerID), true, {
      reason,
    });
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
      reason,
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
      reason,
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
    if (messageIDs.length === 0) {
      return Promise.resolve();
    }
    if (messageIDs.length === 1) {
      return this.deleteMessage(channelID, messageIDs[0], reason);
    }

    const oldestAllowedSnowflake = (Date.now() - 1421280000000) * 4194304;
    const invalidMessage = messageIDs.find((messageID) => messageID < oldestAllowedSnowflake);
    if (invalidMessage) {
      return Promise.reject(new Error(`Message ${invalidMessage} is more than 2 weeks old.`));
    }

    if (messageIDs.length > 100) {
      return this.requestHandler.request("POST", Endpoints.CHANNEL_BULK_DELETE(channelID), true, {
        messages: messageIDs.splice(0, 100),
        reason: reason,
      }).then(() => this.deleteMessages(channelID, messageIDs, reason));
    }
    return this.requestHandler.request("POST", Endpoints.CHANNEL_BULK_DELETE(channelID), true, {
      messages: messageIDs,
      reason: reason,
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
      reason,
    });
  }

  /**
   * Delete a stage instance
   * @arg {String} channelID The stage channel associated with the instance
   * @returns {Promise}
   */
  deleteStageInstance(channelID) {
    return this.requestHandler.request("DELETE", Endpoints.STAGE_INSTANCE(channelID), true);
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
      reason,
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
   * edit an existing auto moderation rule
   * @arg {String} guildID the ID of the guild to edit the rule in
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
  editAutoModerationRule(guildID, ruleID, options) {
    return this.requestHandler.request("PATCH", Endpoints.AUTO_MODERATION_RULE(guildID, ruleID), true, {
      actions: options.actions,
      enabled: options.enabled,
      event_type: options.eventType,
      exempt_channels: options.exemptChannels,
      exempt_roles: options.exemptRoles,
      name: options.name,
      trigger_metadata: options.triggerMetadata,
      trigger_type: options.triggerType,
    });
  }

  /**
   * Edit a channel's properties
   * @arg {String} channelID The ID of the channel
   * @arg {Object} options The properties to edit
   * @arg {Array<String>} [options.appliedTags] The IDs of the set of tags that have been applied to a thread in a forum/media channel (threads created in forum/media channels only, max 5)
   * @arg {Boolean} [options.archived] The archive status of the channel (thread channels only)
   * @arg {Number} [options.autoArchiveDuration] The duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080 (thread channels only)
   * @arg {Array<Object>} [options.availableTags] The available tags that can be applied to threads in a forum/media channel. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#forum-tag-object) for object structure (forum/media channels only, max 20)
   * @arg {Number} [options.bitrate] The bitrate of the channel (guild voice channels only)
   * @arg {Number} [options.defaultAutoArchiveDuration] The default duration of newly created threads in minutes to automatically archive the thread after inactivity (60, 1440, 4320, 10080) (text/news/forum/media channels only)
   * @arg {Number} [options.defaultForumLayout] The default forum layout type used to display posts in forum channels (forum channels only)
   * @arg {Object} [options.defaultReactionEmoji] The emoji to show in the add reaction button on a thread in a forum/media channel (forum/media channels only)
   * @arg {Number} [options.defaultSortOrder] The default sort order type used to order posts in forum/media channels (forum/media channels only)
   * @arg {Number} [options.defaultThreadRateLimitPerUser] The initial rateLimitPerUser to set on newly created threads in a channel (text/forum/media channels only)
   * @arg {Number} [options.flags] The flags for the channel combined as a bitfield (thread/forum/media channels only). Note: `PINNED` can only be set for threads in forum/media channels, `REQUIRE_TAG` can only be set for forum/media channels, and `HIDE_MEDIA_DOWNLOAD_OPTIONS` can only be set for media channels
   * @arg {String} [options.icon] The icon of the channel as a base64 data URI (group channels only). Note: base64 strings alone are not base64 data URI strings
   * @arg {Boolean} [options.invitable] Whether non-moderators can add other non-moderators to the channel (private thread channels only)
   * @arg {Boolean} [options.locked] The lock status of the channel (thread channels only)
   * @arg {String} [options.name] The name of the channel
   * @arg {Boolean} [options.nsfw] The nsfw status of the channel (guild channels only)
   * @arg {String?} [options.parentID] The ID of the parent channel category for this channel (guild text/voice channels only)
   * @arg {Array<Object>} [options.permissionOverwrites] An array containing permission overwrite objects
   * @arg {Number} [options.position] The sorting position of the channel (guild channels only)
   * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (0-21600) (does not affect bots or users with manageMessages/manageChannel permissions) (text/voice/stage/forum/media channels only)
   * @arg {String?} [options.rtcRegion] The RTC region ID of the channel (automatic if `null`) (guild voice channels only)
   * @arg {String} [options.topic] The topic of the channel (guild text channels only)
   * @arg {Number} [options.userLimit] The channel user limit (guild voice channels only)
   * @arg {Number} [options.videoQualityMode] The camera video quality mode of the channel (guild voice channels only). `1` is auto, `2` is 720p
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<CategoryChannel | ForumChannel | GroupChannel | NewsChannel | NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel | TextChannel | VoiceChannel>}
   */
  editChannel(channelID, options, reason) {
    return this.requestHandler.request("PATCH", Endpoints.CHANNEL(channelID), true, {
      applied_tags: options.appliedTags,
      archived: options.archived,
      auto_archive_duration: options.autoArchiveDuration,
      available_tags: options.availableTags,
      bitrate: options.bitrate,
      default_auto_archive_duration: options.defaultAutoArchiveDuration,
      default_forum_layout: options.defaultForumLayout,
      default_reaction_emoji: options.defaultReactionEmoji,
      default_sort_order: options.defaultSortOrder,
      default_thread_rate_limit_per_user: options.defaultThreadRateLimitPerUser,
      flags: options.flags,
      icon: options.icon,
      invitable: options.invitable,
      locked: options.locked,
      name: options.name,
      nsfw: options.nsfw,
      parent_id: options.parentID,
      position: options.position,
      rate_limit_per_user: options.rateLimitPerUser,
      rtc_region: options.rtcRegion,
      topic: options.topic,
      user_limit: options.userLimit,
      video_quality_mode: options.videoQualityMode,
      permission_overwrites: options.permissionOverwrites,
      reason: reason,
    }).then((channel) => Channel.from(channel, this));
  }

  /**
   * Create a channel permission overwrite
   * @arg {String} channelID The ID of channel
   * @arg {String} overwriteID The ID of the overwritten user or role (everyone role ID = guild ID)
   * @arg {BigInt} allow The permissions number for allowed permissions
   * @arg {BigInt} deny The permissions number for denied permissions
   * @arg {Number} type The object type of the overwrite, either 1 for "member" or 0 for "role"
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  editChannelPermission(channelID, overwriteID, allow, deny, type, reason) {
    if (typeof type === "string") { // backward compatibility
      type = type === "member" ? 1 : 0;
    }
    return this.requestHandler.request("PUT", Endpoints.CHANNEL_PERMISSION(channelID, overwriteID), true, {
      allow,
      deny,
      type,
      reason,
    });
  }

  /**
   * Edit a guild channel's position. Note that channel position numbers are grouped by type (category, text, voice), then sorted in ascending order (lowest number is on top).
   * @arg {String} channelID The ID of the channel
   * @arg {Number} position The new position of the channel
   * @arg {Object} [options] Additional options when editing position
   * @arg {Boolean} [options.lockPermissions] Whether to sync the channel's permissions with the new parent, if changing parents
   * @arg {String} [options.parentID] The new parent ID (category channel) for the channel that is moved
   * @returns {Promise}
   */
  editChannelPosition(channelID, position, options = {}) {
    let channels = this.guilds.get(this.channelGuildMap[channelID]).channels;
    const channel = channels.get(channelID);
    if (!channel) {
      return Promise.reject(new Error(`Channel ${channelID} not found`));
    }
    if (channel.position === position) {
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
    if (position > channel.position) {
      channels.push(channel);
    } else {
      channels.unshift(channel);
    }
    return this.requestHandler.request("PATCH", Endpoints.GUILD_CHANNELS(this.channelGuildMap[channelID]), true, channels.map((channel, index) => ({
      id: channel.id,
      position: index + min,
      lock_permissions: options.lockPermissions,
      parent_id: options.parentID,
    })));
  }

  /**
   * Edit multiple guild channels' positions. Note that channel position numbers are grouped by type (category, text, voice), then sorted in ascending order (lowest number is on top).
   * @arg {String} guildID The ID of the guild
   * @arg {Array<Object>} channelPositions An array of [ChannelPosition](https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions)
   * @arg {String} channelPositions[].id The ID of the channel
   * @arg {Boolean} [channelPositions[].lockPermissions] Whether to sync the channel's permissions with the new parent, if changing parents
   * @arg {String} [channelPositions[].parentID] The new parent ID (category channel) for the channel that is moved. For each request, only one channel can change parents
   * @arg {Number} channelPositions[].position The new position of the channel
   * @returns {Promise}
   */
  editChannelPositions(guildID, channelPositions) {
    return this.requestHandler.request("PATCH", Endpoints.GUILD_CHANNELS(guildID), true, channelPositions.map((channelPosition) => {
      return {
        id: channelPosition.id,
        position: channelPosition.position,
        lock_permissions: channelPosition.lockPermissions,
        parent_id: channelPosition.parentID,
      };
    }));
  }

  /**
   * Edit a global application command
   * @arg {String} commandID The command ID
   * @arg {Object} command A command object
   * @arg {BigInt | Number | String | Permission?} [command.defaultMemberPermissions] The default permissions the user must have to use the command
   * @arg {Boolean} [command.defaultPermission] [DEPRECATED] Whether the command is enabled by default when the application is added to a guild. Replaced by `defaultMemberPermissions`
   * @arg {String} [command.description] The command description, required for `CHAT_INPUT` commands
   * @arg {Object?} [command.descriptionLocalizations] Localization directory with keys in [available locales](https://discord.dev/reference#locales) for the command description
   * @arg {Boolean?} [command.dmPermission=true] Whether the command is available in DMs with the app
   * @arg {String} [command.name] The command name
   * @arg {Object?} [command.nameLocalizations] Localization directory with keys in [available locales](https://discord.dev/reference#locales) for the command name
   * @arg {Boolean} [command.nsfw] Whether the command is age-restricted
   * @arg {Array<Object>} [command.options] The application command [options](https://discord.dev/interactions/application-commands#application-command-object-application-command-option-structure)
   * @returns {Promise<ApplicationCommand>} Resolves with the edited application command
   */
  editCommand(commandID, command) {
    if (!commandID) {
      throw new Error("You must provide an id of the command to edit.");
    }
    if (command.name !== undefined) {
      if (command.type === 1 || command.type === undefined) {
        command.name = command.name.toLowerCase();
        if (!command.name.match(/^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u)) {
          throw new Error("Slash Command names must match the regular expression \"^[-_\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$\"");
        }
      }
    }
    if (command.defaultPermission !== undefined) {
      emitDeprecation("DEFAULT_PERMISSION");
      this.emit("warn", "[DEPRECATED] editCommand() was called with a `defaultPermission` parameter. This has been replaced with `defaultMemberPermissions`");
      command.default_permission = command.defaultPermission;
    }
    if (command.defaultMemberPermissions !== undefined) {
      command.default_member_permissions = command.defaultMemberPermissions === null ? null : String(command.defaultMemberPermissions.allow || command.defaultMemberPermissions);
    }
    command.dm_permission = command.dmPermission;
    return this.requestHandler.request("PATCH", Endpoints.COMMAND(this.application.id, commandID), true, command).then((command) => new ApplicationCommand(command, this));
  }

  /**
   * Edits command permissions for a specific command in a guild.
   * Note: You can only add up to 10 permission overwrites for a command.
   * @arg {String} guildID The guild ID
   * @arg {String} commandID The command id
   * @arg {Array<Object>} permissions An array of [permissions objects](https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permissions-structure)
   * @returns {Promise<Object>} Resolves with a [GuildApplicationCommandPermissions](https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-guild-application-command-permissions-structure) object.
   * @arg {String} [reason] The reason to be displayed in audit logs
   */
  editCommandPermissions(guildID, commandID, permissions, reason) {
    if (!guildID) {
      throw new Error("You must provide an id of the guild whose permissions you want to edit.");
    }
    if (!commandID) {
      throw new Error("You must provide an id of the command whose permissions you want to edit.");
    }
    return this.requestHandler.request("PUT", Endpoints.COMMAND_PERMISSIONS(this.application.id, guildID, commandID), true, { permissions, reason });
  }

  /**
   * Edit a guild
   * @arg {String} guildID The ID of the guild
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
   * @arg {String} [options.ownerID] The ID of the user to transfer server ownership to (bot user must be owner)
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
  editGuild(guildID, options, reason) {
    return this.requestHandler.request("PATCH", Endpoints.GUILD(guildID), true, {
      name: options.name,
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
      safety_alerts_channel_id: options.safetyAlertsChannelID,
      reason: reason,
    }).then((guild) => new Guild(guild, this));
  }

  /**
   * Edit a guild application command
   * @arg {String} guildID The ID of the guild
   * @arg {String} commandID The ID of the command
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
  editGuildCommand(guildID, commandID, command) {
    if (!commandID) {
      throw new Error("You must provide an id of the command to edit.");
    }
    if (command.name !== undefined) {
      if (command.type === 1 || command.type === undefined) {
        command.name = command.name.toLowerCase();
        if (!command.name.match(/^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u)) {
          throw new Error("Slash Command names must match the regular expression \"^[-_\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$\"");
        }
      }
    }
    if (command.defaultMemberPermissions !== undefined) {
      command.default_member_permissions = command.defaultMemberPermissions === null ? null : String(command.defaultMemberPermissions.allow || command.defaultMemberPermissions);
    }
    if (command.defaultPermission !== undefined) {
      emitDeprecation("DEFAULT_PERMISSION");
      this.emit("warn", "[DEPRECATED] editGuildCommand() was called with a `defaultPermission` parameter. This has been replaced with `defaultMemberPermissions`");
      command.default_permission = command.defaultPermission;
    }
    return this.requestHandler.request("PATCH", Endpoints.GUILD_COMMAND(this.application.id, guildID, commandID), true, command).then((command) => new ApplicationCommand(command, this));
  }

  /**
   * Edit a guild's discovery data
   * @arg {String} guildID The ID of the guild
   * @arg {Object} [options] The guild discovery data
   * @arg {Boolean} [options.emojiDiscoverabilityEnabled] Whether guild info should be shown when emoji info is loaded
   * @arg {Array<String>} [options.keywords] The discovery keywords (max 10)
   * @arg {String} [options.primaryCategoryID] The primary discovery category ID
   * @arg {String} [options.reason] The reason to be displayed in audit logs
   * @returns {Promise<Object>} The updated guild's discovery object
   */
  editGuildDiscovery(guildID, options = {}) {
    return this.requestHandler.request("PATCH", Endpoints.GUILD_DISCOVERY(guildID), true, {
      primary_category_id: options.primaryCategoryID,
      keywords: options.keywords,
      emoji_discoverability_enabled: options.emojiDiscoverabilityEnabled,
      reason: options.reason,
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
   * Edit a guild member
   * @arg {String} guildID The ID of the guild
   * @arg {String} memberID The ID of the member (you can use "@me" if you are only editing the bot user's nickname)
   * @arg {Object} options The properties to edit
   * @arg {String?} [options.channelID] The ID of the voice channel to move the member to (must be in voice). Set to `null` to disconnect the member
   * @arg {Date?} [options.communicationDisabledUntil] When the user's timeout should expire. Set to `null` to instantly remove timeout
   * @arg {Boolean} [options.deaf] Server deafen the member
   * @arg {Number} [options.flags] The user's flags - `OR` the `BYPASSES_VERIFICATION` flag (4) to make the member exempt from verification requirements, `NAND` the flag to make the member not exempt
   * @arg {Boolean} [options.mute] Server mute the member
   * @arg {String} [options.nick] Set the member's server nickname, "" to remove
   * @arg {Array<String>} [options.roles] The array of role IDs the member should have
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Member>}
   */
  editGuildMember(guildID, memberID, options, reason) {
    return this.requestHandler.request("PATCH", Endpoints.GUILD_MEMBER(guildID, memberID), true, {
      roles: options.roles && options.roles.filter((roleID, index) => options.roles.indexOf(roleID) === index),
      nick: options.nick,
      mute: options.mute,
      deaf: options.deaf,
      channel_id: options.channelID,
      communication_disabled_until: options.communicationDisabledUntil,
      flags: options.flags,
      reason: reason,
    }).then((member) => new Member(member, this.guilds.get(guildID), this));
  }

  /**
   * Edit a guild's MFA level (multi-factor authentication). Note: The bot account must be the owner of the guild to be able to edit the MFA status.
   * @arg {String} guildID The ID of the guild
   * @arg {Number} level The new MFA level, `0` to disable MFA, `1` to enable it
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Object>} An object containing a `level` (Number) key, indicating the new MFA level
   */
  editGuildMFALevel(guildID, level, reason) {
    return this.requestHandler.request("POST", Endpoints.GUILD_MFA_LEVEL(guildID), true, {
      level,
      reason,
    });
  }

  /**
   * Edit a guild's onboarding settings
   * @arg {String} guildID The ID of the guild
   * @arg {Object} options The properties to edit
   * @arg {Array<String>} options.defaultChannelIDs The ID of channels that members are opted into automatically
   * @arg {Boolean} options.enabled Whether onboarding should be enabled or not for the guild
   * @arg {Number} options.mode The onboarding mode, `0` for default, `1` for advanced
   * @arg {Array<Object>} options.prompts The [prompts](https://discord.dev/resources/guild#guild-onboarding-object-onboarding-prompt-structure) shown during the onboarding process
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Object>} The guild's [onboarding settings](https://discord.dev/resources/guild#guild-onboarding-object)
   */
  editGuildOnboarding(guildID, options, reason) {
    options.default_channel_ids = options.defaultChannelIDs;
    options.reason = reason;
    return this.requestHandler.request("PATCH", Endpoints.GUILD_ONBOARDING(guildID), true, options);
  }

  /**
   * Edit a guild scheduled event
   * @arg {String} guildID The guild ID where the event will be edited
   * @arg {String} eventID The guild scheduled event ID to be edited
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
  editGuildScheduledEvent(guildID, eventID, event, reason) {
    return this.requestHandler.request("PATCH", Endpoints.GUILD_SCHEDULED_EVENT(guildID, eventID), true, {
      channel_id: event.channelID,
      description: event.description,
      entity_metadata: event.entityMetadata,
      entity_type: event.entityType,
      image: event.image,
      name: event.name,
      privacy_level: event.privacyLevel,
      scheduled_end_time: event.scheduledEndTime,
      scheduled_start_time: event.scheduledStartTime,
      status: event.status,
      reason: reason,
    }).then((data) => new GuildScheduledEvent(data, this));
  }

  /**
   * Edit a guild soundboard sound
   * @arg {String} guildID The guild ID where the sound will be edited
   * @arg {String} soundID The ID of the soundboard sound
   * @arg {Object} options The properties to edit
   * @arg {String?} [options.emojiID] The ID of the relating custom emoji (mutually exclusive with options.emojiName)
   * @arg {String?} [options.emojiName] The name of the relating default emoji (mutually exclusive with options.emojiID)
   * @arg {String} [options.name] The name of the soundboard sound (2-32 characters)
   * @arg {Number?} [options.volume] The volume of the soundboard sound, between 0 and 1
   * @arg {String} [options.reason] The reason to be displayed in audit logs
   * @returns {Promise<SoundboardSound>}
   */
  editGuildSoundboardSound(guildID, soundID, options) {
    options.emoji_id = options.emojiID;
    options.emoji_name = options.emojiName;
    return this.requestHandler.request("PATCH", Endpoints.SOUNDBOARD_SOUND_GUILD(guildID, soundID), true, options).then((sound) => new SoundboardSound(sound, this));
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
  editGuildSticker(guildID, stickerID, options, reason) {
    options.reason = reason;
    return this.requestHandler.request("PATCH", Endpoints.GUILD_STICKER(guildID, stickerID), true, options);
  }

  /**
   * Edit a guild template
   * @arg {String} guildID The ID of the guild
   * @arg {String} code The template code
   * @arg {Object} options The properties to edit
   * @arg {String?} [options.description] The description for the template. Set to `null` to remove the description
   * @arg {String} [options.name] The name of the template
   * @returns {Promise<GuildTemplate>}
   */
  editGuildTemplate(guildID, code, options) {
    return this.requestHandler.request("PATCH", Endpoints.GUILD_TEMPLATE_GUILD(guildID, code), true, options).then((template) => new GuildTemplate(template, this));
  }

  /**
   * Modify a guild's vanity code
   * @arg {String} guildID The ID of the guild
   * @arg {String?} code The new vanity code
   * @returns {Promise<Object>}
   */
  editGuildVanity(guildID, code) {
    return this.requestHandler.request("PATCH", Endpoints.GUILD_VANITY_URL(guildID), true, {
      code,
    });
  }

  /**
   * Update a user's voice state - See [caveats](https://discord.com/developers/docs/resources/guild#modify-user-voice-state-caveats)
   * @arg {String} guildID The ID of the guild
   * @arg {Object} options The properties to edit
   * @arg {String} options.channelID The ID of the channel the user is currently in
   * @arg {Date?} [options.requestToSpeakTimestamp] Sets the user's request to speak - this can only be used when the `userID` param is "@me"
   * @arg {Boolean} [options.suppress] Toggles the user's suppress state
   * @arg {String} [userID="@me"] The user ID of the user to update
   * @returns {Promise}
   */
  editGuildVoiceState(guildID, options, userID = "@me") {
    return this.requestHandler.request("PATCH", Endpoints.GUILD_VOICE_STATE(guildID, userID), true, {
      channel_id: options.channelID,
      request_to_speak_timestamp: options.requestToSpeakTimestamp,
      suppress: options.suppress,
    });
  }

  /**
   * Edit a guild welcome screen
   * @arg {String} guildID The ID of the guild
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
  editGuildWelcomeScreen(guildID, options) {
    return this.requestHandler.request("PATCH", Endpoints.GUILD_WELCOME_SCREEN(guildID), true, {
      description: options.description,
      enabled: options.enabled,
      welcome_channels: options.welcomeChannels.map((c) => {
        return {
          channel_id: c.channelID,
          description: c.description,
          emoji_id: c.emojiID,
          emoji_name: c.emojiName,
        };
      }),
    });
  }

  /**
   * Modify a guild's widget
   * @arg {String} guildID The ID of the guild
   * @arg {Object} options The widget object to modify (https://discord.com/developers/docs/resources/guild#modify-guild-widget)
   * @arg {String?} [options.channelID] The channel ID for the guild widget
   * @arg {Boolean} [options.enabled] Whether the guild widget is enabled
   * @arg {String?} [options.reason] The reason to be displayed in audit logs
   * @returns {Promise<Object>} A guild widget object
   */
  editGuildWidget(guildID, options) {
    if (options.channelID !== undefined) {
      options.channel_id = options.channelID;
    }
    return this.requestHandler.request("PATCH", Endpoints.GUILD_WIDGET_SETTINGS(guildID), true, options);
  }

  /**
   * Edit a message
   * @arg {String} channelID The ID of the channel
   * @arg {String} messageID The ID of the message
   * @arg {String | Array | Object} content A string, array of strings, or object. If an object is passed:
   * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
   * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here
   * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow
   * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow
   * @arg {Array<Object>} [content.attachments] An array of attachment objects that will be appended to the message, including new files. Only the provided files will be appended
   * @arg {String} [content.attachments[].description] The description of the file
   * @arg {String} [content.attachments[].filename] The name of the file. This is not required if you are attaching a new file
   * @arg {Number | String} content.attachments[].id The ID of the file. If you are attaching a new file, this would be the index of the file
   * @arg {Array<Object>} [content.components] An array of component objects
   * @arg {String} [content.components[].custom_id] The ID of the component (type 2 style 0-4 and type 3,5,6,7,8 only)
   * @arg {Boolean} [content.components[].disabled] Whether the component is disabled (type 2 and 3,5,6,7,8 only)
   * @arg {Object} [content.components[].emoji] The emoji to be displayed in the component (type 2)
   * @arg {String} [content.components[].label] The label to be displayed in the component (type 2)
   * @arg {Array<Object>} [content.components[].default_values] default values for the component (type 5,6,7,8 only)
   * @arg {String} [content.components[].default_values[].id] id of a user, role, or channel
   * @arg {String} [content.components[].default_values[].type] type of value that id represents (user, role, or channel)
   * @arg {Number} [content.components[].max_values] The maximum number of items that can be chosen (1-25, default 1)
   * @arg {Number} [content.components[].min_values] The minimum number of items that must be chosen (0-25, default 1)
   * @arg {Array<Object>} [content.components[].options] The options for this component (type 3 only)
   * @arg {Boolean} [content.components[].options[].default] Whether this option should be the default value selected
   * @arg {String} [content.components[].options[].description] The description for this option
   * @arg {Object} [content.components[].options[].emoji] The emoji to be displayed in this option
   * @arg {String} content.components[].options[].label The label for this option
   * @arg {Number | String} content.components[].options[].value The value for this option
   * @arg {String} [content.components[].placeholder] The placeholder text for the component when no option is selected (type 3,5,6,7,8 only)
   * @arg {Number} [content.components[].style] The style of the component (type 2 only) - If 0-4, `custom_id` is required; if 5, `url` is required
   * @arg {Number} content.components[].type The type of component - If 1, it is a collection and a `components` array (nested) is required; if 2, it is a button; if 3, it is a string select; if 5, it is a user select; if 6, it is a role select; if 7, it is a mentionable select; if 8, it is a channel select
   * @arg {String} [content.components[].url] The URL that the component should open for users (type 2 style 5 only)
   * @arg {String} [content.content] A content string
   * @arg {Object} [content.embed] [DEPRECATED] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @arg {Array<Object>} [content.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @arg {Object | Array<Object>} [content.file] A file object (or an Array of them)
   * @arg {Buffer} content.file[].file A buffer containing file data
   * @arg {String} content.file[].name What to name the file
   * @arg {Number} [content.flags] A number representing the [flags](https://discord.dev/resources/channel#message-object-message-flags) to apply to the message (only SUPPRESS_EMBEDS and SUPPRESS_NOTIFICATIONS)
   * @returns {Promise<Message>}
   */
  editMessage(channelID, messageID, content) {
    if (content !== undefined) {
      if (typeof content !== "object" || content === null) {
        content = {
          content: "" + content,
        };
      } else if (content.content !== undefined && typeof content.content !== "string") {
        content.content = "" + content.content;
      } else if (content.embed) {
        if (!content.embeds) {
          content.embeds = [];
        }
        content.embeds.push(content.embed);
      }
      if (content.content !== undefined || content.embeds || content.allowedMentions) {
        content.allowed_mentions = this._formatAllowedMentions(content.allowedMentions);
      }
    }
    const file = content.file;
    delete content.file;
    return this.requestHandler.request("PATCH", Endpoints.CHANNEL_MESSAGE(channelID, messageID), true, file ? { payload_json: content } : content, file).then((message) => new Message(message, this));
  }

  /**
   * [DEPRECATED] Edit the bot's nickname in a guild
   * @arg {String} guildID The ID of the guild
   * @arg {String} nick The nickname
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  editNickname(guildID, nick, reason) {
    return this.requestHandler.request("PATCH", Endpoints.GUILD_MEMBER_NICK(guildID, "@me"), true, {
      nick,
      reason,
    });
  }

  /**
   * Edit a guild role
   * @arg {String} guildID The ID of the guild the role is in
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
  editRole(guildID, roleID, options, reason) {
    options.unicode_emoji = options.unicodeEmoji;
    options.reason = reason;
    if (options.permissions !== undefined) {
      options.permissions = options.permissions instanceof Permission ? String(options.permissions.allow) : String(options.permissions);
    }
    return this.requestHandler.request("PATCH", Endpoints.GUILD_ROLE(guildID, roleID), true, options).then((role) => new Role(role, this.guilds.get(guildID)));
  }

  /**
   * Update the role connection metadata for the application
   * @arg {Array<Object>} data An array of role connection metadata objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object) for object structure
   * @returns {Promise<Array<Object>>} An array of role connection metadata objects
   */
  editRoleConnectionMetadataRecords(data) {
    for (const connection of data) {
      if (connection.key !== undefined) {
        if (!/^[a-z0-9_]{1,50}$/.test(connection.key)) {
          throw new Error("Role connection keys can only contain lowercase characters (a-z), numbers (0-9) or underscores (_)");
        }
      }
    }
    return this.requestHandler.request("PUT", Endpoints.ROLE_CONNECTION_METADATA_RECORDS(this.application.id), true, data);
  }

  /**
   * Edit a guild role's position. Note that role position numbers are highest on top and lowest at the bottom.
   * @arg {String} guildID The ID of the guild the role is in
   * @arg {String} roleID The ID of the role
   * @arg {Number} position The new position of the role
   * @returns {Promise}
   */
  editRolePosition(guildID, roleID, position) {
    if (guildID === roleID) {
      return Promise.reject(new Error("Cannot move default role"));
    }
    let roles = this.guilds.get(guildID).roles;
    const role = roles.get(roleID);
    if (!role) {
      return Promise.reject(new Error(`Role ${roleID} not found`));
    }
    if (role.position === position) {
      return Promise.resolve();
    }
    const min = Math.min(position, role.position);
    const max = Math.max(position, role.position);
    roles = roles.filter((role) => min <= role.position && role.position <= max && role.id !== roleID).sort((a, b) => a.position - b.position);
    if (position > role.position) {
      roles.push(role);
    } else {
      roles.unshift(role);
    }
    return this.requestHandler.request("PATCH", Endpoints.GUILD_ROLES(guildID), true, roles.map((role, index) => ({
      id: role.id,
      position: index + min,
    })));
  }

  /**
   * Edit properties of the bot user
   * @arg {Object} options The properties to edit
   * @arg {String?} [options.avatar] The new avatar as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
   * @arg {String?} [options.banner] The new banner as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
   * @arg {String} [options.username] The new username
   * @returns {Promise<ExtendedUser>}
   */
  editSelf(options) {
    return this.requestHandler.request("PATCH", Endpoints.USER("@me"), true, options).then((data) => new ExtendedUser(data, this));
  }

  /**
   * Update a stage instance
   * @arg {String} channelID The ID of the stage channel associated with the instance
   * @arg {Object} options The properties to edit
   * @arg {Number} [options.privacyLevel] The privacy level of the stage instance. 1 is public, 2 is guild only
   * @arg {String} [options.topic] The stage instance topic
   * @returns {Promise<StageInstance>}
   */
  editStageInstance(channelID, options) {
    return this.requestHandler.request("PATCH", Endpoints.STAGE_INSTANCE(channelID), true, options).then((instance) => new StageInstance(instance, this));
  }

  /**
   * Update the bot's status on all guilds
   * @arg {String} [status] Sets the bot's status, either "online", "idle", "dnd", or "invisible"
   * @arg {Array | Object} [activities] Sets the bot's activities. A single activity object is also accepted for backwards compatibility
   * @arg {String} [activities[].name] The name of the activity. Note: When setting a custom status, use `state` instead
   * @arg {Number} activities[].type The type of the activity. 0 is playing, 1 is streaming (Twitch only), 2 is listening, 3 is watching, 4 is custom status, 5 is competing in
   * @arg {String} [activities[].url] The URL of the activity
   * @arg {String} [activities[].state] The state of the activity. This is the text to be displayed as the bots custom status
   */
  editStatus(status, activities) {
    if (activities === undefined && typeof status === "object") {
      activities = status;
      status = undefined;
    }
    if (status) {
      this.presence.status = status;
    }
    if (activities === null) {
      activities = [];
    } else if (activities && !Array.isArray(activities)) {
      activities = [activities];
    }
    if (activities !== undefined) {
      this.presence.activities = activities;
    }

    this.shards.forEach((shard) => {
      shard.editStatus(status, activities);
    });
  }

  /**
   * Edit a webhook
   * @arg {String} webhookID The ID of the webhook
   * @arg {Object} options Webhook options
   * @arg {String} [options.avatar] The new default avatar as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
   * @arg {String} [options.channelID] The new channel ID where webhooks should be sent to
   * @arg {String} [options.name] The new default name
   * @arg {String} [token] The token of the webhook, used instead of the Bot Authorization token
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Object>} Resolves with a webhook object
   */
  editWebhook(webhookID, options, token, reason) {
    return this.requestHandler.request("PATCH", token ? Endpoints.WEBHOOK_TOKEN(webhookID, token) : Endpoints.WEBHOOK(webhookID), !token, {
      name: options.name,
      avatar: options.avatar,
      channel_id: options.channelID,
      reason: reason,
    });
  }

  /**
   * Edit a webhook message
   * @arg {String} webhookID The ID of the webhook
   * @arg {String} token The token of the webhook
   * @arg {String} messageID The ID of the message
   * @arg {Object} options Webhook message edit options
   * @arg {Object} [options.allowedMentions] A list of mentions to allow (overrides default)
   * @arg {Boolean} [options.allowedMentions.everyone] Whether or not to allow @everyone/@here
   * @arg {Boolean} [options.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to
   * @arg {Boolean | Array<String>} [options.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow
   * @arg {Boolean | Array<String>} [options.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow
   * @arg {Array<Object>} [options.attachments] An array of attachment objects that will be appended to the message, including new files. Only the provided files will be appended
   * @arg {String} [options.attachments[].description] The description of the file
   * @arg {String} [options.attachments[].filename] The name of the file. This is not required if you are attaching a new file
   * @arg {Number | String} options.attachments[].id The ID of the file. If you are attaching a new file, this would be the index of the file
   * @arg {Array<Object>} [options.components] An array of component objects
   * @arg {String} [options.components[].custom_id] The ID of the component (type 2 style 0-4 and type 3,5,6,7,8 only)
   * @arg {Boolean} [options.components[].disabled] Whether the component is disabled (type 2 and 3,5,6,7,8 only)
   * @arg {Object} [options.components[].emoji] The emoji to be displayed in the component (type 2)
   * @arg {String} [options.components[].label] The label to be displayed in the component (type 2)
   * @arg {Array<Object>} [options.components[].default_values] default values for the component (type 5,6,7,8 only)
   * @arg {String} [options.components[].default_values[].id] id of a user, role, or channel
   * @arg {String} [options.components[].default_values[].type] type of value that id represents (user, role, or channel)
   * @arg {Number} [options.components[].max_values] The maximum number of items that can be chosen (1-25, default 1)
   * @arg {Number} [options.components[].min_values] The minimum number of items that must be chosen (0-25, default 1)
   * @arg {Array<Object>} [options.components[].options] The options for this component (type 3 only)
   * @arg {Boolean} [options.components[].options[].default] Whether this option should be the default value selected
   * @arg {String} [options.components[].options[].description] The description for this option
   * @arg {Object} [options.components[].options[].emoji] The emoji to be displayed in this option
   * @arg {String} options.components[].options[].label The label for this option
   * @arg {Number | String} options.components[].options[].value The value for this option
   * @arg {String} [options.components[].placeholder] The placeholder text for the component when no option is selected (type 3,5,6,7,8 only)
   * @arg {Number} [options.components[].style] The style of the component (type 2 only) - If 0-4, `custom_id` is required; if 5, `url` is required
   * @arg {Number} options.components[].type The type of component - If 1, it is a collection and a `components` array (nested) is required; if 2, it is a button; if 3, it is a string select; if 5, it is a user select; if 6, it is a role select; if 7, it is a mentionable select; if 8, it is a channel select
   * @arg {String} [options.components[].url] The URL that the component should open for users (type 2 style 5 only)
   * @arg {String} [options.content] A content string
   * @arg {Object} [options.embed] [DEPRECATED] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @arg {Array<Object>} [options.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @arg {Object | Array<Object>} [options.file] A file object (or an Array of them)
   * @arg {Buffer} options.file[].file A buffer containing file data
   * @arg {String} options.file[].name What to name the file
   * @returns {Promise<Message>}
   */
  editWebhookMessage(webhookID, token, messageID, options) {
    if (options.allowedMentions) {
      options.allowed_mentions = this._formatAllowedMentions(options.allowedMentions);
    }
    const file = options.file;
    delete options.file;

    if (options.embed) {
      if (!options.embeds) {
        options.embeds = [];
      }
      options.embeds.push(options.embed);
    }

    return this.requestHandler.request("PATCH", Endpoints.WEBHOOK_MESSAGE(webhookID, token, messageID), false, file ? { payload_json: options } : options, file).then((response) => new Message(response, this));
  }

  /**
   * Immediately end a poll. Note: You cannot end polls created by another user.
   * @arg {String} channelID The ID of the channel
   * @arg {String} messageID The ID of the message that the poll is in
   * @returns {Promise<Message>}
   */
  endPoll(channelID, messageID) {
    return this.requestHandler.request("POST", Endpoints.POLL_END(channelID, messageID), true).then((message) => new Message(message, this));
  }

  /**
   * Execute a slack-style webhook
   * @arg {String} webhookID The ID of the webhook
   * @arg {String} token The token of the webhook
   * @arg {Object} options Slack webhook options
   * @arg {Boolean} [options.auth=false] Whether or not to authenticate with the bot token.
   * @arg {String} [options.threadID] The ID of the thread channel in the webhook's channel to send the message to
   * @arg {Boolean} [options.wait=false] Whether to wait for the server to confirm the message create or not
   * @returns {Promise}
   */
  executeSlackWebhook(webhookID, token, options) {
    const wait = !!options.wait;
    options.wait = undefined;
    const auth = !!options.auth;
    options.auth = undefined;
    const threadID = options.threadID;
    options.threadID = undefined;
    let qs = "";
    if (wait) {
      qs += "&wait=true";
    }
    if (threadID) {
      qs += "&thread_id=" + threadID;
    }
    return this.requestHandler.request("POST", Endpoints.WEBHOOK_TOKEN_SLACK(webhookID, token) + (qs ? "?" + qs : ""), auth, options);
  }

  /**
   * Execute a webhook
   * @arg {String} webhookID The ID of the webhook
   * @arg {String} token The token of the webhook
   * @arg {Object} options Webhook execution options
   * @arg {Object} [options.allowedMentions] A list of mentions to allow (overrides default)
   * @arg {Boolean} [options.allowedMentions.everyone] Whether or not to allow @everyone/@here
   * @arg {Boolean | Array<String>} [options.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow
   * @arg {Boolean | Array<String>} [options.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow
   * @arg {Array<Object>} [options.attachments] An array of attachment objects that will be appended to the message, including new files. Only the provided files will be appended
   * @arg {String} [options.attachments[].description] The description of the file
   * @arg {String} [options.attachments[].filename] The name of the file. This is not required if you are attaching a new file
   * @arg {Number | String} options.attachments[].id The ID of the file. If you are attaching a new file, this would be the index of the file
   * @arg {Boolean} [options.auth=false] Whether or not to authenticate with the bot token.
   * @arg {String} [options.avatarURL] A URL for a custom avatar, defaults to webhook default avatar if not specified
   * @arg {Array<Object>} [options.components] An array of component objects
   * @arg {String} [options.components[].custom_id] The ID of the component (type 2 style 0-4 and type 3,5,6,7,8 only)
   * @arg {Boolean} [options.components[].disabled] Whether the component is disabled (type 2 and 3,5,6,7,8 only)
   * @arg {Object} [options.components[].emoji] The emoji to be displayed in the component (type 2)
   * @arg {String} [options.components[].label] The label to be displayed in the component (type 2)
   * @arg {Array<Object>} [options.components[].default_values] default values for the component (type 5,6,7,8 only)
   * @arg {String} [options.components[].default_values[].id] id of a user, role, or channel
   * @arg {String} [options.components[].default_values[].type] type of value that id represents (user, role, or channel)
   * @arg {Number} [options.components[].max_values] The maximum number of items that can be chosen (1-25, default 1)
   * @arg {Number} [options.components[].min_values] The minimum number of items that must be chosen (0-25, default 1)
   * @arg {Array<Object>} [options.components[].options] The options for this component (type 3 only)
   * @arg {Boolean} [options.components[].options[].default] Whether this option should be the default value selected
   * @arg {String} [options.components[].options[].description] The description for this option
   * @arg {Object} [options.components[].options[].emoji] The emoji to be displayed in this option
   * @arg {String} options.components[].options[].label The label for this option
   * @arg {Number | String} options.components[].options[].value The value for this option
   * @arg {String} [options.components[].placeholder] The placeholder text for the component when no option is selected (type 3,5,6,7,8 only)
   * @arg {Number} [options.components[].style] The style of the component (type 2 only) - If 0-4, `custom_id` is required; if 5, `url` is required
   * @arg {Number} options.components[].type The type of component - If 1, it is a collection and a `components` array (nested) is required; if 2, it is a button; if 3, it is a string select; if 5, it is a user select; if 6, it is a role select; if 7, it is a mentionable select; if 8, it is a channel select
   * @arg {String} [options.components[].url] The URL that the component should open for users (type 2 style 5 only)
   * @arg {String} [options.content] A content string
   * @arg {Object} [options.embed] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @arg {Array<Object>} [options.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @arg {Object | Array<Object>} [options.file] A file object (or an Array of them)
   * @arg {Buffer} options.file.file A buffer containing file data
   * @arg {String} options.file.name What to name the file
   * @arg {Number} [options.flags] Flags to execute the webhook with, 64 for ephemeral (Interaction webhooks only)
   * @arg {Object} [options.poll] A poll object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/poll#poll-object) for object structure
   * @arg {String} [options.threadID] The ID of the thread channel in the webhook's channel to send the message to
   * @arg {Boolean} [options.tts=false] Whether the message should be a TTS message or not
   * @arg {String} [options.username] A custom username, defaults to webhook default username if not specified
   * @arg {Boolean} [options.wait=false] Whether to wait for the server to confirm the message create or not
   * @returns {Promise<Message?>}
   */
  executeWebhook(webhookID, token, options) {
    let qs = "";
    if (options.wait) {
      qs += "&wait=true";
    }
    if (options.threadID) {
      qs += "&thread_id=" + options.threadID;
    }
    if (options.allowedMentions) {
      options.allowed_mentions = this._formatAllowedMentions(options.allowedMentions);
    }
    const file = options.file;
    delete options.file;

    if (options.embed) {
      if (!options.embeds) {
        options.embeds = [];
      }
      options.embeds.push(options.embed);
    }
    options.avatar_url = options.avatarURL;
    return this.requestHandler.request("POST", Endpoints.WEBHOOK_TOKEN(webhookID, token) + (qs ? "?" + qs : ""), !!options.auth, file ? { payload_json: options } : options, file).then((response) => options.wait ? new Message(response, this) : undefined);
  }

  /**
   * Follow a NewsChannel in another channel. This creates a webhook in the target channel
   * @arg {String} channelID The ID of the NewsChannel
   * @arg {String} options.webhookChannelID The ID of the target channel
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Object} An object containing the NewsChannel's ID and the new webhook's ID
   */
  followChannel(channelID, webhookChannelID, reason) {
    return this.requestHandler.request("POST", Endpoints.CHANNEL_FOLLOW(channelID), true, { webhook_channel_id: webhookChannelID, reason: reason });
  }

  /**
   * Get all active threads in a guild
   * @arg {String} guildID The ID of the guild
   * @returns {Promise<Object>} An object containing an array of `threads` and an array of `members`
   */
  getActiveGuildThreads(guildID) {
    return this.requestHandler.request("GET", Endpoints.THREADS_GUILD_ACTIVE(guildID), true).then((response) => {
      return {
        members: response.members.map((member) => new ThreadMember(member, this)),
        threads: response.threads.map((thread) => Channel.from(thread, this)),
      };
    });
  }

  /**
   * Get all archived threads in a channel
   * @arg {String} channelID The ID of the channel
   * @arg {String} type The type of thread channel, either "public" or "private"
   * @arg {Object} [options] Additional options when requesting archived threads
   * @arg {Date} [options.before] List of threads to return before the timestamp
   * @arg {Number} [options.limit] Maximum number of threads to return
   * @returns {Promise<Object>} An object containing an array of `threads`, an array of `members` and whether the response `hasMore` threads that could be returned in a subsequent call
   */
  getArchivedThreads(channelID, type, options = {}) {
    return this.requestHandler.request("GET", Endpoints.THREADS_ARCHIVED(channelID, type), true, options).then((response) => {
      return {
        hasMore: response.has_more,
        members: response.members.map((member) => new ThreadMember(member, this)),
        threads: response.threads.map((thread) => Channel.from(thread, this)),
      };
    });
  }

  /**
   * Get an existing auto moderation rule
   * @arg {String} guildID The ID of the guild to get the rule from
   * @arg {String} ruleID The ID of the rule to get
   * @returns {Promise<Object>}
   */
  getAutoModerationRule(guildID, ruleID) {
    return this.requestHandler.request("GET", Endpoints.AUTO_MODERATION_RULE(guildID, ruleID), true);
  }

  /**
   * Get a guild's auto moderation rules
   * @arg {String} guildID The ID of the guild to get the rules of
   * @returns {Promise<Array<Object>>}
   */
  getAutoModerationRules(guildID) {
    return this.requestHandler.request("GET", Endpoints.AUTO_MODERATION_RULES(guildID), true);
  }

  /**
   * Get general and bot-specific info on connecting to the Discord gateway (e.g. connection ratelimit)
   * @returns {Promise<Object>} Resolves with an object containing gateway connection info
   */
  getBotGateway() {
    if (!this._token.startsWith("Bot ")) {
      this._token = "Bot " + this._token;
    }
    return this.requestHandler.request("GET", Endpoints.GATEWAY_BOT, true);
  }

  /**
   * Get a Channel object from a channel ID
   * @arg {String} channelID The ID of the channel
   * @returns {CategoryChannel | DMChannel | ForumChannel | NewsChannel | NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel | TextChannel | VoiceChannel}
   */
  getChannel(channelID) {
    if (!channelID) {
      throw new Error(`Invalid channel ID: ${channelID}`);
    }

    if (this.channelGuildMap[channelID] && this.guilds.get(this.channelGuildMap[channelID])) {
      return this.guilds.get(this.channelGuildMap[channelID]).channels.get(channelID);
    }
    if (this.threadGuildMap[channelID] && this.guilds.get(this.threadGuildMap[channelID])) {
      return this.guilds.get(this.threadGuildMap[channelID]).threads.get(channelID);
    }
    return this.dmChannels.get(channelID);
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
   * Get a global application command
   * @arg {String} commandID The command id
   * @returns {Promise<Object>} Resolves with an application command object.
   */
  getCommand(commandID) {
    if (!commandID) {
      throw new Error("You must provide an id of the command to get.");
    }
    return this.requestHandler.request("GET", Endpoints.COMMAND(this.application.id, commandID), true);
  }

  /**
   * Get the a guild's application command permissions
   * @arg {String} guildID The guild ID
   * @arg {String} commandID The command id
   * @returns {Promise<Object>} Resolves with a guild application command permissions object.
   */
  getCommandPermissions(guildID, commandID) {
    if (!guildID) {
      throw new Error("You must provide an id of the guild whose permissions you want to get.");
    }
    if (!commandID) {
      throw new Error("You must provide an id of the command whose permissions you want to get.");
    }
    return this.requestHandler.request("GET", Endpoints.COMMAND_PERMISSIONS(this.application.id, guildID, commandID), true);
  }

  /**
   * Get the global application commands
   * @returns {Promise<Array<Object>>} Resolves with an array of application command objects.
   */
  getCommands() {
    return this.requestHandler.request("GET", Endpoints.COMMANDS(this.application.id), true);
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
   * @returns {Promise<DMChannel>}
   */
  getDMChannel(userID) {
    if (this.dmChannelMap[userID]) {
      return Promise.resolve(this.dmChannels.get(this.dmChannelMap[userID]));
    }
    return this.requestHandler.request("POST", Endpoints.USER_CHANNELS("@me"), true, {
      recipient_id: userID,
    }).then((dmChannel) => new DMChannel(dmChannel, this));
  }

  /**
   * Get a guild from the guild's emoji ID
   * @arg {String} emojiID The ID of the emoji
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
   * Get the audit log for a guild
   * @arg {String} guildID The ID of the guild to get audit logs for
   * @arg {Object} [options] Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
   * @arg {Number} [options.actionType] Filter entries by action type
   * @arg {String} [options.before] Get entries before this entry ID
   * @arg {Number} [options.limit=50] The maximum number of entries to return
   * @arg {String} [options.userID] Filter entries by the user that performed the action
   * @returns {Promise<{entries: Array<GuildAuditLogEntry>, integrations: Array<PartialIntegration>, threads: Array<NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel>, users: Array<User>, webhooks: Array<Webhook>}>}
   */
  getGuildAuditLog(guildID, options = {}, before, actionType, userID) {
    if (!options || typeof options !== "object") {
      options = {
        limit: options,
      };
    }
    if (options.limit === undefined) { // Legacy behavior
      options.limit = 50;
    }
    if (actionType !== undefined) {
      options.actionType = actionType;
    }
    if (before !== undefined) {
      options.before = before;
    }
    if (userID !== undefined) {
      options.userID = userID;
    }
    if (options.actionType !== undefined) {
      options.action_type = options.actionType;
    }
    if (options.userID !== undefined) {
      options.user_id = options.userID;
    }
    return this.requestHandler.request("GET", Endpoints.GUILD_AUDIT_LOGS(guildID), true, options).then((data) => {
      const guild = this.guilds.get(guildID);
      const users = data.users.map((user) => this.users.add(user, this));
      const threads = data.threads.map((thread) => guild.threads.update(thread, this));
      return {
        entries: data.audit_log_entries.map((entry) => new GuildAuditLogEntry(entry, this)),
        integrations: data.integrations.map((integration) => new GuildIntegration(integration, guild)),
        threads: threads,
        users: users,
        webhooks: data.webhooks,
      };
    });
  }

  /**
   * [DEPRECATED] Get the audit log for a guild. Use `getGuildAuditLog` instead
   * @arg {String} guildID The ID of the guild to get audit logs for
   * @arg {Object} [limit=50] The maximum number of entries to return
   * @arg {String} [before] Get entries before this entry ID
   * @arg {Number} [actionType] Filter entries by action type
   * @arg {String} [userID] Filter entries by the user that performed the action
   * @returns {Promise<{users: Array<User>, entries: Array<GuildAuditLogEntry>, integrations: Array<PartialIntegration>, webhooks: Array<Webhook>}>}
   */
  getGuildAuditLogs(guildID, limit, before, actionType, userID) {
    return this.getGuildAuditLog.call(this, guildID, limit, before, actionType, userID);
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
   * @arg {Object} [options] Options for the request
   * @arg {String} [options.after] Only get users after given user ID
   * @arg {String} [options.before] Only get users before given user ID
   * @arg {Number} [options.limit=1000] The maximum number of users to return
   * @returns {Promise<Array<Object>>} Resolves with an array of { reason: String, user: User }
   */
  async getGuildBans(guildID, options = {}) {
    const bans = await this.requestHandler.request("GET", Endpoints.GUILD_BANS(guildID), true, {
      after: options.after,
      before: options.before,
      limit: options.limit && Math.min(options.limit, 1000),
    });

    for (const ban of bans) {
      ban.user = this.users.update(ban.user, this);
    }

    if (options.limit && options.limit > 1000 && bans.length >= 1000) {
      const page = await this.getGuildBans(guildID, {
        after: options.before ? undefined : bans[bans.length - 1].user.id,
        before: options.before ? bans[0].user.id : undefined,
        limit: options.limit - bans.length,
      });

      if (options.before) {
        bans.unshift(...page);
      } else {
        bans.push(...page);
      }
    }

    return bans;
  }

  /**
   * Get a guild application command
   * @arg {String} guildID The guild ID
   * @arg {String} commandID The command id
   * @returns {Promise<Object>} Resolves with an command object.
   */
  getGuildCommand(guildID, commandID) {
    if (!commandID) {
      throw new Error("You must provide an id of the command to get.");
    }
    return this.requestHandler.request("GET", Endpoints.GUILD_COMMAND(this.application.id, guildID, commandID), true);
  }

  /**
   * Get the all of a guild's application command permissions
   * @arg {String} guildID The guild ID
   * @returns {Promise<Array<Object>>} Resolves with an array of guild application command permissions objects.
   */
  getGuildCommandPermissions(guildID) {
    if (!guildID) {
      throw new Error("You must provide an id of the guild whose permissions you want to get.");
    }
    return this.requestHandler.request("GET", Endpoints.GUILD_COMMAND_PERMISSIONS(this.application.id, guildID), true);
  }

  /**
   * Get a guild's application commands
   * @arg {String} guildID The guild ID
   * @returns {Promise<Array<Object>>} Resolves with an array of command objects.
   */
  getGuildCommands(guildID) {
    return this.requestHandler.request("GET", Endpoints.GUILD_COMMANDS(this.application.id, guildID), true);
  }

  /**
   * Get a guild's discovery object
   * @arg {String} guildID The ID of the guild
   * @returns {Promise<Object>}
   */
  getGuildDiscovery(guildID) {
    return this.requestHandler.request("GET", Endpoints.GUILD_DISCOVERY(guildID), true);
  }

  /**
   * Get a list of integrations for a guild
   * @arg {String} guildID The ID of the guild
   * @returns {Promise<Array<GuildIntegration>>}
   */
  getGuildIntegrations(guildID) {
    const guild = this.guilds.get(guildID);
    return this.requestHandler.request("GET", Endpoints.GUILD_INTEGRATIONS(guildID), true).then((integrations) => integrations.map((integration) => new GuildIntegration(integration, guild)));
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
   * Get a guild's onboarding settings
   * @arg {String} guildID The ID of the guild
   * @returns {Promise<Object>} The guild's [onboarding settings](https://discord.dev/resources/guild#guild-onboarding-object)
   */
  getGuildOnboarding(guildID) {
    return this.requestHandler.request("GET", Endpoints.GUILD_ONBOARDING(guildID), true);
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
   * Get a guild's scheduled events
   * @arg {String} guildID The ID of the guild
   * @arg {Object} [options] Options for the request
   * @arg {Boolean} [options.withUserCount] Whether to include the number of users subscribed to each event
   * @returns {Promise<Array<GuildScheduledEvent>>}
   */
  getGuildScheduledEvents(guildID, options = {}) {
    options.with_user_count = options.withUserCount;
    return this.requestHandler.request("GET", Endpoints.GUILD_SCHEDULED_EVENTS(guildID), true, options).then((data) => data.map((event) => new GuildScheduledEvent(event, this)));
  }

  /**
   * Get a list of users subscribed to a guild scheduled event
   * @arg {String} guildID The ID of the guild
   * @arg {String} eventID The ID of the event
   * @arg {Object} [options] Options for the request
   * @arg {String} [options.after] Get users after this user ID. If `options.before` is provided, this will be ignored. Fetching users in between `before` and `after` is not supported
   * @arg {String} [options.before] Get users before this user ID
   * @arg {Number} [options.limit=100] The number of users to get (max 100). Pagination will only work if one of `options.after` or `options.after` is also provided
   * @arg {Boolean} [options.withMember] Include guild member data
   * @returns {Promise<Array<{guildScheduledEventID: String, member?: Member, user: User}>>}
   */
  getGuildScheduledEventUsers(guildID, eventID, options = {}) {
    const guild = this.guilds.get(guildID);

    options.with_member = options.withMember;
    return this.requestHandler.request("GET", Endpoints.GUILD_SCHEDULED_EVENT_USERS(guildID, eventID), true, options).then((data) => data.map((eventUser) => {
      if (eventUser.member) {
        eventUser.member.id = eventUser.user.id;
      }
      return {
        guildScheduledEventID: eventUser.guild_scheduled_event_id,
        member: eventUser.member && guild ? guild.members.update(eventUser.member) : new Member(eventUser.member),
        user: this.users.update(eventUser.user),
      };
    }));
  }

  /**
   * Get a guild soundboard sound. Not to be confused with getGuildSoundboardSounds, which gets all soundboard sounds in a guild
   * @arg {String} guildID The guild ID where the sound was created
   * @arg {String} soundID The ID of the soundboard sound
   * @returns {Promise<SoundboardSound>}
   */
  getGuildSoundboardSound(guildID, soundID) {
    return this.requestHandler.request("GET", Endpoints.SOUNDBOARD_SOUND_GUILD(guildID, soundID), true).then((sound) => new SoundboardSound(sound, this));
  }

  /**
   * Get a guild's soundboard sounds. Not to be confused with getGuildSoundboardSound, which gets a specified soundboard sound
   * @arg {String} guildID The ID of the guild
   * @returns {Promise<Array<SoundboardSound>>}
   */
  getGuildSoundboardSounds(guildID) {
    return this.requestHandler.request("GET", Endpoints.SOUNDBOARD_SOUNDS_GUILD(guildID), true).then((sounds) => sounds.map((sound) => new SoundboardSound(sound, this)));
  }

  /**
   * Get a guild template
   * @arg {String} code The template code
   * @returns {Promise<GuildTemplate>}
   */
  getGuildTemplate(code) {
    return this.requestHandler.request("GET", Endpoints.GUILD_TEMPLATE(code), true).then((template) => new GuildTemplate(template, this));
  }

  /**
   * Get a guild's templates
   * @arg {String} guildID The ID of the guild
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
   * Get the welcome screen of a Community guild, shown to new members
   * @arg {String} guildID The ID of the guild to get the welcome screen for
   * @returns {Promise<Object>}
   */
  getGuildWelcomeScreen(guildID) {
    return this.requestHandler.request("GET", Endpoints.GUILD_WELCOME_SCREEN(guildID), true);
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
   * Get a guild's widget image
   * @arg {String} guildID The ID of the guild
   * @arg {String} [style="shield"] The style of widget image. Either `shield`, `banner1`, `banner2`, `banner3`, or `banner4`.
   * @returns {String} The widget image link
   */
  getGuildWidgetImageURL(guildID, style) {
    return Endpoints.CLIENT_URL + Endpoints.BASE_URL + Endpoints.GUILD_WIDGET_IMAGE(guildID) + (style !== undefined ? `?style=${style}` : "");
  }

  /**
   * Get a guild's widget settings object. Requires MANAGE_GUILD permission
   * @arg {String} guildID The ID of the guild
   * @returns {Promise<Object>} A guild widget setting object
   */
  getGuildWidgetSettings(guildID) {
    return this.requestHandler.request("GET", Endpoints.GUILD_WIDGET_SETTINGS(guildID), true);
  }

  /**
   * Get info on an invite
   * @arg {String} inviteID The ID of the invite
   * @arg {Boolean} [withCounts] Whether to fetch additional invite info or not (approximate member counts, approximate presences, channel counts, etc.)
   * @arg {Boolean} [withExpiration] Whether to fetch the expiration time or not
   * @arg {String} [guildScheduledEventID] The guild scheduled event to include with the invite
   * @returns {Promise<Invite>}
   */
  getInvite(inviteID, withCounts, withExpiration, guildScheduledEventID) {
    return this.requestHandler.request("GET", Endpoints.INVITE(inviteID), true, {
      with_counts: withCounts,
      with_expiration: withExpiration,
      guild_scheduled_event_id: guildScheduledEventID,
    }).then((invite) => new Invite(invite, this));
  }

  /**
   * Get joined private archived threads in a channel
   * @arg {String} channelID The ID of the channel
   * @arg {Object} [options] Additional options when requesting archived threads
   * @arg {Date} [options.before] List of threads to return before the timestamp
   * @arg {Number} [options.limit] Maximum number of threads to return
   * @returns {Promise<Object>} An object containing an array of `threads`, an array of `members` and whether the response `hasMore` threads that could be returned in a subsequent call
   */
  getJoinedPrivateArchivedThreads(channelID, options = {}) {
    return this.requestHandler.request("GET", Endpoints.THREADS_ARCHIVED_JOINED(channelID), true, options).then((response) => {
      return {
        hasMore: response.has_more,
        members: response.members.map((member) => new ThreadMember(member, this)),
        threads: response.threads.map((thread) => Channel.from(thread, this)),
      };
    });
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
   * @arg {Object} [options] Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
   * @arg {String} [options.after] Get users after this user ID
   * @arg {Number} [options.limit=100] The maximum number of users to get
   * @arg {Number} [options.type=0] The type of reaction (`0` for normal, `1` for burst)
   * @arg {String} [before] [DEPRECATED] Get users before this user ID. Discord no longer supports this parameter
   * @arg {String} [after] [DEPRECATED] Get users after this user ID
   * @returns {Promise<Array<User>>}
   */
  getMessageReaction(channelID, messageID, reaction, options = {}, before, after) {
    if (reaction === decodeURI(reaction)) {
      reaction = encodeURIComponent(reaction);
    }
    if (!options || typeof options !== "object") {
      options = {
        limit: options,
      };
    }
    if (options.limit === undefined) { // Legacy behavior
      options.limit = 100;
    }
    if (before !== undefined) {
      options.before = before;
    }
    if (after !== undefined) {
      options.after = after;
    }
    if (options.before) {
      emitDeprecation("GET_REACTION_BEFORE");
      this.emit("warn", "[DEPRECATED] getMessageReaction() was called with a `before` parameter. Discord no longer supports this parameter");
    }
    return this.requestHandler.request("GET", Endpoints.CHANNEL_MESSAGE_REACTION(channelID, messageID, reaction), true, options).then((users) => users.map((user) => new User(user, this)));
  }

  /**
   * Get previous messages in a channel
   * @arg {String} channelID The ID of the channel
   * @arg {Object} [options] Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
   * @arg {String} [options.after] Get messages after this message ID
   * @arg {String} [options.around] Get messages around this message ID (does not work with limit > 100)
   * @arg {String} [options.before] Get messages before this message ID
   * @arg {Number} [options.limit=50] The max number of messages to get
   * @arg {String} [before] [DEPRECATED] Get messages before this message ID
   * @arg {String} [after] [DEPRECATED] Get messages after this message ID
   * @arg {String} [around] [DEPRECATED] Get messages around this message ID (does not work with limit > 100)
   * @returns {Promise<Array<Message>>}
   */
  async getMessages(channelID, options = {}, before, after, around) {
    if (!options || typeof options !== "object") {
      options = {
        limit: options,
      };
    }
    if (options.limit === undefined) { // Legacy behavior
      options.limit = 50;
    }
    if (after !== undefined) {
      options.after = after;
    }
    if (around !== undefined) {
      options.around = around;
    }
    if (before !== undefined) {
      options.before = before;
    }
    let limit = options.limit;
    if (limit && limit > 100) {
      let logs = [];
      const get = async (_before, _after) => {
        const messages = await this.requestHandler.request("GET", Endpoints.CHANNEL_MESSAGES(channelID), true, {
          limit: 100,
          before: _before || undefined,
          after: _after || undefined,
        });
        if (limit <= messages.length) {
          return (_after ? messages.slice(messages.length - limit, messages.length).map((message) => new Message(message, this)).concat(logs) : logs.concat(messages.slice(0, limit).map((message) => new Message(message, this))));
        }
        limit -= messages.length;
        logs = (_after ? messages.map((message) => new Message(message, this)).concat(logs) : logs.concat(messages.map((message) => new Message(message, this))));
        if (messages.length < 100) {
          return logs;
        }
        this.emit("debug", `Getting ${limit} more messages during getMessages for ${channelID}: ${_before} ${_after}`, -1);
        return get((_before || !_after) && messages[messages.length - 1].id, _after && messages[0].id);
      };
      return get(options.before, options.after);
    }
    const messages = await this.requestHandler.request("GET", Endpoints.CHANNEL_MESSAGES(channelID), true, options);
    return messages.map((message) => {
      try {
        return new Message(message, this);
      } catch (err) {
        this.emit("error", `Error creating message from channel messages\n${err.stack}\n${JSON.stringify(messages)}`);
        return null;
      }
    });
  }

  /**
   * Get the list of sticker packs available to Nitro subscribers
   * @returns {Promise<Object>} An object whichs contains a value which contains an array of sticker packs
   */
  getNitroStickerPacks() {
    return this.requestHandler.request("GET", Endpoints.STICKER_PACKS, true);
  }

  /**
   * Get data on the bot's OAuth2 application
   * @returns {Promise<Object>} The bot's application data. Refer to [the official Discord API documentation entry](https://discord.com/developers/docs/topics/oauth2#get-current-application-information) for object structure
   */
  getOAuthApplication() {
    return this.requestHandler.request("GET", Endpoints.OAUTH2_APPLICATION, true);
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
   * Get a list of users that voted for a specific poll answer
   * @arg {String} channelID The ID of the channel
   * @arg {String} messageID The ID of the message that the poll is in
   * @arg {Number} answerID The ID of the answer to get voters for
   * @arg {Object} [options] Options for the request
   * @arg {String} [options.after] Get users after this user ID
   * @arg {Number} [options.limit=25] The max number of users to get
   * @returns {Promise<Array<User>>} An array of users who voted for this answer
   */
  getPollAnswerVoters(channelID, messageID, answerID, options = {}) {
    return this.requestHandler.request("GET", Endpoints.POLL_ANSWER_VOTERS(channelID, messageID, answerID), true, {
      after: options.after,
      limit: options.limit,
    }).then((voters) => voters.users.map((user) => new User(user, this)));
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
      include_roles: options.includeRoles,
    }).then((data) => data.pruned);
  }

  /**
   * Get a channel's data via the REST API. REST mode is required to use this endpoint.
   * @arg {String} channelID The ID of the channel
   * @returns {Promise<CategoryChannel | DMChannel | ForumChannel | GroupChannel | NewsChannel | NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel | StageChannel | TextChannel | VoiceChannel>}
   */
  getRESTChannel(channelID) {
    if (!this.options.restMode) {
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
    if (!this.options.restMode) {
      return Promise.reject(new Error("Eris REST mode is not enabled"));
    }
    return this.requestHandler.request("GET", Endpoints.GUILD(guildID), true, {
      with_counts: withCounts,
    }).then((guild) => new Guild(guild, this));
  }

  /**
   * Get a guild's channels via the REST API. REST mode is required to use this endpoint.
   * @arg {String} guildID The ID of the guild
   * @returns {Promise<Array<CategoryChannel | ForumChannel | NewsChannel | StageChannel | TextChannel | VoiceChannel>>}
   */
  getRESTGuildChannels(guildID) {
    if (!this.options.restMode) {
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
    if (!this.options.restMode) {
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
    if (!this.options.restMode) {
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
    if (!this.options.restMode) {
      return Promise.reject(new Error("Eris REST mode is not enabled"));
    }
    return this.requestHandler.request("GET", Endpoints.GUILD_MEMBER(guildID, memberID), true).then((member) => new Member(member, this.guilds.get(guildID), this));
  }

  /**
   * Get a guild's members via the REST API. REST mode is required to use this endpoint.
   * @arg {String} guildID The ID of the guild
   * @arg {Object} [options] Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
   * @arg {String} [options.after] The highest user ID of the previous page
   * @arg {Number} [options.limit=1] The max number of members to get (1 to 1000)
   * @arg {String} [after] [DEPRECATED] The highest user ID of the previous page
   * @returns {Promise<Array<Member>>}
   */
  getRESTGuildMembers(guildID, options = {}, after) {
    if (!this.options.restMode) {
      return Promise.reject(new Error("Eris REST mode is not enabled"));
    }
    if (!options || typeof options !== "object") {
      options = {
        limit: options,
      };
    }
    if (after !== undefined) {
      options.after = after;
    }
    return this.requestHandler.request("GET", Endpoints.GUILD_MEMBERS(guildID), true, options).then((members) => members.map((member) => new Member(member, this.guilds.get(guildID), this)));
  }

  /**
   * Get a guild's roles via the REST API. REST mode is required to use this endpoint.
   * @arg {String} guildID The ID of the guild
   * @returns {Promise<Array<Role>>}
   */
  getRESTGuildRoles(guildID) {
    if (!this.options.restMode) {
      return Promise.reject(new Error("Eris REST mode is not enabled"));
    }
    return this.requestHandler.request("GET", Endpoints.GUILD_ROLES(guildID), true).then((roles) => roles.map((role) => new Role(role, null)));
  }

  /**
   * Get a list of the user's guilds via the REST API. REST mode is required to use this endpoint.
   * @arg {Object} [options] Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
   * @arg {String} [options.after] The highest guild ID of the previous page
   * @arg {String} [options.before] The lowest guild ID of the next page
   * @arg {Number} [options.limit=100] The max number of guilds to get (1 to 200)
   * @arg {Boolean} [options.withCounts=false] Whether to include approximate member and presence counts
   * @arg {String} [before] [DEPRECATED] The lowest guild ID of the next page
   * @arg {String} [after] [DEPRECATED] The highest guild ID of the previous page
   * @returns {Promise<Array<Guild>>}
   */
  getRESTGuilds(options = {}, before, after) {
    // TODO type
    if (!this.options.restMode) {
      return Promise.reject(new Error("Eris REST mode is not enabled"));
    }
    if (!options || typeof options !== "object") {
      options = {
        limit: options,
      };
    }
    if (after !== undefined) {
      options.after = after;
    }
    if (before !== undefined) {
      options.before = before;
    }
    options.with_counts = options.withCounts;
    return this.requestHandler.request("GET", Endpoints.USER_GUILDS("@me"), true, options).then((guilds) => guilds.map((guild) => new Guild(guild, this)));
  }

  /**
   * Get a guild scheduled event via the REST API. REST mode is required to use this endpoint.
   * @arg {String} guildID The ID of the guild
   * @arg {String} eventID The ID of the guild scheduled event
   * @arg {Object} [options] Options for the request
   * @arg {Boolean} [options.withUserCount] Whether to include the number of users subscribed to the event
   * @returns {Promise<GuildScheduledEvent>}
   */
  getRESTGuildScheduledEvent(guildID, eventID, options = {}) {
    if (!this.options.restMode) {
      return Promise.reject(new Error("Eris REST mode is not enabled"));
    }

    options.with_user_count = options.withUserCount;
    return this.requestHandler.request("GET", Endpoints.GUILD_SCHEDULED_EVENT(guildID, eventID), true, options).then((data) => new GuildScheduledEvent(data, this));
  }

  /**
   * Get a guild sticker via the REST API. REST mode is required to use this endpoint.
   * @arg {String} guildID The ID of the guild
   * @arg {String} stickerID The ID of the sticker
   * @returns {Promise<Object>} A sticker object
   */
  getRESTGuildSticker(guildID, stickerID) {
    if (!this.options.restMode) {
      return Promise.reject(new Error("Eris REST mode is not enabled"));
    }
    return this.requestHandler.request("GET", Endpoints.GUILD_STICKER(guildID, stickerID), true);
  }

  /**
   * Get a guild's stickers via the REST API. REST mode is required to use this endpoint.
   * @arg {String} guildID The ID of the guild
   * @returns {Promise<Array<Object>>} An array of guild sticker objects
   */
  getRESTGuildStickers(guildID) {
    if (!this.options.restMode) {
      return Promise.reject(new Error("Eris REST mode is not enabled"));
    }
    return this.requestHandler.request("GET", Endpoints.GUILD_STICKERS(guildID), true);
  }

  /**
   * Get a sticker via the REST API. REST mode is required to use this endpoint.
   * @arg {String} stickerID The ID of the sticker
   * @returns {Promise<Object>} A sticker object
   */
  getRESTSticker(stickerID) {
    if (!this.options.restMode) {
      return Promise.reject(new Error("Eris REST mode is not enabled"));
    }
    return this.requestHandler.request("GET", Endpoints.STICKER(stickerID), true);
  }

  /**
   * Get a user's data via the REST API. REST mode is required to use this endpoint.
   * @arg {String} userID The ID of the user
   * @returns {Promise<User>}
   */
  getRESTUser(userID) {
    if (!this.options.restMode) {
      return Promise.reject(new Error("Eris REST mode is not enabled"));
    }
    return this.requestHandler.request("GET", Endpoints.USER(userID), true).then((user) => new User(user, this));
  }

  /**
   * Get the role connection metadata for the application
   * @returns {Promise<Array<Object>>} An array of role connection metadata objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object) for object structure
   */
  getRoleConnectionMetadataRecords() {
    return this.requestHandler.request("GET", Endpoints.ROLE_CONNECTION_METADATA_RECORDS(this.application.id), true);
  }

  /**
   * Get properties of the bot user
   * @returns {Promise<ExtendedUser>}
   */
  getSelf() {
    return this.requestHandler.request("GET", Endpoints.USER("@me"), true).then((data) => new ExtendedUser(data, this));
  }

  /**
   * Get the default soundboard sounds
   * @returns {Promise<Array<SoundboardSound>>}
   */
  getSoundboardSounds() {
    return this.requestHandler.request("GET", Endpoints.SOUNDBOARD_SOUNDS_DEFAULT, true).then((sounds) => sounds.map((sound) => new SoundboardSound(sound, this)));
  }

  /**
   * Get the stage instance associated with a stage channel
   * @arg {String} channelID The stage channel ID
   * @returns {Promise<StageInstance>}
   */
  getStageInstance(channelID) {
    return this.requestHandler.request("GET", Endpoints.STAGE_INSTANCE(channelID), true).then((instance) => new StageInstance(instance, this));
  }

  /**
   * Get a member that is part of a thread channel
   * @arg {String} channelID The ID of the thread channel
   * @arg {String} userID The ID of the user
   * @arg {Boolean} [withMember] Whether to include the guild member object within the response
   * @returns {Promise<ThreadMember>}
   */
  getThreadMember(channelID, userID, withMember) {
    return this.requestHandler.request("GET", Endpoints.THREAD_MEMBER(channelID, userID), true, {
      with_member: withMember,
    }).then((threadMember) => new ThreadMember(threadMember, this));
  }

  /**
   * Get a list of members that are part of a thread channel
   * @arg {String} channelID The ID of the thread channel
   * @arg {Object} [options] Options for the request
   * @arg {String} [options.after] Get members after this user ID
   * @arg {Number} [options.limit=100] The maximum number of thread members to fetch (1-100)
   * @arg {Boolean} [options.withMember] Whether to include the guild member object for each member of the thread
   * @returns {Promise<Array<ThreadMember>>}
   */
  getThreadMembers(channelID, options = {}) {
    return this.requestHandler.request("GET", Endpoints.THREAD_MEMBERS(channelID), true, {
      after: options.after,
      limit: options.limit,
      with_member: options.withMember,
    }).then((members) => members.map((member) => new ThreadMember(member, this)));
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
   * Get a webhook message
   * @arg {String} webhookID The ID of the webhook
   * @arg {String} token The token of the webhook
   * @arg {String} messageID The message ID of a message sent by this webhook
   * @returns {Promise<Message>} Resolves with a webhook message
   */
  getWebhookMessage(webhookID, token, messageID) {
    return this.requestHandler.request("GET", Endpoints.WEBHOOK_MESSAGE(webhookID, token, messageID)).then((message) => new Message(message, this));
  }

  /**
   * Join a thread
   * @arg {String} channelID The ID of the thread channel
   * @arg {String} [userID="@me"] The user ID of the user joining
   * @returns {Promise}
   */
  joinThread(channelID, userID = "@me") {
    return this.requestHandler.request("PUT", Endpoints.THREAD_MEMBER(channelID, userID), true);
  }

  /**
   * Join a voice channel
   * @arg {String} channelID The ID of the voice channel
   * @arg {Object} [options] VoiceConnection constructor options
   * @arg {Object} [options.opusOnly] Skip opus encoder initialization. You should not enable this unless you know what you are doing
   * @arg {Boolean} [options.selfDeaf] Whether the bot joins the channel deafened or not
   * @arg {Boolean} [options.selfMute] Whether the bot joins the channel muted or not
   * @arg {Object} [options.shared] Whether the VoiceConnection will be part of a SharedStream or not
   * @returns {Promise<VoiceConnection>} Resolves with a VoiceConnection
   */
  joinVoiceChannel(channelID, options = {}) {
    const channel = this.getChannel(channelID);
    if (!channel) {
      return Promise.reject(new Error("Channel not found"));
    }
    if (channel.guild && channel.guild.members.has(this.user.id) && !(channel.permissionsOf(this.user.id).allow & Constants.Permissions.voiceConnect)) {
      return Promise.reject(new Error("Insufficient permission to connect to voice channel"));
    }
    this.shards.get(this.guildShardMap[this.channelGuildMap[channelID]] || 0).sendWS(Constants.GatewayOPCodes.VOICE_STATE_UPDATE, {
      guild_id: this.channelGuildMap[channelID] || null,
      channel_id: channelID || null,
      self_mute: options.selfMute || false,
      self_deaf: options.selfDeaf || false,
    });
    if (options.opusOnly === undefined) {
      options.opusOnly = this.options.opusOnly;
    }
    return this.voiceConnections.join(this.channelGuildMap[channelID], channelID, options);
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
      reason,
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
   * Leave a thread
   * @arg {String} channelID The ID of the thread channel
   * @arg {String} [userID="@me"] The user ID of the user leaving
   * @returns {Promise}
   */
  leaveThread(channelID, userID = "@me") {
    return this.requestHandler.request("DELETE", Endpoints.THREAD_MEMBER(channelID, userID), true);
  }

  /**
   * Leaves a voice channel
   * @arg {String} channelID The ID of the voice channel
   */
  leaveVoiceChannel(channelID) {
    if (!channelID || !this.channelGuildMap[channelID]) {
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
      reason: options.reason,
    }).then((data) => data.pruned);
  }

  /**
   * Purge previous messages in a channel with an optional filter (bot accounts only)
   * @arg {String} channelID The ID of the channel
   * @arg {Object} options Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
   * @arg {String} [options.after] Get messages after this message ID
   * @arg {String} [options.before] Get messages before this message ID
   * @arg {Function} [options.filter] Optional filter function that returns a boolean when passed a Message object
   * @arg {Number} options.limit The max number of messages to search through, -1 for no limit
   * @arg {String} [options.reason] The reason to be displayed in audit logs
   * @arg {Function} [filter] [DEPRECATED] Optional filter function that returns a boolean when passed a Message object
   * @arg {String} [before] [DEPRECATED] Get messages before this message ID
   * @arg {String} [after] [DEPRECATED] Get messages after this message ID
   * @arg {String} [reason] [DEPRECATED] The reason to be displayed in audit logs
   * @returns {Promise<Number>} Resolves with the number of messages deleted
   */
  async purgeChannel(channelID, options, filter, before, after, reason) {
    if (!options || typeof options !== "object") {
      options = {
        limit: options,
      };
    }
    if (after !== undefined) {
      options.after = after;
    }
    if (before !== undefined) {
      options.before = before;
    }
    if (filter !== undefined) {
      options.filter = filter;
    }
    if (reason !== undefined) {
      options.reason = reason;
    }
    if (typeof options.filter === "string") {
      const filter = options.filter;
      options.filter = (msg) => msg.content.includes(filter);
    }
    let limit = options.limit;
    if (typeof limit !== "number") {
      throw new TypeError(`Invalid limit: ${limit}`);
    }
    if (limit !== -1 && limit <= 0) {
      return 0;
    }
    const toDelete = [];
    let deleted = 0;
    let done = false;
    const checkToDelete = async () => {
      const messageIDs = (done && toDelete) || (toDelete.length >= 100 && toDelete.splice(0, 100));
      if (messageIDs) {
        deleted += messageIDs.length;
        await this.deleteMessages(channelID, messageIDs, options.reason);
        if (done) {
          return deleted;
        }
        await sleep(1000);
        return checkToDelete();
      } else if (done) {
        return deleted;
      } else {
        await sleep(250);
        return checkToDelete();
      }
    };
    const del = async (_before, _after) => {
      const messages = await this.getMessages(channelID, {
        limit: 100,
        before: _before,
        after: _after,
      });
      if (limit !== -1 && limit <= 0) {
        done = true;
        return;
      }
      for (const message of messages) {
        if (limit !== -1 && limit <= 0) {
          break;
        }
        if (message.timestamp < Date.now() - 1209600000) { // 14d * 24h * 60m * 60s * 1000ms
          done = true;
          return;
        }
        if (!options.filter || options.filter(message)) {
          toDelete.push(message.id);
        }
        if (limit !== -1) {
          limit--;
        }
      }
      if ((limit !== -1 && limit <= 0) || messages.length < 100) {
        done = true;
        return;
      }
      await del((_before || !_after) && messages[messages.length - 1].id, _after && messages[0].id);
    };
    await del(options.before, options.after);
    return checkToDelete();
  }

  /**
   * Remove a user from a group
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
      reason,
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
    if (reaction === decodeURI(reaction)) {
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
    if (reaction === decodeURI(reaction)) {
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
   * Search for guild members by partial nickname/username
   * @arg {String} guildID The ID of the guild
   * @arg {String} query The query string to match username(s) and nickname(s) against
   * @arg {Number} [limit=1] The maximum number of members you want returned, capped at 100
   * @returns {Promise<Array<Member>>}
   */
  searchGuildMembers(guildID, query, limit) {
    return this.requestHandler.request("GET", Endpoints.GUILD_MEMBERS_SEARCH(guildID), true, {
      query,
      limit,
    }).then((members) => {
      const guild = this.guilds.get(guildID);
      return members.map((member) => new Member(member, guild, this));
    });
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
   * Send a soundboard sound to a connected voice channel
   * @arg {String} channelID The ID of the connected voice channel
   * @arg {Object} options The soundboard sound options
   * @arg {String} options.soundID The ID of the soundboard sound
   * @arg {String} [options.sourceGuildID] The ID of the guild where the soundboard sound was created, if not in the same guild
   * @returns {Promise}
   */
  sendSoundboardSound(channelID, options) {
    options.sound_id = options.soundID;
    options.source_guild_id = options.sourceGuildID;
    return this.requestHandler.request("POST", Endpoints.SOUNDBOARD_SOUNDS_SEND(channelID), true, options);
  }

  /**
   * Set the status of a voice channel. Note: This will not work in stage channels
   * @arg {String} channelID The ID of the channel
   * @arg {String} status The new voice channel status
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  setVoiceChannelStatus(channelID, status, reason) {
    return this.requestHandler.request("PUT", Endpoints.CHANNEL_VOICE_STATUS(channelID), true, {
      status,
      reason,
    });
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
   * @arg {String} guildID The ID of the guild
   * @arg {String} code The template code
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
      reason,
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
   * @arg {String} term The search term to check
   * @returns {Promise<Object>} An object with a `valid` field which is `true` when valid and `false` when invalid
   */
  validateDiscoverySearchTerm(term) {
    return this.requestHandler.request("GET", Endpoints.DISCOVERY_VALIDATION + `?term=${encodeURI(term)}`, true);
  }

  _formatAllowedMentions(allowed) {
    if (!allowed) {
      return this.options.allowedMentions;
    }
    const result = {
      parse: [],
    };
    if (allowed.everyone) {
      result.parse.push("everyone");
    }
    if (allowed.roles === true) {
      result.parse.push("roles");
    } else if (Array.isArray(allowed.roles)) {
      if (allowed.roles.length > 100) {
        throw new Error("Allowed role mentions cannot exceed 100.");
      }
      result.roles = allowed.roles;
    }
    if (allowed.users === true) {
      result.parse.push("users");
    } else if (Array.isArray(allowed.users)) {
      if (allowed.users.length > 100) {
        throw new Error("Allowed user mentions cannot exceed 100.");
      }
      result.users = allowed.users;
    }
    if (allowed.repliedUser !== undefined) {
      result.replied_user = allowed.repliedUser;
    }
    return result;
  }

  _formatImage(url, format, size) {
    if (!format || !Constants.ImageFormats.includes(format.toLowerCase())) {
      format = url.includes("/a_") ? "gif" : this.options.defaultImageFormat;
    }
    if (!size || size < Constants.ImageSizeBoundaries.MINIMUM || size > Constants.ImageSizeBoundaries.MAXIMUM || (size & (size - 1))) {
      size = this.options.defaultImageSize;
    }
    return `${Endpoints.CDN_URL}${url}.${format}?size=${size}`;
  }

  toString() {
    return `[Client ${this.user.id}]`;
  }

  toJSON(props = []) {
    return Base.prototype.toJSON.call(this, [
      "application",
      "bot",
      "channelGuildMap",
      "gatewayURL",
      "groupChannels",
      "guilds",
      "guildShardMap",
      "lastConnect",
      "lastReconnectDelay",
      "notes",
      "options",
      "presence",
      "dmChannelMap",
      "dmChannels",
      "ready",
      "reconnectAttempts",
      "requestHandler",
      "shards",
      "startTime",
      "unavailableGuilds",
      "userGuildSettings",
      "users",
      "userSettings",
      "voiceConnections",
      ...props,
    ]);
  }
}

module.exports = Client;
