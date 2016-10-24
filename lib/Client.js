"use strict";

const GuildChannel = require("./structures/GuildChannel");
const Collection = require("./util/Collection");
const Constants = require("./Constants");
const Endpoints = require("./rest/Endpoints");
const ExtendedUser = require("./structures/ExtendedUser");
const GroupChannel = require("./structures/GroupChannel");
const Guild = require("./structures/Guild");
const GuildIntegration = require("./structures/GuildIntegration");
const Invite = require("./structures/Invite");
const Member = require("./structures/Member");
const Message = require("./structures/Message");
const PrivateChannel = require("./structures/PrivateChannel");
const Relationship = require("./structures/Relationship");
const RequestHandler = require("./rest/RequestHandler");
const Role = require("./structures/Role");
const Shard = require("./gateway/Shard");
const User = require("./structures/User");
const VoiceConnectionManager = require("./voice/VoiceConnectionManager");
const SharedStream = require("./voice/SharedStream");

var EventEmitter;
try {
    EventEmitter = require("eventemitter3");
} catch(err) {
    EventEmitter = require("events").EventEmitter;
}
var Pako;
try {
    Pako = require("pako");
} catch(err) { // eslint-disable no-empty
}
var Promise;
try {
    Promise = require("bluebird");
} catch(err) {
    Promise = global.Promise;
}

/**
* Represents the main Eris client
* @extends EventEmitter
* @prop {String} token The bot user token
* @prop {Boolean?} bot Whether the bot user belongs to an OAuth2 application
* @prop {Object} options Eris options
* @prop {Object} channelGuildMap Object mapping channel IDs to guild IDs
* @prop {Collection<Shard>} shards Collection of shards Eris is using
* @prop {Collection<Guild>} guilds Collection of guilds the bot is in
* @prop {Object} privateChannelMap Object mapping user IDs to private channel IDs
* @prop {Collection<PrivateChannel>} privateChannels Collection of private channels the bot is in
* @prop {Collection<GroupChannel>} groupChannels Collection of group channels the bot is in (user accounts only)
* @prop {VoiceConnectionManager} voiceConnections Extended collection of VoiceConnections the bot has
* @prop {Object} retryAfters Object mapping endpoints to ratelimit expiry timestamps
* @prop {Object} guildShardMap Object mapping guild IDs to shard IDs
* @prop {Number} startTime Timestamp of bot ready event
* @prop {Collection<Guild>} unavailableGuilds Collection of unavailable guilds the bot is in
* @prop {Number} uptime How long in milliseconds the bot has been up for
* @prop {ExtendedUser} user The bot user
* @prop {Collection<User>} users Collection of users the bot sees
* @prop {Collection<Relationship>} relationships Collection of relationships the bot user has (user accounts only)
*/
class Client extends EventEmitter {
    /**
    * Create a Client
    * @arg {String} token bot token
    * @arg {Object} [options] Eris options (all options are optional)
    * @arg {Boolean} [options.autoreconnect=true] Have Eris autoreconnect when connection is lost
    * @arg {Boolean} [options.compress=true] Whether to request WebSocket data to be compressed or not
    * @arg {Number} [options.connectionTimeout=5000] How long in milliseconds to wait for the connection to handshake with the server
    * @arg {Object} [options.disableEvents] If disableEvents[eventName] is true, the WS event will not be processed. This can cause significant performance increase on large bots. [A full list of the WS event names can be found on the docs reference page](/docs/reference#ws-event-names)
    * @arg {Boolean} [options.disableEveryone=true] When true, filter out @everyone/@here by default in createMessage/editMessage
    * @arg {Number} [options.firstShardID=0] The ID of the first shard to run for this client
    * @arg {Boolean} [options.getAllUsers=false] Get all the users in every guild. Ready time will be severely delayed
    * @arg {Number} [options.guildCreateTimeout=2000] How long in milliseconds to wait for a GUILD_CREATE before "ready" is fired. Increase this value if you notice missing guilds
    * @arg {Number} [options.largeThreshold=250] The maximum number of offline users per guild during initial guild data transmission
    * @arg {Number} [options.lastShardID=options.maxShards - 1] The ID of the last shard to run for this client
    * @arg {Number} [options.maxShards=1] The total number of shards you want to run
    * @arg {Number} [options.messageLimit=100] The maximum size of a channel message cache
    * @arg {Boolean} [options.opusOnly=false] Whether to suppress the node-opus not found error or not
    * @arg {Boolean} [options.seedVoiceConnections=false] Whether to populate bot.voiceConnections with existing connections the bot account has during startup
    * @arg {Number} [options.sequencerWait=200] How long to wait between sending potentially ratelimited requests. This number should be at least 3/4 your ping (in milliseconds)
    */
    constructor(token, options) {
        super();

        this.options = {
            autoreconnect: true,
            compress: true,
            connectionTimeout: 5000,
            crystal: false,
            disableEvents: {},
            disableEveryone: true,
            firstShardID: 0,
            getAllUsers: false,
            guildCreateTimeout: 2000,
            largeThreshold: 250,
            maxShards: 1,
            messageLimit: 100,
            opusOnly: false,
            seedVoiceConnections: false,
            sequencerWait: 200
        };
        if(typeof options === "object") {
            for(var property of Object.keys(options)) {
                this.options[property] = options[property];
            }
        }
        if(this.options.lastShardID === undefined) {
            this.options.lastShardID = this.options.maxShards - 1;
        }
        if(typeof window !== "undefined" && !Pako) {
            this.options.compress = false; // zlib does not like Blobs, Pako is not here
        }

        this.token = token;

        this.requestHandler = new RequestHandler(this);

        this.ready = false;
        this.bot = true;
        this.startTime = 0;
        this.lastConnect = 0;
        this.connectQueue = [];
        this.channelGuildMap = {};
        this.shards = new Collection(Shard);
        this.groupChannels = new Collection(GroupChannel);
        this.guilds = new Collection(Guild);
        this.privateChannelMap = {};
        this.privateChannels = new Collection(PrivateChannel);
        this.retryAfters = {};
        this.guildShardMap = {};
        this.sharedStreams = {};
        this.unavailableGuilds = new Collection(Guild);
        this.relationships = new Collection(Relationship);
        this.users = new Collection(User);

        if(this.options.crystal) {
            var Crystal = require("eris-crystal");
            this.voiceConnections = new Crystal.ErisClient(this.options.crystal);
        } else {
            this.voiceConnections = new VoiceConnectionManager();
        }
    }

    get uptime() {
        return this.startTime ? Date.now() - this.startTime : 0;
    }

