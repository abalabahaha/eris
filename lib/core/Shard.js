"use strict";

const Bucket = require("../util/Bucket");
const Call = require("./Call");
const EventEmitter = require("eventemitter3");
const ExtendedUser = require("./ExtendedUser");
const OPCodes = require("../Constants").GatewayOPCodes;
const User = require("./User");
const WebSocket = require("ws");
const Zlib = require("zlib");

/**
* Represents a shard
* @extends EventEmitter
* @prop {Number} id The ID of the shard
* @prop {Boolean} connecting Whether the shard is connecting
* @prop {Boolean} ready Whether the shard is ready
* @prop {Number} guildCount The number of guilds this shard handles
* @prop {Array<String>?} discordServerTrace Debug trace of Discord servers
*/
class Shard extends EventEmitter {
    constructor(id, client) {
        super();

        this.hardReset();

        this.id = id;
        this.client = client;

        this.globalBucket = new Bucket(120, 60000, 0);
        this.presenceUpdateBucket = new Bucket(5, 60000, 0);
    }

    /**
    * Tells the shard to connect
    */
    connect() {
        if(this.ws && this.ws.readyState != WebSocket.CLOSED) {
            this.client.emit("error", new Error("Existing connection detected"), this.id);
        }
        this.connectAttempts++;
        this.connecting = true;
        return this.initializeWS();
    }

