declare module "eris" {
   import { EventEmitter } from 'events';
   import { Readable as ReadableStream } from 'stream';

   interface ErisConstructor {
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
       new (token: String, options?: { autoreconnect?: Boolean, cleanContent?: Boolean, compress?: Boolean, connectionTimeout?: Number, disableEvents?: Object, disableEveryone?: Boolean, firstShardID?: Number, getAllUsers?: Boolean, guildCreateTimeout?: Number, largeThreshold?: Number, lastShardID?: Number, maxShards?: Number, messageLimit?: Number, opusOnly?: Boolean, seedVoiceConnections?: Boolean, sequencerWait?: Number });

       Bucket: Bucket;
       Call: Call;
       Channel: Channel;
       Client: Client;
       Collection: Collection;
       Command: Command;
       CommandClient: CommandClient;
       Constants: Constants;
       ExtendedUser: ExtendedUser;
       GroupChannel: GroupChannel;
       Guild: Guild;
       GuildIntegration: GuildIntegration;
       Invite: Invite;
       Member: Member;
       Message: Message;
       Permission: Permission;
       PermissionOverwrite: PermissionOverwrite;
       PrivateChannel: PrivateChannel;
       Relationship: Relationship;
       Role: Role;
       Shard: Shard;
       User: User;
       VoiceConnection: VoiceConnection;
       VoiceState: VoiceState;
   }

   var Eris: ErisConstructor;
   export = Eris;

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
   declare class Client extends EventEmitter {
       token: String;
       bot: Boolean;
       options: Object;
       channelGuildMap: Object;
       shards: Collection<Shard>;
       guilds: Collection<Guild>;
       privateChannelMap: Object;
       privateChannels: Collection<PrivateChannel>;
       groupChannels: Collection<GroupChannel>;
       voiceConnections: VoiceConnectionManager;
       retryAfters: Object;
       guildShardMap: Object;
       startTime: Number;
       unavailableGuilds: Collection<Guild>;
       uptime: Number;
       user: ExtendedUser;
       users: Collection<User>;
       relationships: Collection<Relationship>;
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
       constructor(token: String, options?: { autoreconnect?: Boolean, cleanContent?: Boolean, compress?: Boolean, connectionTimeout?: Number, disableEvents?: Object, disableEveryone?: Boolean, firstShardID?: Number, getAllUsers?: Boolean, guildCreateTimeout?: Number, largeThreshold?: Number, lastShardID?: Number, maxShards?: Number, messageLimit?: Number, opusOnly?: Boolean, seedVoiceConnections?: Boolean, sequencerWait?: Number }, autoreconnect?: Boolean, cleanContent?: Boolean, compress?: Boolean, connectionTimeout?: Number, disableEvents?: Object, disableEveryone?: Boolean, firstShardID?: Number, getAllUsers?: Boolean, guildCreateTimeout?: Number, largeThreshold?: Number, lastShardID?: Number, maxShards?: Number, messageLimit?: Number, opusOnly?: Boolean, seedVoiceConnections?: Boolean, sequencerWait?: Number);

       /**
        * Tells all shards to connect.
        * @returns {Promise} Resolves when all shards are initialized
        */
       connect(): Promise<void>;

       /**
        * Get the Discord websocket gateway URL.
        * @returns {Promise<String>} Resolves with the gateway URL
        */
       getGateway(): Promise<String>;

       /**
        * Disconnects all shards
        * @arg {Object?} [options] Shard disconnect options
        * @arg {String | Boolean} [options.reconnect] false means destroy everything, true means you want to reconnect in the future, "auto" will autoreconnect
        */
       disconnect(options?: { reconnect?: (String|Boolean) }): void;

       /**
        * Join a voice channel. If joining a group call, the voice connection ID will be stored in voiceConnections as "call". Otherwise, it will be the guild ID
        * @arg {String} channelID The ID of the voice channel
        * @arg {Boolean} [waitForReady=true] Whether to wait for ready before resolving the Promise
        * @returns {Promise<VoiceConnection>} Resolves with a VoiceConnection
        */
       joinVoiceChannel(channelID: String, waitForReady?: Boolean): Promise<VoiceConnection>;

       /**
        * Leaves a voice channel
        * @arg {String} channelID The ID of the voice channel
        */
       leaveVoiceChannel(channelID: String): void;

       /**
        * Updates the bot's status (for all guilds)
        * @arg {Boolean?} [idle] Sets if the bot is idle (true) or online (false)
        * @arg {Object?} [game] Sets the bot's active game, null to clear
        * @arg {String} game.name Sets the name of the bot's active game
        * @arg {Number} [game.type] The type of game. 0 is default, 1 is streaming (Twitch only)
        * @arg {String} [game.url] Sets the url of the shard's active game
        */
       editStatus(idle?: Boolean, game?: { name: String, type?: Number, url?: String }): void;

       /**
        * Updates the bot's idle status (for all guilds)
        * @arg {Boolean} idle Sets if the bot is idle (true) or online (false)
        */
       editIdle(idle: Boolean): void;

       /**
        * Updates the bot's active game (for all guilds)
        * @arg {Object?} game Sets the bot's active game, null to clear
        * @arg {String} game.name Sets the name of the bot's active game
        * @arg {Number} [game.type] The type of game. 0 is default, 1 is streaming (Twitch only)
        * @arg {String} [game.url] Sets the url of the shard's active game
        */
       editGame(game?: { name: String, type?: Number, url?: String }): void;

       /**
        * Get a Channel object from a channelID
        * @arg {String} [channelID] The ID of the channel
        * @returns {Channel}
        */
       getChannel(channelID?: String): Channel;

       /**
        * Create a channel in a guild
        * @arg {String} guildID The ID of the guild to create the channel in
        * @arg {String} name The name of the channel
        * @arg {String} [type=0] The type of the channel, either 0 or 2 ("text" or "voice" respectively in gateway 5 and under)
        * @returns {Promise<GuildChannel>}
        */
       createChannel(guildID: String, name: String, type?: String): Promise<GuildChannel>;

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
       editChannel(channelID: String, options: { name?: String, icon?: String, ownerID?: String, topic?: String, bitrate?: Number, userLimit?: Number }): Promise<(GroupChannel|GuildChannel)>;

       /**
        * Edit a guild channel's position. Note that channel position numbers are lowest on top and highest at the bottom.
        * @arg {String} channelID The ID of the channel
        * @arg {Number} position The new position of the channel
        * @returns {Promise}
        */
       editChannelPosition(channelID: String, position: Number): Promise<void>;

       /**
        * Delete a guild channel, or leave a private or group channel
        * @arg {String} channelID The ID of the channel
        * @returns {Promise}
        */
       deleteChannel(channelID: String): Promise<void>;

       /**
        * Send typing status in a channel
        * @arg {String} channelID The ID of the channel
        * @returns {Promise}
        */
       sendChannelTyping(channelID: String): Promise<void>;

       /**
        * Create a channel permission overwrite
        * @arg {String} channelID The ID of channel
        * @arg {String} overwriteID The ID of the overwritten user or role
        * @arg {Number} allow The permissions number for allowed permissions
        * @arg {Number} deny The permissions number for denied permissions
        * @arg {String} type The object type of the overwrite, either "member" or "role"
        * @returns {Promise<PermissionOverwrite>}
        */
       editChannelPermission(channelID: String, overwriteID: String, allow: Number, deny: Number, type: String): Promise<PermissionOverwrite>;

       /**
        * Delete a channel permission overwrite
        * @arg {String} channelID The ID of the channel
        * @arg {String} overwriteID The ID of the overwritten user or role
        * @returns {Promise}
        */
       deleteChannelPermission(channelID: String, overwriteID: String): Promise<void>;

       /**
        * Get all invites in a channel
        * @arg {String} channelID The ID of the channel
        * @returns {Promise<Invite[]>}
        */
       getChannelInvites(channelID: String): Promise<Invite[]>;

       /**
        * Create an invite for a channel
        * @arg {String} channelID The ID of the channel
        * @arg {Object} [options] Invite generation options
        * @arg {Number} [options.maxAge] How long the invite should last in seconds
        * @arg {Number} [options.maxUses] How many uses the invite should last for
        * @arg {Boolean} [options.temporary] Whether the invite is temporary or not
        * @returns {Promise<Invite>}
        */
       createInvite(channelID: String, options?: { maxAge?: Number, maxUses?: Number, temporary?: Boolean }): Promise<Invite>;

       /**
        * Create a gulid role
        * @arg {String} guildID The ID of the guild to create the role in
        * @returns {Promise<Role>}
        */
       createRole(guildID: String): Promise<Role>;

       /**
        * Edit a gulid role
        * @arg {String} guildID The ID of the guild the role is in
        * @arg {String} roleID The ID of the role
        * @arg {Object} options The properties to edit
        * @arg {String} [options.name] The name of the role
        * @arg {Number} [options.permissions] The role permissions number
        * @arg {Number} [options.color] The hex color of the role, in number form (ex: 0x3da5b3 or 4040115)
        * @arg {Boolean} [options.hoist] Whether to hoist the role in the user list or not
        * @returns {Promise<Role>}
        */
       editRole(guildID: String, roleID: String, options: { name?: String, permissions?: Number, color?: Number, hoist?: Boolean }): Promise<Role>;

       /**
        * Edit a guild role's position. Note that role position numbers are highest on top and lowest at the bottom.
        * @arg {String} guildID The ID of the guild the role is in
        * @arg {String} roleID The ID of the role
        * @arg {Number} position The new position of the role
        * @returns {Promise}
        */
       editRolePosition(guildID: String, roleID: String, position: Number): Promise<void>;

       /**,
        * Create a gulid role
        * @arg {String} guildID The ID of the guild to create the role in
        * @arg {String} roleID The ID of the role
        * @returns {Promise}
        */
       deleteRole(guildID: String, roleID: String): Promise<void>;

