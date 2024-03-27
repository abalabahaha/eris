"use strict";

module.exports.GATEWAY_VERSION = 10;
module.exports.REST_VERSION = 10;

module.exports.ActivityFlags = {
    INSTANCE:                    1 << 0,
    JOIN:                        1 << 1,
    SPECTATE:                    1 << 2,
    JOIN_REQUEST:                1 << 3,
    SYNC:                        1 << 4,
    PLAY:                        1 << 5,
    PARTY_PRIVACY_FRIENDS:       1 << 6,
    PARTY_PRIVACY_VOICE_CHANNEL: 1 << 7,
    EMBEDDED:                    1 << 8
};

module.exports.ActivityTypes = {
    GAME:      0,
    STREAMING: 1,
    LISTENING: 2,
    WATCHING:  3,
    CUSTOM:    4,
    COMPETING: 5
};

module.exports.ApplicationCommandOptionTypes = {
    SUB_COMMAND:       1,
    SUB_COMMAND_GROUP: 2,
    STRING:            3,
    INTEGER:           4,
    BOOLEAN:           5,
    USER:              6,
    CHANNEL:           7,
    ROLE:              8,
    MENTIONABLE:       9,
    NUMBER:            10,
    ATTACHMENT:        11
};

module.exports.ApplicationCommandPermissionTypes = {
    ROLE:    1,
    USER:    2,
    CHANNEL: 3
};

module.exports.ApplicationCommandTypes = {
    CHAT_INPUT: 1,
    USER:       2,
    MESSAGE:    3
};

module.exports.AttachmentFlags = {
    IS_REMIX: 1 << 2
};

module.exports.AuditLogActions = {
    GUILD_UPDATE: 1,

    CHANNEL_CREATE:           10,
    CHANNEL_UPDATE:           11,
    CHANNEL_DELETE:           12,
    CHANNEL_OVERWRITE_CREATE: 13,
    CHANNEL_OVERWRITE_UPDATE: 14,
    CHANNEL_OVERWRITE_DELETE: 15,

    MEMBER_KICK:        20,
    MEMBER_PRUNE:       21,
    MEMBER_BAN_ADD:     22,
    MEMBER_BAN_REMOVE:  23,
    MEMBER_UPDATE:      24,
    MEMBER_ROLE_UPDATE: 25,
    MEMBER_MOVE:        26,
    MEMBER_DISCONNECT:  27,
    BOT_ADD:            28,

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

    MESSAGE_DELETE:      72,
    MESSAGE_BULK_DELETE: 73,
    MESSAGE_PIN:         74,
    MESSAGE_UNPIN:       75,

    INTEGRATION_CREATE: 80,
    INTEGRATION_UPDATE: 81,
    INTEGRATION_DELETE: 82,

    STAGE_INSTANCE_CREATE: 83,
    STAGE_INSTANCE_UPDATE: 84,
    STAGE_INSTANCE_DELETE: 85,

    STICKER_CREATE: 90,
    STICKER_UPDATE: 91,
    STICKER_DELETE: 92,

    GUILD_SCHEDULED_EVENT_CREATE: 100,
    GUILD_SCHEDULED_EVENT_UPDATE: 101,
    GUILD_SCHEDULED_EVENT_DELETE: 102,

    THREAD_CREATE: 110,
    THREAD_UPDATE: 111,
    THREAD_DELETE: 112,

    APPLICATION_COMMAND_PERMISSION_UPDATE: 121,

    AUTO_MODERATION_RULE_CREATE:   140,
    AUTO_MODERATION_RULE_UPDATE:   141,
    AUTO_MODERATION_RULE_DELETE:   142,
    AUTO_MODERATION_BLOCK_MESSAGE: 143,

    CREATOR_MONETIZATION_REQUEST_CREATED: 150,
    CREATOR_MONETIZATION_TERMS_ACCEPTED:  151,

    ROLE_PROMPT_CREATE: 160,
    ROLE_PROMPT_UPDATE: 161,
    ROLE_PROMPT_DELETE: 162,

    GUILD_HOME_FEATURE_ITEM: 171,
    GUILD_HOME_REMOVE_ITEM:  172
};