    /**
    * Tells all shards to connect.
    * @returns {Promise} Resolves when all shards are initialized
    */
    connect() {
        return this.getGateway().catch((err) => {
            this.emit("error", err);
            setTimeout(() => this.connect(), 2000);
        }).then((data) => {
            if(!data.url) {
                return Promise.reject(new Error("Invalid response from gateway REST call"));
            }
            if(data.url.includes("?")) {
                data.url = data.url.substring(0, data.url.indexOf("?"));
            }
            if(!data.url.endsWith("/")) {
                data.url += "/";
            }
            this.gatewayURL = `${data.url}?encoding=json&v=${Constants.GATEWAY_VERSION}`;
            for(var i = this.options.firstShardID; i <= this.options.lastShardID; ++i) {
                let shard = this.shards.get(i);
                if(!shard) {
                    shard = this.shards.add(new Shard(i, this));
                    shard.on("ready", () => {
                        /**
                        * Fired when a shard turns ready
                        * @event Client#shardReady
                        * @prop {Number} id The ID of the shard
                        */
                        this.emit("shardReady", shard.id);
                        if(this.ready) {
                            return;
                        }
                        for(var other of this.shards) {
                            if(!other[1].ready) {
                                return;
                            }
                        }
                        this.ready = true;
                        this.startTime = Date.now();
                        /**
                        * Fired when all shards turn ready
                        * @event Client#ready
                        */
                        this.emit("ready");
                    });
                    shard.on("resume", () => {
                        /**
                        * Fired when a shard resumes
                        * @event Client#shardResume
                        * @prop {Number} id The ID of the shard
                        */
                        this.emit("shardResume", shard.id);
                        if(this.ready) {
                            return;
                        }
                        for(var other of this.shards) {
                            if(!other[1].ready) {
                                return;
                            }
                        }
                        this.ready = true;
                        this.startTime = Date.now();
                        this.emit("ready");
                    });
                    shard.on("disconnect", (error) => {
                        /**
                        * Fired when a shard disconnects
                        * @event Client#shardDisconnect
                        * @prop {Error?} error The error, if any
                        * @prop {Number} id The ID of the shard
                        */
                        this.emit("shardDisconnect", error, shard.id);
                        this.tryConnect();
                        if(!this.ready) {
                            return;
                        }
                        for(var other of this.shards) {
                            if(other[1].ready) {
                                return;
                            }
                        }
                        this.ready = false;
                        this.startTime = 0;
                        /**
                        * Fired when all shards disconnect
                        * @event Client#disconnect
                        */
                        this.emit("disconnect");
                    });
                }
                this.queueConnect(shard);
            }
        });
    }

    /**
    * Get the Discord gateway URL
    * @returns {Promise<String>} Resolves with the gateway URL
    */
    getGateway() {
        return this.requestHandler.request("GET", Endpoints.GATEWAY);
    }

    /**
    * Get the Discord gateway URL along with bot metadata
    * @returns {Promise<Object>} Resolves with the gateway data
    */
    getBotGateway() {
        return this.requestHandler.request("GET", Endpoints.GATEWAY_BOT, true);
    }

    queueConnect(shard) {
        if(this.lastConnect <= Date.now() - 5250 && !this.shards.find((shard) => shard.connecting)) {
            shard.once("readyPacket", () => {
                this.lastConnect = Date.now();
                this.tryConnect();
            });
            shard.connect();
        } else {
            this.connectQueue.push(shard);
            this.tryConnect();
        }
    }

    tryConnect() {
        if(this.connectQueue.length > 0 && !this.shards.find((shard) => shard.connecting)) {
            if(this.lastConnect <= Date.now() - 5250) {
                var shard = this.connectQueue.shift();
                shard.once("readyPacket", () => {
                    this.lastConnect = Date.now();
                    this.tryConnect();
                });
                shard.connect();
                this.lastConnect = Date.now() + 5250;
            } else if(!this.connectTimeout) {
                this.connectTimeout = setTimeout(() => {
                    this.connectTimeout = null;
                    this.tryConnect();
                }, this.lastConnect - Date.now() + 5250);
            }
        }
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
        this.connectQueue = [];
    }

    /**
    * Join a voice channel. If joining a group call, the voice connection ID will be stored in voiceConnections as "call". Otherwise, it will be the guild ID
    * @arg {String} channelID The ID of the voice channel
    * @returns {Promise<VoiceConnection>} Resolves with a VoiceConnection
    */
    joinVoiceChannel(channelID, options) {
        var channel = this.getChannel(channelID);
        if(!channel) {
            return Promise.reject(new Error("Channel not found"));
        }
        if(channel.guild && !channel.permissionsOf(this.user.id).allow & Constants.Permissions.voiceConnect) {
            return Promise.reject(new Error("Insufficient permission to connect to voice channel"));
        }
        this.shards.get(this.guildShardMap[this.channelGuildMap[channelID]] || 0).sendWS(Constants.GatewayOPCodes.VOICE_STATE_UPDATE, {
            guild_id: this.channelGuildMap[channelID] || null,
            channel_id: channelID || null,
            self_mute: false,
            self_deaf: false
        });
        return this.voiceConnections.join(this.channelGuildMap[channelID] || "call", channelID, options);
    }

    /**
    * Leaves a voice channel
    * @arg {String} channelID The ID of the voice channel
    */
    leaveVoiceChannel(channelID) {
        var channel = this.getChannel(channelID);
        if(!channel) {
            return Promise.reject(new Error("Channel not found"));
        }
        this.voiceConnections.leave(this.channelGuildMap[channelID] || "call");
    }

    /** Creates a shared stream. Each shared stream contains a collection of VoiceConnections to output to.
    * @arg {String} source The input audio stream as a URL. Currently only supports web streams.
    * @returns {SharedStream}
    */
    createSharedStream(source) {
        if (typeof source !== "string") {
            return null;
        }

        if (this.sharedStreams[source]) {
            return this.sharedStreams[source];
        }

        var sharedStream = new SharedStream(source);
        this.sharedStreams[source] = sharedStream;
        return sharedStream;
    }

    /**
    * Updates the bot's status on all guilds
    * @arg {String} [status] Sets the bot's status, either "online", "idle", "dnd", or "invisible"
    * @arg {Object} [game] Sets the bot's active game, null to clear
    * @arg {String} game.name Sets the name of the bot's active game
    * @arg {Number} [game.type] The type of game. 0 is default, 1 is streaming (Twitch only)
    * @arg {String} [game.url] Sets the url of the shard's active game
    */
    editStatus(status, game) {
        this.shards.forEach((shard) => {
            shard.editStatus(status, game);
        });
    }