       /**
        * Get the prune count for a guild
        * @arg {String} guildID The ID of the guild
        * @arg {Number} days The number of days of inactivity to prune for
        * @returns {Promise<Number>} Resolves with the number of users that would be pruned
        */
       getPruneCount(guildID: String, days: Number): Promise<Number>;

       /**
        * Begin pruning a guild
        * @arg {String} guildID The ID of the guild
        * @arg {Number} days The number of days of inactivity to prune for
        * @returns {Promise<Number>} Resolves with the number of pruned users
        */
       pruneMembers(guildID: String, days: Number): Promise<Number>;

       /**
        * Get possible voice reigons for a guild
        * @arg {String} guildID The ID of the guild
        * @returns {Promise<Object[]>} Resolves with an array of voice region objects
        */
       getVoiceRegions(guildID: String): Promise<Object[]>;

       /**
        * Get info on an invite
        * @arg {String} inviteID The ID of the invite
        * @returns {Promise<Invite>}
        */
       getInvite(inviteID: String): Promise<Invite>;

       /**
        * Accept an invite (not for bot accounts)
        * @arg {String} inviteID The ID of the invite
        * @returns {Promise<Invite>}
        */
       acceptInvite(inviteID: String): Promise<Invite>;

       /**
        * Delete an invite
        * @arg {String} inviteID The ID of the invite
        * @returns {Promise}
        */
       deleteInvite(inviteID: String): Promise<void>;

       /**
        * Get properties of the bot user
        * @returns {Promise<ExtendedUser>}
        */
       getSelf(): Promise<ExtendedUser>;

       /**
        * Edit properties of the bot user
        * @arg {Object} options The properties to edit
        * @arg {String} [options.username] The new username
        * @arg {String} [options.avatar] The new avatar as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
        * @returns {Promise<ExtendedUser>}
        */
       editSelf(options: { username?: String, avatar?: String }): Promise<ExtendedUser>;

       /**
        * Get a DM channel with a user, or create one if it does not exist
        * @arg {String} userID The ID of the user
        * @returns {Promise<PrivateChannel>}
        */
       getDMChannel(userID: String): Promise<PrivateChannel>;

       /**
        * Create a group channel with other users
        * @arg {String[]} userIDs The IDs of the other users
        * @returns {Promise<PrivateChannel>}
        */
       createGroupChannel(userIDs: String[]): Promise<PrivateChannel>;

       /**
        * Get a previous message in a channel
        * @arg {String} channelID The ID of the channel
        * @arg {String} messageID The ID of the message
        * @returns {Promise<Message>}
        */
       getMessage(channelID: String, messageID: String): Promise<Message>;

       /**
        * Get previous messages in a channel
        * @arg {String} channelID The ID of the channel
        * @arg {Number} [limit=50] The max number of messages to get (maximum 100)
        * @arg {String} [before] Get messages before this message ID
        * @arg {String} [after] Get messages after this message ID
        * @arg {String} [around] Get messages around this message ID (does not work with limit > 100)
        * @returns {Promise<Message[]>}
        */
       getMessages(channelID: String, limit?: Number, before?: String, after?: String, around?: String): Promise<Message[]>;

       /**
        * Get all the pins in a channel
        * @arg {String} channelID The ID of the channel
        * @returns {Promise<Message[]>}
        */
       getPins(channelID: String): Promise<Message[]>;

       /**
        * Create a message in a channel
        * Note: If you want to DM someone, the user ID is <b>not</b> the DM channel ID. use Client.getDMChanne() to get the DM channel ID for a user
        * @arg {String} channelID The ID of the channel
        * @arg {String | Object} content A string or object. If an object is passed:
        * @arg {String} content.content A content string
        * @arg {Boolean} [content.tts] Set the message TTS flag
        * @arg {Boolean} [content.disableEveryone] Whether to filter @everyone/@here or not (overrides default)
        * @arg {Object} [file] A file object
        * @arg {String} file.file A readable stream or buffer
        * @arg {String} file.name What to name the file
        * @returns {Promise<Message>}
        */
       createMessage(channelID: String, content: (String|{ content: String, tts?: Boolean, disableEveryone?: Boolean }), file?: { file: String, name: String }): Promise<Message>;

       /**
        * Edit a message
        * @arg {String} channelID The ID of the channel
        * @arg {String} messageID The ID of the message
        * @arg {String} content The updated message content
        * @arg {Boolean} [disableEveryone] Whether to filter @everyone/@here or not (overrides default)
        * @returns {Promise<Message>}
        */
       editMessage(channelID: String, messageID: String, content: String, disableEveryone?: Boolean): Promise<Message>;

       /**
        * Pin a message
        * @arg {String} channelID The ID of the channel
        * @arg {String} messageID The ID of the message
        * @returns {Promise}
        */
       pinMessage(channelID: String, messageID: String): Promise<void>;

       /**
        * Unpin a message
        * @arg {String} channelID The ID of the channel
        * @arg {String} messageID The ID of the message
        * @returns {Promise}
        */
       unpinMessage(channelID: String, messageID: String): Promise<void>;

       /**
        * Delete a message
        * @arg {String} channelID The ID of the channel
        * @arg {String} messageID The ID of the message
        * @returns {Promise}
        */
       deleteMessage(channelID: String, messageID: String): Promise<void>;

       /**
        * Bulk delete messages (bot accounts only)
        * @arg {String} channelID The ID of the channel
        * @arg {String[]} messageIDs Array of message IDs to delete
        * @returns {Promise}
        */
       deleteMessages(channelID: String, messageIDs: String[]): Promise<void>;

       /**
        * Purge previous messages in a channel with an optional filter (bot accounts only)
        * @arg {String} channelID The ID of the channel
        * @arg {Number} limit The max number of messages to search through, -1 for no limit
        * @arg {function} [filter] Optional filter function that returns a boolean when passed a Message object
        * @arg {String} [before] Get messages before this message ID
        * @arg {String} [after] Get messages after this message ID
        * @returns {Promise<Number>} Resolves with the number of messages deleted
        */
       purgeChannel(channelID: String, limit: Number, filter?: (() => any), before?: String, after?: String): Promise<Number>;

       /**
        * Get a list of integrations for a guild
        * @arg {String} guildID The ID of the guild
        * @returns {Promise<GuildIntegration[]>}
        */
       getGuildIntegrations(guildID: String): Promise<GuildIntegration[]>;

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
       editGuildIntegration(guildID: String, integrationID: String, options: { expireBehavior?: String, expireGracePeriod?: String, enableEmoticons?: String }): Promise<void>;

       /**
        * Delete a guild integration
        * @arg {String} guildID The ID of the guild
        * @arg {String} integrationID The ID of the integration
        * @returns {Promise}
        */
       deleteGuildIntegration(guildID: String, integrationID: String): Promise<void>;

       /**
        * Force a guild integration to sync
        * @arg {String} guildID The ID of the guild
        * @arg {String} integrationID The ID of the integration
        * @returns {Promise}
        */
       syncGuildIntegration(guildID: String, integrationID: String): Promise<void>;

       /**
        * Get all invites in a guild
        * @arg {String} guildID The ID of the guild
        * @returns {Promise<Invite[]>}
        */
       getGuildInvites(guildID: String): Promise<Invite[]>;

       /**
        * Ban a user from a guild
        * @arg {String} guildID The ID of the guild
        * @arg {String} userID The ID of the user
        * @arg {Number} [deleteMessageDays=0] Number of days to delete messages for
        * @returns {Promise}
        */
       banGuildMember(guildID: String, userID: String, deleteMessageDays?: Number): Promise<void>;

       /**
        * Unban a user from a guild
        * @arg {String} guildID The ID of the guild
        * @arg {String} userID The ID of the user
        * @returns {Promise}
        */
       unbanGuildMember(guildID: String, userID: String): Promise<void>;

       /**
        * Create a guild
        * @arg {String} name The name of the guild
        * @arg {String} region The region of the guild
        * @arg {String} [icon] The guild icon as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
        * @returns {Promise<Guild>}
        */
       createGuild(name: String, region: String, icon?: String): Promise<Guild>;

       /**
        * Edit a guild
        * @arg {String} guildID The ID of the guild
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
       editGuild(guildID: String, options: { name?: String, region?: String, icon?: String, verificationLevel?: Number, afkChannelID?: String, afkTimeout?: Number, ownerID?: String, splash?: String }): Promise<Guild>;

       /**
        * Get the ban list of a guild
        * @arg {String} guildID The ID of the guild
        * @returns {Promise<User[]>}
        */
       getGuildBans(guildID: String): Promise<User[]>;

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
       editGuildMember(guildID: String, userID: String, options: { roles?: String[], nick?: String, mute?: Boolean, deaf?: Boolean, channelID?: String }): Promise<void>;

       /**
        * Edit the bot's nickname in a guild
        * @arg {String} guildID The ID of the guild
        * @arg {String} nick The nickname
        * @returns {Promise}
        */
       editNickname(guildID: String, nick: String): Promise<void>;

       /**
        * Remove (kick) a member from a guild
        * @arg {String} guildID The ID of the guild
        * @arg {String} userID The ID of the user
        * @returns {Promise}
        */
       deleteGuildMember(guildID: String, userID: String): Promise<void>;

       /**
        * Delete a guild (bot user must be owner)
        * @arg {String} guildID The ID of the guild
        * @returns {Promise}
        */
       deleteGuild(guildID: String): Promise<void>;

       /**
        * Leave a guild
        * @arg {String} guildID The ID of the guild
        * @returns {Promise}
        */
       leaveGuild(guildID: String): Promise<void>;

       /**
        * Get data on an OAuth2 application
        * @arg {String} [appID="@me"] The client ID of the application to get data for. "@me" refers to the logged in user's own application
        * @returns {Promise<Object>} The bot's application data. Refer to <a href="https://discordapp.com/developers/docs/topics/oauth2#get-current-application-information">the official Discord API documentation entry</a> for Object structure
        */
       getOAuthApplication(appID?: String): Promise<Object>;