module.exports.AutoModerationActionTypes = {
    BLOCK_MESSAGE:      1,
    SEND_ALERT_MESSAGE: 2,
    TIMEOUT:            3
};

module.exports.AutoModerationEventTypes = {
    MESSAGE_SEND: 1
};

module.exports.AutoModerationKeywordPresetTypes = {
    PROFANITY:      1,
    SEXUAL_CONTENT: 2,
    SLURS:          3
};

module.exports.AutoModerationTriggerTypes = {
    KEYWORD:        1,
    HARMFUL_LINK:   2,
    SPAM:           3,
    KEYWORD_PRESET: 4
};

module.exports.ButtonStyles = {
    PRIMARY:   1,
    SECONDARY: 2,
    SUCCESS:   3,
    DANGER:    4,
    LINK:      5
};

module.exports.ChannelFlags = {
    PINNED:      1 << 1,
    REQUIRE_TAG: 1 << 4
};

module.exports.ChannelTypes = {
    GUILD_TEXT:           0,
    DM:                   1,
    GUILD_VOICE:          2,
    GROUP_DM:             3,
    GUILD_CATEGORY:       4,
    GUILD_NEWS:           5,

    GUILD_NEWS_THREAD:    10,
    GUILD_PUBLIC_THREAD:  11,
    GUILD_PRIVATE_THREAD: 12,
    GUILD_STAGE_VOICE:    13, GUILD_STAGE: 13, // [DEPRECATED]

    GUILD_FORUM: 15
};

module.exports.ComponentTypes = {
    ACTION_ROW:  1,
    BUTTON:      2,
    SELECT_MENU: 3,
    TEXT_INPUT:  4
};

module.exports.ConnectionVisibilityTypes = {
    NONE:     0,
    EVERYONE: 1
};

module.exports.ForumLayoutTypes = {
    NOT_SET: 0,
    LIST_VIEW: 1,
    GALLERY_VIEW: 2
};

module.exports.DefaultMessageNotificationLevels = {
    ALL_MESSAGES:  0,
    ONLY_MENTIONS: 1
};

module.exports.SortOrderTypes = {
    LATEST_ACTIVITY: 0,
    CREATION_DATE: 1
};

module.exports.ExplicitContentFilterLevels = {
    DISABLED:              0,
    MEMBERS_WITHOUT_ROLES: 1,
    ALL_MEMBERS:           2
};

module.exports.GatewayOPCodes = {
    DISPATCH:              0, EVENT: 0, // [DEPRECATED]
    HEARTBEAT:             1,
    IDENTIFY:              2,
    PRESENCE_UPDATE:       3, STATUS_UPDATE: 3, // [DEPRECATED]
    VOICE_STATE_UPDATE:    4,
    VOICE_SERVER_PING:     5,
    RESUME:                6,
    RECONNECT:             7,
    REQUEST_GUILD_MEMBERS: 8, GET_GUILD_MEMBERS: 8, // [DEPRECATED]
    INVALID_SESSION:       9,
    HELLO:                 10,
    HEARTBEAT_ACK:         11,
    SYNC_GUILD:            12,
    SYNC_CALL:             13
};

module.exports.GuildFeatures = [
    "ANIMATED_BANNER",
    "ANIMATED_ICON",
    "APPLICATION_COMMAND_PERMISSIONS_V2",
    "AUTO_MODERATION",
    "BANNER",
    "COMMERCE",
    "COMMUNITY",
    "CREATOR_MONETIZABLE_PROVISIONAL",
    "CREATOR_STORE_PAGE",
    "DEVELOPER_SUPPORT_SERVER",
    "DISCOVERABLE",
    "FEATURABLE",
    "INVITE_SPLASH",
    "INVITES_DISABLED",
    "MEMBER_VERIFICATION_GATE_ENABLED",
    "MONETIZATION_ENABLED",
    "MORE_STICKERS",
    "NEWS",
    "PARTNERED",
    "PREVIEW_ENABLED",
    "PRIVATE_THREADS",
    "RAID_ALERTS_DISABLED",
    "ROLE_ICONS",
    "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE",
    "ROLE_SUBSCRIPTIONS_ENABLED",
    "SEVEN_DAY_THREAD_ARCHIVE",
    "THREE_DAY_THREAD_ARCHIVE",
    "TICKETED_EVENTS_ENABLED",
    "VANITY_URL",
    "VERIFIED",
    "VIP_REGIONS",
    "WELCOME_SCREEN_ENABLED"
];

