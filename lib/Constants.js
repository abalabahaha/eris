"use strict";

module.exports.DefaultAvatarHashes = [
    "6debd47ed13483642cf09e832ed0bc1b",
    "322c936a8c8be1b803cd94861bdfa868",
    "dd4dbc0016779df1378e7812eabaa04d",
    "0e291f67c9274a1abdddeb3fd919cbaa",
    "1cbd08c76f8af6dddce02c5138971129"
];

module.exports.ImageFormats = [
    "jpg",
    "png",
    "webp",
    "gif"
];

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
    HELLO:             10,
    HEARTBEAT_ACK:     11,
    SYNC_GUILD:        12,
    SYNC_CALL:         13
};

module.exports.GATEWAY_VERSION = 6;
module.exports.REST_VERSION = 7;

module.exports.Permissions = {
    createInstantInvite:  1,
    kickMembers:          1 << 1,
    banMembers:           1 << 2,
    administrator:        1 << 3,
    manageChannels:       1 << 4,
    manageGuild:          1 << 5,
    addReactions:         1 << 6,
    viewAuditLogs:        1 << 7,
    voicePrioritySpeaker: 1 << 8,
    readMessages:         1 << 10,
    sendMessages:         1 << 11,
    sendTTSMessages:      1 << 12,
    manageMessages:       1 << 13,
    embedLinks:           1 << 14,
    attachFiles:          1 << 15,
    readMessageHistory:   1 << 16,
    mentionEveryone:      1 << 17,
    externalEmojis:       1 << 18,
    voiceConnect:         1 << 20,
    voiceSpeak:           1 << 21,
    voiceMuteMembers:     1 << 22,
    voiceDeafenMembers:   1 << 23,
    voiceMoveMembers:     1 << 24,
    voiceUseVAD:          1 << 25,
    changeNickname:       1 << 26,
    manageNicknames:      1 << 27,
    manageRoles:          1 << 28,
    manageWebhooks:       1 << 29,
    manageEmojis:         1 << 30,
    all:      0b1111111111101111111110111111111,
    allGuild: 0b1111100000000000000000010111111,
    allText:  0b0110000000001111111110001010001,
    allVoice: 0b0110011111100000000000100010001
};

module.exports.VoiceOPCodes = {
    IDENTIFY:            0,
    SELECT_PROTOCOL:     1,
    HELLO:               2,
    HEARTBEAT:           3,
    SESSION_DESCRIPTION: 4,
    SPEAKING:            5
};

module.exports.SystemJoinMessages = [
    "%user% just joined the server - glhf!",
    "%user% just joined. Everyone, look busy!",
    "%user% just joined. Can I get a heal?",
    "%user% joined your party.",
    "%user% joined. You must construct additional pylons.",
    "Ermagherd. %user% is here.",
    "Welcome, %user%. Stay awhile and listen.",
    "Welcome, %user%. We were expecting you ( ͡° ͜ʖ ͡°)",
    "Welcome, %user%. We hope you brought pizza.",
    "Welcome %user%. Leave your weapons by the door.",
    "A wild %user% appeared.",
    "Swoooosh. %user% just landed.",
    "Brace yourselves. %user% just joined the server.",
    "%user% just joined. Hide your bananas.",
    "%user% just arrived. Seems OP - please nerf.",
    "%user% just slid into the server.",
    "A %user% has spawned in the server.",
    "Big %user% showed up!",
    "Where’s %user%? In the server!",
    "%user% hopped into the server. Kangaroo!!",
    "%user% just showed up. Hold my beer.",
    "Challenger approaching - %user% has appeared!",
    "It's a bird! It's a plane! Nevermind, it's just %user%.",
    "It's %user%! Praise the sun! \\[T]/",
    "Never gonna give %user% up. Never gonna let %user% down.",
    "Ha! %user% has joined! You activated my trap card!",
    "Cheers, love! %user%'s here!",
    "Hey! Listen! %user% has joined!",
    "We've been expecting you %user%",
    "It's dangerous to go alone, take %user%!",
    "%user% has joined the server! It's super effective!",
    "Cheers, love! %user% is here!",
    "%user% is here, as the prophecy foretold.",
    "%user% has arrived. Party's over.",
    "Ready player %user%",
    "%user% is here to kick butt and chew bubblegum. And %user% is all out of gum.",
    "Hello. Is it %user% you're looking for?",
    "%user% has joined. Stay a while and listen!",
    "Roses are red, violets are blue, %user% joined this server with you"
];

module.exports.AuditLogActions = {
    GUILD_UPDATE: 1,

    CHANNEL_CREATE: 10,
    CHANNEL_UPDATE: 11,
    CHANNEL_DELETE: 12,
    CHANNEL_OVERWRITE_CREATE: 13,
    CHANNEL_OVERWRITE_UPDATE: 14,
    CHANNEL_OVERWRITE_DELETE: 15,

    MEMBER_KICK: 20,
    MEMBER_PRUNE: 21,
    MEMBER_BAN_ADD: 22,
    MEMBER_BAN_REMOVE: 23,
    MEMBER_UPDATE: 24,
    MEMBER_ROLE_UPDATE: 25,

    ROLE_CREATE: 30,
    ROLE_UPDATE: 31,
    ROLE_DELETE: 32,

    INVITE_CREATE: 40,
    INVITE_UPDATE: 41,
    INVITE_DELETE: 42,

    WEBHOOK_CREATE: 50,
    WEBHOOK_UPDATE: 51,
    WEBHOOK_DELETE: 52,

    EMOJI_CREATE: 60,
    EMOJI_UPDATE: 61,
    EMOJI_DELETE: 62,

    MESSAGE_DELETE: 72
};