    /**
    * Get a Channel object from a channelID
    * @arg {String} [channelID] The ID of the channel
    * @returns {GuildChannel | GroupChannel | PrivateChannel}
    */
    getChannel(channelID) {
        return this.channelGuildMap[channelID] ? this.guilds.get(this.channelGuildMap[channelID]).channels.get(channelID) : this.privateChannels.get(channelID) || this.groupChannels.get(channelID);
    }

    /**
    * Create a channel in a guild
    * @arg {String} guildID The ID of the guild to create the channel in
    * @arg {String} name The name of the channel
    * @arg {String} [type=0] The type of the channel, either 0 or 2
    * @returns {Promise<GuildChannel>}
    */
    createChannel(guildID, name, type) {
        var guild = this.guilds.get(guildID);
        if(!guild) {
            return Promise.reject(new Error(`Guild ${guildID} not found`));
        }
        return this.requestHandler.request("POST", Endpoints.GUILD_CHANNELS(guildID), true, {
            name,
            type
        }).then((channel) => new GuildChannel(channel, guild));
    }

    /**
    * Edit a channel's properties
    * @arg {String} channelID The ID of the channel
    * @arg {Object} options The properties to edit
    * @arg {String} [options.name] The name of the channel
    * @arg {String} [options.icon] The icon of the channel as a base64 data URI (group channels only). Note: base64 strings alone are not base64 data URI strings
    * @arg {String} [options.ownerID] The ID of the channel owner (group channels only)
    * @arg {String} [options.topic] The topic of the channel (guild text channels only)
    * @arg {Number} [options.bitrate] The bitrate of the channel (guild voice channels only)
    * @arg {Number} [options.userLimit] The channel user limit (guild voice channels only)
    * @returns {Promise<GroupChannel | GuildChannel>}
    */
    editChannel(channelID, options) {
        var channel = this.getChannel(channelID);
        if(!channel) {
            return Promise.reject(new Error(`Channel ${channelID} not found`));
        }

        return this.requestHandler.request("PATCH", Endpoints.CHANNEL(channelID), true, {
            name: options.name || channel.name,
            icon: channel.type === 3 ? options.icon || channel.icon : undefined,
            owner_id: channel.type === 3 ? options.ownerID || channel.ownerID : undefined,
            topic: channel.type === 0 ? options.topic || channel.topic : undefined,
            bitrate: channel.type === 2 ? options.bitrate || channel.bitrate : undefined,
            user_limit: channel.type === 2 ? (options.userLimit !== undefined ? options.userLimit : channel.userLimit) : undefined
        }).then((data) => {
            if(channel.guild) {
                return new GuildChannel(data, channel.guild);
            } else {
                return new GroupChannel(data, this);
            }
        });
    }

    /**
    * Edit a guild channel's position. Note that channel position numbers are lowest on top and highest at the bottom.
    * @arg {String} channelID The ID of the channel
    * @arg {Number} position The new position of the channel
    * @returns {Promise}
    */
    editChannelPosition(channelID, position) {
        var channels = this.guilds.get(this.channelGuildMap[channelID]).channels;
        var channel = channels.get(channelID);
        if(!channel) {
            return Promise.reject(new Error(`Channel ${channelID} not found`));
        }
        if(channel.position === position) {
            return Promise.resolve();
        }
        var min = Math.min(position, channel.position);
        var max = Math.max(position, channel.position);
        channels = channels.filter((chan) => chan.type === channel.type && min <= chan.position && chan.position <= max && chan.id !== channelID).sort((a, b) => a.position - b.position);
        if(position > channel.position) {
            channels.push(channel);
        } else {
            channels.unshift(channel);
        }
        return this.requestHandler.request("PATCH", Endpoints.GUILD_CHANNELS(this.channelGuildMap[channelID]), true, channels.map((channel, index) => ({
            id: channel.id,
            position: index + min
        })));
    }