       /**
        * Create a relationship with a user
        * @arg {String} userID The ID of the target user
        * @arg {Boolean} [block=false] If true, block the user. Otherwise, add the user as a friend
        * @returns {Promise}
        */
       addRelationship(userID: String, block?: Boolean): Promise<void>;

       /**
        * Remove a relationship with a user
        * @arg {String} userID The ID of the target user
        * @returns {Promise}
        */
       removeRelationship(userID: String): Promise<void>;

       /**
        * Add a user to a group
        * @arg {String} groupID The ID of the target group
        * @arg {String} userID The ID of the target user
        * @returns {Promise}
        */
       addGroupRecipient(groupID: String, userID: String): Promise<void>;

       /**
        * Remove a user from a group
        * @arg {String} groupID The ID of the target group
        * @arg {String} userID The ID of the target user
        * @returns {Promise}
        */
       removeGroupRecipient(groupID: String, userID: String): Promise<void>;

   }

   /**
    * Represents an command framework command
    * @prop {Object} subcommands Object mapping subcommand labels to Command objects
    */
   declare class Command {
       subcommands: Object;
       /**
        * Represents an command framework command
        * @prop {Object} subcommands Object mapping subcommand labels to Command objects
        */
       constructor(label: String, generator: ((() => any)|String|((() => any)|String)[]), options?: { aliases?: String[], caseInsensitive?: Boolean, deleteCommand?: Boolean, guildOnly?: Boolean, dmOnly?: Boolean, description?: String, fullDescription?: String, usage?: String, requirements?: Object });

       /**
        * Register an alias for a subcommand
        * @arg {String} alias The alias
        * @arg {String} label The original subcommand label
        */
       registerSubcommandAlias(alias: String, label: String): void;

       /**
        * Register a subcommand
        * @arg {String} label The subcommand label
        * @arg {Function | String | Array<Function | String>} generator A response string, array of functions or strings, or function that generates a string or array of strings when called.
        * If a function is passed, the function will be passed a Message object and an array of subcommand arguments. The Message object will have an additional property `prefix`, which is the prefix used in the subcommand.
        * <pre><code>generator(msg, args)</code></pre>
        * @arg {Object} [options] Command options
        * @arg {Array<String>} [options.aliases] An array of subcommand aliases
        * @arg {Boolean} [options.caseInsensitive=false] Whether the subcommand label (and aliases) is case insensitive or not
        * @arg {Boolean} [options.deleteCommand=false] Whether to delete the user subcommand message or not
        * @arg {Boolean} [options.guildOnly=false] Whether to prevent the subcommand from being used in Direct Messages or not
        * @arg {Boolean} [options.dmOnly=false] Whether to prevent the subcommand from being used in guilds or not
        * @arg {String} [options.description="No description"] A short description of the subcommand to show in the default help subcommand
        * @arg {String} [options.fullDescription="No full description"] A detailed description of the subcommand to show in the default help subcommand
        * @arg {String} [options.usage] Details on how to call the subcommand to show in the default help subcommand
        * @arg {Object} [options.requirements] A set of factors that limit who can call the subcommand
        * @arg {Array<String>} [options.requirements.userIDs] An array of user IDs representing users that can call the subcommand
        * @arg {Object} [options.requirements.permissions] An object containing permission keys the user must match to use the subcommand
        * i.e.:
        * ```
        * {
        *   "administrator": false,
        *   "manageMessages": true
        * }```
        * In the above example, the user must not have administrator permissions, but must have manageMessages to use the subcommand
        * @arg {Array<String>} [options.requirements.roleIDs] An array of role IDs that would allow a user to use the subcommand
        * @arg {Array<String>} [options.requirements.roleNames] An array of role names that would allow a user to use the subcommand
        * @returns {Command}
        */
       registerSubcommand(label: String, generator: ((() => any)|String|((() => any)|String)[]), options?: { aliases?: String[], caseInsensitive?: Boolean, deleteCommand?: Boolean, guildOnly?: Boolean, dmOnly?: Boolean, description?: String, fullDescription?: String, usage?: String, requirements?: Object }): Command;

       /**
        * Unregister a subcommand
        * @arg {String} label The subcommand label
        */
       unregisterSubcommand(label: String): void;

   }

   /**
    * Represents an Eris client with the command framework
    * @extends Client
    * @prop {Object} commands Object mapping command labels to Command objects
    */
   declare class CommandClient extends Client {
       commands: Object;
       /**
        * Represents an Eris client with the command framework
        * @extends Client
        * @prop {Object} commands Object mapping command labels to Command objects
        */
       constructor(token: String, options?: Object, commandOptions?: { defaultHelpCommand?: Boolean, description?: String, ignoreBots?: Boolean, ignoreSelf?: Boolean, name?: String, owner?: String, prefix?: (String|any[]), defaultCommandOptions?: Object });

       /**
        * Register a prefix override for a specific guild
        * @arg {String} guildID The ID of the guild to override prefixes for
        * @arg {String|Array} prefix The bot prefix. Can be either an array of prefixes or a single prefix. "@mention" will be automatically replaced with the bot's actual mention
        */
       registerGuildPrefix(guildID: String, prefix: (String|any[])): void;

       /**
        * Register an alias for a command
        * @arg {String} alias The alias
        * @arg {String} label The original command label
        */
       registerCommandAlias(alias: String, label: String): void;

       /**
        * Register a command
        * @arg {String} label The command label
        * @arg {Function | String | Array<Function | String>} generator A response string, array of functions or strings, or function that generates a string or array of strings when called.
        * If a function is passed, the function will be passed a Message object and an array of command arguments. The Message object will have an additional property `prefix`, which is the prefix used in the command.
        * <pre><code>generator(msg, args)</code></pre>
        * @arg {Object} [options] Command options
        * @arg {Array<String>} [options.aliases] An array of command aliases
        * @arg {Boolean} [options.caseInsensitive=false] Whether the command label (and aliases) is case insensitive or not
        * @arg {Boolean} [options.deleteCommand=false] Whether to delete the user command message or not
        * @arg {Boolean} [options.guildOnly=false] Whether to prevent the command from being used in Direct Messages or not
        * @arg {Boolean} [options.dmOnly=false] Whether to prevent the command from being used in guilds or not
        * @arg {String} [options.description="No description"] A short description of the command to show in the default help command
        * @arg {String} [options.fullDescription="No full description"] A detailed description of the command to show in the default help command
        * @arg {String} [options.usage] Details on how to call the command to show in the default help command
        * @arg {Object} [options.requirements] A set of factors that limit who can call the command
        * @arg {Array<String>} [options.requirements.userIDs] An array of user IDs representing users that can call the command
        * @arg {Object} [options.requirements.permissions] An object containing permission keys the user must match to use the command
        * i.e.:
        * ```
        * {
        *   "administrator": false,
        *   "manageMessages": true
        * }```
        * In the above example, the user must not have administrator permissions, but must have manageMessages to use the command
        * @arg {Array<String>} [options.requirements.roleIDs] An array of role IDs that would allow a user to use the command
        * @arg {Array<String>} [options.requirements.roleNames] An array of role names that would allow a user to use the command
        * @returns {Command}
        */
       registerCommand(label: String, generator: ((() => any)|String|((() => any)|String)[]), options?: { aliases?: String[], caseInsensitive?: Boolean, deleteCommand?: Boolean, guildOnly?: Boolean, dmOnly?: Boolean, description?: String, fullDescription?: String, usage?: String, requirements?: Object }): Command;

       /**
        * Unregister a command
        * @arg {String} label The command label
        */
       unregisterCommand(label: String): void;

   }

   /**
    * Represents a shard
    * @extends EventEmitter
    * @prop {Number} id The ID of the shard
    * @prop {Boolean} connecting Whether the shard is connecting
    * @prop {Boolean} ready Whether the shard is ready
    * @prop {Number} guildCount The number of guilds this shard handles
    * @prop {Array<String>?} discordServerTrace Debug trace of Discord servers
    * @prop {String} status The status of the shard. "disconnected"/"connecting"/"handshaking"/"connected"
    */
   declare class Shard extends EventEmitter {
       id: Number;
       connecting: Boolean;
       ready: Boolean;
       guildCount: Number;
       discordServerTrace: String[];
       status: String;
       /**
        * Represents a shard
        * @extends EventEmitter
        * @prop {Number} id The ID of the shard
        * @prop {Boolean} connecting Whether the shard is connecting
        * @prop {Boolean} ready Whether the shard is ready
        * @prop {Number} guildCount The number of guilds this shard handles
        * @prop {Array<String>?} discordServerTrace Debug trace of Discord servers
        * @prop {String} status The status of the shard. "disconnected"/"connecting"/"handshaking"/"connected"
        */
       constructor();

       /**
        * Tells the shard to connect
        */
       connect(): void;

       /**
        * Disconnects the shard
        * @arg {Object?} [options] Shard disconnect options
        * @arg {String | Boolean} [options.reconnect] false means destroy everything, true means you want to reconnect in the future, "auto" will autoreconnect
        */
       disconnect(options?: { reconnect?: (String|Boolean) }): void;

       /**
        * Updates the bot's status (for all guilds the shard is in)
        * @arg {Boolean?} [idle] Sets if the bot is idle (true) or online (false)
        * @arg {Object?} [game] Sets the bot's active game, null to clear
        * @arg {String} game.name Sets the name of the bot's active game
        * @arg {Number} [game.type] The type of game. 0 is default, 1 is streaming (Twitch only)
        * @arg {String} [game.url] Sets the url of the shard's active game
        */
       editStatus(idle?: Boolean, game?: { name: String, type?: Number, url?: String }): void;

       /**
        * Updates the shard's idle status (for all guilds the shard is in)
        * @arg {Boolean} idle Sets if the shard is idle (true) or online (false)
        */
       editIdle(idle: Boolean): void;

