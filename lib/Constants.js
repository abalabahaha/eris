"use strict";

module.exports.ImageFormats = [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif"
];

module.exports.ImageSizeBoundaries = {
    MINIMUM: 16,
    MAXIMUM: 4096
};

module.exports.GatewayOPCodes = {
    EVENT:              0,
    HEARTBEAT:          1,
    IDENTIFY:           2,
    STATUS_UPDATE:      3,
    VOICE_STATE_UPDATE: 4,
    VOICE_SERVER_PING:  5,
    RESUME:             6,
    RECONNECT:          7,
    GET_GUILD_MEMBERS:  8,
    INVALID_SESSION:    9,
    HELLO:              10,
    HEARTBEAT_ACK:      11,
    SYNC_GUILD:         12,
    SYNC_CALL:          13
};

module.exports.GATEWAY_VERSION = 6;
module.exports.REST_VERSION = 7;

const Permissions = {
    createInstantInvite:  1n,
    kickMembers:          1n << 1n,
    banMembers:           1n << 2n,
    administrator:        1n << 3n,
    manageChannels:       1n << 4n,
    manageGuild:          1n << 5n,
    addReactions:         1n << 6n,
    viewAuditLog:         1n << 7n, viewAuditLogs: 1n << 7n, // [DEPRECATED]
    voicePrioritySpeaker: 1n << 8n,
    voiceStream:          1n << 9n, stream: 1n << 9n, // [DEPRECATED]
    viewChannel:          1n << 10n, readMessages: 1n << 10n, // [DEPRECATED]
    sendMessages:         1n << 11n,
    sendTTSMessages:      1n << 12n,
    manageMessages:       1n << 13n,
    embedLinks:           1n << 14n,
    attachFiles:          1n << 15n,
    readMessageHistory:   1n << 16n,
    mentionEveryone:      1n << 17n,
    useExternalEmojis:    1n << 18n, externalEmojis: 1n << 18n, // [DEPRECATED]
    viewGuildInsights:    1n << 19n,
    voiceConnect:         1n << 20n,
    voiceSpeak:           1n << 21n,
    voiceMuteMembers:     1n << 22n,
    voiceDeafenMembers:   1n << 23n,
    voiceMoveMembers:     1n << 24n,
    voiceUseVAD:          1n << 25n,
    changeNickname:       1n << 26n,
    manageNicknames:      1n << 27n,
    manageRoles:          1n << 28n,
    manageWebhooks:       1n << 29n,
    manageEmojis:         1n << 30n,
    useSlashCommands:     1n << 31n,
    voiceRequestToSpeak:  1n << 32n
};
Permissions.allGuild = Permissions.kickMembers
    | Permissions.banMembers
    | Permissions.administrator
    | Permissions.manageChannels
    | Permissions.manageGuild
    | Permissions.viewAuditLog
    | Permissions.viewGuildInsights
    | Permissions.changeNickname
    | Permissions.manageNicknames
    | Permissions.manageRoles
    | Permissions.manageWebhooks
    | Permissions.manageEmojis;
Permissions.allText = Permissions.createInstantInvite
    | Permissions.manageChannels
    | Permissions.addReactions
    | Permissions.viewChannel
    | Permissions.sendMessages
    | Permissions.sendTTSMessages
    | Permissions.manageMessages
    | Permissions.embedLinks
    | Permissions.attachFiles
    | Permissions.readMessageHistory
    | Permissions.mentionEveryone
    | Permissions.useExternalEmojis
    | Permissions.manageRoles
    | Permissions.manageWebhooks
    | Permissions.useSlashCommands;
Permissions.allVoice = Permissions.createInstantInvite
    | Permissions.manageChannels
    | Permissions.voicePrioritySpeaker
    | Permissions.voiceStream
    | Permissions.viewChannel
    | Permissions.voiceConnect
    | Permissions.voiceSpeak
    | Permissions.voiceMuteMembers
    | Permissions.voiceDeafenMembers
    | Permissions.voiceMoveMembers
    | Permissions.voiceUseVAD
    | Permissions.manageRoles
    | Permissions.voiceRequestToSpeak;
Permissions.all = Permissions.allGuild | Permissions.allText | Permissions.allVoice;
module.exports.Permissions = Permissions;

module.exports.VoiceOPCodes = {
    IDENTIFY:            0,
    SELECT_PROTOCOL:     1,
    READY:               2,
    HEARTBEAT:           3,
    SESSION_DESCRIPTION: 4,
    SPEAKING:            5,
    HEARTBEAT_ACK:       6,
    RESUME:              7,
    HELLO:               8,
    RESUMED:             9,
    DISCONNECT:          13
};

module.exports.SystemJoinMessages = [
    "%user% joined the party.",
    "%user% is here.",
    "Welcome, %user%. We hope you brought pizza.",
    "A wild %user% appeared.",
    "%user% just landed.",
    "%user% just slid into the server.",
    "%user% just showed up!",
    "Welcome %user%. Say hi!",
    "%user% hopped into the server.",
    "Everyone welcome %user%!",
    "Glad you're here, %user%.",
    "Good to see you, %user%.",
    "Yay you made it, %user%!"
];

