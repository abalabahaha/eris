"use strict";

const Client = require("./lib/Client");

module.exports = {
    /**
     * Create a new `Client` instance
     * @param {string} token The token to the bot
     * @param {import('./lib/Client').ClientOptions} [options] Any other options to addon to
     */
    create: (token, options = {}) => new Client(token, options),
    Base: require("./lib/structures/Base"),
    Bucket: require("./lib/util/Bucket"),
    Call: require("./lib/structures/Call"),
    CategoryChannel: require("./lib/structures/CategoryChannel"),
    Channel: require("./lib/structures/Channel"),
    Client,
    Collection: require("./lib/util/Collection"),
    Constants: require("./lib/Constants"),
    Emoji: require("./lib/structures/Emoji"),
    ExtendedUser: require("./lib/structures/ExtendedUser"),
    GroupChannel: require("./lib/structures/GroupChannel"),
    Guild: require("./lib/structures/Guild"),
    GuildChannel: require("./lib/structures/GuildChannel"),
    GuildIntegration: require("./lib/structures/GuildIntegration"),
    Invite: require("./lib/structures/Invite"),
    Member: require("./lib/structures/Member"),
    Message: require("./lib/structures/Message"),
    Permission: require("./lib/structures/Permission"),
    PermissionOverwrite: require("./lib/structures/PermissionOverwrite"),
    PrivateChannel: require("./lib/structures/PrivateChannel"),
    Relationship: require("./lib/structures/Relationship"),
    Role: require("./lib/structures/Role"),
    Shard: require("./lib/gateway/Shard"),
    SharedStream: require("./lib/voice/SharedStream"),
    TextChannel: require("./lib/structures/TextChannel"),
    User: require("./lib/structures/User"),
    version: require("./package").version,
    VoiceChannel: require("./lib/structures/VoiceChannel"),
    VoiceConnection: require("./lib/voice/VoiceConnection"),
    VoiceConnectionManager: require("./lib/voice/VoiceConnectionManager"),
    VoiceState: require("./lib/structures/VoiceState"),
    WebSocketManager: require("./lib/gateway/WebSocketManager")
};