       /**
        * Updates the shard's active game (for all guilds the shard is in)
        * @arg {Object?} game Sets the shard's active game, null to clear
        * @arg {String} game.name Sets the name of the shard's active game
        * @arg {Number} [game.type] The type of game. 0 is default, 1 is Twitch, 2 is YouTube
        * @arg {String} [game.url] Sets the url of the shard's active game
        */
       editGame(game?: { name: String, type?: Number, url?: String }): void;

   }

   /**
    * Handles APi requests
    */
   declare class RequestHandler {
       /**
        * Handles APi requests
        */
       constructor();

       /**
        * Make an API request
        * @arg {String} method Uppercase HTTP method
        * @arg {String} url URL of the endpoint
        * @arg {Boolean} auth Whether to add the Authorization header and token or not
        * @arg {Object} [body] Request payload
        * @arg {Object} [file] File object
        * @arg {String} file.file A readable stream or buffer
        * @arg {String} file.name What to name the file
        * @returns {Promise<Object>} Resolves with the returned JSON data
        */
       request(method: String, url: String, auth: Boolean, body?: Object, file?: { file: String, name: String }): Promise<Object>;

   }

   /**
    * Represents a call
    * @prop {String} id The ID of the call
    * @prop {GroupChannel} channel The call channel
    * @prop {Collection<VoiceState>} voiceStates The voice states of the call participants
    * @prop {String[]} participants The IDs of the call participants
    * @prop {Number?} endedTimestamp The timestamp of the call end
    * @prop {String[]?} ringing The IDs of people that still have not responded to the call request
    * @prop {String?} region The region of the call server
    * @prop {Boolean} unavailable Whether the call is unavailable or not
    */
   declare class Call {
       id: String;
       channel: GroupChannel;
       voiceStates: Collection<VoiceState>;
       participants: String[];
       endedTimestamp: Number;
       ringing: String[];
       region: String;
       unavailable: Boolean;
       /**
        * Represents a call
        * @prop {String} id The ID of the call
        * @prop {GroupChannel} channel The call channel
        * @prop {Collection<VoiceState>} voiceStates The voice states of the call participants
        * @prop {String[]} participants The IDs of the call participants
        * @prop {Number?} endedTimestamp The timestamp of the call end
        * @prop {String[]?} ringing The IDs of people that still have not responded to the call request
        * @prop {String?} region The region of the call server
        * @prop {Boolean} unavailable Whether the call is unavailable or not
        */
       constructor();

   }

   /**
    * Represents a channel
    * @prop {String} id The ID of the channel
    * @prop {Number} createdAt Timestamp of channel creation
    */
   declare class Channel {
       id: String;
       createdAt: Number;
       /**
        * Represents a channel
        * @prop {String} id The ID of the channel
        * @prop {Number} createdAt Timestamp of channel creation
        */
       constructor();

       /**
        * Send typing status in a text channel
        * @returns {Promise}
        */
       sendTyping(): Promise<void>;

       /**
        * Get a previous message in a text channel
        * @arg {String} messageID The ID of the message
        * @returns {Promise<Message>}
        */
       getMessage(messageID: String): Promise<Message>;

       /**
        * Get a previous message in a text channel
        * @arg {Number} [limit=50] The max number of messages to get (maximum 100)
        * @arg {String} [before] Get messages before this message ID
        * @arg {String} [after] Get messages after this message ID
        * @arg {String} [around] Get messages around this message ID (does not work with limit > 100)
        * @returns {Promise<Message[]>}
        */
       getMessages(limit?: Number, before?: String, after?: String, around?: String): Promise<Message[]>;

       /**
        * Get all the pins in a text channel
        * @returns {Promise<Message[]>}
        */
       getPins(): Promise<Message[]>;

       /**
        * Create a message in a text channel
        * Note: If you want to DM someone, the user ID is <b>not</b> the DM channel ID. use Client.getDMChanne() to get the DM channel ID for a user
        * @arg {String | Object} content A string or object. If an object is passed:
        * @arg {String} content.content A content string
        * @arg {Boolean} [content.tts] Set the message TTS flag
        * @arg {Boolean} [content.disableEveryone] Whether to filter @everyone/@here or not (overrides default)
        * @arg {Object} [file] A file object
        * @arg {String} file.file A readable stream or buffer
        * @arg {String} file.name What to name the file
        * @returns {Promise<Message>}
        */
       createMessage(content: (String|{ content: String, tts?: Boolean, disableEveryone?: Boolean }), file?: { file: String, name: String }): Promise<Message>;

       /**
        * Edit a message
        * @arg {String} messageID The ID of the message
        * @arg {String} content The updated message content
        * @arg {Boolean} [disableEveryone] Whether to filter @everyone/@here or not (overrides default)
        * @returns {Promise<Message>}
        */
       editMessage(messageID: String, content: String, disableEveryone?: Boolean): Promise<Message>;

       /**
        * Pin a message
        * @arg {String} messageID The ID of the message
        * @returns {Promise}
        */
       pinMessage(messageID: String): Promise<void>;

       /**
        * Unpin a message
        * @arg {String} messageID The ID of the message
        * @returns {Promise}
        */
       unpinMessage(messageID: String): Promise<void>;

       /**
        * Delete a message
        * @arg {String} messageID The ID of the message
        * @returns {Promise}
        */
       deleteMessage(messageID: String): Promise<void>;

       /**
        * Bulk delete messages (bot accounts only)
        * @arg {String[]} messageIDs Array of message IDs to delete
        * @returns {Promise}
        */
       deleteMessages(messageIDs: String[]): Promise<void>;

       /**
        * Purge previous messages in the channel with an optional filter (bot accounts only)
        * @arg {Number} limit The max number of messages to search through, -1 for no limit
        * @arg {function} [filter] Optional filter function that returns a boolean when passed a Message object
        * @arg {String} [before] Get messages before this message ID
        * @arg {String} [after] Get messages after this message ID
        * @returns {Promise<Number>} Resolves with the number of messages deleted
        */
       purge(limit: Number, filter?: (() => any), before?: String, after?: String): Promise<Number>;

   }

   /**
    * Represents an extended user
    * @extends {User}
    * @prop {String} email The email of the user
    * @prop {Boolean} verified Whether the account email has been verified
    * @prop {Boolean} mfaEnabled Whether the user has enabled two-factor authentication
    */
   declare class ExtendedUser extends User {
       email: String;
       verified: Boolean;
       mfaEnabled: Boolean;
       /**
        * Represents an extended user
        * @extends {User}
        * @prop {String} email The email of the user
        * @prop {Boolean} verified Whether the account email has been verified
        * @prop {Boolean} mfaEnabled Whether the user has enabled two-factor authentication
        */
       constructor();

   }

   /**
    * Represents a group channel. See PrivateChannel docs for additional properties.
    * @extends PrivateChannel
    * @prop {Call?} call The current group call, if any
    * @prop {Call?} lastCall The previous group call, if any
    * @prop {Collection<User>} recipients The recipients in this private channel
    * @prop {String} name The name of the group channel
    * @prop {String?} icon The hash of the group channel icon
    * @prop {String} ownerID The ID of the user that is the group owner
    */
   declare class GroupChannel extends PrivateChannel {
       call: Call;
       lastCall: Call;
       recipients: Collection<User>;
       name: String;
       icon: String;
       ownerID: String;
       /**
        * Represents a group channel. See PrivateChannel docs for additional properties.
        * @extends PrivateChannel
        * @prop {Call?} call The current group call, if any
        * @prop {Call?} lastCall The previous group call, if any
        * @prop {Collection<User>} recipients The recipients in this private channel
        * @prop {String} name The name of the group channel
        * @prop {String?} icon The hash of the group channel icon
        * @prop {String} ownerID The ID of the user that is the group owner
        */
       constructor();

       /**
        * Edit the channel's properties
        * @arg {Object} options The properties to edit
        * @arg {String} [options.name] The name of the channel
        * @arg {String} [options.icon] The icon of the channel as a base64 data URI (group channels only). Note: base64 strings alone are not base64 data URI strings
        * @arg {String} [options.ownerID] The ID of the channel owner (group channels only)
        * @returns {Promise<GroupChannel>}
        */
       edit(options: { name?: String, icon?: String, ownerID?: String }): Promise<GroupChannel>;

       /**
        * Add a user to the group
        * @arg {String} userID The ID of the target user
        * @returns {Promise}
        */
       addRecipient(userID: String): Promise<void>;

       /**
        * Remove a user from the group
        * @arg {String} userID The ID of the target user
        * @returns {Promise}
        */
       removeRecipient(userID: String): Promise<void>;

   }

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
   declare class Guild {
       id: String;
       createdAt: Number;
       name: String;
       verificationLevel: Number;
       region: String;
       defaultChannel: GuildChannel;
       icon: String;
       afkChannelID: String;
       afkTimeout: Number;
       defaultNotifications: Number;
       mfaLevel: Number;
       joinedAt: Number;
       ownerID: String;
       splash: String;
       unavailable: Boolean;
       channels: Collection<GuildChannel>;
       members: Collection<Member>;
       memberCount: Number;
       roles: Collection<Role>;
       shard: Shard;
       features: Object[];
       emojis: Object[];
       iconURL: String;
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
       constructor();

       /**
        * Request all guild members from Discord
        */
       fetchAllMembers(): void;

       /**
        * Create a channel in the guild
        * @arg {String} name The name of the channel
        * @arg {String} [type=0] The type of the channel, either 0 or 2 ("text" or "voice" respectively in gateway 5 and under)
        * @returns {Promise<GuildChannel>}
        */
       createChannel(name: String, type?: String): Promise<GuildChannel>;

       /**
        * Create a guild role
        * @returns {Promise<Role>}
        */
       createRole(): Promise<Role>;

       /**
        * Get the prune count for the guild
        * @arg {Number} days The number of days of inactivity to prune for
        * @returns {Promise<Number>} Resolves with the number of users that would be pruned
        */
       getPruneCount(days: Number): Promise<Number>;