module.exports.GuildIntegrationExpireBehavior = {
    REMOVE_ROLE: 0,
    KICK:        1
};
module.exports.GuildIntegrationTypes = [
    "twitch",
    "youtube",
    "discord",
    "guild_subscription"
];

module.exports.GuildNSFWLevels = {
    DEFAULT:        0,
    EXPLICIT:       1,
    SAFE:           2,
    AGE_RESTRICTED: 3
};

module.exports.GuildOnboardingModes = {
    ONBOARDING_DEFAULT:  0,
    ONBOARDING_ADVANCED: 1
};

module.exports.GuildOnboardingPromptTypes = {
    MULTIPLE_CHOICE: 0,
    DROPDOWN:        1
};

module.exports.GuildScheduledEventEntityTypes = {
    STAGE_INSTANCE: 1,
    VOICE:          2,
    EXTERNAL:       3
};

module.exports.GuildScheduledEventPrivacyLevel = {
    PUBLIC:     1,
    GUILD_ONLY: 2
};

module.exports.GuildScheduledEventStatus = {
    SCHEDULED: 1,
    ACTIVE:    2,
    COMPLETED: 3,
    CANCELED:  4
};

module.exports.GuildWidgetStyles = {
    SHIELD:   "shield",
    BANNER_1: "banner1",
    BANNER_2: "banner2",
    BANNER_3: "banner3",
    BANNER_4: "banner4"
};

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

const Intents = {
    guilds:                      1 << 0,
    guildMembers:                1 << 1,
    guildBans:                   1 << 2,
    guildEmojisAndStickers:      1 << 3, guildEmojis: 1 << 3, // [DEPRECATED]
    guildIntegrations:           1 << 4,
    guildWebhooks:               1 << 5,
    guildInvites:                1 << 6,
    guildVoiceStates:            1 << 7,
    guildPresences:              1 << 8,
    guildMessages:               1 << 9,
    guildMessageReactions:       1 << 10,
    guildMessageTyping:          1 << 11,
    directMessages:              1 << 12,
    directMessageReactions:      1 << 13,
    directMessageTyping:         1 << 14,
    messageContent:              1 << 15,
    guildScheduledEvents:        1 << 16,

    autoModerationConfiguration: 1 << 20,
    autoModerationExecution:     1 << 21
};

Intents.allNonPrivileged = Intents.guilds
    | Intents.guildBans
    | Intents.guildEmojisAndStickers
    | Intents.guildIntegrations
    | Intents.guildWebhooks
    | Intents.guildInvites
    | Intents.guildVoiceStates
    | Intents.guildMessages
    | Intents.guildMessageReactions
    | Intents.guildMessageTyping
    | Intents.directMessages
    | Intents.directMessageReactions
    | Intents.directMessageTyping
    | Intents.guildScheduledEvents
    | Intents.autoModerationConfiguration
    | Intents.autoModerationExecution;
Intents.allPrivileged = Intents.guildMembers
    | Intents.guildPresences
    | Intents.messageContent;
Intents.all = Intents.allNonPrivileged | Intents.allPrivileged;
module.exports.Intents = Intents;

module.exports.InteractionResponseTypes = {
    PONG:                                    1,
    CHANNEL_MESSAGE_WITH_SOURCE:             4,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE:    5,
    DEFERRED_UPDATE_MESSAGE:                 6,
    UPDATE_MESSAGE:                          7,
    APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8,
    MODAL:                                   9
};

module.exports.InteractionTypes = {
    PING:                             1,
    APPLICATION_COMMAND:              2,
    MESSAGE_COMPONENT:                3,
    APPLICATION_COMMAND_AUTOCOMPLETE: 4,
    MODAL_SUBMIT:                     5
};

module.exports.InviteTargetTypes = {
    STREAM:               1,
    EMBEDDED_APPLICATION: 2
};