module.exports.AuditLogActions = {
    GUILD_UPDATE:             1,

    CHANNEL_CREATE:           10,
    CHANNEL_UPDATE:           11,
    CHANNEL_DELETE:           12,
    CHANNEL_OVERWRITE_CREATE: 13,
    CHANNEL_OVERWRITE_UPDATE: 14,
    CHANNEL_OVERWRITE_DELETE: 15,

    MEMBER_KICK:              20,
    MEMBER_PRUNE:             21,
    MEMBER_BAN_ADD:           22,
    MEMBER_BAN_REMOVE:        23,
    MEMBER_UPDATE:            24,
    MEMBER_ROLE_UPDATE:       25,
    MEMBER_MOVE:              26,
    MEMBER_DISCONNECT:        27,
    BOT_ADD:                  28,

    ROLE_CREATE:              30,
    ROLE_UPDATE:              31,
    ROLE_DELETE:              32,

    INVITE_CREATE:            40,
    INVITE_UPDATE:            41,
    INVITE_DELETE:            42,

    WEBHOOK_CREATE:           50,
    WEBHOOK_UPDATE:           51,
    WEBHOOK_DELETE:           52,

    EMOJI_CREATE:             60,
    EMOJI_UPDATE:             61,
    EMOJI_DELETE:             62,

    MESSAGE_DELETE:           72,
    MESSAGE_BULK_DELETE:      73,
    MESSAGE_PIN:              74,
    MESSAGE_UNPIN:            75,

    INTEGRATION_CREATE:       80,
    INTEGRATION_UPDATE:       81,
    INTEGRATION_DELETE:       82
};

module.exports.MessageActivityTypes = {
    JOIN:         1,
    SPECTATE:     2,
    LISTEN:       3,
    JOIN_REQUEST: 5
};

module.exports.MessageFlags = {
    CROSSPOSTED:            1 << 0,
    IS_CROSSPOST:           1 << 1,
    SUPPRESS_EMBEDS:        1 << 2,
    SOURCE_MESSAGE_DELETED: 1 << 3,
    URGENT:                 1 << 4
};

module.exports.MessageTypes = {
    DEFAULT:                                      0,
    RECIPIENT_ADD:                                1,
    RECIPIENT_REMOVE:                             2,
    CALL:                                         3,
    CHANNEL_NAME_CHANGE:                          4,
    CHANNEL_ICON_CHANGE:                          5,
    CHANNEL_PINNED_MESSAGE:                       6,
    GUILD_MEMBER_JOIN:                            7,
    USER_PREMIUM_GUILD_SUBSCRIPTION:              8,
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1:       9,
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2:       10,
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3:       11,
    CHANNEL_FOLLOW_ADD:                           12,

    GUILD_DISCOVERY_DISQUALIFIED:                 14,
    GUILD_DISCOVERY_REQUALIFIED:                  15,
    GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING: 16,
    GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING:   17,
    REPLY:                                        19,
    APPLICATION_COMMAND:                          20,

    GUILD_INVITE_REMINDER:                        22
};

module.exports.ChannelTypes = {
    GUILD_TEXT:     0,
    DM:             1,
    GUILD_VOICE:    2,
    GROUP_DM:       3,
    GUILD_CATEGORY: 4,
    GUILD_NEWS:     5,
    GUILD_STORE:    6,
    GUILD_STAGE:    13
};

module.exports.UserFlags = {
    NONE:                   0,
    DISCORD_EMPLOYEE:       1 << 0,
    DISCORD_PARTNER:        1 << 1,
    HYPESQUAD_EVENTS:       1 << 2,
    BUG_HUNTER_LEVEL_1:     1 << 3,
    HOUSE_BRAVERY:          1 << 6,
    HOUSE_BRILLIANCE:       1 << 7,
    HOUSE_BALANCE:          1 << 8,
    EARLY_SUPPORTER:        1 << 9,
    TEAM_USER:              1 << 10,
    SYSTEM:                 1 << 12,
    BUG_HUNTER_LEVEL_2:     1 << 14,
    VERIFIED_BOT:           1 << 16,
    VERIFIED_BOT_DEVELOPER: 1 << 17
};


module.exports.Intents = {
    guilds:                 1 << 0,
    guildMembers:           1 << 1,
    guildBans:              1 << 2,
    guildEmojis:            1 << 3,
    guildIntegrations:      1 << 4,
    guildWebhooks:          1 << 5,
    guildInvites:           1 << 6,
    guildVoiceStates:       1 << 7,
    guildPresences:         1 << 8,
    guildMessages:          1 << 9,
    guildMessageReactions:  1 << 10,
    guildMessageTyping:     1 << 11,
    directMessages:         1 << 12,
    directMessageReactions: 1 << 13,
    directMessageTyping:    1 << 14
};