       /**
        * Begin pruning the guild
        * @arg {Number} days The number of days of inactivity to prune for
        * @returns {Promise<Number>} Resolves with the number of pruned users
        */
       pruneMembers(days: Number): Promise<Number>;

       /**
        * Get possible voice reigons for a guild
        * @returns {Promise<Object[]>} Resolves with an array of voice region objects
        */
       getVoiceRegions(): Promise<Object[]>;

       /**
        * Edit the gulid role
        * @arg {String} roleID The ID of the role
        * @arg {Object} options The properties to edit
        * @arg {String} [options.name] The name of the role
        * @arg {Number} [options.permissions] The role permissions number
        * @arg {Number} [options.color] The hex color of the role, in number form (ex: 0x3da5b3 or 4040115)
        * @arg {Boolean} [options.hoist] Whether to hoist the role in the user list or not
        * @returns {Promise<Role>}
        */
       editRole(roleID: String, options: { name?: String, permissions?: Number, color?: Number, hoist?: Boolean }): Promise<Role>;

       /**
        * Delete a role
        * @arg {String} roleID The ID of the role
        * @returns {Promise}
        */
       deleteRole(roleID: String): Promise<void>;

       /**
        * Get a list of integrations for the guild
        * @returns {Promise<GuildIntegration[]>}
        */
       getIntegrations(): Promise<GuildIntegration[]>;

       /**
        * Edit a guild integration
        * @arg {String} integrationID The ID of the integration
        * @arg {Object} options The properties to edit
        * @arg {String} [options.expireBehavior] What to do when a user's subscription runs out
        * @arg {String} [options.expireGracePeriod] How long before the integration's role is removed from an unsubscribed user
        * @arg {String} [options.enableEmoticons] Whether to enable integration emoticons or not
        * @returns {Promise}
        */
       editIntegration(integrationID: String, options: { expireBehavior?: String, expireGracePeriod?: String, enableEmoticons?: String }): Promise<void>;

       /**
        * Force a guild integration to sync
        * @arg {String} integrationID The ID of the integration
        * @returns {Promise}
        */
       syncIntegration(integrationID: String): Promise<void>;

       /**
        * Delete a guild integration
        * @arg {String} integrationID The ID of the integration
        * @returns {Promise}
        */
       deleteIntegration(integrationID: String): Promise<void>;

       /**
        * Get all invites in the guild
        * @returns {Promise<Invite[]>}
        */
       getInvites(): Promise<Invite[]>;

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
       editMember(userID: String, options: { roles?: String[], nick?: String, mute?: Boolean, deaf?: Boolean, channelID?: String }): Promise<void>;

       /**
        * Remove (kick) a member from the guild
        * @arg {String} userID The ID of the user
        * @returns {Promise}
        */
       deleteMember(userID: String): Promise<void>;

       /**
        * Ban a user from the guild
        * @arg {String} userID The ID of the user
        * @arg {Number} [deleteMessageDays=0] Number of days to delete messages for
        * @returns {Promise}
        */
       banMember(userID: String, deleteMessageDays?: Number): Promise<void>;

       /**
        * Unban a user from the guild
        * @arg {String} userID The ID of the user
        * @returns {Promise}
        */
       unbanMember(userID: String): Promise<void>;

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
       edit(options: { name?: String, region?: String, icon?: String, verificationLevel?: Number, afkChannelID?: String, afkTimeout?: Number, ownerID?: String, splash?: String }): Promise<Guild>;

       /**
        * Delete the guild (bot user must be owner)
        * @returns {Promise}
        */
       delete(): Promise<void>;

       /**
        * Leave the guild
        * @returns {Promise}
        */
       leave(): Promise<void>;

       /**
        * Get the ban list of the guild
        * @returns {Promise<User[]>}
        */
       getBans(): Promise<User[]>;

       /**
        * Edit the bot's nickname in the guild
        * @arg {String} nick The nickname
        * @returns {Promise}
        */
       editNickname(nick: String): Promise<void>;

   }

   /**
    * Represents a guild channel
    * @prop {String} id The ID of the channel
    * @prop {String} mention A string that mentions the channel
    * @prop {Number} createdAt Timestamp of channel creation
    * @prop {Guild} guild The guild that owns the channel
    * @prop {Collection<Message>} messages Collection of Messages in this channel
    * @prop {String} lastMessageID The ID of the last message in this channel
    * @prop {Number} lastPinTimestamp The timestamp of the last pinned message
    * @prop {Collection<PermissionOverwrite>} permissionOverwrites Collection of PermissionOverwrites in this channel
    * @prop {String} type The type of the channel, either 0 or 2 ("text" or "voice" respectively in gateway 5 and under)
    * @prop {String} name The name of the channel
    * @prop {Number} position The position of the channel
    * @prop {String?} topic The topic of the channel (text channels only)
    * @prop {Number?} bitrate The bitrate of the channel (voice channels only)
    * @prop {Collection<Member>?} voiceMembers Collection of Members in this channel (voice channels only)
    */
   declare class GuildChannel {
       id: String;
       mention: String;
       createdAt: Number;
       guild: Guild;
       messages: Collection<Message>;
       lastMessageID: String;
       lastPinTimestamp: Number;
       permissionOverwrites: Collection<PermissionOverwrite>;
       type: String;
       name: String;
       position: Number;
       topic: String;
       bitrate: Number;
       voiceMembers: Collection<Member>;
       /**
        * Represents a guild channel
        * @prop {String} id The ID of the channel
        * @prop {String} mention A string that mentions the channel
        * @prop {Number} createdAt Timestamp of channel creation
        * @prop {Guild} guild The guild that owns the channel
        * @prop {Collection<Message>} messages Collection of Messages in this channel
        * @prop {String} lastMessageID The ID of the last message in this channel
        * @prop {Number} lastPinTimestamp The timestamp of the last pinned message
        * @prop {Collection<PermissionOverwrite>} permissionOverwrites Collection of PermissionOverwrites in this channel
        * @prop {String} type The type of the channel, either 0 or 2 ("text" or "voice" respectively in gateway 5 and under)
        * @prop {String} name The name of the channel
        * @prop {Number} position The position of the channel
        * @prop {String?} topic The topic of the channel (text channels only)
        * @prop {Number?} bitrate The bitrate of the channel (voice channels only)
        * @prop {Collection<Member>?} voiceMembers Collection of Members in this channel (voice channels only)
        */
       constructor();

       /**
        * Get the channel-specific permissions of a member
        * @arg {String} memberID The ID of the member
        * @returns {Permission}
        */
       permissionsOf(memberID: String): Permission;

       /**
        * Edit the channel's properties
        * @arg {Object} options The properties to edit
        * @arg {String} [options.name] The name of the channel
        * @arg {String} [options.topic] The topic of the channel (guild text channels only)
        * @arg {Number} [options.bitrate] The bitrate of the channel (guild voice channels only)
        * @arg {Number} [options.userLimit] The channel user limit (guild voice channels only)
        * @returns {Promise<GuildChannel>}
        */
       edit(options: { name?: String, topic?: String, bitrate?: Number, userLimit?: Number }): Promise<GuildChannel>;

       /**
        * Edit the channel's position. Note that channel position numbers are lowest on top and highest at the bottom.
        * @arg {Number} position The new position of the channel
        * @returns {Promise}
        */
       editPosition(position: Number): Promise<void>;

       /**
        * Delete the channel
        * @returns {Promise}
        */
       delete(): Promise<void>;

       /**
        * Create a channel permission overwrite
        * @arg {String} overwriteID The ID of the overwritten user or role
        * @arg {Number} allow The permissions number for allowed permissions
        * @arg {Number} deny The permissions number for denied permissions
        * @arg {String} type The object type of the overwrite, either "member" or "role"
        * @returns {Promise<PermissionOverwrite>}
        */
       editPermission(overwriteID: String, allow: Number, deny: Number, type: String): Promise<PermissionOverwrite>;

       /**
        * Delete a channel permission overwrite
        * @arg {String} overwriteID The ID of the overwritten user or role
        * @returns {Promise}
        */
       deletePermission(overwriteID: String): Promise<void>;

       /**
        * Get all invites in the channel
        * @returns {Promise<Invite[]>}
        */
       getInvites(): Promise<Invite[]>;

       /**
        * Create an invite for the channel
        * @arg {Object} [options] Invite generation options
        * @arg {Number} [options.maxAge] How long the invite should last in seconds
        * @arg {Number} [options.maxUses] How many uses the invite should last for
        * @arg {Boolean} [options.temporary] Whether the invite is temporary or not
        * @returns {Promise<Invite>}
        */
       createInvite(options?: { maxAge?: Number, maxUses?: Number, temporary?: Boolean }): Promise<Invite>;

   }

   /**
    * Represents a guild integration
    * @prop {String} id The ID of the integration
    * @prop {Number} createdAt Timestamp of guild integration creation
    * @prop {String} name The name of the integration
    * @prop {String} type The type of the integration
    * @prop {String} roleID The ID of the role connected to the integration
    * @prop {User} user The user connected to the integration
    * @prop {Object} account Info on the integration account
    * @prop {String} account.id The ID of the integration account
    * @prop {String} account.name The name of the integration account
    * @prop {Boolean} enabled Whether the integration is enabled or not
    * @prop {Boolean} syncing Whether the integration is syncing or not
    * @prop {Number} expireBehavior behavior of expired subscriptions
    * @prop {Number} expireGracePeriod grace period for expired subscriptions
    * @prop {Boolean} enableEmoticons Whether integration emoticons are enabled or not
    * @prop {Number} subscriberCount number of subscribers
    * @prop {Number} syncedAt Unix timestamp of last integration sync
    */
   declare class GuildIntegration {
       id: String;
       createdAt: Number;
       name: String;
       type: String;
       roleID: String;
       user: User;
       account: { id: String, name: String };
       enabled: Boolean;
       syncing: Boolean;
       expireBehavior: Number;
       expireGracePeriod: Number;
       enableEmoticons: Boolean;
       subscriberCount: Number;
       syncedAt: Number;
       /**
        * Represents a guild integration
        * @prop {String} id The ID of the integration
        * @prop {Number} createdAt Timestamp of guild integration creation
        * @prop {String} name The name of the integration
        * @prop {String} type The type of the integration
        * @prop {String} roleID The ID of the role connected to the integration
        * @prop {User} user The user connected to the integration
        * @prop {Object} account Info on the integration account
        * @prop {String} account.id The ID of the integration account
        * @prop {String} account.name The name of the integration account
        * @prop {Boolean} enabled Whether the integration is enabled or not
        * @prop {Boolean} syncing Whether the integration is syncing or not
        * @prop {Number} expireBehavior behavior of expired subscriptions
        * @prop {Number} expireGracePeriod grace period for expired subscriptions
        * @prop {Boolean} enableEmoticons Whether integration emoticons are enabled or not
        * @prop {Number} subscriberCount number of subscribers
        * @prop {Number} syncedAt Unix timestamp of last integration sync
        */
       constructor();