module.exports.Locales = {
    BULGARIAN:            "bg",
    CZECH:                "cs",
    DANISH:               "da",
    GERMAN:               "de",
    GREEK:                "el",
    ENGLISH_UK:           "en-GB",
    ENGLISH_US:           "en-US",
    SPANISH:              "es-ES",
    FINNISH:              "fi",
    FRENCH:               "fr",
    HINDI:                "hi",
    CROATIAN:             "hr",
    HUNGARIAN:            "hu",
    INDONESIAN:           "id",
    ITALIAN:              "it",
    JAPANESE:             "ja",
    KOREAN:               "ko",
    LITHUANIAN:           "lt",
    DUTCH:                "nl",
    NORWEGIAN:            "no",
    POLISH:               "pl",
    PORTUGUESE_BRAZILIAN: "pt-BR",
    ROMANIAN_ROMANIA:     "ro",
    RUSSIAN:              "ru",
    SWEDISH:              "sv-SE",
    THAI:                 "th",
    TURKISH:              "tr",
    UKRAINIAN:            "uk",
    VIETNAMESE:           "vi",
    CHINESE_CHINA:        "zh-CN",
    CHINESE_TAIWAN:       "zh-TW"
};

module.exports.MemberFlags = {
    DID_REJOIN:            1 << 0,
    COMPLETED_ONBOARDING:  1 << 1,
    BYPASSES_VERIFICATION: 1 << 2,
    STARTED_ONBOARDING:    1 << 3
};

module.exports.MembershipState = {
    INVITED:  1,
    ACCEPTED: 2
};

module.exports.MessageActivityTypes = {
    JOIN:         1,
    SPECTATE:     2,
    LISTEN:       3,
    WATCH:        4,
    JOIN_REQUEST: 5
};

module.exports.MessageFlags = {
    CROSSPOSTED:                            1 << 0,
    IS_CROSSPOST:                           1 << 1,
    SUPPRESS_EMBEDS:                        1 << 2,
    SOURCE_MESSAGE_DELETED:                 1 << 3,
    URGENT:                                 1 << 4,
    HAS_THREAD:                             1 << 5,
    EPHEMERAL:                              1 << 6,
    LOADING:                                1 << 7,
    FAILED_TO_MENTION_SOME_ROLES_IN_THREAD: 1 << 8,
    SUPPRESS_NOTIFICATIONS:                 1 << 12,
    IS_VOICE_MESSAGE:                       1 << 13
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
    THREAD_CREATED:                               18,
    REPLY:                                        19,
    CHAT_INPUT_COMMAND:                           20,
    THREAD_STARTER_MESSAGE:                       21,
    GUILD_INVITE_REMINDER:                        22,
    CONTEXT_MENU_COMMAND:                         23,
    AUTO_MODERATION_ACTION:                       24,
    ROLE_SUBSCRIPTION_PURCHASE:                   25,
    INTERACTION_PREMIUM_UPSELL:                   26,
    STAGE_START:                                  27,
    STAGE_END:                                    28,
    STAGE_SPEAKER:                                29,

    STAGE_TOPIC:                                  31,
    GUILD_APPLICATION_PREMIUM_SUBSCRIPTION:       32
};

module.exports.MFALevels = {
    NONE:     0,
    ELEVATED: 1
};

module.exports.OAuthTeamMemberRoleTypes = {
    ADMIN:     "admin",
    DEVELOPER: "developer",
    OWNER:     "",
    READ_ONLY: "read_only"
};

module.exports.PermissionOverwriteTypes = {
    ROLE: 0,
    USER: 1
};

