export default interface Constants {
  GATEWAY_VERSION: 10;
  REST_VERSION:    10;
  ActivityFlags: {
    INSTANCE:                    1;
    JOIN:                        2;
    SPECTATE:                    4;
    JOIN_REQUEST:                8;
    SYNC:                        16;
    PLAY:                        32;
    PARTY_PRIVACY_FRIENDS:       64;
    PARTY_PRIVACY_VOICE_CHANNEL: 128;
    EMBEDDED:                    256;
  };
  ActivityTypes: {
    PLAYING:   0;
    /** @deprecated */
    GAME:      0;
    STREAMING: 1;
    LISTENING: 2;
    WATCHING:  3;
    CUSTOM:    4;
    COMPETING: 5;
  };
  ApplicationCommandOptionTypes: {
    SUB_COMMAND:       1;
    SUB_COMMAND_GROUP: 2;
    STRING:            3;
    INTEGER:           4;
    BOOLEAN:           5;
    USER:              6;
    CHANNEL:           7;
    ROLE:              8;
    MENTIONABLE:       9;
    NUMBER:            10;
  };
  ApplicationCommandPermissionTypes: {
    ROLE:    1;
    USER:    2;
    CHANNEL: 3;
  };
  ApplicationCommandTypes: {
    CHAT_INPUT: 1;
    USER:       2;
    MESSAGE:    3;
  };
  AttachmentFlags: {
    IS_REMIX: 4;
  };
  AuditLogActions: {
    GUILD_UPDATE: 1;

    CHANNEL_CREATE:           10;
    CHANNEL_UPDATE:           11;
    CHANNEL_DELETE:           12;
    CHANNEL_OVERWRITE_CREATE: 13;
    CHANNEL_OVERWRITE_UPDATE: 14;
    CHANNEL_OVERWRITE_DELETE: 15;

    MEMBER_KICK:        20;
    MEMBER_PRUNE:       21;
    MEMBER_BAN_ADD:     22;
    MEMBER_BAN_REMOVE:  23;
    MEMBER_UPDATE:      24;
    MEMBER_ROLE_UPDATE: 25;
    MEMBER_MOVE:        26;
    MEMBER_DISCONNECT:  27;
    BOT_ADD:            28;

    ROLE_CREATE: 30;
    ROLE_UPDATE: 31;
    ROLE_DELETE: 32;

    INVITE_CREATE: 40;
    INVITE_UPDATE: 41;
    INVITE_DELETE: 42;

    WEBHOOK_CREATE: 50;
    WEBHOOK_UPDATE: 51;
    WEBHOOK_DELETE: 52;

    EMOJI_CREATE: 60;
    EMOJI_UPDATE: 61;
    EMOJI_DELETE: 62;

    MESSAGE_DELETE:      72;
    MESSAGE_BULK_DELETE: 73;
    MESSAGE_PIN:         74;
    MESSAGE_UNPIN:       75;

    INTEGRATION_CREATE:    80;
    INTEGRATION_UPDATE:    81;
    INTEGRATION_DELETE:    82;
    STAGE_INSTANCE_CREATE: 83;
    STAGE_INSTANCE_UPDATE: 84;
    STAGE_INSTANCE_DELETE: 85;

    STICKER_CREATE: 90;
    STICKER_UPDATE: 91;
    STICKER_DELETE: 92;

    GUILD_SCHEDULED_EVENT_CREATE: 100;
    GUILD_SCHEDULED_EVENT_UPDATE: 101;
    GUILD_SCHEDULED_EVENT_DELETE: 102;

    THREAD_CREATE: 110;
    THREAD_UPDATE: 111;
    THREAD_DELETE: 112;

    APPLICATION_COMMAND_PERMISSION_UPDATE: 121;

    AUTO_MODERATION_RULE_CREATE:                 140;
    AUTO_MODERATION_RULE_UPDATE:                 141;
    AUTO_MODERATION_RULE_DELETE:                 142;
    AUTO_MODERATION_BLOCK_MESSAGE:               143;
    AUTO_MODERATION_FLAG_TO_CHANNEL:             144;
    AUTO_MODERATION_USER_COMMUNICATION_DISABLED: 145;

    VOICE_CHANNEL_STATUS_UPDATE: 192;
    VOICE_CHANNEL_STATUS_DELETE: 193;
  };
  AutoModerationActionTypes: {
    BLOCK_MESSAGE:            1;
    SEND_ALERT_MESSAGE:       2;
    TIMEOUT:                  3;
    BLOCK_MEMBER_INTERACTION: 4;
  };
  AutoModerationEventTypes: {
    MESSAGE_SEND:  1;
    MEMBER_UPDATE: 2;
  };
  AutoModerationKeywordPresetTypes: {
    PROFANITY:      1;
    SEXUAL_CONTENT: 2;
    SLURS:          3;
  };
  AutoModerationTriggerTypes: {
    KEYWORD:        1;
    /** @deprecated */
    HARMFUL_LINK:   2;
    SPAM:           3;
    KEYWORD_PRESET: 4;
    MENTION_SPAM:   5;
    MEMBER_PROFILE: 6;
  };
  ButtonStyles: {
    PRIMARY:   1;
    SECONDARY: 2;
    SUCCESS:   3;
    DANGER:    4;
    LINK:      5;
  };
  ChannelFlags: {
    PINNED:                      1;
    REQUIRE_TAG:                 16;
    HIDE_MEDIA_DOWNLOAD_OPTIONS: 32768;
  };
  ChannelTypes: {
    GUILD_TEXT:           0;
    DM:                   1;
    GUILD_VOICE:          2;
    GROUP_DM:             3;
    GUILD_CATEGORY:       4;
    GUILD_NEWS:           5;
    // Unknown 6-9
    GUILD_NEWS_THREAD:    10;
    GUILD_PUBLIC_THREAD:  11;
    GUILD_PRIVATE_THREAD: 12;
    GUILD_STAGE_VOICE:    13;
    /** @deprecated */
    GUILD_STAGE:          13;
    // Unknown 14
    GUILD_FORUM:          15;
    GUILD_MEDIA:          16;
  };
  ComponentTypes: {
    ACTION_ROW:         1;
    BUTTON:             2;
    STRING_SELECT:      3;
    TEXT_INPUT:         4;
    USER_SELECT:        5;
    ROLE_SELECT:        6;
    MENTIONABLE_SELECT: 7;
    CHANNEL_SELECT:     8;
  };
  ForumLayoutTypes: {
    NOT_SET:      0;
    LIST_VIEW:    1;
    GALLERY_VIEW: 2;
  };
  DefaultMessageNotificationLevels: {
    ALL_MESSAGES:  0;
    ONLY_MENTIONS: 1;
  };
  SortOrderTypes: {
    LATEST_ACTIVITY: 0;
    CREATION_DATE:   1;
  };
  ExplicitContentFilterLevels: {
    DISABLED:              0;
    MEMBERS_WITHOUT_ROLES: 1;
    ALL_MEMBERS:           2;
  };
  GatewayOPCodes: {
    DISPATCH:                  0;
    /** @deprecated */
    EVENT:                     0;
    HEARTBEAT:                 1;
    IDENTIFY:                  2;
    PRESENCE_UPDATE:           3;
    /** @deprecated */
    STATUS_UPDATE:             3;
    VOICE_STATE_UPDATE:        4;
    VOICE_SERVER_PING:         5;
    RESUME:                    6;
    RECONNECT:                 7;
    REQUEST_GUILD_MEMBERS:     8;
    /** @deprecated */
    GET_GUILD_MEMBERS:         8;
    INVALID_SESSION:           9;
    HELLO:                     10;
    HEARTBEAT_ACK:             11;
    // Unknown 12-30
    REQUEST_SOUNDBOARD_SOUNDS: 31;
  };
  GuildFeatures: [
    "ANIMATED_BANNER",
    "ANIMATED_ICON",
    "APPLICATION_COMMAND_PERMISSIONS_V2",
    "AUTO_MODERATION",
    "BANNER",
    "COMMUNITY",
    "CREATOR_MONETIZABLE_PROVISIONAL",
    "CREATOR_STORE_PAGE",
    "DEVELOPER_SUPPORT_SERVER",
    "DISCOVERABLE",
    "FEATURABLE",
    "INVITES_DISABLED",
    "INVITE_SPLASH",
    "MEMBER_VERIFICATION_GATE_ENABLED",
    "MORE_SOUNDBOARD",
    "MORE_STICKERS",
    "NEWS",
    "PARTNERED",
    "PREVIEW_ENABLED",
    "RAID_ALERTS_DISABLED",
    "ROLE_ICONS",
    "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE",
    "ROLE_SUBSCRIPTIONS_ENABLED",
    "SOUNDBOARD",
    "TICKETED_EVENTS_ENABLED",
    "VANITY_URL",
    "VERIFIED",
    "VIP_REGIONS",
    "WELCOME_SCREEN_ENABLED",
  ];
  GuildIntegrationExpireBehavior: {
    REMOVE_ROLE: 0;
    KICK:        1;
  };
  GuildIntegrationTypes: [
    "twitch",
    "youtube",
    "discord",
    "guild_subscription",
  ];
  GuildNSFWLevels: {
    DEFAULT:        0;
    EXPLICIT:       1;
    SAFE:           2;
    AGE_RESTRICTED: 3;
  };
  GuildOnboardingModes: {
    ONBOARDING_DEFAULT:  0;
    ONBOARDING_ADVANCED: 1;
  };
  GuildOnboardingPromptTypes: {
    MULTIPLE_CHOICE: 0;
    DROPDOWN:        1;
  };
  GuildScheduledEventEntityTypes: {
    STAGE_INSTANCE: 1;
    VOICE:          2;
    EXTERNAL:       3;
  };
  GuildScheduledEventPrivacyLevel: {
    PUBLIC:     1;
    GUILD_ONLY: 2;
  };
  GuildScheduledEventStatus: {
    SCHEDULED: 1;
    ACTIVE:    2;
    COMPLETED: 3;
    CANCELED:  4;
  };
  GuildWidgetStyles: {
    Shield:  "shield";
    Banner1: "banner1";
    Banner2: "banner2";
    Banner3: "banner3";
    Banner4: "banner4";
  };
  ImageFormats: [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
  ];
  ImageSizeBoundaries: {
    MAXIMUM: 4096;
    MINIMUM: 16;
  };
  Intents: {
    guilds:                      1;
    guildMembers:                2;
    guildBans:                   4;
    guildExpressions:            8;
    /** @deprecated */
    guildEmojisAndStickers:      8;
    /** @deprecated */
    guildEmojis:                 8;
    guildIntegrations:           16;
    guildWebhooks:               32;
    guildInvites:                64;
    guildVoiceStates:            128;
    guildPresences:              256;
    guildMessages:               512;
    guildMessageReactions:       1024;
    guildMessageTyping:          2048;
    directMessages:              4096;
    directMessageReactions:      8192;
    directMessageTyping:         16384;
    messageContent:              32768;
    guildScheduledEvents:        65536;
    autoModerationConfiguration: 1048576;
    autoModerationExecution:     2097152;
    guildMessagePolls:           16777216;
    directMessagePolls:          33554432;
    allNonPrivileged:            53575421;
    allPrivileged:               33026;
    all:                         53608447;
  };
  InteractionResponseTypes: {
    PONG:                                    1;
    CHANNEL_MESSAGE_WITH_SOURCE:             4;
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE:    5;
    DEFERRED_UPDATE_MESSAGE:                 6;
    UPDATE_MESSAGE:                          7;
    APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8;
    MODAL:                                   9;
  };
  InteractionTypes: {
    PING:                             1;
    APPLICATION_COMMAND:              2;
    MESSAGE_COMPONENT:                3;
    APPLICATION_COMMAND_AUTOCOMPLETE: 4;
    MODAL_SUBMIT:                     5;
  };
  InviteTargetTypes: {
    STREAM:               1;
    EMBEDDED_APPLICATION: 2;
  };
  Locales: {
    BULGARIAN:            "bg";
    CZECH:                "cs";
    DANISH:               "da";
    GERMAN:               "de";
    GREEK:                "el";
    ENGLISH_UK:           "en-GB";
    ENGLISH_US:           "en-US";
    SPANISH:              "es-ES";
    SPANISH_LATAM:        "es-419";
    FINNISH:              "fi";
    FRENCH:               "fr";
    HINDI:                "hi";
    CROATIAN:             "hr";
    HUNGARIAN:            "hu";
    INDONESIAN:           "id";
    ITALIAN:              "it";
    JAPANESE:             "ja";
    KOREAN:               "ko";
    LITHUANIAN:           "lt";
    DUTCH:                "nl";
    NORWEGIAN:            "no";
    POLISH:               "pl";
    PORTUGUESE_BRAZILIAN: "pt-BR";
    ROMANIAN_ROMANIA:     "ro";
    RUSSIAN:              "ru";
    SWEDISH:              "sv-SE";
    THAI:                 "th";
    TURKISH:              "tr";
    UKRAINIAN:            "uk";
    VIETNAMESE:           "vi";
    CHINESE_CHINA:        "zh-CN";
    CHINESE_TAIWAN:       "zh-TW";
  };
  MemberFlags: {
    DID_REJOIN:                      1;
    COMPLETED_ONBOARDING:            2;
    BYPASSES_VERIFICATION:           4;
    STARTED_ONBOARDING:              8;
    IS_GUEST:                        16;
    STARTED_HOME_ACTIONS:            32;
    COMPLETED_HOME_ACTIONS:          64;
    AUTOMOD_QUARANTINED_USERNAME:    128;
    // Unknown 1 << 8 (256)
    DM_SETTINGS_UPSELL_ACKNOWLEDGED: 512;
  };
  MessageActivityTypes: {
    JOIN:         1;
    SPECTATE:     2;
    LISTEN:       3;
    WATCH:        4;
    JOIN_REQUEST: 5;
  };
  MembershipState: {
    INVITED:  1;
    ACCEPTED: 2;
  };
  MessageFlags: {
    CROSSPOSTED:                            1;
    IS_CROSSPOST:                           2;
    SUPPRESS_EMBEDS:                        4;
    SOURCE_MESSAGE_DELETED:                 8;
    URGENT:                                 16;
    HAS_THREAD:                             32;
    EPHEMERAL:                              64;
    LOADING:                                128;
    FAILED_TO_MENTION_SOME_ROLES_IN_THREAD: 256;
    SUPPRESS_NOTIFICATIONS:                 4096;
    IS_VOICE_MESSAGE:                       8192;
  };
  MessageTypes: {
    DEFAULT:                                      0;
    RECIPIENT_ADD:                                1;
    RECIPIENT_REMOVE:                             2;
    CALL:                                         3;
    CHANNEL_NAME_CHANGE:                          4;
    CHANNEL_ICON_CHANGE:                          5;
    CHANNEL_PINNED_MESSAGE:                       6;
    GUILD_MEMBER_JOIN:                            7;
    USER_PREMIUM_GUILD_SUBSCRIPTION:              8;
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1:       9;
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2:       10;
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3:       11;
    CHANNEL_FOLLOW_ADD:                           12;
    // Unknown 13
    GUILD_DISCOVERY_DISQUALIFIED:                 14;
    GUILD_DISCOVERY_REQUALIFIED:                  15;
    GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING: 16;
    GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING:   17;
    THREAD_CREATED:                               18;
    REPLY:                                        19;
    CHAT_INPUT_COMMAND:                           20;
    THREAD_STARTER_MESSAGE:                       21;
    GUILD_INVITE_REMINDER:                        22;
    CONTEXT_MENU_COMMAND:                         23;
    AUTO_MODERATION_ACTION:                       24;
    ROLE_SUBSCRIPTION_PURCHASE:                   25;
    INTERACTION_PREMIUM_UPSELL:                   26;
    STAGE_START:                                  27;
    STAGE_END:                                    28;
    STAGE_SPEAKER:                                29;
    // Unknown 30
    STAGE_TOPIC:                                  31;
    GUILD_APPLICATION_PREMIUM_SUBSCRIPTION:       32;
    // Unknown 33-35
    GUILD_INCIDENT_ALERT_MODE_ENABLED:            36;
    GUILD_INCIDENT_ALERT_MODE_DISABLED:           37;
    GUILD_INCIDENT_REPORT_RAID:                   38;
    GUILD_INCIDENT_REPORT_FALSE_ALARM:            39;
    // Unknown 40-43
    PURCHASE_NOTIFICATION:                        44;
    // Unknown 45
    POLL_RESULT:                                  46;
  };
  MessageReferenceTypes: {
    DEFAULT: 0;
    FORWARD: 1;
  };
  MFALevels: {
    NONE:     0;
    ELEVATED: 1;
  };
  OAuthTeamMemberRoleTypes: {
    ADMIN:     "admin";
    DEVELOPER: "developer";
    OWNER:     "";
    READ_ONLY: "read_only";
  };
  PermissionOverwriteTypes: {
    ROLE: 0;
    USER: 1;
  };
  Permissions: {
    createInstantInvite:              1n;
    kickMembers:                      2n;
    banMembers:                       4n;
    administrator:                    8n;
    manageChannels:                   16n;
    manageGuild:                      32n;
    addReactions:                     64n;
    viewAuditLog:                     128n;
    /** @deprecated */
    viewAuditLogs:                    128n;
    prioritySpeaker:                  256n;
    /** @deprecated */
    voicePrioritySpeaker:             256n;
    stream:                           512n;
    /** @deprecated */
    voiceStream:                      512n;
    viewChannel:                      1024n;
    /** @deprecated */
    readMessages:                     1024n;
    sendMessages:                     2048n;
    sendTTSMessages:                  4096n;
    manageMessages:                   8192n;
    embedLinks:                       16384n;
    attachFiles:                      32768n;
    readMessageHistory:               65536n;
    mentionEveryone:                  131072n;
    useExternalEmojis:                262144n;
    /** @deprecated */
    externalEmojis:                   262144n;
    viewGuildInsights:                524288n;
    connect:                          1048576n;
    /** @deprecated */
    voiceConnect:                     1048576n;
    speak:                            2097152n;
    /** @deprecated */
    voiceSpeak:                       2097152n;
    muteMembers:                      4194304n;
    /** @deprecated */
    voiceMuteMembers:                 4194304n;
    deafenMembers:                    8388608n;
    /** @deprecated */
    voiceDeafenMembers:               8388608n;
    moveMembers:                      16777216n;
    /** @deprecated */
    voiceMoveMembers:                 16777216n;
    useVAD:                           33554432n;
    /** @deprecated */
    voiceUseVAD:                      33554432n;
    /** @deprecated */
    changeNickname:                   67108864n;
    manageNicknames:                  134217728n;
    manageRoles:                      268435456n;
    manageWebhooks:                   536870912n;
    manageGuildExpressions:           1073741824n;
    /** @deprecated */
    manageExpressions:                1073741824n;
    /** @deprecated */
    manageEmojisAndStickers:          1073741824n;
    /** @deprecated */
    manageEmojis:                     1073741824n;
    useApplicationCommands:           2147483648n;
    /** @deprecated */
    useSlashCommands:                 2147483648n;
    requestToSpeak:                   4294967296n;
    /** @deprecated */
    voiceRequestToSpeak:              4294967296n;
    manageEvents:                     8589934592n;
    manageThreads:                    17179869184n;
    createPublicThreads:              34359738368n;
    createPrivateThreads:             68719476736n;
    useExternalStickers:              137438953472n;
    sendMessagesInThreads:            274877906944n;
    useEmbeddedActivities:            549755813888n;
    /** @deprecated */
    startEmbeddedActivities:          549755813888n;
    moderateMembers:                  1099511627776n;
    viewCreatorMonetizationAnalytics: 2199023255552n;
    useSoundboard:                    4398046511104n;
    createGuildExpressions:           8796093022208n;
    createEvents:                     17592186044416n;
    useExternalSounds:                35184372088832n;
    sendVoiceMessages:                70368744177664n;
    setVoiceChannelStatus:            281474976710656n;
    sendPolls:                        562949953421312n;
    useExternalApps:                  1125899906842624n;
    allGuild:                         1155597391626430n;
    allText:                          1759754133699665n;
    allVoice:                         2080830385030929n;
    all:                              2111062325329919n;
  };
  PollLayoutTypes: {
    DEFAULT: 1;
  };
  PremiumTiers: {
    NONE:   0;
    TIER_1: 1;
    TIER_2: 2;
    TIER_3: 3;
  };
  PremiumTypes: {
    NONE:          0;
    NITRO_CLASSIC: 1;
    NITRO:         2;
  };
  RoleConnectionMetadataTypes: {
    INTEGER_LESS_THAN_OR_EQUAL:     1;
    INTEGER_GREATER_THAN_OR_EQUAL:  2;
    INTEGER_EQUAL:                  3;
    INTEGER_NOT_EQUAL:              4;
    DATETIME_LESS_THAN_OR_EQUAL:    5;
    DATETIME_GREATER_THAN_OR_EQUAL: 6;
    BOOLEAN_EQUAL:                  7;
    BOOLEAN_NOT_EQUAL:              8;
  };
  RoleFlags: {
    IN_PROMPT: 1;
  };
  ReactionTypes: {
    NORMAL: 0;
    BURST:  1;
  };
  StageInstancePrivacyLevel: {
    PUBLIC:     1;
    GUILD_ONLY: 2;
  };
  StickerFormats: {
    PNG:    1;
    APNG:   2;
    LOTTIE: 3;
    GIF:    4;
  };
  StickerTypes: {
    STANDARD: 1;
    GUILD:    2;
  };
  SystemChannelFlags: {
    SUPPRESS_JOIN_NOTIFICATIONS:                              1;
    SUPPRESS_PREMIUM_SUBSCRIPTIONS:                           2;
    SUPPRESS_GUILD_REMINDER_NOTIFICATIONS:                    4;
    SUPPRESS_JOIN_NOTIFICATION_REPLIES:                       8;
    SUPPRESS_ROLE_SUBSCRIPTION_PURCHASE_NOTIFICATIONS:        16;
    SUPPRESS_ROLE_SUBSCRIPTION_PURCHASE_NOTIFICATION_REPLIES: 32;
  };
  SystemJoinMessages: [
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
    "Yay you made it, %user%!",
  ];
  ThreadMemberFlags: {
    HAS_INTERACTED: 1;
    ALL_MESSAGES:   2;
    ONLY_MENTIONS:  4;
    NO_MESSAGES:    8;
  };
  TextInputStyles: {
    SHORT:     1;
    PARAGRAPH: 2;
  };
  UserFlags: {
    NONE:                         0;
    DISCORD_STAFF:                1;
    DISCORD_EMPLOYEE:             1;
    PARTNER:                      2;
    PARTNERED_SERVER_OWNER:       2;
    /** @deprecated */
    DISCORD_PARTNER:              2;
    HYPESQUAD:                    4;
    HYPESQUAD_EVENTS:             4;
    BUG_HUNTER_LEVEL_1:           8;
    HYPESQUAD_ONLINE_HOUSE_1:     64;
    HOUSE_BRAVERY:                64;
    HYPESQUAD_ONLINE_HOUSE_2:     128;
    HOUSE_BRILLIANCE:             128;
    HYPESQUAD_ONLINE_HOUSE_3:     256;
    HOUSE_BALANCE:                256;
    PREMIUM_EARLY_SUPPORTER:      512;
    EARLY_SUPPORTER:              512;
    TEAM_PSEUDO_USER:             1024;
    TEAM_USER:                    1024;
    SYSTEM:                       4096;
    BUG_HUNTER_LEVEL_2:           16384;
    VERIFIED_BOT:                 65536;
    VERIFIED_DEVELOPER:           131072;
    VERIFIED_BOT_DEVELOPER:       131072;
    EARLY_VERIFIED_BOT_DEVELOPER: 131072;
    CERTIFIED_MODERATOR:          262144;
    DISCORD_CERTIFIED_MODERATOR:  262144;
    BOT_HTTP_INTERACTIONS:        524288;
    SPAMMER:                      1048576;
    ACTIVE_DEVELOPER:             4194304;
  };
  VerificationLevels: {
    NONE:      0;
    LOW:       1;
    MEDIUM:    2;
    HIGH:      3;
    VERY_HIGH: 4;
  };
  VideoQualityModes: {
    AUTO: 1;
    FULL: 2;
  };
  VoiceChannelEffectAnimationTypes: {
    PREMIUM: 0;
    BASIC:   1;
  };
  VoiceOPCodes: {
    IDENTIFY:            0;
    SELECT_PROTOCOL:     1;
    READY:               2;
    HEARTBEAT:           3;
    SESSION_DESCRIPTION: 4;
    SPEAKING:            5;
    HEARTBEAT_ACK:       6;
    RESUME:              7;
    HELLO:               8;
    RESUMED:             9;
    // Unknown 10
    CLIENTS_CONNECT:     11;
    // Unknown 12
    CLIENT_DISCONNECT:   13;
    /** @deprecated */
    DISCONNECT:          13;
  };
  WebhookTypes: {
    INCOMING:         1;
    CHANNEL_FOLLOWER: 2;
    APPLICATION:      3;
  };
}