       /**
        * Edit the guild integration
        * @arg {Object} options The properties to edit
        * @arg {String} [options.expireBehavior] What to do when a user's subscription runs out
        * @arg {String} [options.expireGracePeriod] How long before the integration's role is removed from an unsubscribed user
        * @arg {String} [options.enableEmoticons] Whether to enable integration emoticons or not
        * @returns {Promise}
        */
       edit(options: { expireBehavior?: String, expireGracePeriod?: String, enableEmoticons?: String }): Promise<void>;

       /**
        * Delete the guild integration
        * @returns {Promise}
        */
       delete(): Promise<void>;

       /**
        * Force the guild integration to sync
        * @returns {Promise}
        */
       sync(): Promise<void>;

   }

   /**
    * Represents an invite. The nullable properties will be null if the bot user does not have manage channel or manage server permissions for the invite's channel/server.
    * @prop {String} code The invite code
    * @prop {Object} channel Info on the invite channel
    * @prop {String} channel.id The ID of the invite's channel
    * @prop {String} channel.name The name of the invite's channel
    * @prop {Object} guild Info on the invite guild
    * @prop {String} guild.id The ID of the invite's guild
    * @prop {String} guild.name The name of the invite's guild
    * @prop {String?} guild.splashHash The hash of the invite splash screen
    * @prop {User?} inviter The invite creator
    * @prop {Number?} uses The number of invite uses
    * @prop {Number?} maxUses The max number of invite uses
    * @prop {Number?} maxAge How long the invite lasts in seconds
    * @prop {Boolean?} temporary Whether the invite is temporary or not
    * @prop {Number?} createdAt Timestamp of invite creation
    * @prop {Boolean?} revoked Whether the invite was revoked or not
    */
   declare class Invite {
       code: String;
       channel: { id: String, name: String };
       guild: { id: String, name: String, splashHash: String };
       inviter: User;
       uses: Number;
       maxUses: Number;
       maxAge: Number;
       temporary: Boolean;
       createdAt: Number;
       revoked: Boolean;
       /**
        * Represents an invite. The nullable properties will be null if the bot user does not have manage channel or manage server permissions for the invite's channel/server.
        * @prop {String} code The invite code
        * @prop {Object} channel Info on the invite channel
        * @prop {String} channel.id The ID of the invite's channel
        * @prop {String} channel.name The name of the invite's channel
        * @prop {Object} guild Info on the invite guild
        * @prop {String} guild.id The ID of the invite's guild
        * @prop {String} guild.name The name of the invite's guild
        * @prop {String?} guild.splashHash The hash of the invite splash screen
        * @prop {User?} inviter The invite creator
        * @prop {Number?} uses The number of invite uses
        * @prop {Number?} maxUses The max number of invite uses
        * @prop {Number?} maxAge How long the invite lasts in seconds
        * @prop {Boolean?} temporary Whether the invite is temporary or not
        * @prop {Number?} createdAt Timestamp of invite creation
        * @prop {Boolean?} revoked Whether the invite was revoked or not
        */
       constructor();

       /**
        * Delete the invite
        * @returns {Promise}
        */
       delete(): Promise<void>;

   }

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
    * @prop {String?} game.url The url of the active game
    * @prop {VoiceState} voiceState The voice state of the member
    * @prop {String?} nick The server nickname of the member
    * @prop {String[]} roles An array of role IDs this member is a part of
    * @prop {User} user The user object of the member
    * @prop {Permission} permission The guild-wide permissions of the member
    */
   declare class Member {
       id: String;
       mention: String;
       guild: Guild;
       joinedAt: Number;
       status: String;
       game: { name: String, type: Number, url: String };
       voiceState: VoiceState;
       nick: String;
       roles: String[];
       user: User;
       permission: Permission;
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
        * @prop {String?} game.url The url of the active game
        * @prop {VoiceState} voiceState The voice state of the member
        * @prop {String?} nick The server nickname of the member
        * @prop {String[]} roles An array of role IDs this member is a part of
        * @prop {User} user The user object of the member
        * @prop {Permission} permission The guild-wide permissions of the member
        */
       constructor();

       /**
        * Edit the guild member
        * @arg {Object} options The properties to edit
        * @arg {String[]} [options.roles] The array of role IDs the user should have
        * @arg {String} [options.nick] Set the user's server nickname, "" to remove
        * @arg {Boolean} [options.mute] Server mute the user
        * @arg {Boolean} [options.deaf] Server deafen the user
        * @arg {String} [options.channelID] The ID of the voice channel to move the user to (must be in voice)
        * @returns {Promise}
        */
       edit(options: { roles?: String[], nick?: String, mute?: Boolean, deaf?: Boolean, channelID?: String }): Promise<void>;

       /**
        * Remove (kick) the member from the guild
        * @returns {Promise}
        */
       delete(): Promise<void>;

       /**
        * Ban the user from the guild
        * @arg {Number} [deleteMessageDays=0] Number of days to delete messages for
        * @returns {Promise}
        */
       ban(deleteMessageDays?: Number): Promise<void>;

       /**
        * Unban the user from the guild
        * @returns {Promise}
        */
       unban(): Promise<void>;

   }

   /**
    * Represents a message
    * @prop {String} id The ID of the message
    * @prop {Channel} channel The channel the message is in
    * @prop {Number} timestamp Timestamp of message creation
    * @prop {User} author The message author
    * @prop {Member?} member The message author with server-specific data
    * @prop {User[]} mentions Array of mentioned users
    * @prop {String} content Message content
    * @prop {String?} cleanContent Message content with mentions replaced by names, and @everyone/@here escaped
    * @prop {String[]} roleMentions Array of mentioned roles' ids
    * @prop {String[]?} channelMentions Array of mentions channels' ids, requires client option cleanContent
    * @prop {Number?} editedTimestamp Timestamp of latest message edit
    * @prop {Boolean} tts Whether to play the message using TTS or not
    * @prop {Boolean} mentionEveryone Whether the message mentions everyone/here or not
    * @prop {Object[]} attachments Array of attachments
    * @prop {Object[]} embeds Array of embeds
    * @prop {Boolean} command True if message is a command, false if not (CommandClient only)
    */
   declare class Message {
       id: String;
       channel: Channel;
       timestamp: Number;
       author: User;
       member: Member;
       mentions: User[];
       content: String;
       cleanContent: String;
       roleMentions: String[];
       channelMentions: String[];
       editedTimestamp: Number;
       tts: Boolean;
       mentionEveryone: Boolean;
       attachments: Object[];
       embeds: Object[];
       command: Boolean;
       /**
        * Represents a message
        * @prop {String} id The ID of the message
        * @prop {Channel} channel The channel the message is in
        * @prop {Number} timestamp Timestamp of message creation
        * @prop {User} author The message author
        * @prop {Member?} member The message author with server-specific data
        * @prop {User[]} mentions Array of mentioned users
        * @prop {String} content Message content
        * @prop {String?} cleanContent Message content with mentions replaced by names, and @everyone/@here escaped
        * @prop {String[]} roleMentions Array of mentioned roles' ids
        * @prop {String[]?} channelMentions Array of mentions channels' ids, requires client option cleanContent
        * @prop {Number?} editedTimestamp Timestamp of latest message edit
        * @prop {Boolean} tts Whether to play the message using TTS or not
        * @prop {Boolean} mentionEveryone Whether the message mentions everyone/here or not
        * @prop {Object[]} attachments Array of attachments
        * @prop {Object[]} embeds Array of embeds
        * @prop {Boolean} command True if message is a command, false if not (CommandClient only)
        */
       constructor();

       /**
        * Edit the message
        * @arg {String} content The updated message content
        * @arg {Boolean} [disableEveryone] Whether to filter @everyone/@here or not (overrides default)
        * @returns {Promise<Message>}
        */
       edit(content: String, disableEveryone?: Boolean): Promise<Message>;

       /**
        * Pin the message
        * @returns {Promise}
        */
       pin(): Promise<void>;

       /**
        * Unpin the message
        * @returns {Promise}
        */
       unpin(): Promise<void>;

       /**
        * Delete the message
        * @returns {Promise}
        */
       delete(): Promise<void>;

   }