    /**
    * Delete a guild channel, or leave a private or group channel
    * @arg {String} channelID The ID of the channel
    * @returns {Promise}
    */
    deleteChannel(channelID) {
        return this.requestHandler.request("DELETE", Endpoints.CHANNEL(channelID), true);
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
    * Create a channel permission overwrite
    * @arg {String} channelID The ID of channel
    * @arg {String} overwriteID The ID of the overwritten user or role
    * @arg {Number} allow The permissions number for allowed permissions
    * @arg {Number} deny The permissions number for denied permissions
    * @arg {String} type The object type of the overwrite, either "member" or "role"
    * @returns {Promise}
    */
    editChannelPermission(channelID, overwriteID, allow, deny, type) {
        return this.requestHandler.request("PUT", Endpoints.CHANNEL_PERMISSION(channelID, overwriteID), true, {
            allow,
            deny,
            type
        });
    }

    /**
    * Delete a channel permission overwrite
    * @arg {String} channelID The ID of the channel
    * @arg {String} overwriteID The ID of the overwritten user or role
    * @returns {Promise}
    */
    deleteChannelPermission(channelID, overwriteID) {
        return this.requestHandler.request("DELETE", Endpoints.CHANNEL_PERMISSION(channelID, overwriteID), true);
    }

    /**
    * Get all invites in a channel
    * @arg {String} channelID The ID of the channel
    * @returns {Promise<Invite[]>}
    */
    getChannelInvites(channelID) {
        return this.requestHandler.request("GET", Endpoints.CHANNEL_INVITES(channelID), true).then((invites) => invites.map((invite) => new Invite(invite, this)));
    }

    /**
    * Create an invite for a channel
    * @arg {String} channelID The ID of the channel
    * @arg {Object} [options] Invite generation options
    * @arg {Number} [options.maxAge] How long the invite should last in seconds
    * @arg {Number} [options.maxUses] How many uses the invite should last for
    * @arg {Boolean} [options.temporary] Whether the invite is temporary or not
    * @returns {Promise<Invite>}
    */
    createChannelInvite(channelID, options) {
        options = options || {};
        return this.requestHandler.request("POST", Endpoints.CHANNEL_INVITES(channelID), true, {
            max_age: options.maxAge,
            max_uses: options.maxUses,
            temporary: options.temporary
        }).then((invite) => new Invite(invite, this));
    }

    /**
    * Get all the webhooks in a channel
    * @arg {String} channelID The ID of the channel to get webhooks for
    * @returns {Promise<Object[]>} Resolves with an array of webhook objects
    */
    getChannelWebhooks(channelID) {
        return this.requestHandler.request("GET", Endpoints.CHANNEL_WEBHOOKS(channelID), true);
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
    * Create a channel webhook
    * @arg {String} channelID The ID of the channel to create the webhook in
    * @arg {Object} options Webhook options
    * @arg {String} options.name The default name
    * @arg {String} options.avatar The default avatar as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
    * @returns {Promise<Object>} Resolves with a webhook object
    */
    createChannelWebhook(channelID, options) {
        return this.requestHandler.request("POST", Endpoints.CHANNEL_WEBHOOKS(channelID), true, options);
    }

    /**
    * Edit a webhook
    * @arg {String} webhookID The ID of the webhook
    * @arg {Object} options Webhook options
    * @arg {String} [options.name] The new default name
    * @arg {String} [options.avatar] The new default avatar as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
    * @arg {String} [token] The token of the webhook, used instead of the Bot Authorization token
    * @returns {Promise<Object>} Resolves with a webhook object
    */
    editWebhook(webhookID, options, token) {
        return this.requestHandler.request("PATCH", token ? Endpoints.WEBHOOK_TOKEN(webhookID, token) : Endpoints.WEBHOOK(webhookID), !token, options);
    }

    /**
    * Execute a webhook
    * @arg {String} webhookID The ID of the webhook
    * @arg {String} token The token of the webhook
    * @arg {Object} options Webhook execution options
    * @arg {String} [options.content=""] A content string
    * @arg {Object} [options.file] A file object
    * @arg {Buffer} options.file.file A buffer containing file data
    * @arg {String} options.file.name What to name the file
    * @arg {Object[]} [options.embeds] An array of Discord embeds
    * @arg {String} [options.username] A custom username, defaults to webhook default username if not specified
    * @arg {String} [options.avatarURL] A URL for a custom avatar, defaults to webhook default avatar if not specified
    * @arg {Boolean} [options.tts=false] Whether the message should be a TTS message or not
    * @arg {Boolean} [options.wait=false] Whether to wait for the server to confirm the message create or not
    * @arg {Boolean} [options.disableEveryone] Whether to filter @everyone/@here or not (overrides default)
    * @returns {Promise}
    */
    executeWebhook(webhookID, token, options) {
        if(!options.content && !options.file && !options.embeds) {
            return Promise.reject(new Error("No content, file, or embeds"));
        }
        if(options.content && (options.disableEveryone !== undefined ? options.disableEveryone : this.options.disableEveryone)) {
            options.content = options.content.replace(/@everyone/g, "@\u200beveryone").replace(/@here/g, "@\u200bhere");
        }
        return this.requestHandler.request("POST", Endpoints.WEBHOOK_TOKEN(webhookID, token) + (options.wait ? "?wait=true" : ""), true, {
            content: options.content,
            embeds: options.embeds,
            username: options.username,
            avatar_url: options.avatarURL,
            tts: options.tts
        }, options.file);
    }

    /**
    * Execute a slack-style webhook
    * @arg {String} webhookID The ID of the webhook
    * @arg {String} token The token of the webhook
    * @arg {Object} options Slack webhook options
    * @arg {Boolean} [options.wait=false] Whether to wait for the server to confirm the message create or not
    * @returns {Promise}
    */
    executeSlackWebhook(webhookID, token, options) {
        var wait = !!options.wait;
        options.wait = undefined;
        return this.requestHandler.request("POST", Endpoints.WEBHOOK_TOKEN_SLACK(webhookID, token) + (wait ? "?wait=true" : ""), true, options);
    }

    /**
    * Delete a webhook
    * @arg {String} webhookID The ID of the webhook
    * @arg {String} [token] The token of the webhook, used instead of the Bot Authorization token
    */
    deleteWebhook(webhookID, token) {
        return this.requestHandler.request("DELETE", token ? Endpoints.WEBHOOK_TOKEN(webhookID, token) : Endpoints.WEBHOOK(webhookID), !token);
    }

    /**
    * Get all the webhooks in a guild
    * @arg {String} guildID The ID of the guild to get webhooks for
    * @returns {Promise<Object[]>} Resolves with an array of webhook objects
    */
    getGuildWebhooks(guildID) {
        return this.requestHandler.request("GET", Endpoints.GUILD_WEBHOOKS(guildID), true);
    }

    /**
    * Create a guild emoji object (not for bot accounts)
    * @arg {String} guildID The ID of the guild to create the emoji in
    * @arg {Object} options Emoji options
    * @arg {String} options.name The name of emoji
    * @arg {String} options.image The base 64 encoded string
    * @arg {Array} [options.roles] An array containing authorized role IDs
    * @returns {Promise<Object>} A guild emoji object
    */
    createGuildEmoji(guildID, options) {
      return this.requestHandler.request("POST", Endpoints.GUILD_EMOJIS(guildID), true, options);
    }
    /**
    * Edit a guild emoji object (not for bot accounts)
    * @arg {String} guildID The ID of the guild to edit the emoji in
    * @arg {String} emojiID The ID of the emoji you want to modify
    * @arg {Object} options Emoji options
    * @arg {String} [options.name] The name of emoji
    * @arg {Array} [options.roles] An array containing authorized role IDs
    * @returns {Promise<Object>} A guild emoji object
    */
    editGuildEmoji(guildID, emojiID, options) {
      return this.requestHandler.request("PATCH", Endpoints.GUILD_EMOJI(guildID, emojiID), true, options);
    }
    /**
    * Delete a guild emoji object (not for bot accounts)
    * @arg {String} guildID The ID of the guild to delete the emoji in
    * @arg {String} emojiID The ID of the emoji
    * @returns {Promise}
    */
    deleteGuildEmoji(guildID, emojiID) {
      return this.requestHandler.request("DELETE", Endpoints.GUILD_EMOJI(guildID, emojiID), true);
    }
    /**
    * Create a guild role
    * @arg {String} guildID The ID of the guild to create the role in
    * @returns {Promise<Role>}
    */
    createRole(guildID) {
        return this.requestHandler.request("POST", Endpoints.GUILD_ROLES(guildID), true).then((role) => new Role(role, this.guilds.get(guildID)));
    }

    /**
    * Edit a guild role
    * @arg {String} guildID The ID of the guild the role is in
    * @arg {String} roleID The ID of the role
    * @arg {Object} options The properties to edit
    * @arg {String} [options.name] The name of the role
    * @arg {Number} [options.permissions] The role permissions number
    * @arg {Number} [options.color] The hex color of the role, in number form (ex: 0x3da5b3 or 4040115)
    * @arg {Boolean} [options.hoist] Whether to hoist the role in the user list or not
    * @arg {Boolean} [options.mentionable] Whether the role is mentionable or not
    * @returns {Promise<Role>}
    */
    editRole(guildID, roleID, options) {
        var guild = this.guilds.get(guildID);
        if(!guild) {
            return Promise.reject(new Error("Invalid guild ID"));
        }
        var role = guild.roles.get(roleID);
        if(!role) {
            return Promise.reject(new Error("Invalid role ID"));
        }
        return this.requestHandler.request("PATCH", Endpoints.GUILD_ROLE(guildID, roleID), true, {
            name: options.name || role.name,
            permissions: options.permissions !== undefined ? options.permissions : role.permissions.allow,
            color: options.color || role.color,
            hoist: options.hoist || role.hoist,
            mentionable: options.mentionable || role.mentionable
        }).then((role) => new Role(role, guild));
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
        var roles = this.guilds.get(guildID).roles;
        var role = roles.get(roleID);
        if(!role) {
            return Promise.reject(new Error(`Role ${roleID} not found`));
        }
        if(role.position === position) {
            return Promise.resolve();
        }
        var min = Math.min(position, role.position);
        var max = Math.max(position, role.position);
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
    * Create a guild role
    * @arg {String} guildID The ID of the guild to create the role in
    * @arg {String} roleID The ID of the role
    * @returns {Promise}
    */
    deleteRole(guildID, roleID) {
        return this.requestHandler.request("DELETE", Endpoints.GUILD_ROLE(guildID, roleID), true);
    }

    /**
    * Get the prune count for a guild
    * @arg {String} guildID The ID of the guild
    * @arg {Number} days The number of days of inactivity to prune for
    * @returns {Promise<Number>} Resolves with the number of users that would be pruned
    */
    getPruneCount(guildID, days) {
        return this.requestHandler.request("GET", Endpoints.GUILD_PRUNE(guildID), true, {
            days
        }).then((data) => data.pruned);
    }

    /**
    * Begin pruning a guild
    * @arg {String} guildID The ID of the guild
    * @arg {Number} days The number of days of inactivity to prune for
    * @returns {Promise<Number>} Resolves with the number of pruned users
    */
    pruneMembers(guildID, days) {
        return this.requestHandler.request("POST", Endpoints.GUILD_PRUNE(guildID), true, {
            days
        }).then((data) => data.pruned);
    }

    /**
    * Get a list of general/guild-specific voice reigons
    * @arg {String} [guildID] The ID of the guild
    * @returns {Promise<Object[]>} Resolves with an array of voice region objects
    */
    getVoiceRegions(guildID) {
        return guildID ? this.requestHandler.request("GET", Endpoints.GUILD_VOICE_REGIONS(guildID), true) : this.requestHandler.request("GET", Endpoints.VOICE_REGIONS, true); // TODO parse regions
    }

    /**
    * Get info on an invite
    * @arg {String} inviteID The ID of the invite
    * @returns {Promise<Invite>}
    */
    getInvite(inviteID) {
        return this.requestHandler.request("GET", Endpoints.INVITE(inviteID), true).then((invite) => {
            if(this.channelGuildMap[invite.channel.id] && this.getChannel(invite.channel.id).permissionsOf(this.user.id).json.manageChannels) {
                return this.requestHandler.request("POST", Endpoints.CHANNEL_INVITES(invite.channel.id), true, {
                    validate: inviteID
                }).then((extendedInvite) => new Invite(extendedInvite, this));
            }
            return new Invite(invite, this);
        });
    }

    /**
    * Accept an invite (not for bot accounts)
    * @arg {String} inviteID The ID of the invite
    * @returns {Promise<Invite>}
    */
    acceptInvite(inviteID) {
        return this.requestHandler.request("POST", Endpoints.INVITE(inviteID), true).then((invite) => new Invite(invite, this));
    }

    /**
    * Delete an invite
    * @arg {String} inviteID The ID of the invite
    * @returns {Promise}
    */
    deleteInvite(inviteID) {
        return this.requestHandler.request("DELETE", Endpoints.INVITE(inviteID), true);
    }

    /**
    * Get properties of the bot user
    * @returns {Promise<ExtendedUser>}
    */
    getSelf() {
        return this.requestHandler.request("GET", Endpoints.USER("@me"), true).then((data) => new ExtendedUser(data));
    }

    /**
    * Edit properties of the bot user
    * @arg {Object} options The properties to edit
    * @arg {String} [options.username] The new username
    * @arg {String} [options.avatar] The new avatar as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
    * @returns {Promise<ExtendedUser>}
    */
    editSelf(options) {
        if(!this.user) {
            return Promise.reject(new Error("Bot not ready yet"));
        }
        return this.requestHandler.request("PATCH", Endpoints.USER("@me"), true, {
            username: options.username || this.user.username,
            avatar: options.avatar || this.user.avatar
        }).then((data) => new ExtendedUser(data));
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
    * Create a group channel with other users
    * @arg {String[]} userIDs The IDs of the other users
    * @returns {Promise<PrivateChannel>}
    */
    createGroupChannel(userIDs) {
        return this.requestHandler.request("POST", Endpoints.USER_CHANNELS("@me"), true, {
            recipients: userIDs,
            type: 3
        }).then((privateChannel) => new GroupChannel(privateChannel, this));
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
    * Get previous messages in a channel
    * @arg {String} channelID The ID of the channel
    * @arg {Number} [limit=50] The max number of messages to get (maximum 100)
    * @arg {String} [before] Get messages before this message ID
    * @arg {String} [after] Get messages after this message ID
    * @arg {String} [around] Get messages around this message ID (does not work with limit > 100)
    * @returns {Promise<Message[]>}
    */
    getMessages(channelID, limit, before, after, around) {
        if(limit && limit > 100) {
            return new Promise((resolve, reject) => {
                var logs = [];
                var get = (_before, _after) => {
                    this.requestHandler.request("GET", Endpoints.CHANNEL_MESSAGES(channelID), true, {
                        limit: 100,
                        before: _before || undefined,
                        after: _after || undefined
                    }).catch(reject).then((messages) => {
                        if(limit <= messages.length) {
                            return resolve((_after ? messages.slice(messages.length - limit, messages.length).map((message) => new Message(message, this)).concat(logs) : logs.concat(messages.slice(0, limit).map((message) => new Message(message, this)))));
                        }
                        limit -= messages.length;
                        logs = (_after ? messages.map((message) => new Message(message, this)).concat(logs) : logs.concat(messages.map((message) => new Message(message, this))));
                        if(messages.length < 100) {
                            return resolve(logs);
                        }
                        this.emit("debug", `Getting ${limit} more messages during getMessages for ${channelID}: ${_before} ${_after}`, -1);
                        get((_before || !_after) && messages[messages.length - 1].id, _after && messages[0].id);
                    });
                };
                get(before, after);
            });
        }
        return this.requestHandler.request("GET", Endpoints.CHANNEL_MESSAGES(channelID), true, {
            limit: limit || 50,
            before,
            after,
            around
        }).then((messages) => messages.map((message) => {
            try {
                return new Message(message, this);
            } catch(err) {
                this.emit("error", `ERROR CREATING MESSAGE FROM CHANNEL MESSAGES: ${JSON.stringify(messages)}`);
                return null;
            }
        }));
    }

    /**
    * Get all the pins in a channel
    * @arg {String} channelID The ID of the channel
    * @returns {Promise<Message[]>}
    */
    getPins(channelID) {
        return this.requestHandler.request("GET", Endpoints.CHANNEL_PINS(channelID), true).then((messages) => messages.map((message) => new Message(message, this)));
    }

    /**
    * Create a message in a channel
    * Note: If you want to DM someone, the user ID is <b>not</b> the DM channel ID. use Client.getDMChannel() to get the DM channel for a user
    * @arg {String} channelID The ID of the channel
    * @arg {String | Array | Object} content A string, array of strings, or object. If an object is passed:
    * @arg {String} content.content A content string
    * @arg {Boolean} [content.tts] Set the message TTS flag
    * @arg {Boolean} [content.disableEveryone] Whether to filter @everyone/@here or not (overrides default)
    * @arg {Object} [file] A file object
    * @arg {Buffer} file.file A buffer containing file data
    * @arg {String} file.name What to name the file
    * @returns {Promise<Message>}
    */
    createMessage(channelID, content, file) {
        if(typeof content === "string") {
            content = {
                content: content
            };
        } else if(typeof content !== "object" || content.content === undefined) {
            content = {
                content: "" + content
            };
        } else if(typeof content.content !== "string") {
            content.content = (content.content || "").toString();
        }
        if(!content.content && !file) {
            return Promise.reject(new Error("No content or file"));
        }
        if(content.disableEveryone !== undefined ? content.disableEveryone : this.options.disableEveryone) {
            content.content = content.content.replace(/@everyone/g, "@\u200beveryone").replace(/@here/g, "@\u200bhere");
        }
        return this.requestHandler.request("POST", Endpoints.CHANNEL_MESSAGES(channelID), true, content, file).then((message) => new Message(message, this));
    }

    /**
    * Edit a message
    * @arg {String} channelID The ID of the channel
    * @arg {String} messageID The ID of the message
    * @arg {String} content The updated message content
    * @arg {Boolean} [disableEveryone] Whether to filter @everyone/@here or not (overrides default)
    * @returns {Promise<Message>}
    */
    editMessage(channelID, messageID, content, disableEveryone) {
        if(content == null) {
            content = "" + content;
        }
        if(typeof content !== "string") {
            content = content.toString();
        }
        if(disableEveryone !== undefined ? disableEveryone : this.options.disableEveryone) {
            content = content.replace(/@everyone/g, "@\u200beveryone").replace(/@here/g, "@\u200bhere");
        }
        return this.requestHandler.request("PATCH", Endpoints.CHANNEL_MESSAGE(channelID, messageID), true, {
            content
        }).then((message) => new Message(message, this));
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
    * Unpin a message
    * @arg {String} channelID The ID of the channel
    * @arg {String} messageID The ID of the message
    * @returns {Promise}
    */
    unpinMessage(channelID, messageID) {
        return this.requestHandler.request("DELETE", Endpoints.CHANNEL_PIN(channelID, messageID), true);
    }

    /**
    * Delete a message
    * @arg {String} channelID The ID of the channel
    * @arg {String} messageID The ID of the message
    * @returns {Promise}
    */
    deleteMessage(channelID, messageID) {
        return this.requestHandler.request("DELETE", Endpoints.CHANNEL_MESSAGE(channelID, messageID), true);
    }

    /**
    * Bulk delete messages (bot accounts only)
    * @arg {String} channelID The ID of the channel
    * @arg {String[]} messageIDs Array of message IDs to delete
    * @returns {Promise}
    */
    deleteMessages(channelID, messageIDs) {
        if(messageIDs.length === 0) {
            return Promise.resolve();
        }
        if(messageIDs.length === 1) {
            return this.deleteMessage(channelID, messageIDs[0]);
        }
        if(messageIDs.length > 100) {
            return this.requestHandler.request("POST", Endpoints.CHANNEL_BULK_DELETE(channelID), true, {
                messages: messageIDs.splice(0, 100)
            }).then(() => this.deleteMessages(channelID, messageIDs));
        }
        return this.requestHandler.request("POST", Endpoints.CHANNEL_BULK_DELETE(channelID), true, {
            messages: messageIDs
        });
    }

    /**
    * Purge previous messages in a channel with an optional filter (bot accounts only)
    * @arg {String} channelID The ID of the channel
    * @arg {Number} limit The max number of messages to search through, -1 for no limit
    * @arg {function} [filter] Optional filter function that returns a boolean when passed a Message object
    * @arg {String} [before] Get messages before this message ID
    * @arg {String} [after] Get messages after this message ID
    * @returns {Promise<Number>} Resolves with the number of messages deleted
    */
    purgeChannel(channelID, limit, filter, before, after) {
        if(typeof filter === "string") {
            filter = (msg) => msg.content.includes(filter);
        }
        return new Promise((resolve, reject) => {
            var toDelete = [];
            var deleted = 0;
            var done = false;
            var checkToDelete = () => {
                var messageIDs = (done && toDelete) || (toDelete.length >= 100 && toDelete.splice(0, 100));
                if(messageIDs) {
                    deleted += messageIDs.length;
                    this.deleteMessages(channelID, messageIDs).catch(reject).then(() => {
                        if(done) {
                            return resolve(deleted);
                        }
                        setTimeout(() => {
                            checkToDelete();
                        }, 1000);
                    });
                } else if(done) {
                    return resolve(deleted);
                } else {
                    setTimeout(() => {
                        checkToDelete();
                    }, 250);
                }
            };
            var del = (_before, _after) => {
                this.getMessages(channelID, 100, _before, _after).catch(reject).then((messages) => {
                    if(limit === 0) {
                        done = true;
                        return;
                    }
                    for(var message of messages) {
                        if(limit === 0) {
                            break;
                        }
                        if(!filter || filter(message)) {
                            toDelete.push(message.id);
                        }
                        limit--;
                    }
                    if(limit === 0 || messages.length < 100) {
                        done = true;
                        return;
                    }
                    del((_before || !_after) && messages[messages.length - 1].id, _after && messages[0].id);
                });
            };
            del(before, after);
            checkToDelete();
        });
    }

    /**
    * Get a guild's embed object
    * @arg {String} guildID The ID of the guild
    * @returns {Promise<Object>} A guild embed object
    */
    getGuildEmbed(guildID) {
        return this.requestHandler.request("GET", Endpoints.GUILD_EMBED(guildID), true);
    }

    /**
    * Get a list of integrations for a guild
    * @arg {String} guildID The ID of the guild
    * @returns {Promise<GuildIntegration[]>}
    */
    getGuildIntegrations(guildID) {
        var guild = this.guilds.get(guildID);
        return this.requestHandler.request("GET", Endpoints.GUILD_INTEGRATIONS(guildID), true).then((integrations) => integrations.map((integration) => new GuildIntegration(integration, guild)));
    }

    /**
    * Edit a guild integration
    * @arg {String} guildID The ID of the guild
    * @arg {String} integrationID The ID of the integration
    * @arg {Object} options The properties to edit
    * @arg {String} [options.expireBehavior] What to do when a user's subscription runs out
    * @arg {String} [options.expireGracePeriod] How long before the integration's role is removed from an unsubscribed user
    * @arg {String} [options.enableEmoticons] Whether to enable integration emoticons or not
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
    * Delete a guild integration
    * @arg {String} guildID The ID of the guild
    * @arg {String} integrationID The ID of the integration
    * @returns {Promise}
    */
    deleteGuildIntegration(guildID, integrationID) {
        return this.requestHandler.request("DELETE", Endpoints.GUILD_INTEGRATION(guildID, integrationID), true);
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
    * Get all invites in a guild
    * @arg {String} guildID The ID of the guild
    * @returns {Promise<Invite[]>}
    */
    getGuildInvites(guildID) {
        return this.requestHandler.request("GET", Endpoints.GUILD_INVITES(guildID), true).then((invites) => invites.map((invite) => new Invite(invite, this)));
    }

    /**
    * Ban a user from a guild
    * @arg {String} guildID The ID of the guild
    * @arg {String} userID The ID of the user
    * @arg {Number} [deleteMessageDays=0] Number of days to delete messages for
    * @returns {Promise}
    */
    banGuildMember(guildID, userID, deleteMessageDays) {
        return this.requestHandler.request("PUT", Endpoints.GUILD_BAN(guildID, userID), true, {
            "delete-message-days": deleteMessageDays || 0
        });
    }

    /**
    * Unban a user from a guild
    * @arg {String} guildID The ID of the guild
    * @arg {String} userID The ID of the user
    * @returns {Promise}
    */
    unbanGuildMember(guildID, userID) {
        return this.requestHandler.request("DELETE", Endpoints.GUILD_BAN(guildID, userID), true);
    }

    /**
    * Create a guild
    * @arg {String} name The name of the guild
    * @arg {String} region The region of the guild
    * @arg {String} [icon] The guild icon as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
    * @returns {Promise<Guild>}
    */
    createGuild(name, region, icon) {
        icon = icon || null;
        return this.requestHandler.request("POST", Endpoints.GUILDS, true, {
            name,
            region,
            icon
        }).then((guild) => new Guild(guild, this));
    }

    /**
    * Edit a guild
    * @arg {String} guildID The ID of the guild
    * @arg {Object} options The properties to edit
    * @arg {String} [options.name] The ID of the guild
    * @arg {String} [options.region] The region of the guild
    * @arg {String} [options.icon] The guild icon as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
    * @arg {Number} [options.verificationLevel] The guild verification level
    * @arg {Number} [options.defaultNotifications] The default notification settings for the guild. 0 is "All Messages", 1 is "Only @mentions".
    * @arg {String} [options.afkChannelID] The ID of the AFK voice channel
    * @arg {Number} [options.afkTimeout] The AFK timeout in seconds
    * @arg {String} [options.ownerID] The ID of the user to transfer server ownership to (bot user must be owner)
    * @arg {String} [options.splash] The guild splash image as a base64 data URI (VIP only). Note: base64 strings alone are not base64 data URI strings
    * @returns {Promise<Guild>}
    */
    editGuild(guildID, options) {
        var guild = this.guilds.get(guildID);
        if(!guild) {
            return Promise.reject(new Error(`Guild ${guildID} not found`));
        }

        return this.requestHandler.request("PATCH", Endpoints.GUILD(guildID), true, {
            name: options.name || guild.name,
            region: options.region,
            icon: options.icon,
            verification_level: options.verificationLevel,
            default_message_notifications: options.defaultNotifications,
            afk_channel_id: options.afkChannelID,
            afk_timeout: options.afkTimeout,
            splash: options.splash,
            owner_id: options.ownerID
        }).then((guild) => new Guild(guild, this));
    }

    /**
    * Get the ban list of a guild
    * @arg {String} guildID The ID of the guild
    * @returns {Promise<User[]>}
    */
    getGuildBans(guildID) {
        return this.requestHandler.request("GET", Endpoints.GUILD_BANS(guildID), true).then((bans) => bans.map((ban) => new User(ban.user, this)));
    }

    /**
    * Edit a guild member
    * @arg {String} guildID The ID of the guild
    * @arg {String} userID The ID of the user
    * @arg {Object} options The properties to edit
    * @arg {String[]} [options.roles] The array of role IDs the user should have
    * @arg {String} [options.nick] Set the user's server nickname, "" to remove
    * @arg {Boolean} [options.mute] Server mute the user
    * @arg {Boolean} [options.deaf] Server deafen the user
    * @arg {String} [options.channelID] The ID of the voice channel to move the user to (must be in voice)
    * @returns {Promise}
    */
    editGuildMember(guildID, userID, options) {
        return this.requestHandler.request("PATCH", Endpoints.GUILD_MEMBER(guildID, userID), true, {
            roles: options.roles,
            nick: options.nick,
            mute: options.mute,
            deaf: options.deaf,
            channel_id: options.channelID
        });
    }

    /**
    * Edit the bot's nickname in a guild
    * @arg {String} guildID The ID of the guild
    * @arg {String} nick The nickname
    * @returns {Promise}
    */
    editNickname(guildID, nick) {
        return this.requestHandler.request("PATCH", Endpoints.GUILD_MEMBER_NICK(guildID, "@me"), true, {
            nick
        });
    }

    /**
    * Kick a member from a guild
    * @arg {String} guildID The ID of the guild
    * @arg {String} userID The ID of the user
    * @returns {Promise}
    */
    kickGuildMember(guildID, userID) {
        return this.requestHandler.request("DELETE", Endpoints.GUILD_MEMBER(guildID, userID), true);
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
    * Leave a guild
    * @arg {String} guildID The ID of the guild
    * @returns {Promise}
    */
    leaveGuild(guildID) {
        return this.requestHandler.request("DELETE", Endpoints.USER_GUILD("@me", guildID), true);
    }

    /**
    * Get data on an OAuth2 application
    * @arg {String} [appID="@me"] The client ID of the application to get data for. "@me" refers to the logged in user's own application
    * @returns {Promise<Object>} The bot's application data. Refer to [the official Discord API documentation entry](https://discordapp.com/developers/docs/topics/oauth2#get-current-application-information) for Object structure
    */
    getOAuthApplication(appID) {
        return this.requestHandler.request("GET", Endpoints.OAUTH2_APPLICATION(appID || "@me"), true);
    }

    /**
    * Create a relationship with a user
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
    * Remove a relationship with a user
    * @arg {String} userID The ID of the target user
    * @returns {Promise}
    */
    removeRelationship(userID) {
        return this.requestHandler.request("DELETE", Endpoints.USER_RELATIONSHIP("@me", userID), true);
    }

    /**
    * Add a user to a group
    * @arg {String} groupID The ID of the target group
    * @arg {String} userID The ID of the target user
    * @returns {Promise}
    */
    addGroupRecipient(groupID, userID) {
        return this.requestHandler.request("PUT", Endpoints.CHANNEL_RECIPIENT(groupID, userID), true);
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
    * Get a channel's data via the REST API. Users should use the bot's cache instead of relying on this endpoint.
    * @arg {String} channelID The ID of the channel
    * @returns {Promise<GuildChannel | GroupChannel | PrivateChannel>}
    */
    getRESTChannel(channelID) {
        return this.requestHandler.request("GET", Endpoints.CHANNEL(channelID), true).then((channel) => {
            if(channel.type === 0 || channel.type === 2) {
                return new GuildChannel(channel, this.guilds.get(channel.guild_id));
            } else if(channel.type === 1) {
                return new PrivateChannel(channel, this);
            } else if(channel.type === 3) {
                return new GroupChannel(channel, this);
            } else {
                throw new Error(`Unsupported channel type: ${channel.type}`);
            }
        });
    }

    /**
    * Get a guild's data via the REST API. Users should use the bot's cache instead of relying on this endpoint.
    * @arg {String} guildID The ID of the guild
    * @returns {Promise<Guild>}
    */
    getRESTGuild(guildID) {
        return this.requestHandler.request("GET", Endpoints.GUILD(guildID), true).then((guild) => new Guild(guild, this));
    }

    /**
    * Get a list of the user's guilds via the REST API. Users should use the bot's cache instead of relying on this endpoint.
    * @arg {Number} [limit=100] The max number of guilds to get (1 to 1000)
    * @arg {String} [before] The lowest guild ID of the next page
    * @arg {String} [after] The highest guild ID of the previous page
    * @returns {Promise<Object[]>}
    */
    getRESTGuilds(limit, before, after) {
        return this.requestHandler.request("GET", Endpoints.USER_GUILDS("@me"), true, {
            limit,
            before,
            after
        });
    }

    /**
    * Get a guild's channels via the REST API. Users should use the bot's cache instead of relying on this endpoint.
    * @arg {String} guildID The ID of the guild
    * @returns {Promise<GuildChannel[]>}
    */
    getGuildChannels(guildID) {
        var guild = this.guilds.get(guildID);
        if(!guild) {
            return Promise.reject(new Error("Guild not found"));
        }
        return this.requestHandler.request("GET", Endpoints.GUILD_CHANNELS(guildID), true).then((channels) => channels.map((channel) => new GuildChannel(channel, guild)));
    }

    /**
    * Get a guild's emojis via the REST API. Users should use the bot's cache instead of relying on this endpoint.
    * @arg {String} guildID The ID of the guild
    * @returns {Promise<Object[]>} An array of guild emoji objects
    */
    getGuildEmojis(guildID) {
        return this.requestHandler.request("GET", Endpoints.GUILD_EMOJIS(guildID), true);
    }

    /**
    * Get a guild emoji via the REST API. Users should use the bot's cache instead of relying on this endpoint.
    * @arg {String} guildID The ID of the guild
    * @arg {String} emojiID The ID of the emoji
    * @returns {Promise<Object>} An emoji object
    */
    getGuildEmoji(guildID, emojiID) {
        return this.requestHandler.request("GET", Endpoints.GUILD_EMOJI(guildID, emojiID), true);
    }

    /**
    * Get a guild's members via the REST API. Users should use the bot's cache instead of relying on this endpoint.
    * @arg {String} guildID The ID of the guild
    * @arg {Number} [limit=1] The max number of members to get (1 to 1000)
    * @arg {String} [after] The highest user ID of the previous page
    * @returns {Promise<Member[]>}
    */
    getGuildMembers(guildID, limit, after) {
        var guild = this.guilds.get(guildID);
        if(!guild) {
            return Promise.reject(new Error("Guild not found"));
        }
        return this.requestHandler.request("GET", Endpoints.GUILD_MEMBERS(guildID), true, {
            limit,
            after
        }).then((members) => members.map((member) => new Member(member, guild)));
    }

    /**
    * Get a guild's members via the REST API. Users should use the bot's cache instead of relying on this endpoint.
    * @arg {String} guildID The ID of the guild
    * @arg {String} memberID The ID of the member
    * @returns {Promise<Member>}
    */
    getGuildMember(guildID, memberID) {
        var guild = this.guilds.get(guildID);
        if(!guild) {
            return Promise.reject(new Error("Guild not found"));
        }
        return this.requestHandler.request("GET", Endpoints.GUILD_MEMBER(guildID, memberID), true).then((member) => new Member(member, guild));
    }

    /**
    * Get a guild's roles via the REST API. Users should use the bot's cache instead of relying on this endpoint.
    * @arg {String} guildID The ID of the guild
    * @returns {Promise<Role[]>}
    */
    getGuildRoles(guildID) {
        var guild = this.guilds.get(guildID);
        if(!guild) {
            return Promise.reject(new Error("Guild not found"));
        }
        return this.requestHandler.request("GET", Endpoints.GUILD_ROLES(guildID), true).then((roles) => roles.map((role) => new Role(role, guild)));
    }

    /**
    * Get a user's data via the REST API. Users should use the bot's cache instead of relying on this endpoint.
    * @arg {String} userID The ID of the user
    * @returns {Promise<User>}
    */
    getRESTUser(userID) {
        return this.requestHandler.request("GET", Endpoints.USER(userID), true).then((user) => new User(user, this));
    }
}

module.exports = Client;