const Permissions = {
    createInstantInvite:              1n << 0n,
    kickMembers:                      1n << 1n,
    banMembers:                       1n << 2n,
    administrator:                    1n << 3n,
    manageChannels:                   1n << 4n,
    manageGuild:                      1n << 5n,
    addReactions:                     1n << 6n,
    viewAuditLog:                     1n << 7n, viewAuditLogs: 1n << 7n, // [DEPRECATED]
    prioritySpeaker:                  1n << 8n, voicePrioritySpeaker: 1n << 8n, // [DEPRECATED]
    stream:                           1n << 9n, voiceStream: 1n << 9n, // [DEPRECATED]
    viewChannel:                      1n << 10n, readMessages: 1n << 10n, // [DEPRECATED]
    sendMessages:                     1n << 11n,
    sendTTSMessages:                  1n << 12n,
    manageMessages:                   1n << 13n,
    embedLinks:                       1n << 14n,
    attachFiles:                      1n << 15n,
    readMessageHistory:               1n << 16n,
    mentionEveryone:                  1n << 17n,
    useExternalEmojis:                1n << 18n, externalEmojis: 1n << 18n, // [DEPRECATED]
    viewGuildInsights:                1n << 19n,
    connect:                          1n << 20n, voiceConnect: 1n << 20n, // [DEPRECATED]
    speak:                            1n << 21n, voiceSpeak: 1n << 21n, // [DEPRECATED]
    muteMembers:                      1n << 22n, voiceMuteMembers: 1n << 22n, // [DEPRECATED]
    deafenMembers:                    1n << 23n, voiceDeafenMembers: 1n << 23n, // [DEPRECATED]
    moveMembers:                      1n << 24n, voiceMoveMembers: 1n << 24n, // [DEPRECATED]
    useVAD:                           1n << 25n, voiceUseVAD: 1n << 25n, // [DEPRECATED]
    changeNickname:                   1n << 26n,
    manageNicknames:                  1n << 27n,
    manageRoles:                      1n << 28n,
    manageWebhooks:                   1n << 29n,
    manageGuildExpressions:           1n << 30n, manageExpressions: 1n << 30n, manageEmojisAndStickers: 1n << 30n, manageEmojis: 1n << 30n, // [DEPRECATED]
    useApplicationCommands:           1n << 31n, useSlashCommands: 1n << 31n, // [DEPRECATED]
    requestToSpeak:                   1n << 32n, voiceRequestToSpeak: 1n << 32n, // [DEPRECATED]
    manageEvents:                     1n << 33n,
    manageThreads:                    1n << 34n,
    createPublicThreads:              1n << 35n,
    createPrivateThreads:             1n << 36n,
    useExternalStickers:              1n << 37n,
    sendMessagesInThreads:            1n << 38n,
    useEmbeddedActivities:            1n << 39n, startEmbeddedActivities: 1n << 39n, // [DEPRECATED]
    moderateMembers:                  1n << 40n,
    viewCreatorMonetizationAnalytics: 1n << 41n,
    useSoundboard:                    1n << 42n,
    createGuildExpressions:           1n << 43n,
    createEvents:                     1n << 44n,
    useExternalSounds:                1n << 45n,
    sendVoiceMessages:                1n << 46n
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
    | Permissions.manageGuildExpressions
    | Permissions.manageEvents
    | Permissions.moderateMembers
    | Permissions.viewCreatorMonetizationAnalytics
    | Permissions.createGuildExpressions
    | Permissions.createEvents;
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
    | Permissions.useApplicationCommands
    | Permissions.manageThreads
    | Permissions.createPublicThreads
    | Permissions.createPrivateThreads
    | Permissions.useExternalStickers
    | Permissions.sendMessagesInThreads
    | Permissions.sendVoiceMessages;
Permissions.allVoice = Permissions.createInstantInvite
    | Permissions.manageChannels
    | Permissions.prioritySpeaker
    | Permissions.stream
    | Permissions.viewChannel
    | Permissions.connect
    | Permissions.speak
    | Permissions.muteMembers
    | Permissions.deafenMembers
    | Permissions.moveMembers
    | Permissions.useVAD
    | Permissions.manageRoles
    | Permissions.requestToSpeak
    | Permissions.useEmbeddedActivities
    | Permissions.useSoundboard
    | Permissions.useExternalSounds
    | Permissions.sendVoiceMessages;
Permissions.all = Permissions.allGuild | Permissions.allText | Permissions.allVoice;
module.exports.Permissions = Permissions;

module.exports.PremiumTiers = {
    NONE:   0,
    TIER_1: 1,
    TIER_2: 2,
    TIER_3: 3
};

module.exports.PremiumTypes = {
    NONE:          0,
    NITRO_CLASSIC: 1,
    NITRO:         2
};

module.exports.RoleConnectionMetadataTypes = {
    INTEGER_LESS_THAN_OR_EQUAL:     1,
    INTEGER_GREATER_THAN_OR_EQUAL:  2,
    INTEGER_EQUAL:                  3,
    INTEGER_NOT_EQUAL:              4,
    DATETIME_LESS_THAN_OR_EQUAL:    5,
    DATETIME_GREATER_THAN_OR_EQUAL: 6,
    BOOLEAN_EQUAL:                  7,
    BOOLEAN_NOT_EQUAL:              8
};

module.exports.RoleFlags = {
    IN_PROMPT: 1 << 0
};

module.exports.StageInstancePrivacyLevel = {
    PUBLIC:     1,
    GUILD_ONLY: 2
};

module.exports.StickerFormats = {
    PNG: 1,
    APNG: 2,
    LOTTIE: 3
};

module.exports.StickerTypes = {
    STANDARD: 1,
    GUILD:    2
};

module.exports.SystemChannelFlags = {
    SUPPRESS_JOIN_NOTIFICATIONS:                              1 << 0,
    SUPPRESS_PREMIUM_SUBSCRIPTIONS:                           1 << 1,
    SUPPRESS_GUILD_REMINDER_NOTIFICATIONS:                    1 << 2,
    SUPPRESS_JOIN_NOTIFICATION_REPLIES:                       1 << 3,
    SUPPRESS_ROLE_SUBSCRIPTION_PURCHASE_NOTIFICATIONS:        1 << 4,
    SUPPRESS_ROLE_SUBSCRIPTION_PURCHASE_NOTIFICATION_REPLIES: 1 << 5
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

module.exports.ThreadMemberFlags = {
    HAS_INTERACTED: 1 << 0,
    ALL_MESSAGES:   1 << 1,
    ONLY_MENTIONS:  1 << 2,
    NO_MESSAGES:    1 << 3
};

module.exports.TextInputStyles = {
    SHORT:     1,
    PARAGRAPH: 2
};

module.exports.UserFlags = {
    NONE:                    0,
    DISCORD_STAFF:           1 << 0,  DISCORD_EMPLOYEE: 1 << 0,
    PARTNER:                 1 << 1,  PARTNERED_SERVER_OWNER: 1 << 1, DISCORD_PARTNER: 1 << 1, // [DEPRECATED]
    HYPESQUAD:               1 << 2,  HYPESQUAD_EVENTS: 1 << 2,
    BUG_HUNTER_LEVEL_1:      1 << 3,

    HOUSE_BRAVERY:           1 << 6,  HYPESQUAD_ONLINE_HOUSE_1: 1 << 6,
    HOUSE_BRILLIANCE:        1 << 7,  HYPESQUAD_ONLINE_HOUSE_2: 1 << 7,
    HOUSE_BALANCE:           1 << 8,  HYPESQUAD_ONLINE_HOUSE_3: 1 << 8,
    PREMIUM_EARLY_SUPPORTER: 1 << 9,  EARLY_SUPPORTER: 1 << 9,
    TEAM_PSEUDO_USER:        1 << 10, TEAM_USER: 1 << 10,

    SYSTEM:                  1 << 12,

    BUG_HUNTER_LEVEL_2:      1 << 14,

    VERIFIED_BOT:            1 << 16,
    VERIFIED_DEVELOPER:      1 << 17, EARLY_VERIFIED_BOT_DEVELOPER: 1 << 17, VERIFIED_BOT_DEVELOPER: 1 << 17,
    CERTIFIED_MODERATOR:     1 << 18, DISCORD_CERTIFIED_MODERATOR: 1 << 18,
    BOT_HTTP_INTERACTIONS:   1 << 19,
    SPAMMER:                 1 << 20,

    ACTIVE_BOT_DEVELOPER:    1 << 22
};

module.exports.VerificationLevels = {
    NONE:      0,
    LOW:       1,
    MEDIUM:    2,
    HIGH:      3,
    VERY_HIGH: 4
};

module.exports.VideoQualityModes = {
    AUTO: 1,
    FULL: 2
};

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
    CLIENT_DISCONNECT:   13, DISCONNECT: 13 // [DEPRECATED]
};

module.exports.WebhookTypes = {
    INCOMING:         1,
    CHANNEL_FOLLOWER: 2,
    APPLICATION:      3
};