   /**
    * Represents a calculated permissions number
    * @prop {Number} allow The allowed permissions number
    * @prop {Number} deny The denied permissions number
    * @prop {Object} json A JSON representation of the permissions number.
    * If a permission key isn't there, it is not set by this permission.
    * If a permission key is false, it is denied by the permission.
    * If a permission key is true, it is allowed by the permission.
    * i.e.:
    * ```
    * {
    *   "readMessages": true,
    *   "sendMessages": true,
    *   "manageMessages": false
    * }```
    * In the above example, readMessages and sendMessages are allowed permissions, and manageMessages is denied. Everything else is not explicitly set.
    * <a href="reference.html#permissions">A full list of permission nodes can be found on the docs reference page</a>
    */
   declare class Permission {
       allow: Number;
       deny: Number;
       json: Object;
       /**
        * Represents a calculated permissions number
        * @prop {Number} allow The allowed permissions number
        * @prop {Number} deny The denied permissions number
        * @prop {Object} json A JSON representation of the permissions number.
        * If a permission key isn't there, it is not set by this permission.
        * If a permission key is false, it is denied by the permission.
        * If a permission key is true, it is allowed by the permission.
        * i.e.:
        * ```
        * {
        *   "readMessages": true,
        *   "sendMessages": true,
        *   "manageMessages": false
        * }```
        * In the above example, readMessages and sendMessages are allowed permissions, and manageMessages is denied. Everything else is not explicitly set.
        * <a href="reference.html#permissions">A full list of permission nodes can be found on the docs reference page</a>
        */
       constructor();

       /**
        * Check if this permission allows a specific permission
        * @arg {String} permission The name of the permission. <a href="reference.html#permissions">A full list of permission nodes can be found on the docs reference page</a>
        * @returns {Boolean} Whether the permission allows the specified permission
        */
       has(permission: String): Boolean;

   }

   /**
    * Represents a permission overwrite
    * @extends Permission
    * @prop {String} id The ID of the overwrite
    * @prop {String} type The type of the overwrite, either "user" or "role"
    */
   declare class PermissionOverwrite extends Permission {
       id: String;
       type: String;
       /**
        * Represents a permission overwrite
        * @extends Permission
        * @prop {String} id The ID of the overwrite
        * @prop {String} type The type of the overwrite, either "user" or "role"
        */
       constructor();

   }

   /**
    * Represents a private channel
    * @prop {String} id The ID of the channel
    * @prop {Number} createdAt Timestamp of private channel creation
    * @prop {String} lastMessageID The ID of the last message in this channel
    * @prop {User} recipient The recipient in this private channel (private channels only)
    * @prop {Collection<Message>} messages Collection of Messages in this channel
    */
   declare class PrivateChannel {
       id: String;
       createdAt: Number;
       lastMessageID: String;
       recipient: User;
       messages: Collection<Message>;
       /**
        * Represents a private channel
        * @prop {String} id The ID of the channel
        * @prop {Number} createdAt Timestamp of private channel creation
        * @prop {String} lastMessageID The ID of the last message in this channel
        * @prop {User} recipient The recipient in this private channel (private channels only)
        * @prop {Collection<Message>} messages Collection of Messages in this channel
        */
       constructor();

       /**
        * Ring fellow group channel recipient(s)
        * @arg {String[]} recipients The IDs of the recipients to ring
        */
       ring(recipients: String[]): void;

       /**
        * Check if the channel has an existing call
        */
       syncCall(): void;

       /**
        * Leave the channel
        * @returns {Promise}
        */
       leave(): Promise<void>;

   }

   /**
    * Represents a Relationship
    * @prop {User} user The other user in the relationship
    * @prop {Number} type The type of relationship. 1 is friend, 2 is block, 3 is incoming request, 4 is outgoing request
    * @prop {String} status The other user's status. Either "online", "idle", or "offline"
    * @prop {Object?} game The active game the other user is playing
    * @prop {String} game.name The name of the active game
    * @prop {Number} game.type The type of the active game (0 is default, 1 is Twitch, 2 is YouTube)
    * @prop {String?} game.url The url of the active game
    */
   declare class Relationship {
       user: User;
       type: Number;
       status: String;
       game: { name: String, type: Number, url: String };
       /**
        * Represents a Relationship
        * @prop {User} user The other user in the relationship
        * @prop {Number} type The type of relationship. 1 is friend, 2 is block, 3 is incoming request, 4 is outgoing request
        * @prop {String} status The other user's status. Either "online", "idle", or "offline"
        * @prop {Object?} game The active game the other user is playing
        * @prop {String} game.name The name of the active game
        * @prop {Number} game.type The type of the active game (0 is default, 1 is Twitch, 2 is YouTube)
        * @prop {String?} game.url The url of the active game
        */
       constructor();

   }

   /**
    * Represents a role
    * @prop {String} id The ID of the role
    * @prop {Guild} guild The guild that owns the role
    * @prop {String} mention A string that mentions the role
    * @prop {Number} createdAt Timestamp of role creation
    * @prop {String} name The name of the role
    * @prop {Boolean} mentionable Whether the role is mentionable or not
    * @prop {Boolean} managed Whether a guild integration manages this role or not
    * @prop {Boolean} hoist Whether users with this role are hoisted in the user list or not
    * @prop {Number} color The hex color of the role in base 10
    * @prop {Number} position The position of the role
    * @prop {Permission} permissions The permissions representation of the role
    */
   declare class Role {
       id: String;
       guild: Guild;
       mention: String;
       createdAt: Number;
       name: String;
       mentionable: Boolean;
       managed: Boolean;
       hoist: Boolean;
       color: Number;
       position: Number;
       permissions: Permission;
       /**
        * Represents a role
        * @prop {String} id The ID of the role
        * @prop {Guild} guild The guild that owns the role
        * @prop {String} mention A string that mentions the role
        * @prop {Number} createdAt Timestamp of role creation
        * @prop {String} name The name of the role
        * @prop {Boolean} mentionable Whether the role is mentionable or not
        * @prop {Boolean} managed Whether a guild integration manages this role or not
        * @prop {Boolean} hoist Whether users with this role are hoisted in the user list or not
        * @prop {Number} color The hex color of the role in base 10
        * @prop {Number} position The position of the role
        * @prop {Permission} permissions The permissions representation of the role
        */
       constructor();

       /**
        * Generates a JSON representation of the role permissions
        * @returns {Object}
        */
       asJSON(): Object;

       /**
        * Edit the gulid role
        * @arg {Object} options The properties to edit
        * @arg {String} [options.name] The name of the role
        * @arg {Number} [options.permissions] The role permissions number
        * @arg {Number} [options.color] The hex color of the role, in number form (ex: 0x3da5b3 or 4040115)
        * @arg {Boolean} [options.hoist] Whether to hoist the role in the user list or not
        * @returns {Promise<Role>}
        */
       edit(options: { name?: String, permissions?: Number, color?: Number, hoist?: Boolean }): Promise<Role>;

       /**
        * Edit the role's position. Note that role position numbers are highest on top and lowest at the bottom.
        * @arg {Number} position The new position of the role
        * @returns {Promise}
        */
       editPosition(position: Number): Promise<void>;

       /**
        * Delete the role
        * @returns {Promise}
        */
       delete(): Promise<void>;

   }

   /**
    * Represents a user
    * @prop {String} id The ID of the user
    * @prop {String} mention A string that mentions the user
    * @prop {String} defaultAvatar The hash for the default avatar of a user if there is no avatar set
    * @prop {Number} createdAt Timestamp of user creation
    * @prop {Boolean} bot Whether the user is an OAuth bot or not
    * @prop {String} username The username of the user
    * @prop {String?} discriminator The discriminator of the user
    * @prop {String?} avatar The hash of the user's avatar, or null if no avatar
    * @prop {String} defaultAvatarURL The URL of the user's default avatar
    * @prop {String} avatarURL The URL of the user's avatar
    */
   declare class User {
       id: String;
       mention: String;
       defaultAvatar: String;
       createdAt: Number;
       bot: Boolean;
       username: String;
       discriminator: String;
       avatar: String;
       defaultAvatarURL: String;
       avatarURL: String;
       /**
        * Represents a user
        * @prop {String} id The ID of the user
        * @prop {String} mention A string that mentions the user
        * @prop {String} defaultAvatar The hash for the default avatar of a user if there is no avatar set
        * @prop {Number} createdAt Timestamp of user creation
        * @prop {Boolean} bot Whether the user is an OAuth bot or not
        * @prop {String} username The username of the user
        * @prop {String?} discriminator The discriminator of the user
        * @prop {String?} avatar The hash of the user's avatar, or null if no avatar
        * @prop {String} defaultAvatarURL The URL of the user's default avatar
        * @prop {String} avatarURL The URL of the user's avatar
        */
       constructor();

       /**
        * Get a DM channel with the user, or create one if it does not exist
        * @returns {Promise<PrivateChannel>}
        */
       getDMChannel(): Promise<PrivateChannel>;

       /**
        * Create a relationship with the user
        * @arg {Boolean} [block=false] If true, block the user. Otherwise, add the user as a friend
        * @returns {Promise}
        */
       addRelationship(block?: Boolean): Promise<void>;

       /**
        * Remove a relationship with the user
        * @returns {Promise}
        */
       removeRelationship(): Promise<void>;

   }

   /**
    * Represents a user's voice state in a call/guild
    * @prop {String} id The ID of the guild
    * @prop {String?} sessionID The ID of the user's current voice session
    * @prop {String?} channelID The ID of the user's current voice channel
    * @prop {Boolean} mute Whether the user is server muted or not
    * @prop {Boolean} deaf Whether the user is server deafened or not
    * @prop {Boolean} suppress Whether the user is suppressed or not
    * @prop {Boolean} selfMute Whether the user is self muted or not
    * @prop {Boolean} selfDeaf Whether the user is self deafened or not
    */
   declare class VoiceState {
       id: String;
       sessionID: String;
       channelID: String;
       mute: Boolean;
       deaf: Boolean;
       suppress: Boolean;
       selfMute: Boolean;
       selfDeaf: Boolean;
       /**
        * Represents a user's voice state in a call/guild
        * @prop {String} id The ID of the guild
        * @prop {String?} sessionID The ID of the user's current voice session
        * @prop {String?} channelID The ID of the user's current voice channel
        * @prop {Boolean} mute Whether the user is server muted or not
        * @prop {Boolean} deaf Whether the user is server deafened or not
        * @prop {Boolean} suppress Whether the user is suppressed or not
        * @prop {Boolean} selfMute Whether the user is self muted or not
        * @prop {Boolean} selfDeaf Whether the user is self deafened or not
        */
       constructor();

   }