    /**
    * Disconnects the shard
    * @arg {Object?} [options] Shard disconnect options
    * @arg {String | Boolean} [options.reconnect] false means destroy everything, true means you want to reconnect in the future, "auto" will autoreconnect
    */
    disconnect(options, error) {
        var ws = this.ws;
        this.ws = null;
        options = options || {};
        this.ready = this.connecting = false;
        this.client.voiceConnections.forEach((connection) => {
            if(connection.shard.id === this.id) {
                connection.disconnect();
                this.client.voiceConnections.remove(connection);
            }
        });
        if(this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if(ws) {
            try {
                ws.close(options.reconnect && this.sessionID ? 4000 : 1000);
            } catch(err) {
                /**
                * Fired when the shard encounters an error
                * @event Client#error
                * @prop {Error} err The error
                * @prop {Number} id The ID of the shard
                */
                this.client.emit("error", err, this.id);
            }
            /**
            * Fired when the shard disconnects
            * @event Shard#disconnect
            * @prop {Error?} err The error, if any
            */
            this.emit("disconnect", error || null);
        }
        this.reset();
        if(options.reconnect === "auto" && this.client.options.autoreconnect) {
            /**
            * Fired when stuff happens and gives more info
            * @event Client#debug
            * @prop {String} message The debug message
            * @prop {Number} id The ID of the shard
            */
            this.client.emit("debug", `Queueing reconnect in ${this.reconnectInterval}ms | Attempt ${this.connectAttempts}`, this.id);
            setTimeout(() => {
                this.client.queueConnect(this);
            }, this.reconnectInterval);
            this.reconnectInterval = Math.min(Math.round(this.reconnectInterval * (Math.random() * 2 + 1)), 60000);
        } else if(!options.reconnect) {
            this.hardReset();
        }
    }

    reset() {
        this.connecting = false;
        this.ready = false;
        this.getAllUsersCount = {};
        this.getAllUsersQueue = [];
        this.getAllUsersLength = 1;
        this.guildSyncQueue = [];
        this.guildSyncQueueLength = 1;
        this.unsyncedGuilds = 0;
        this.lastHeartbeatAck = true;
    }

    hardReset() {
        this.reset();
        this.guildCount = 0;
        this.seq = 0;
        this.sessionID = null;
        this.reconnectInterval = 1000;
        this.connectAttempts = 0;
        this.ws = null;
        this.heartbeatInterval = null;
        this.guildCreateTimeout = null;
        this.idleSince = null;
    }

    resume() {
        this.sendWS(OPCodes.RESUME, {
            token: this.client.token,
            session_id: this.sessionID,
            seq: this.seq
        });
    }

    identify() {
        var identify = {
            token: this.client.token,
            v: this.client.options.gatewayVersion,
            compress: !!this.client.options.compress,
            large_threshold: this.client.options.largeThreshold,
            properties: {
                "os": process.platform,
                "browser": "Eris",
                "device": "Eris"
            }
        };
        if(!this.client.bot && this.client.options.gatewayVersion >= 5) {
            identify.synced_guilds = [];
        }
        if(this.client.options.maxShards > 1) {
            identify.shard = [this.id, this.client.options.maxShards];
        }
        this.sendWS(OPCodes.IDENTIFY, identify);
    }

    wsEvent(packet) {
        // var startTime = Date.now();
        // var debugStr = "";
        switch(packet.t) { /* eslint-disable no-redeclare */ // (╯°□°）╯︵ ┻━┻
            case "PRESENCE_UPDATE": {
                if(packet.d.user.username !== undefined) {
                    var user = this.client.users.get(packet.d.user.id);
                    var oldUser = null;
                    if(user && (user.username !== packet.d.user.username || user.avatar !== packet.d.user.avatar)) {
                        oldUser = {
                            username: user.username,
                            discriminator: user.discriminator,
                            avatar: user.avatar
                        };
                    }
                    if(!user || oldUser) {
                        user = this.client.users.update(packet.d.user);
                        /**
                        * Fired when a user's username or avatar changes
                        * @event Client#userUpdate
                        * @prop {User} user The updated user
                        * @prop {Object?} oldUser The old user data
                        * @prop {String} oldUser.username The username of the user
                        * @prop {String} oldUser.discriminator The discriminator of the user
                        * @prop {String?} oldUser.avatar The hash of the user's avatar, or null if no avatar
                        */
                        this.client.emit("userUpdate", user, oldUser);
                    }
                }
                if(!packet.d.guild_id) {
                    packet.d.id = packet.d.user.id;
                    var relationship = this.client.relationships.get(packet.d.id);
                    var oldPresence = {
                        game: relationship.game,
                        status: relationship.status
                    };
                    /**
                    * Fired when a guild member or relationship's status or game changes
                    * @event Client#presenceUpdate
                    * @prop {Member | Relationship} other The updated member or relationship
                    * @prop {Object?} oldPresence The old presence data
                    * @prop {String} oldPresence.status The other user's old status. Either "online", "idle", or "offline"
                    * @prop {Object?} oldPresence.game The old game the other user was playing
                    * @prop {String} oldPresence.game.name The name of the active game
                    * @prop {Number} oldPresence.game.type The type of the active game (0 is default, 1 is Twitch, 2 is YouTube)
                    * @prop {String} oldPresence.game.url The url of the active game
                    */
                    this.client.emit("presenceUpdate", this.client.relationships.update(packet.d), oldPresence);
                    break;
                }
                var guild = this.client.guilds.get(packet.d.guild_id);
                if(!guild) {
                    this.client.emit("warn", "ROGUE PRESENCE UPDATE: " + JSON.stringify(packet), this.id);
                    break;
                }
                var member = guild.members.get(packet.d.id = packet.d.user.id);
                var oldPresence = null;
                if(member && (member.status !== packet.d.status || (member.game !== packet.d.game && (!member.game || !packet.d.game || member.game.name !== packet.d.game.name || member.game.type !== packet.d.game.type || member.game.url !== packet.d.game.url)))) {
                    oldPresence = {
                        game: member.game,
                        status: member.status
                    };
                }
                if(!member || oldPresence) {
                    member = guild.members.update(packet.d, guild);
                    this.client.emit("presenceUpdate", member, oldPresence);
                }
                break;
            }
            case "VOICE_STATE_UPDATE": { // (╯°□°）╯︵ ┻━┻
                if(packet.d.guild_id === undefined) {
                    packet.d.id = packet.d.user_id;
                    if(packet.d.channel_id === null) {
                        var flag = false;
                        for(var groupChannel of this.client.groupChannels) {
                            var call = (groupChannel[1].call || groupChannel[1].lastCall);
                            if(call && call.voiceStates.remove(packet.d)) {
                                flag = true;
                                break;
                            }
                        }
                        if(!flag) {
                            for(var privateChannel of this.client.privateChannels) {
                                var call = (privateChannel[1].call || privateChannel[1].lastCall);
                                if(call && call.voiceStates.remove(packet.d)) {
                                    flag = true;
                                    break;
                                }
                            }
                            if(!flag) {
                                this.client.emit("error", new Error("VOICE_STATE_UPDATE for user leaving call not found"));
                                break;
                            }
                        }
                    } else {
                        var channel = this.client.getChannel(packet.d.channel_id);
                        if(!channel.call && !channel.lastCall) {
                            this.client.emit("error", new Error("VOICE_STATE_UPDATE for untracked call"));
                            break;
                        }
                        (channel.call || channel.lastCall).voiceStates.update(packet.d);
                    }
                }
                var guild = this.client.guilds.get(packet.d.guild_id);
                if(!guild) {
                    break;
                }
                if(guild.pendingVoiceStates) {
                    guild.pendingVoiceStates.push(packet.d);
                    break;
                }
                var member = guild.members.get(packet.d.id = packet.d.user_id);
                if(!member) {
                    var channel = guild.channels.find((channel) => (channel.type === "voice" || channel.type === 2) && channel.voiceMembers.get(packet.d.id));
                    if(channel) {
                        channel.voiceMembers.remove(packet.d);
                        break;
                    }
                    this.client.emit("error", new Error("VOICE STATE UPDATE MEMBER NULL " + JSON.stringify(packet)), this.id);
                    break;
                }
                var oldState = {
                    mute: member.mute,
                    deaf: member.deaf,
                    selfMute: member.selfMute,
                    selfDeaf: member.selfDeaf
                };
                var oldChannelID = member.voiceState && member.voiceState.channelID || null;
                member.update(packet.d, this.client);
                if(member.user.id === this.client.user.id) {
                    var voiceConnection = this.client.voiceConnections.get(packet.d.guild_id);
                    if(voiceConnection) {
                        voiceConnection.channelID = packet.d.channel_id;
                    }
                }
                if(oldChannelID != packet.d.channel_id) {
                    var oldChannel, newChannel;
                    if(oldChannelID) {
                        oldChannel = guild.channels.get(oldChannelID);
                        if(oldChannel) {
                            /**
                            * Fired when a guild member leaves a voice channel
                            * @event Client#voiceChannelLeave
                            * @prop {Member} member The member
                            * @prop {Channel} oldChannel The voice channel
                            */
                            this.client.emit("voiceChannelLeave", oldChannel.voiceMembers.remove(member), oldChannel);
                        }
                    }
                    if(packet.d.channel_id) {
                        newChannel = guild.channels.get(packet.d.channel_id);
                        /**
                        * Fired when a guild member joins a voice channel
                        * @event Client#voiceChannelJoin
                        * @prop {Member} member The member
                        * @prop {Channel} newChannel The voice channel
                        */
                        this.client.emit("voiceChannelJoin", newChannel.voiceMembers.add(member, guild), newChannel);
                    }
                    if(oldChannel && newChannel) {
                        /**
                        * Fired when a guild member switches voice channels
                        * @event Client#voiceChannelSwitch
                        * @prop {Member} member The member
                        * @prop {Channel} newChannel The new voice channel
                        * @prop {Channel} oldChannel The old voice channel
                        */
                        this.client.emit("voiceChannelSwitch", member, newChannel, oldChannel);
                    }
                }
                if(oldState.mute !== member.mute || oldState.deaf !== member.deaf || oldState.selfMute !== member.selfMute || oldState.selfDeaf !== member.selfDeaf) {
                    /**
                    * Fired when a guild member's voice state changes
                    * @event Client#voiceStateUpdate
                    * @prop {Member} member The member
                    * @prop {Object} oldState The old voice state
                    * @prop {Boolean} oldState.mute The previous server mute status
                    * @prop {Boolean} oldState.deaf The previous server deaf status
                    * @prop {Boolean} oldState.selfMute The previous self mute status
                    * @prop {Boolean} oldState.selfDeaf The previous self deaf status
                    */
                    this.client.emit("voiceStateUpdate", member, oldState);
                }
                break;
            }
            case "TYPING_START": {
                if(this.client.listeners("typingStart").length > 0) {
                    /**
                    * Fired when a user begins typing
                    * @event Client#typingStart
                    * @prop {Channel} channel The text channel the user is typing in
                    * @prop {User} user The user
                    */
                    this.client.emit("typingStart", this.client.getChannel(packet.d.channel_id), this.client.users.get(packet.d.user_id));
                }
                break;
            }
            case "MESSAGE_CREATE": {
                var channel = this.client.getChannel(packet.d.channel_id);
                if(channel) { // MESSAGE_CREATE just when deleting o.o
                    channel.lastMessageID = packet.d.id;
                    /**
                    * Fired when a message is created
                    * @event Client#messageCreate
                    * @prop {Message} message The message
                    */
                    this.client.emit("messageCreate", channel.messages.add(packet.d, this.client));
                } else {
                    this.client.emit("debug", "MESSAGE_CREATE but channel not found (OK if deleted channel)", this.id);
                }
                break;
            }
            case "MESSAGE_UPDATE": {
                var channel = this.client.getChannel(packet.d.channel_id);
                if(!channel) {
                    break;
                }
                var message = channel.messages.get(packet.d.id);
                if(!message) {
                    break;
                }
                var oldMessage = {
                    attachments: message.attachments,
                    content: message.content,
                    embeds: message.embeds,
                    editedTimestamp: message.editedTimestamp,
                    mentionedBy: message.mentionedBy,
                    mentions: message.mentions,
                    roleMentions: message.roleMentions,
                    channelMentions: message.channelMentions,
                    cleanContent: message.cleanContent,
                    tts: message.tts
                };
                /**
                * Fired when a message is updated
                * @event Client#messageUpdate
                * @prop {Message} message The updated message. If oldMessage was undefined, it is not recommended to use this since it will be very incomplete
                * @prop {Object?} oldMessage The old message data, if the message was cached
                * @prop {Object[]} oldMessage.attachments Array of attachments
                * @prop {Object[]} oldMessage.embeds Array of embeds
                * @prop {String} oldMessage.content Message content
                * @prop {Number?} oldMessage.editedTimestamp Timestamp of latest message edit
                * @prop {Object} oldMessage.mentionedBy Object of if different things mention the bot user
                * @prop {Boolean} oldMessage.tts Whether to play the message using TTS or not
                * @prop {String[]} oldMessage.mentions Array of mentioned users' ids
                * @prop {String[]} oldMessage.roleMentions Array of mentioned roles' ids, requires client option moreMentions
                * @prop {String[]} oldMessage.channelMentions Array of mentions channels' ids, requires client option moreMentions
                * @prop {String} oldMessage.cleanContent Message content with mentions replaced by names, and @everyone/@here escaped
                */
                this.client.emit("messageUpdate", channel.messages.update(packet.d, this.client), oldMessage);
                break;
            }
            case "MESSAGE_DELETE": {
                var channel = this.client.getChannel(packet.d.channel_id);
                if(!channel) {
                    break;
                }
                if(channel.messages.get(packet.d.id)) {
                    /**
                    * Fired when a cached message is deleted
                    * @event Client#messageDelete
                    * @prop {Message} message The message
                    */
                    this.client.emit("messageDelete", channel.messages.remove(packet.d));
                }
                break;
            }
            case "MESSAGE_DELETE_BULK": {
                var channel = this.client.getChannel(packet.d.channel_id);
                if(!channel) {
                    break;
                }
                packet.d.ids.forEach((id) => {
                    if(channel.messages.get(id)) {
                        this.client.emit("messageDelete", channel.messages.remove(packet.d));
                    }
                });
                break;
            }
            case "GUILD_MEMBER_ADD": {
                var guild = this.client.guilds.get(packet.d.guild_id);
                packet.d.id = packet.d.user.id;
                guild.memberCount++;
                /**
                * Fired when a member joins a server
                * @event Client#guildMemberAdd
                * @prop {Guild} guild The guild
                * @prop {Member} member The member
                */
                this.client.emit("guildMemberAdd", guild, guild.members.add(packet.d, guild));
                break;
            }
            case "GUILD_MEMBER_UPDATE": {
                var guild = this.client.guilds.get(packet.d.guild_id);
                var member = guild.members.get(packet.d.id = packet.d.user.id);
                var oldMember = null;
                if(member) {
                    oldMember = {
                        roles: member.roles,
                        nick: member.nick
                    };
                }
                member = guild.members.update(packet.d, guild);
                /**
                * Fired when a member's roles or nickname are updated
                * @event Client#guildMemberUpdate
                * @prop {Guild} guild The guild
                * @prop {Member} member The updated member
                * @prop {Object?} oldMember The old member data
                * @prop {String[]} oldMember.roles An array of role IDs this member is a part of
                * @prop {String?} oldMember.nick The server nickname of the member
                */
                this.client.emit("guildMemberUpdate", guild, member, oldMember);
                break;
            }
            case "GUILD_MEMBER_REMOVE": {
                var guild = this.client.guilds.get(packet.d.guild_id);
                if(guild) { // Maybe the GUILD_DELETE won the race (bot was left/booted from a guild)
                    guild.memberCount--;
                    packet.d.id = packet.d.user.id;
                    /**
                    * Fired when a member leaves a server
                    * @event Client#guildMemberRemove
                    * @prop {Guild} guild The guild
                    * @prop {Member} member The member
                    */
                    this.client.emit("guildMemberRemove", guild, guild.members.remove(packet.d));
                }
                break;
            }
            case "GUILD_CREATE": {
                this.client.guildShardMap[packet.d.id] = this.id;
                if(!packet.d.unavailable) {
                    if(!this.client.user.bot) {
                        this.unsyncedGuilds++;
                        this.syncGuild(packet.d.id);
                    }
                    if(this.client.unavailableGuilds.get(packet.d.id)) {
                        this.client.unavailableGuilds.remove(packet.d);
                    }
                    var guild = this.createGuild(packet.d);
                    if(this.ready) {
                        /**
                        * Fired when an guild is created or becomes available
                        * @event Client#guildCreate
                        * @prop {Guild} guild The guild
                        */
                        this.client.emit("guildCreate", guild);
                    } else {
                        this.restartGuildCreateTimeout();
                    }
                } else {
                    /**
                    * Fired when an unavailable guild is created
                    * @event Client#unavailableGuildCreate
                    * @prop {Guild} guild The guild
                    */
                    this.client.emit("unavailableGuildCreate", this.client.unavailableGuilds.add(packet.d, this.client));
                }
                break;
            }
            case "GUILD_UPDATE": {
                var guild = this.client.guilds.get(packet.d.id);
                var oldGuild = null;
                oldGuild = {
                    name: guild.name,
                    verificationLevel: guild.verification_level,
                    splash: guild.splash,
                    region: guild.region,
                    ownerID: guild.owner_id,
                    icon: guild.icon,
                    features: guild.features,
                    emojis: guild.emojis,
                    afkChannelID: guild.afk_channel_id,
                    afkTimeout: guild.afk_timeout
                };
                /**
                * Fired when an guild is updated
                * @event Client#guildUpdate
                * @prop {Guild} guild The guild
                * @prop {Object} oldGuild The old guild data
                * @prop {String} oldGuild.name The name of the guild
                * @prop {Number} oldGuild.verificationLevel The guild verification level
                * @prop {String} oldGuild.region The region of the guild
                * @prop {String?} oldGuild.icon The hash of the guild icon, or null if no icon
                * @prop {String} oldGuild.afkChannelID The ID of the AFK voice channel
                * @prop {Number} oldGuild.afkTimeout The AFK timeout in seconds
                * @prop {String} oldGuild.ownerID The ID of the user that is the guild owner
                * @prop {String?} oldGuild.splash The hash of the guild splash image, or null if no splash (VIP only)
                * @prop {Object[]} oldGuild.features An array of guild features
                * @prop {Object[]} oldGuild.emojis An array of guild emojis
                */
                this.client.emit("guildUpdate", this.client.guilds.update(packet.d, this.client), oldGuild);
                break;
            }
            case "GUILD_DELETE": {
                delete this.client.guildShardMap[packet.d.id];
                var guild = this.client.guilds.remove(packet.d);
                guild.channels.forEach((channel) => {
                    delete this.client.channelGuildMap[channel.id];
                });
                if(packet.d.unavailable) {
                    this.client.unavailbleGuilds.add(packet.d, this.client);
                }

                this.client.buckets["bot:msg:guild:" + packet.d.id] =
                    this.client.buckets["dmsg:" + packet.d.id] =
                    this.client.buckets["bdmsg:" + packet.d.id] =
                    this.client.buckets["guild_member:" + packet.d.id] =
                    this.client.buckets["guild_member_nick:" + packet.d.id] = undefined;

                /**
                * Fired when an guild is deleted
                * @event Client#guildDelete
                * @prop {Guild} guild The guild
                * @prop {Boolean} unavailable Whether the guild is turning unavailable or being deleted
                */
                this.client.emit("guildDelete", guild, !!packet.d.unavailable);
                break;
            }
            case "GUILD_BAN_ADD": {
                /**
                * Fired when a user is banned from a guild
                * @event Client#guildBanAdd
                * @prop {Guild} guild The guild
                * @prop {User} user The banned user
                */
                this.client.emit("guildBanAdd", this.client.guilds.get(packet.d.guild_id), new User(packet.d.user));
                break;
            }
            case "GUILD_BAN_REMOVE": {
                /**
                * Fired when a user is unbanned from a guild
                * @event Client#guildBanRemove
                * @prop {Guild} guild The guild
                * @prop {User} user The banned user
                */
                this.client.emit("guildBanRemove", this.client.guilds.get(packet.d.guild_id), new User(packet.d.user));
                break;
            }
            case "GUILD_ROLE_CREATE": {
                /**
                * Fired when a guild role is created
                * @event Client#guildRoleCreate
                * @prop {Guild} guild The guild
                * @prop {Role} role The role
                */
                var guild = this.client.guilds.get(packet.d.guild_id);
                this.client.emit("guildRoleCreate", guild, guild.roles.add(packet.d.role));
                break;
            }
            case "GUILD_ROLE_UPDATE": {
                var guild = this.client.guilds.get(packet.d.guild_id);
                var role = guild.roles.add(packet.d.role);
                var oldRole = null;
                if(role) {
                    oldRole = {
                        color: role.color,
                        hoist: role.hoist,
                        managed: role.managed,
                        name: role.name,
                        permissions: role.permissions,
                        position: role.position
                    };
                }
                /**
                * Fired when a guild role is updated
                * @event Client#guildRoleUpdate
                * @prop {Guild} guild The guild
                * @prop {Role} role The updated role
                * @prop {Object} oldRole The old role data
                * @prop {String} oldRole.name The name of the role
                * @prop {Boolean} oldRole.managed Whether a guild integration manages this role or not
                * @prop {Boolean} oldRole.hoist Whether users with this role are hoisted in the user list or not
                * @prop {Number} oldRole.color The hex color of the role in base 10
                * @prop {Number} oldRole.position The position of the role
                * @prop {Number} oldRole.permissions The permissions number of the role
                */
                this.client.emit("guildRoleUpdate", guild, guild.roles.update(packet.d.role), oldRole);
                break;
            }
            case "GUILD_ROLE_DELETE": {
                /**
                * Fired when a guild role is deleted
                * @event Client#guildRoleDelete
                * @prop {Guild} guild The guild
                * @prop {Role} role The role
                */
                var guild = this.client.guilds.get(packet.d.guild_id);
                this.client.emit("guildRoleDelete", guild, guild.roles.remove({id: packet.d.role_id}));
                break;
            }
            case "CHANNEL_CREATE": {
                if(packet.d.type === undefined || packet.d.type === 1) {
                    if(this.id === 0) {
                        /**
                        * Fired when a channel is created
                        * @event Client#channelCreate
                        * @prop {Channel} channel The channel
                        */
                        this.client.emit("channelCreate", this.client.privateChannels.add(packet.d, this.client));
                    }
                } else if(packet.d.type === 0 || packet.d.type === 2 || packet.d.type === "text" || packet.d.type === "voice") {
                    var guild = this.client.guilds.get(packet.d.guild_id);
                    if(!guild) {
                        break;
                    }
                    var channel = guild.channels.add(packet.d, guild);
                    this.client.channelGuildMap[packet.d.id] = packet.d.guild_id;
                    this.client.emit("channelCreate", channel);
                } else if(packet.d.type === 3) {
                    if(this.id === 0) {
                        this.client.emit("channelCreate", this.client.groupChannels.add(packet.d, this.client));
                    }
                } else {
                    this.emit("error", new Error("Unhandled CHANNEL_CREATE type: " + JSON.stringify(packet, null, 2)));
                }
                break;
            }
            case "CHANNEL_UPDATE": {
                var channel = this.client.getChannel(packet.d.id);
                if(channel.type === 3) {
                    if(this.id !== 0) {
                        break;
                    }
                    var oldChannel = {
                        name: channel.name,
                        ownerID: channel.ownerID,
                        icon: channel.icon
                    };
                }
                if(channel.type === 0 || channel.type === 2 || channel.type === "text" || channel.type === "voice") {
                    var oldChannel = {
                        name: channel.name,
                        topic: channel.topic,
                        position: channel.position,
                        bitrate: channel.bitrate,
                        permissionOverwrites: channel.permissionOverwrites
                    };
                }
                channel.update(packet.d);
                /**
                * Fired when a channel is updated
                * @event Client#channelUpdate
                * @prop {Channel} channel The updated channel
                * @prop {Object} oldChannel The old channel data
                * @prop {String} oldChannel.name The name of the channel
                * @prop {Number} oldChannel.position The position of the channel
                * @prop {String?} oldChannel.topic The topic of the channel (text channels only)
                * @prop {Number?} oldChannel.bitrate The bitrate of the channel (voice channels only)
                * @prop {Collection} oldChannel.permissionOverwrites Collection of PermissionOverwrites in this channel
                */
                this.client.emit("channelUpdate", channel, oldChannel);
                break;
            }
            case "CHANNEL_DELETE": {
                if(packet.d.type === 1 || packet.d.type === undefined) {
                    if(this.id === 0) {
                        var channel = this.client.privateChannels.remove(packet.d); // TODO channel can be null
                        delete this.client.privateChannelMap[channel.recipient.id];
                        /**
                        * Fired when a channel is deleted
                        * @event Client#channelDelete
                        * @prop {Channel} channel The channel
                        */
                        this.client.emit("channelDelete", channel);
                    }
                } else if(packet.d.type === 0 || packet.d.type === 2 || packet.d.type === "text" || packet.d.type === "voice") {
                    delete this.client.channelGuildMap[packet.d.id];
                    var channel = this.client.guilds.get(packet.d.guild_id).channels.remove(packet.d);
                    if(channel.type === 2 || channel.type === "voice") {
                        channel.voiceMembers.forEach((member) => {
                            this.client.emit("voiceChannelLeave", channel.voiceMembers.remove(member), channel);
                        });
                    }
                    this.client.emit("channelDelete", channel);
                } else if(packet.d.type === 3) {
                    if(this.id === 0) {
                        this.client.emit("channelDelete", this.client.groupChannels.remove(packet.d));
                    }
                } else {
                    this.emit("error", new Error("Unhandled CHANNEL_DELETE type: " + JSON.stringify(packet, null, 2)));
                }
                break;
            }
            case "CALL_CREATE": {
                packet.d.id = packet.d.message_id;
                var channel = this.client.getChannel(packet.d.channel_id);
                if(channel.call) {
                    channel.call.update(packet.d);
                } else {
                    channel.call = new Call(packet.d, channel);
                    var incrementedID = "";
                    var overflow = true;
                    var chunks = packet.d.id.match(/\d{1,9}/g).map((chunk) => parseInt(chunk));
                    for(var i = chunks.length - 1; i >= 0; --i) {
                        if(overflow) {
                            chunks[i] ++;
                            overflow = false;
                        }
                        if(chunks[i] > 999999999) {
                            overflow = true;
                            incrementedID = "000000000" + incrementedID;
                        } else {
                            incrementedID = chunks[i] + incrementedID;
                        }
                    }
                    if(overflow) {
                        incrementedID = overflow + incrementedID;
                    }
                    this.client.getMessages(channel.id, 1, incrementedID);
                }
                /**
                * Fired when a call is created
                * @event Client#callCreate
                * @prop {Call} call The call
                */
                this.client.emit("callCreate", channel.call);
                break;
            }
            case "CALL_UPDATE": {
                var channel = this.client.getChannel(packet.d.channel_id);
                if(!channel.call) {
                    throw new Error("CALL_UPDATE but channel has no call");
                }
                var oldCall = {
                    participants: channel.call.participants,
                    ringing: channel.call.ringing,
                    region: channel.call.region,
                    endedTimestamp: channel.call.endedTimestamp,
                    unavailable: channel.call.unavailable,
                };
                /**
                * Fired when a call is updated
                * @event Client#callUpdate
                * @prop {Call} call The updated call
                * @prop {Object} oldCall The old call data
                * @prop {String[]} oldCall.participants The IDs of the call participants
                * @prop {Number?} oldCall.endedTimestamp The timestamp of the call end
                * @prop {String[]?} oldCall.ringing The IDs of people that were being rung
                * @prop {String?} oldCall.region The region of the call server
                * @prop {Boolean} oldCall.unavailable Whether the call was unavailable or not
                */
                this.client.emit("callUpdate", channel.call.update(packet.d), oldCall);
                break;
            }
            case "CALL_DELETE": {
                var channel = this.client.getChannel(packet.d.channel_id);
                if(!channel.call) {
                    throw new Error("CALL_DELETE but channel has no call");
                }
                channel.lastCall = channel.call;
                channel.call = null;
                /**
                * Fired when a call is deleted
                * @event Client#callDelete
                * @prop {Call} call The call
                */
                this.client.emit("callDelete", channel.lastCall);
                break;
            }
            case "CHANNEL_RECIPIENT_ADD": { // TODO implement
                var channel = this.client.groupChannels.get(packet.d.channel_id);
                    /**
                    * Fired when a user joins a group channel
                    * @event Client#channelRecipientAdd
                    * @prop {Channel} channel The channel
                    * @prop {User} user The user
                    */
                this.client.emit("channelRecipientAdd", channel, channel.recipients.add(this.client.users.add(packet.d.user)));
                break;
            }
            case "CHANNEL_RECIPIENT_REMOVE": { // TODO implement
                var channel = this.client.groupChannels.get(packet.d.channel_id);
                    /**
                    * Fired when a user leaves a group channel
                    * @event Client#channelRecipientRemove
                    * @prop {Channel} channel The channel
                    * @prop {User} user The user
                    */
                this.client.emit("channelRecipientRemove", channel, channel.recipients.remove(packet.d.user));
                break;
            }
            case "GUILD_MEMBERS_CHUNK": {
                var guild = this.client.guilds.get(packet.d.guild_id);
                if(this.getAllUsersCount.hasOwnProperty(guild.id)) {
                    if(this.getAllUsersCount[guild.id] <= 1) {
                        delete this.getAllUsersCount[guild.id];
                        this.checkReady();
                    } else {
                        this.getAllUsersCount[guild.id]--;
                    }
                }
                packet.d.members.forEach((member) => {
                    member.id = member.user.id;
                    guild.members.add(member, guild);
                });

                // debugStr = " | " + packet.d.members.length + " members | " + guild.id;

                break;
            }
            case "GUILD_SYNC": {// (╯°□°）╯︵ ┻━┻ thx Discord devs
                var guild = this.client.guilds.get(packet.d.id);
                for(var member of packet.d.members) {
                    member.id = member.user.id;
                    guild.members.add(member, guild);
                }
                for(var presence of packet.d.presences) {
                    presence.id = presence.user.id;
                    guild.members.update(presence);
                }
                if(guild.pendingVoiceStates && guild.pendingVoiceStates > 0) {
                    for(var voiceState of guild.pendingVoiceStates) {
                        voiceState.id = voiceState.user_id;
                        var channel = guild.channels.get(voiceState.channel_id);
                        if(channel) {
                            channel.voiceMembers.add(guild.members.update(voiceState));
                        } else { // Phantom voice states from connected users in deleted channels (╯°□°）╯︵ ┻━┻
                            this.client.emit("warn", "Phantom voice state received but channel not found | Guild: " + guild.id + " | Channel: " + voiceState.channel_id);
                        }
                    }
                }
                guild.pendingVoiceStates = null;
                this.unsyncedGuilds--;
                this.checkReady();
                break;
            }
            case "RESUMED":
            case "READY": {
                this.client.lastReadyPacket = Date.now();

                this.connectAttempts = 0;
                this.reconnectInterval = 1000;

                this.connecting = false;

                if(packet.t === "RESUMED") {
                    this.ready = true;

                    /**
                    * Fired when a shard finishes resuming
                    * @event Shard#resume
                    * @prop {Number} id The ID of the shard
                    */
                    this.emit("resume");
                    break;
                }

                if(packet.d.user.bot === !this.client.bot) {
                    throw new Error(`Client detected bot user is ${this.client.bot ? "a" : "not a"} a bot, but the websocket bot user is ${packet.d.user.bot ? "a" : "not a"} a bot`);
                }

                if(packet.d.heartbeat_interval > 0) {
                    if(this.heartbeatInterval) {
                        clearInterval(this.heartbeatInterval);
                    }
                    this.heartbeatInterval = setInterval(() => this.heartbeat(), packet.d.heartbeat_interval);
                    this.heartbeat();
                }
                if(packet.d._trace) {
                    this.discordServerTrace = packet.d._trace;
                }

                this.sessionID = packet.d.session_id;

                this.client.user = this.client.users.add(new ExtendedUser(packet.d.user));

                this.guildCount = packet.d.guilds.length;
                packet.d.guilds.forEach((guild) => {
                    if(guild.unavailable) {
                        this.client.unavailableGuilds.add(guild, this.client);
                    } else {
                        if(!this.client.user.bot) {
                            this.unsyncedGuilds++;
                            this.syncGuild(guild.id);
                        }
                        this.createGuild(guild);
                    }
                });

                packet.d.private_channels.forEach((channel) => {
                    if(channel.type === 1 || channel.type === undefined) {
                        this.client.privateChannels.add(channel, this.client);
                    } else if(channel.type === 3) {
                        this.client.groupChannels.add(channel, this.client).syncCall();
                    } else {
                        this.emit("error", new Error("Unhandled READY private_channel type: " + JSON.stringify(channel, null, 2)));
                    }
                });

                if(packet.d.relationships) {
                    packet.d.relationships.forEach((relationship) => {
                        this.client.relationships.add(relationship, this.client);
                    });
                }

                if(packet.d.presences) {
                    packet.d.presences.forEach((presence) => {
                        if(this.client.relationships.get(presence.user.id)) { // Avoid DM channel presences which are also in here
                            presence.id = presence.user.id;
                            this.client.relationships.update(presence);
                        }
                    });
                }

                /**
                * Fired when a shard finishes processing the ready packet
                * @event Client#shardPreReady
                * @prop {Number} id The ID of the shard
                */
                this.client.emit("shardPreReady", this.id);

                if(this.client.unavailableGuilds.size > 0 && packet.d.guilds.length > 0) {
                    this.restartGuildCreateTimeout();
                } else {
                    this.checkReady();
                }

                // debugStr = " | " + packet.d.guilds.length + " guilds";

                break;
            }
            case "VOICE_SERVER_UPDATE": {
                var connection = this.client.voiceConnections.get(packet.d.guild_id || "call");
                if(connection && connection.voiceServerUpdateCallback) {
                    connection.voiceServerUpdateCallback(packet.d);
                }
                break;
            }
            case "USER_UPDATE": {
                this.client.users.update(packet.d);
                break;
            }
            case "RELATIONSHIP_ADD": {
                if(this.client.user.bot) {
                    break;
                }
                var relationship = this.client.relationships.get(packet.d.id);
                if(relationship) {
                    var oldRelationship = {
                        type: relationship.type
                    };
                    /**
                    * Fired when a relationship is updated
                    * @event Client#relationshipUpdate
                    * @prop {Relationship} relationship The relationship
                    * @prop {Object} oldRelationship The old relationship data
                    * @prop {Number} oldRelationship.type The old type of the relationship
                    */
                    this.client.emit("relationshipUpdate", this.client.relationships.update(packet.d), oldRelationship);
                } else {
                    /**
                    * Fired when a relationship is added
                    * @event Client#relationshipAdd
                    * @prop {Relationship} relationship The relationship
                    */
                    this.client.emit("relationshipAdd", this.client.relationships.add(packet.d, this.client));
                }
                break;
            }
            case "RELATIONSHIP_REMOVE": {
                if(this.client.user.bot) {
                    break;
                }
                /**
                * Fired when a relationship is removed
                * @event Client#relationshipRemove
                * @prop {Relationship} relationship The relationship
                */
                this.client.emit("relationshipRemove", this.client.relationships.remove(packet.d));
                break;
            }
            case "GUILD_EMOJIS_UPDATE": {
                var guild = this.client.guilds.get(packet.d.guild_id);
                var oldEmojis = guild.emojis;
                /**
                * Fired when a guild's emojis are updated
                * @event Client#guildEmojisUpdate
                * @prop {Guild} guild The guild
                * @prop {Array} emojis The updated emojis of the guild
                * @prop {Array} oldEmojis The old emojis of the guild
                */
                this.client.emit("guildEmojisUpdate", guild, guild.update(packet.d).emojis, oldEmojis);
                break;
            }
            case "MESSAGE_ACK": // Ignore these
            case "GUILD_INTEGRATIONS_UPDATE":
            case "USER_SETTINGS_UPDATE": {
                break;
            }
            default: {
                /**
                * Fired when the shard encounters an unknown packet
                * @event Client#unknown
                * @prop {Object} packet The unknown packet
                * @prop {Number} id The ID of the shard
                */
                this.client.emit("unknown", packet, this.id);
                break;
            }
        } /* eslint-enable no-redeclare */
        // this.client.emit("debug", packet.t + ": " + (Date.now() - startTime) + "ms" + debugStr, this.id);
    }

    syncGuild(guildID) {
        if(this.guildSyncQueueLength + 3 + guildID.length > 4081) { // 4096 - "{\"op\":12,\"d\":[]}".length + 1 for lazy comma offset
            this.requestGuildSync(this.guildSyncQueue);
            this.guildSyncQueue = [guildID];
            this.guildSyncQueueLength = 1 + guildID.length + 3;
        } else {
            this.guildSyncQueue.push(guildID);
            this.guildSyncQueueLength += guildID.length + 3;
        }
    }

    requestGuildSync(guildID) {
        this.sendWS(OPCodes.SYNC_GUILD, guildID);
    }

    createGuild(guild) {
        this.client.guildShardMap[guild.id] = this.id;
        guild = this.client.guilds.add(guild, this.client);
        if(this.client.options.getAllUsers && guild.members.size < guild.memberCount) {
            guild.fetchAllMembers();
        }
        return guild;
    }

    restartGuildCreateTimeout() {
        if(this.guildCreateTimeout) {
            clearTimeout(this.guildCreateTimeout);
            this.guildCreateTimeout = null;
        }
        if(!this.ready) {
            this.guildCreateTimeout = setTimeout(() => {
                this.checkReady();
            }, this.client.options.guildCreateTimeout);
        }
    }

    getGuildMembers(guildID, chunkCount) {
        this.getAllUsersCount[guildID] = chunkCount;
        if(this.getAllUsersLength + 3 + guildID.length > 4048) { // 4096 - "{\"op\":8,\"d\":{\"guild_id\":[],\"query\":\"\",\"limit\":0}}".length + 1 for lazy comma offset
            this.requestGuildMembers(this.getAllUsersQueue);
            this.getAllUsersQueue = [guildID];
            this.getAllUsersLength = 1 + guildID.length + 3;
        } else {
            this.getAllUsersQueue.push(guildID);
            this.getAllUsersLength += guildID.length + 3;
        }
    }

    requestGuildMembers(guildID, query, limit) {
        this.sendWS(OPCodes.GET_GUILD_MEMBERS, {
            guild_id: guildID,
            query: query || "",
            limit: limit || 0
        });
    }

    checkReady() {
        if(!this.ready) {
            if(this.guildSyncQueue.length > 0) {
                this.requestGuildSync(this.guildSyncQueue);
                this.guildSyncQueue = [];
                this.guildSyncQueueLength = 1;
                return;
            }
            if(this.unsyncedGuilds > 0) {
                return;
            }
            if(this.getAllUsersQueue.length > 0) {
                this.requestGuildMembers(this.getAllUsersQueue);
                this.getAllUsersQueue = [];
                this.getAllUsersLength = 1;
                return;
            }
            if(Object.keys(this.getAllUsersCount).length === 0) {
                this.ready = true;
                /**
                * Fired when the shard turns ready
                * @event Shard#ready
                */
                this.emit("ready");
            }
        }
    }

    initializeWS() {
        this.ws = new WebSocket(this.client.gatewayURL);
        this.ws.on("open", () => {
            if(!this.client.token) {
                return this.disconnect(null, new Error("Token not specified"));
            }
            /**
            * Fired when the shard establishes a connection
            * @event Client#connect
            * @prop {Number} id The ID of the shard
            */
            this.client.emit("connect", this.id);
            this.lastHeartbeatAck = true;

            if(this.client.options.gatewayVersion <= 4) {
                if(this.sessionID) {
                    this.resume();
                } else {
                    this.identify();
                }
            }
        });
        this.ws.on("message", (m) => {
            try {
                if(this.client.options.compress && m instanceof Buffer) {
                    m = Zlib.inflateSync(m).toString();
                }

                var packet = JSON.parse(m);

                if(this.client.listeners("rawWS").length > 0) {
                    /**
                    * Fired when the shard receives a websocket packet
                    * @event Client#rawWS
                    * @prop {Object} packet The packet
                    * @prop {Number} id The ID of the shard
                    */
                    this.client.emit("rawWS", packet, this.id);
                }

                if(packet.s > this.seq + 1 && this.ws) {
                    /**
                    * Fired to warn of something weird but non-breaking happening
                    * @event Client#warn
                    * @prop {String} message The warning message
                    * @prop {Number} id The ID of the shard
                    */
                    this.client.emit("warn", "Non-consecutive sequence, requesting resume", this.id);
                    this.resume();
                } else if(packet.s) {
                    this.seq = packet.s;
                }

                switch(packet.op) {
                    case OPCodes.EVENT: {
                        if(!this.client.options.disableEvents[packet.t]) {
                            this.wsEvent(packet);
                        }
                        break;
                    }
                    case OPCodes.HEARTBEAT: {
                        this.heartbeat();
                        break;
                    }
                    case OPCodes.INVALID_SESSION: {
                        this.seq = 0;
                        this.sessionID = null;
                        this.client.emit("warn", "Invalid session, reidentifying!", this.id);
                        this.identify();
                        break;
                    }
                    case OPCodes.RECONNECT: {
                        this.disconnect({
                            reconnect: "auto"
                        });
                        break;
                    }
                    case OPCodes.HELLO: {
                        if(packet.d.heartbeat_interval > 0) {
                            if(this.heartbeatInterval) {
                                clearInterval(this.heartbeatInterval);
                            }
                            this.heartbeatInterval = setInterval(() => this.heartbeat(), Math.min(packet.d.heartbeat_interval, 15000)); // Detect lost connections within 15000ms
                        }

                        this.discordServerTrace = packet.d._trace;
                        this.connecting = false;

                        if(this.sessionID) {
                            this.resume();
                        } else {
                            this.identify();
                        }
                        this.heartbeat();
                        break; /* eslint-enable no-unreachable */
                    }
                    case OPCodes.HEARTBEAT_ACK: {
                        this.lastHeartbeatAck = true;
                        break;
                    }
                    default: {
                        this.client.emit("unknown", packet, this.id);
                        break;
                    }
                }
            } catch(err) {
                this.client.emit("error", err, this.id);
            }
        });
        this.ws.on("error", (err, msg) => {
            if(msg) {
                this.client.emit("debug", "WS error: " + msg, this.id);
            }
            this.disconnect({
                reconnect: "auto"
            }, err);
        });
        this.ws.on("close", (code, err) => {
            var options = {
                reconnect: true
            };
            if(code) {
                this.client.emit("warn", "WS close: " + code, this.id);
                if(code === 4001) {
                    err = new Error("Gateway received invalid OP code");
                } else if(code === 4002) {
                    err = new Error("Gateway received invalid message");
                } else if(code === 4003) {
                    err = new Error("Not authenticated");
                } else if(code === 4004) {
                    err = new Error("Authentication failed");
                } else if(code === 4005) {
                    err = new Error("Already authenticated");
                } if(code === 4006 || code === 4009) {
                    this.sessionID = null;
                    err = new Error("Invalid session");
                } else if(code === 4007) {
                    err = new Error("Invalid sequence number: " + this.seq);
                    this.seq = 0;
                } else if(code === 4008) {
                    err = new Error("Gateway connection was ratelimited");
                } else if(code === 4010) {
                    err = new Error("Invalid shard key");
                }
                if(this.ws) {
                    options.reconnect = "auto";
                }
            }
            this.disconnect(options, err);
        });
        setTimeout(() => {
            if(this.connecting) {
                this.disconnect(null, new Error("Connection timeout"));
            }
        }, this.client.options.connectionTimeout);
    }

    heartbeat() {
        if(!this.lastHeartbeatAck && this.client.options.gatewayVersion >= 5) {
            this.disconnect({
                reconnect: "auto"
            }, new Error("Server didn't acknowledge previous heartbeat, possible lost connection"));
        }
        this.lastHeartbeatAck = false;
        this.sendWS(OPCodes.HEARTBEAT, this.seq);
    }

    sendWS(op, data) {
        if(this.ws && this.ws.readyState === WebSocket.OPEN) {
            if(op === OPCodes.STATUS_UPDATE) {
                var i = 0;
                var func = () => {
                    if(++i === 2 && this.ws && this.ws.readyState === WebSocket.OPEN) {
                        data = JSON.stringify({op: op, d: data});
                        this.ws.send(data);
                        this.client.emit("debug", data, this.id);
                    }
                };
                this.globalBucket.queue(func);
                this.presenceUpdateBucket.queue(func);
            } else {
                this.globalBucket.queue(() => {
                    if(this.ws && this.ws.readyState === WebSocket.OPEN) {
                        data = JSON.stringify({op: op, d: data});
                        this.ws.send(data);
                        this.client.emit("debug", data, this.id);
                    }
                });
            }
        }
    }

    /**
    * Updates the bot's status (for all guilds the shard is in)
    * @arg {Boolean?} [idle] Sets if the bot is idle (true) or online (false)
    * @arg {Object?} [game] Sets the bot's active game, null to clear
    * @arg {String} game.name Sets the name of the bot's active game
    * @arg {Number} [game.type] The type of game. 0 is default, 1 is Twitch, 2 is YouTube
    * @arg {String} [game.url] Sets the url of the shard's active game
    */
    editStatus(idle, game) {
        if(game !== undefined) {
            this.game = game;
        }
        if(idle === true || idle === false) {
            this.idleSince = idle ? Date.now() : null;
        }
        this.sendWS(OPCodes.STATUS_UPDATE, {
            idle_since: this.idleSince,
            game: this.game
        });
        var obj = {
            status: this.idleSince ? "away" : "online",
            game: this.game
        };
        this.client.guilds.forEach((guild) => {
            if(guild.shard.id === this.id) {
                guild.members.get(this.client.user.id).update(obj);
            }
        });
    }

    /**
    * Updates the shard's idle status (for all guilds the shard is in)
    * @arg {Boolean} idle Sets if the shard is idle (true) or online (false)
    */
    editIdle(idle) {
        this.editStatus(idle);
    }

    /**
    * Updates the shard's active game (for all guilds the shard is in)
    * @arg {Object?} game Sets the shard's active game, null to clear
    * @arg {String} game.name Sets the name of the shard's active game
    * @arg {Number} [game.type] The type of game. 0 is default, 1 is Twitch, 2 is YouTube
    * @arg {String} [game.url] Sets the url of the shard's active game
    */
    editGame(game) {
        this.editStatus(null, game);
    }
}

module.exports = Shard;