   /**
    * Handle ratelimiting something
    * @prop {Number} tokens How many tokens the bucket has consumed in this interval
    * @prop {Number} lastReset Timestamp of last token clearing
    * @prop {Number} lastSend Timestamp of last token consumption
    * @prop {Number} tokens How many tokens the bucket has consumed in this interval
    * @prop {Number} tokenLimit The max number tokens the bucket can consume per interval
    * @prop {Number} interval How long (in ms) to wait between clearing used tokens
    * @prop {Number} sequencerWait How long (in ms) to wait between consuming tokens
    */
   declare class Bucket {
       tokens: Number;
       lastReset: Number;
       lastSend: Number;
       tokenLimit: Number;
       interval: Number;
       sequencerWait: Number;
       /**
        * Handle ratelimiting something
        * @prop {Number} tokens How many tokens the bucket has consumed in this interval
        * @prop {Number} lastReset Timestamp of last token clearing
        * @prop {Number} lastSend Timestamp of last token consumption
        * @prop {Number} tokens How many tokens the bucket has consumed in this interval
        * @prop {Number} tokenLimit The max number tokens the bucket can consume per interval
        * @prop {Number} interval How long (in ms) to wait between clearing used tokens
        * @prop {Number} sequencerWait How long (in ms) to wait between consuming tokens
        */
       constructor(tokenLimit: Number, interval: Number, sequencerWait?: Number);

       /**
        * Queue something in the Bucket
        * @arg {Function} func A callback to call when a token can be consumed
        */
       queue(func: (() => any)): void;

   }

   /**
    * Hold a bunch of something
    * @extends Map
    * @prop {Class} baseObject The base class for all items
    * @prop {Number?} limit Max number of items to hold
    */
   declare class Collection<T> extends Map {
       baseObject: T;
       limit: Number;
       /**
        * Hold a bunch of something
        * @extends Map
        * @prop {Class} baseObject The base class for all items
        * @prop {Number?} limit Max number of items to hold
        */
       constructor(baseObject: T, limit?: Number);

       /**
        * Add an object
        * @arg {Object} obj The object data
        * @arg {String} obj.id The ID of the object
        * @arg {Class?} extra An extra parameter the constructor may need
        * @returns {Class} The existing or newly created object
        */
       add(obj: { id: String }, extra?: T): T;

       /**
        * Return the first object to make the function evaluate true
        * @arg {function} func A function that takes an object and returns true if it matches
        * @returns {Class?} The first matching object, or null if no match
        */
       find(func: (() => any)): T;

       /**
        * Get a random object from the Collection
        * @returns {Class?} The first matching object, or null if no match
        */
       random(): T;

       /**
        * Return all the objects that make the function evaluate true
        * @arg {function} func A function that takes an object and returns true if it matches
        * @returns {Array<Class>} An array containing all the objects that matched
        */
       filter(func: (() => any)): T[];

       /**
        * Return an array with the results of applying the given function to each element
        * @arg {function} func A function that takes an object and returns something
        * @returns {Array} An array containing the results
        */
       map(func: (() => any)): any[];

       /**
        * Update an object
        * @arg {Object} obj The updated object data
        * @arg {String} obj.id The ID of the object
        * @arg {Class?} extra An extra parameter the constructor may need
        * @returns {Class} The updated object
        */
       update(obj: { id: String }, extra?: T): T;

       /**
        * Remove an object
        * @arg {Object} obj The object
        * @arg {String} obj.id The ID of the object
        * @returns {Class?} The removed object, or null if nothing was removed
        */
       remove(obj: { id: String }): T;

   }

   /**
    * Ratelimit requests and release in sequence
    * @prop {Number} limit How many tokens the bucket can consume in the current interval
    * @prop {Number} remaining How many tokens the bucket has left in the current interval
    * @prop {Number} reset Timestamp of next reset
    * @prop {Boolean} processing Timestamp of last token consumption
    */
   declare class SequentialBucket {
       limit: Number;
       remaining: Number;
       reset: Number;
       processing: Boolean;
       /**
        * Ratelimit requests and release in sequence
        * @prop {Number} limit How many tokens the bucket can consume in the current interval
        * @prop {Number} remaining How many tokens the bucket has left in the current interval
        * @prop {Number} reset Timestamp of next reset
        * @prop {Boolean} processing Timestamp of last token consumption
        */
       constructor(tokenLimit: Number);

       /**
        * Queue something in the SequentialBucket
        * @arg {Function} func A function to call when a token can be consumed. The function will be passed a callback argument, which must be called to allow the bucket to continue to work
        */
       queue(func: (() => any)): void;

   }

   /**
    * Represents a voice connection
    * @extends EventEmitter
    * @prop {String} id The ID of the voice connection (guild ID)
    * @prop {String} channelID The ID of the voice connection's current channel
    * @prop {Boolean} connecting Whether the voice connection is connecting
    * @prop {Boolean} ready Whether the voice connection is ready
    * @prop {Boolean} playing Whether the voice connection is playing something
    * @prop {Boolean} paused Whether the voice connection is paused
    * @prop {Number} playTime Position of playback of current resource in milliseconds
    */
   declare class VoiceConnection extends EventEmitter {
       id: String;
       channelID: String;
       connecting: Boolean;
       ready: Boolean;
       playing: Boolean;
       paused: Boolean;
       playTime: Number;
       /**
        * Represents a voice connection
        * @extends EventEmitter
        * @prop {String} id The ID of the voice connection (guild ID)
        * @prop {String} channelID The ID of the voice connection's current channel
        * @prop {Boolean} connecting Whether the voice connection is connecting
        * @prop {Boolean} ready Whether the voice connection is ready
        * @prop {Boolean} playing Whether the voice connection is playing something
        * @prop {Boolean} paused Whether the voice connection is paused
        * @prop {Number} playTime Position of playback of current resource in milliseconds
        */
       constructor();

       /**
        * Tells the voice connection to connect to a channel
        * @arg {String} channelID The ID of the voice channel
        */
       connect(channelID: String): void;

       /**
        * Tells the voice connection to disconnect
        * @arg {Error} [err] The error, if any
        * @arg {Boolean} [reconnecting] Whether the voice connection is reconnecting or not
        */
       disconnect(err?: Error, reconnecting?: Boolean): void;

       /**
        * Play an audio or video resource. If playing from a non-opus resource, FFMPEG should be compiled with --enable-libopus for best performance. If playing from HTTPS, FFMPEG must be compiled with --enable-openssl
        * @arg {ReadableStream | String} resource The audio or video resource, either a ReadableStream, URL, or file path
        * @arg {Object} [options] Music options (see options parameter in VoiceConnection.playRaw description)
        * @arg {Boolean} [options.inlineVolume=false] Whether to enable on-the-fly volume changing. Note that enabling this leads to increased CPU usage
        * @arg {Number} [options.voiceDataTimeout=2000] Timeout when waiting for voice data (-1 for no timeout)
        * @arg {String} [options.format] The format of the resource. If null, FFmpeg will attempt to guess and play the format. Available options: "dca", "ogg", "pcm", null
        * @arg {Number} [options.frameDuration=60] The resource opus frame duration (required for DCA/Ogg)
        * @arg {Number} [options.frameSize=2880] The resource opus frame size
        * @arg {Number} [options.sampleRate=48000] The resource audio sampling rate
        */
       play(resource: (ReadableStream|String), options?: { inlineVolume?: Boolean, voiceDataTimeout?: Number, format?: String, frameDuration?: Number, frameSize?: Number, sampleRate?: Number }): void;

       /**
        * Generate a receive stream for the voice connection.
        * @arg {String} [type="pcm"] The desired vocie data type, either "opus" or "pcm"
        * @returns {VoiceDataStream}
        */
       receive(type?: String): VoiceDataStream;

       /**
        * Switch the voice channel the bot is in. The channel to switch to must be in the same guild as the current voice channel
        * @arg {String} channelID The ID of the voice channel
        */
       switchChannel(channelID: String): void;

       /**
        * Update the bot's voice state
        * @arg {Boolean} selfMute Whether the bot muted itself or not (audio sending is unaffected)
        * @arg {Boolean} selfDeaf Whether the bot deafened itself or not (audio receiving is unaffected)
        */
       updateVoiceState(selfMute: Boolean, selfDeaf: Boolean): void;

       /**
        * Modify the output volume of the current stream (if inlineVoice is enabled for the current stream)
        * @arg {Number} [volume=1.0] The desired volume. 0.0 is 0%, 1.0 is 100%, 2.0 is 200%, etc. It is not recommended to go above 2.0
        */
       setVolume(volume?: Number): void;

       /**
        * Stop the bot from sending audio
        */
       stopPlaying(): void;

       /**
        * Pause sending audio (if playing)
        */
       pause(): void;

       /**
        * Resume sending audio (if paused)
        */
       resume(): void;

   }

   /**
    * Collects and manages VoiceConnections
    * @extends Collection
    */
   declare class VoiceConnectionManager extends Collection {
       /**
        * Collects and manages VoiceConnections
        * @extends Collection
        */
       constructor();

       /**
        * Connect to a voice channel
        * @arg {String} channelID The ID of the voice channel
        */
       join(channelID: String): void;

       /**
        * Leave a voice channel
        * @arg {String} targetID The ID of the voice channel
        */
       leave(targetID: String): void;

       /**
        * Gets the voice connection associated with the specified guild or channel
        * @arg {String} targetID The ID of the guild or channel
        */
       get(targetID: String): void;

   }

   /**
    * Represents a voice data stream
    * @extends EventEmitter
    * @prop {String} type The targeted voice data type for the stream, either "opus" or "pcm"
    */
   declare class VoiceDataStream extends EventEmitter {
       type: String;
       /**
        * Represents a voice data stream
        * @extends EventEmitter
        * @prop {String} type The targeted voice data type for the stream, either "opus" or "pcm"
        */
       constructor();

   }

}
