import { EventEmitter } from "events";
import { Readable as ReadableStream } from "stream";
import { Agent as HTTPSAgent } from "https";
import { IncomingMessage } from "http";

declare function Eris(token: string, options?: Eris.ClientOptions): Eris.Client;

declare namespace Eris {
  // TODO good hacktoberfest PR: implement ShardManager, RequestHandler and other stuff

  export const VERSION: string;
  interface JSONCache {
    [s: string]: any;
  }

  interface SimpleJSON {
    toJSON(props?: string[]): JSONCache;
  }

  interface NestedJSON {
    toJSON(arg?: any, cache?: (string | any)[]): JSONCache;
  }

  // TODO there's also toJSON(): JSONCache, though, SimpleJSON should suffice

  type GuildTextableChannel = TextChannel | NewsChannel
  type TextableChannel = Textable & GuildTextableChannel | PrivateChannel;
  type AnyChannel = AnyGuildChannel | PrivateChannel;
  type AnyGuildChannel = GuildTextableChannel | VoiceChannel | CategoryChannel | StoreChannel;

  interface CreateInviteOptions {
    maxAge?: number;
    maxUses?: number;
    temporary?: boolean;
    unique?: boolean;
  }

  interface Invitable {
    getInvites(): Promise<ChannelInvite[]>;
    createInvite(options?: CreateInviteOptions, reason?: string): Promise<ChannelInvite>;
  }

  interface Textable {
    lastMessageID: string;
    messages: Collection<Message>;
    sendTyping(): Promise<void>;
    getMessage(messageID: string): Promise<Message>;
    getMessages(limit?: number, before?: string, after?: string, around?: string): Promise<Message[]>;
    getPins(): Promise<Message[]>;
    createMessage(content: MessageContent, file?: MessageFile | MessageFile[]): Promise<Message>;
    editMessage(messageID: string, content: MessageContent): Promise<Message>;
    pinMessage(messageID: string): Promise<void>;
    unpinMessage(messageID: string): Promise<void>;
    getMessageReaction(
      messageID: string,
      reaction: string,
      limit?: number,
      before?: string,
      after?: string
    ): Promise<User[]>;
    addMessageReaction(messageID: string, reaction: string, userID?: string): Promise<void>;
    removeMessageReaction(messageID: string, reaction: string, userID?: string): Promise<void>;
    deleteMessage(messageID: string, reason?: string): Promise<void>;
    unsendMessage(messageID: string): Promise<void>;
  }

  interface OldCall {
    participants: string[];
    endedTimestamp?: number;
    ringing: string[];
    region: string;
    unavailable: boolean;
  }

  interface OldGuildChannel {
    name: string;
    position: string;
    nsfw: boolean;
    permissionOverwrites: Collection<PermissionOverwrite>;
    parentID?: string;
    topic?: string;
    rateLimitPerUser?: number;
    type: 0 | 2 | 4 | 5 | 6;
    bitrate?: number;
    userLimit?: number;
  }

  interface OldMessage {
    attachments: Attachment[];
    embeds: Embed[];
    content: string;
    editedTimestamp?: number;
    mentionedBy?: any;
    tts: boolean;
    mentions: string[];
    roleMentions: string[];
    channelMentions: string[];
  }

  type FriendSuggestionReasons = { type: number; platform_type: string; name: string }[];

  interface MemberPartial {
    id: string;
    user: User;
  }

  interface Presence {
    activities?: Activity[];
    clientStatus?: ClientStatus;
    status?: Status;
    game?: Activity;
  }

  type BotActivityType = 0 | 1 | 2 | 3
  type ActivityType = BotActivityType & 4;

  interface ActivityPartial<T extends BotActivityType> {
    name: string;
    type: T;
    url?: string;
  }
  interface Activity extends ActivityPartial<ActivityType> {
    created_at: number;
    timestamps?: { start: number; end?: number };
    application_id?: string;
    details?: string;
    state?: string;
    emoji?: { name: string; id?: string; animated?: boolean };
    party?: { id?: string; size?: [number, number] };
    assets?: {
      small_text?: string;
      small_image?: string;
      large_text?: string;
      large_image?: string;
      [key: string]: unknown;
    };
    secrets?: { join?: string; spectate?: string; match?: string };
    instance?: boolean;
    flags?: number;
    // the stuff attached to this object apparently varies even more than documented, so...
    [key: string]: unknown;
  }

  interface OldVoiceState {
    mute: boolean;
    deaf: boolean;
    selfMute: boolean;
    selfDeaf: boolean;
    selfStream: boolean;
  }

  interface OAuthApplicationInfo {
    description: string;
    name: string;
    owner: {
      username: string;
      discriminator: string;
      id: string;
      avatar?: string;
    };
    bot_public: boolean;
    bot_require_code_grant: boolean;
    id: string;
    icon?: string;
  }

  interface Constants {
    ImageSizeBoundaries: {
      MINIMUM: 16;
      MAXIMUM: 4096;
    };
    ImageFormats: ["jpg", "jpeg", "png", "webp", "gif"];
    GatewayOPCodes: {
      EVENT: 0;
      HEARTBEAT: 1;
      IDENTIFY: 2;
      STATUS_UPDATE: 3;
      VOICE_STATE_UPDATE: 4;
      VOICE_SERVER_PING: 5;
      RESUME: 6;
      RECONNECT: 7;
      GET_GUILD_MEMBERS: 8;
      INVALID_SESSION: 9;
      HELLO: 10;
      HEARTBEAT_ACK: 11;
      SYNC_GUILD: 12;
      SYNC_CALL: 13;
    };
    GATEWAY_VERSION: 6;
    REST_VERSION: 7;
    Permissions: {
      createInstantInvite: 1;
      kickMembers: 2;
      banMembers: 4;
      administrator: 8;
      manageChannels: 16;
      manageGuild: 32;
      addReactions: 64;
      viewAuditLogs: 128;
      voicePrioritySpeaker: 256;
      stream: 512;
      readMessages: 1024;
      sendMessages: 2048;
      sendTTSMessages: 4096;
      manageMessages: 8192;
      embedLinks: 16384;
      attachFiles: 32768;
      readMessageHistory: 65536;
      mentionEveryone: 131072;
      externalEmojis: 262144;
      viewGuildInsights: 524288;
      voiceConnect: 1048576;
      voiceSpeak: 2097152;
      voiceMuteMembers: 4194304;
      voiceDeafenMembers: 8388608;
      voiceMoveMembers: 16777216;
      voiceUseVAD: 33554432;
      changeNickname: 67108864;
      manageNicknames: 134217728;
      manageRoles: 268435456;
      manageWebhooks: 546870912;
      manageEmojis: 1973741824;
      all: 2147483647;
      allGuild: 2080899263;
      allText: 805829714;
      allVoice: 871367441;
    };
    VoiceOPCodes: {
      IDENTIFY: 0;
      SELECT_PROTOCOL: 1;
      READY: 2;
      HEARTBEAT: 3;
      SESSION_DESCRIPTION: 4;
      SPEAKING: 5;
      DISCONNECT: 13;
    };
    Intents: {
      guilds: 1;
      guildMembers: 2;
      guildBans: 4;
      guildEmojis: 8;
      guildIntegrations: 16;
      guildWebhooks: 32;
      guildInvites: 64;
      guildVoiceStates: 128;
      guildPresences: 256;
      guildMessages: 512;
      guildMessageReactions: 1024;
      guildMessageTyping: 2048;
      directMessages: 4096;
      directMessageReactions: 8192;
      directMessageTyping: 16384;
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
      "Yay you made it, %user%!"
    ];
    AuditLogActions: {
      GUILD_UPDATE: 1;

      CHANNEL_CREATE: 10;
      CHANNEL_UPDATE: 11;
      CHANNEL_DELETE: 12;
      CHANNEL_OVERWRITE_CREATE: 13;
      CHANNEL_OVERWRITE_UPDATE: 14;
      CHANNEL_OVERWRITE_DELETE: 15;

      MEMBER_KICK: 20;
      MEMBER_PRUNE: 21;
      MEMBER_BAN_ADD: 22;
      MEMBER_BAN_REMOVE: 23;
      MEMBER_UPDATE: 24;
      MEMBER_ROLE_UPDATE: 25;
      MEMBER_MOVE: 26;
      MEMBER_DISCONNECT: 27;
      BOT_ADD: 28;

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

      MESSAGE_DELETE: 72;
      MESSAGE_BULK_DELETE: 73;
      MESSAGE_PIN: 74;
      MESSAGE_UNPIN: 75;

      INTEGRATION_CREATE: 80;
      INTEGRATION_UPDATE: 81;
      INTEGRATION_DELETE: 82;
    };
    MessageFlags: {
      CROSSPOSTED: 0;
      IS_CROSSPOST: 2;
      SUPPRESS_EMBEDS: 4;
      SOURCE_MESSAGE_DELETED: 8;
      URGENT: 16;
    };
    MessageTypes: {
      DEFAULT: 0;
      RECIPIENT_ADD: 1;
      RECIPIENT_REMOVE: 2;
      CALL: 3;
      CHANNEL_NAME_CHANGE: 4;
      CHANNEL_ICON_CHANGE: 5;
      CHANNEL_PINNED_MESSAGE: 6;
      GUILD_MEMBER_JOIN: 7;
      USER_PREMIUM_GUILD_SUBSCRIPTION: 8;
      USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1: 9;
      USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2: 10;
      USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3: 11;
      CHANNEL_FOLLOW_ADD: 12;

      GUILD_DISCOVERY_DISQUALIFIED: 14;
      GUILD_DISCOVERY_REQUALIFIED: 15;
    };
    ChannelTypes: {
      GUILD_TEXT: 0;
      DM: 1;
      GUILD_VOICE: 2;
      GROUP_DM: 3;
      GUILD_CATEGORY: 4;
      GUILD_NEWS: 5;
      GUILD_STORE: 6;
    };
    UserFlags: {
      NONE: 0;
      DISCORD_EMPLOYEE: 1;
      DISCORD_PARTNER: 2;
      HYPESQUAD_EVENTS: 4;
      BUG_HUNTER_LEVEL_1: 8;
      HOUSE_BRAVERY: 64;
      HOUSE_BRILLIANCE: 128;
      HOUSE_BALANCE: 256;
      EARLY_SUPPORTER: 512;
      TEAM_USER: 1024;
      SYSTEM: 4096;
      BUG_HUNTER_LEVEL_2: 16384;
      VERIFIED_BOT: 65536;
      VERIFIED_BOT_DEVELOPER: 131072;
    };
  }

  export const Constants: Constants;

  interface WebhookPayload {
    auth?: boolean;
    content?: string;
    file?: { file: Buffer; name: string } | { file: Buffer; name: string }[];
    embeds?: EmbedOptions[];
    username?: string;
    avatarURL?: string;
    tts?: boolean;
    wait?: boolean;
    allowedMentions?: AllowedMentions;
  }

  interface EmbedAuthorOptions {
    name: string;
    url?: string;
    icon_url?: string;
  }
  interface EmbedAuthor extends EmbedAuthorOptions {
    proxy_icon_url?: string;
  }

  interface EmbedField {
    name: string;
    value: string;
    inline?: boolean;
  }

  interface EmbedFooterOptions {
    text: string;
    icon_url?: string;
  }
  interface EmbedFooter extends EmbedFooterOptions {
    proxy_icon_url?: string;
  }

  interface EmbedImageOptions {
    url?: string;
  }
  interface EmbedImage extends EmbedImageOptions {
    proxy_url?: string;
    height?: number;
    width?: number;
  }

  interface EmbedVideo {
    url?: string;
    height?: number;
    width?: number;
  }

  interface EmbedProvider {
    name?: string;
    url?: string;
  }

  interface EmbedOptions {
    title?: string;
    description?: string;
    url?: string;
    timestamp?: Date | string;
    color?: number;
    footer?: EmbedFooterOptions;
    image?: EmbedImageOptions;
    thumbnail?: EmbedImageOptions;
    fields?: EmbedField[];
    author?: EmbedAuthorOptions;
  }

  // Omit<T, K> used to override
  interface Embed extends Omit<EmbedOptions, "footer" | "image" | "thumbnail" | "author"> {
    type: string;
    video?: EmbedVideo;
    provider?: EmbedProvider;
    footer?: EmbedFooter;
    image?: EmbedImage;
    thumbnail?: EmbedImage;
    author?: EmbedAuthor;
  }

  interface Webhook {
    name: string;
    channel_id: string;
    token: string;
    avatar?: string;
    guild_id: string;
    id: string;
    user: {
      username: string;
      discriminator: string;
      id: string;
      avatar?: string;
    };
  }

  interface GuildEmbed {
    channel_id?: string;
    enabled: boolean;
  }

  interface Attachment {
    url: string;
    proxy_url: string;
    size: number;
    id: string;
    filename: string;
  }

  interface VoiceRegion {
    name: string;
    deprecated: boolean;
    custom: boolean;
    vip: boolean;
    optimal: boolean;
    id: string;
  }

  interface UserSettings {
    theme: string;
    status: string;
    show_current_game: boolean;
    restricted_guilds: string[];
    render_reactions: boolean;
    render_embeds: boolean;
    message_display_compact: boolean;
    locale: string;
    inline_embed_media: boolean;
    inline_attachment_media: boolean;
    guild_positions: string[];
    friend_source_flags: {
      all: boolean; // not sure about other keys, abal heeeelp
    };
    explicit_content_filter: number;
    enable_tts_command: boolean;
    developer_mode: boolean;
    detect_platform_accounts: boolean;
    default_guilds_restricted: boolean;
    convert_emojis: boolean;
    afk_timeout: number;
  }

  interface GuildSettings {
    suppress_everyone: boolean;
    muted: boolean;
    mobile_push: boolean;
    message_notifications: number;
    guild_id: string;
    channel_override: {
      muted: boolean;
      message_notifications: number;
      channel_id: string;
    }[];
  }

  interface UserProfile {
    premium_since?: number;
    mutual_guilds: { nick?: string; id: string }[];
    user: { username: string; discriminator: string; flags: number; id: string; avatar?: string };
    connected_accounts: { verified: boolean; type: string; id: string; name: string }[];
  }

  interface Connection {
    verified: boolean;
    revoked: boolean;
    integrations: any[]; // TODO ????
    visibility: number;
    friend_sync: boolean;
    type: string;
    id: string;
    name: string;
  }

  interface GuildAuditLog {
    users: User[];
    entries: GuildAuditLogEntry[];
  }

  // TODO: Does this have more stuff?
  interface BaseData {
    id: string;
    [key: string]: {};
  }

  interface AllowedMentions {
    everyone?: boolean;
    roles?: boolean | string[];
    users?: boolean | string[];
  }
  type MessageContent = string | AdvancedMessageContent;
  type AdvancedMessageContent = {
    content?: string;
    tts?: boolean;
    allowedMentions?: AllowedMentions;
    embed?: EmbedOptions;
    flags?: number;
  }

  interface MessageFile {
    file: Buffer | string;
    name: string;
  }
  interface EmojiBase {
    name: string;
    icon?: string;
  }
  type EmojiOptions = {
    roles?: string[];
  } & EmojiBase;
  type Emoji = {
    roles: string[];
    id: string;
    require_colons: boolean;
    animated: boolean;
    managed: boolean;
    user: { name: string; discriminator: string; id: string; avatar: string };
  } & EmojiBase;
  interface PartialEmoji {
    id?: string;
    name: string;
  }
  interface IntegrationOptions {
    expireBehavior: string;
    expireGracePeriod: string;
    enableEmoticons: string;
  }
  interface PartialRole {
    id?: number;
    color?: number;
    hoist?: boolean;
    name?: string;
    permissions?: number;
    position?: number;
    mentionable?: boolean;
  }
  interface PartialChannel {
    id?: number;
    type: number;
    permission_overwrites?: Overwrite[];
    name?: string;
    topic?: string;
    nsfw?: boolean;
    bitrate?: number;
    user_limit?: number;
    rate_limit_per_user?: number;
    parent_id?: number;
  }
  interface CreateGuildOptions {
    region?: string;
    icon?: string;
    verificationLevel?: number;
    defaultNotifications?: number;
    explicitContentFilter?: number;
    afkChannelID?: string;
    afkTimeout?: number;
    roles?: PartialRole[];
    channels?: PartialChannel[];
  }
  interface GuildOptions {
    name?: string;
    region?: string;
    icon?: string;
    verificationLevel?: number;
    defaultNotifications?: number;
    explicitContentFilter?: number;
    systemChannelID?: string;
    rulesChannelID?: string;
    publicUpdatesChannelID?: string;
    preferredLocale?: string;
    afkChannelID?: string;
    afkTimeout?: number;
    ownerID?: string;
    splash?: string;
    banner?: string;
    description?: string;
  }
  interface OldGuild {
    name: string;
    verificationLevel: 0 | 1 | 2 | 3 | 4;
    splash?: string;
    banner?: string;
    region: string;
    ownerID: string;
    icon: string;
    features: string[];
    emojis: (Omit<Emoji, "user" | "icon"> & { available: boolean })[];
    afkChannelID?: string;
    afkTimeout: number;
    mfaLevel: 0 | 1;
    large: boolean;
    maxPresences?: number;
    explicitContentFilter: 0 | 1 | 2;
    systemChannelID?: string;
  }
  interface MemberOptions {
    roles?: string[];
    nick?: string;
    mute?: boolean;
    deaf?: boolean;
    channelID?: string | null;
  }
  interface RoleOptions {
    name?: string;
    permissions?: number;
    color?: number;
    hoist?: boolean;
    mentionable?: boolean;
  }

  interface OldRole {
    color: number;
    hoist: boolean;
    managed: boolean;
    name: string;
    permissions: Permission;
    position: number;
    mentionable: boolean;
  }

  interface SearchOptions {
    sortBy?: string;
    sortOrder?: string;
    content?: string;
    authorID?: string;
    minID?: string;
    maxID?: string;
    limit?: number;
    offset?: number;
    contextSize?: number;
    has?: string;
    embedProviders?: string;
    embedTypes?: string;
    attachmentExtensions?: string;
    attachmentFilename?: string;
    channelIDs?: string[];
  }
  interface SearchResults {
    totalResults: number;
    results: (Message & { hit?: boolean })[][];
  }
  interface VoiceResourceOptions {
    inlineVolume?: boolean;
    voiceDataTimeout?: number;
    inputArgs?: string[];
    encoderArgs?: string[];
    format?: string;
    frameDuration?: number;
    frameSize?: number;
    sampleRate?: number;
  }
  type PossiblyUncachedMessage = Message | { id: string; channel: TextableChannel | { id: string } };
  interface RawPacket {
    op: number;
    t?: string;
    d?: any;
    s?: number;
  }
  type ReconnectDelayFunction = (lastDelay: number, attempts: number) => number;
  type IntentStrings = keyof Constants["Intents"];
  interface ClientOptions {
    autoreconnect?: boolean;
    compress?: boolean;
    connectionTimeout?: number;
    disableEvents?: { [s: string]: boolean };
    allowedMentions?: AllowedMentions;
    firstShardID?: number;
    getAllUsers?: boolean;
    guildCreateTimeout?: number;
    guildSubscriptions?: boolean;
    intents?: number | IntentStrings[];
    largeThreshold?: number;
    lastShardID?: number;
    maxShards?: number | "auto";
    messageLimit?: number;
    opusOnly?: boolean;
    restMode?: boolean;
    seedVoiceConnections?: boolean;
    defaultImageFormat?: string;
    defaultImageSize?: number;
    ws?: any;
    latencyThreshold?: number;
    agent?: HTTPSAgent;
    reconnectAttempts?: number;
    reconnectDelay?: ReconnectDelayFunction;
  }
  interface CommandClientOptions {
    defaultHelpCommand?: boolean;
    description?: string;
    ignoreBots?: boolean;
    ignoreSelf?: boolean;
    name?: string;
    owner?: string;
    prefix?: string | string[];
    defaultCommandOptions?: CommandOptions;
  }
  interface Hooks {
    preCommand?: (msg: Message, args: string[]) => void;
    postCheck?: (msg: Message, args: string[], checksPassed: boolean) => void;
    postExecution?: (msg: Message, args: string[], executionSuccess: boolean) => void;
    postCommand?: (msg: Message, args: string[], sent?: Message) => void;
  }
  type GenericCheckFunction<T> = (msg: Message) => T;
  interface CommandOptions {
    aliases?: string[];
    caseInsensitive?: boolean;
    deleteCommand?: boolean;
    argsRequired?: boolean;
    guildOnly?: boolean;
    dmOnly?: boolean;
    description?: string;
    fullDescription?: string;
    usage?: string;
    hooks?: Hooks;
    requirements?: {
      userIDs?: string[] | GenericCheckFunction<string[]>;
      roleIDs?: string[] | GenericCheckFunction<string[]>;
      roleNames?: string[] | GenericCheckFunction<string[]>;
      permissions?: { [s: string]: boolean } | GenericCheckFunction<{ [s: string]: boolean }>;
      custom?: GenericCheckFunction<void>;
    };
    cooldown?: number;
    cooldownExclusions?: {
      userIDs?: string[];
      guildIDs?: string[];
      channelIDs?: string[];
    };
    restartCooldown?: boolean;
    cooldownReturns?: number;
    cooldownMessage?: string | GenericCheckFunction<string>;
    invalidUsageMessage?: string | GenericCheckFunction<string>;
    permissionMessage?: string | GenericCheckFunction<string>;
    errorMessage?: string | GenericCheckFunction<string>;
    reactionButtons?: { emoji: string; type: string; response: CommandGenerator }[];
    reactionButtonTimeout?: number;
    defaultSubcommandOptions?: CommandOptions;
    hidden?: boolean;
  }
  type CommandGeneratorFunction = (
    msg: Message,
    args: string[]
  ) => Promise<MessageContent> | Promise<void> | MessageContent | void;
  type CommandGenerator = CommandGeneratorFunction | MessageContent | MessageContent[] | CommandGeneratorFunction[];

  export class ShardManager extends Collection<Shard> {
    constructor(client: Client);
    connect(shard: Shard): void;
    spawn(id: number): void;
    toString(): string;
    toJSON(props?: string[]): string;
  }

  interface CreateChannelOptions {
    topic?: string;
    nsfw?: boolean;
    bitrate?: number;
    userLimit?: number;
    rateLimitPerUser?: number;
    parentID?: string;
    permissionOverwrites?: Overwrite[];
    reason?: string;
  }

  interface RawRESTRequest {
    method: string;
    url: string;
    auth: boolean;
    body: unknown;
    file?: MessageFile;
    route: string;
    short: boolean;
    resp: IncomingMessage;
  }

  interface EventListeners<T> {
    (event: "ready" | "disconnect", listener: () => void): T;
    (event: "callCreate" | "callRing" | "callDelete", listener: (call: Call) => void): T;
    (event: "callUpdate", listener: (call: Call, oldCall: OldCall) => void): T;
    (event: "channelCreate" | "channelDelete", listener: (channel: AnyChannel) => void): T;
    (
      event: "channelPinUpdate",
      listener: (channel: TextableChannel, timestamp: number, oldTimestamp: number) => void
    ): T;
    (
      event: "channelRecipientAdd" | "channelRecipientRemove",
      listener: (channel: GroupChannel, user: User) => void
    ): T;
    (event: "channelUpdate", listener: (channel: AnyGuildChannel, oldChannel: OldGuildChannel) => void): T;
    (event: "friendSuggestionCreate", listener: (user: User, reasons: FriendSuggestionReasons) => void): T;
    (event: "friendSuggestionDelete", listener: (user: User) => void): T;
    (event: "guildAvailable" | "guildBanAdd" | "guildBanRemove", listener: (guild: Guild, user: User) => void): T;
    (event: "guildDelete" | "guildUnavailable" | "guildCreate", listener: (guild: Guild) => void): T;
    (event: "guildEmojisUpdate", listener: (guild: Guild, emojis: Emoji[], oldEmojis: Emoji[]) => void): T;
    (event: "guildMemberAdd", listener: (guild: Guild, member: Member) => void): T;
    (event: "guildMemberChunk", listener: (guild: Guild, members: Member[]) => void): T;
    (event: "guildMemberRemove", listener: (guild: Guild, member: Member | MemberPartial) => void): T;
    (
      event: "guildMemberUpdate",
      listener: (guild: Guild, member: Member, oldMember: { roles: string[]; nick?: string }) => void
    ): T;
    (event: "guildRoleCreate" | "guildRoleDelete", listener: (guild: Guild, role: Role) => void): T;
    (event: "guildRoleUpdate", listener: (guild: Guild, role: Role, oldRole: OldRole) => void): T;
    (event: "guildUpdate", listener: (guild: Guild, oldGuild: OldGuild) => void): T;
    (event: "hello", listener: (trace: string[], id: number) => void): T;
    (event: "inviteCreate" | "inviteDelete", listener: (guild: Guild, invite: GuildInvite) => void): T;
    (event: "messageCreate", listener: (message: Message) => void): T;
    (event: "messageDelete" | "messageReactionRemoveAll", listener: (message: PossiblyUncachedMessage) => void): T;
    (event: "messageReactionRemoveEmoji", listener: (message: PossiblyUncachedMessage, emoji: PartialEmoji) => void): T;
    (event: "messageDeleteBulk", listener: (messages: PossiblyUncachedMessage[]) => void): T;
    (
      event: "messageReactionAdd" | "messageReactionRemove",
      listener: (message: PossiblyUncachedMessage, emoji: Emoji, userID: string) => void
    ): T;
    (event: "messageUpdate", listener: (message: Message, oldMessage?: OldMessage) => void
    ): T;
    (event: "presenceUpdate", listener: (other: Member | Relationship, oldPresence?: Presence) => void): T;
    (event: "rawREST", listener: (request: RawRESTRequest) => void): T;
    (event: "rawWS" | "unknown", listener: (packet: RawPacket, id: number) => void): T;
    (event: "relationshipAdd" | "relationshipRemove", listener: (relationship: Relationship) => void): T;
    (
      event: "relationshipUpdate",
      listener: (relationship: Relationship, oldRelationship: { type: number }) => void
    ): T;
    (event: "typingStart", listener: (channel: TextableChannel, user: User) => void): T;
    (event: "unavailableGuildCreate", listener: (guild: UnavailableGuild) => void): T;
    (
      event: "userUpdate",
      listener: (user: User, oldUser: { username: string; discriminator: string; avatar?: string }) => void
    ): T;
    (event: "voiceChannelJoin", listener: (member: Member, newChannel: VoiceChannel) => void): T;
    (event: "voiceChannelLeave", listener: (member: Member, oldChannel: VoiceChannel) => void): T;
    (
      event: "voiceChannelSwitch",
      listener: (member: Member, newChannel: VoiceChannel, oldChannel: VoiceChannel) => void
    ): T;
    (event: "voiceStateUpdate", listener: (member: Member, oldState: OldVoiceState) => void): T;
    (event: "warn" | "debug", listener: (message: string, id: number) => void): T;
    (event: string, listener: Function): T;
  }

  interface ClientEvents<T> extends EventListeners<T> {
    (
      event: "shardDisconnect" | "error" | "shardPreReady" | "connect",
      listener: (err: Error, id: number) => void
    ): T;
    (event: "shardReady" | "shardResume", listener: (id: number) => void): T;
  }

  interface ShardEvents<T> extends EventListeners<T> {
    (event: "shardPreReady" | "connect", listener: (id: number) => void): T;
    (event: "disconnect", listener: (err: Error) => void): T;
    (event: "resume", listener: () => void): T;
  }

  interface ChannelFollow {
    channel_id: string;
    webhook_id: string;
  }

  export class Client extends EventEmitter {
    token?: string;
    gatewayURL?: string;
    bot?: boolean;
    options: ClientOptions;
    channelGuildMap: { [s: string]: string };
    shards: ShardManager;
    guilds: Collection<Guild>;
    privateChannelMap: { [s: string]: string };
    privateChannels: Collection<PrivateChannel>;
    groupChannels: Collection<GroupChannel>;
    voiceConnections: Collection<VoiceConnection>;
    guildShardMap: { [s: string]: number };
    startTime: number;
    unavailableGuilds: Collection<UnavailableGuild>;
    uptime: number;
    user: ExtendedUser;
    users: Collection<User>;
    relationships: Collection<Relationship>;
    userGuildSettings: { [s: string]: GuildSettings };
    userSettings: UserSettings;
    notes: { [s: string]: string };
    constructor(token: string, options?: ClientOptions);
    connect(): Promise<void>;
    getGateway(): Promise<{ url: string }>;
    getBotGateway(): Promise<{ url: string; shards: number; session_start_limit: { total: number; remaining: number; reset_after: number } }>;
    disconnect(options: { reconnect: boolean }): void;
    joinVoiceChannel(channelID: string, options?: { shared?: boolean; opusOnly?: boolean }): Promise<VoiceConnection>;
    leaveVoiceChannel(channelID: string): void;
    closeVoiceConnection(guildID: string): void;
    editAFK(afk: boolean): void;
    editStatus(status?: Status, game?: ActivityPartial<BotActivityType>): void;
    getChannel(channelID: string): AnyChannel;
    createChannel(guildID: string, name: string): Promise<TextChannel>;
    createChannel(
      guildID: string,
      name: string,
      type: 0,
      reason?: string,
      options?: CreateChannelOptions | string
    ): Promise<TextChannel>;
    createChannel(
      guildID: string,
      name: string,
      type: 2,
      reason?: string,
      options?: CreateChannelOptions | string
    ): Promise<VoiceChannel>;
    createChannel(
      guildID: string,
      name: string,
      type: 4,
      reason?: string,
      options?: CreateChannelOptions | string
    ): Promise<CategoryChannel>;
    createChannel(
      guildID: string,
      name: string,
      type?: number,
      reason?: string,
      options?: CreateChannelOptions | string
    ): Promise<unknown>;
    createChannel(
      guildID: string,
      name: string,
      type: 0,
      options?: CreateChannelOptions
    ): Promise<TextChannel>;
    createChannel(
      guildID: string,
      name: string,
      type: 2,
      options?: CreateChannelOptions
    ): Promise<VoiceChannel>;
    createChannel(
      guildID: string,
      name: string,
      type: 4,
      options?: CreateChannelOptions
    ): Promise<CategoryChannel>;
    createChannel(
      guildID: string,
      name: string,
      type?: number,
      options?: CreateChannelOptions
    ): Promise<unknown>;
    editChannel(
      channelID: string,
      options: {
        name?: string;
        icon?: string;
        ownerID?: string;
        topic?: string;
        bitrate?: number;
        userLimit?: number;
        rateLimitPerUser?: number;
        nsfw?: boolean;
        parentID?: string;
      },
      reason?: string
    ): Promise<GroupChannel | AnyGuildChannel>;
    editChannelPosition(channelID: string, position: number): Promise<void>;
    deleteChannel(channelID: string, reason?: string): Promise<void>;
    sendChannelTyping(channelID: string): Promise<void>;
    editChannelPermission(
      channelID: string,
      overwriteID: string,
      allow: number,
      deny: number,
      type: string,
      reason?: string
    ): Promise<void>;
    deleteChannelPermission(channelID: string, overwriteID: string, reason?: string): Promise<void>;
    getChannelInvites(channelID: string): Promise<ChannelInvite[]>;
    createChannelInvite(
      channelID: string,
      options?: { maxAge?: number; maxUses?: number; temporary?: boolean; unique?: boolean },
      reason?: string
    ): Promise<ChannelInvite>;
    getChannelWebhooks(channelID: string): Promise<Webhook[]>;
    getWebhook(webhookID: string, token?: string): Promise<Webhook>;
    createChannelWebhook(
      channelID: string,
      options: { name: string; avatar: string },
      reason?: string
    ): Promise<Webhook>;
    editWebhook(
      webhookID: string,
      options: { name?: string; avatar?: string },
      token?: string,
      reason?: string
    ): Promise<Webhook>;
    executeWebhook(webhookID: string, token: string, options: WebhookPayload & { wait: true }): Promise<Message>;
    executeWebhook(webhookID: string, token: string, options: WebhookPayload): Promise<void>;
    executeSlackWebhook(webhookID: string, token: string, options?: { wait?: boolean; auth?: boolean }): Promise<void>;
    deleteWebhook(webhookID: string, token?: string, reason?: string): Promise<void>;
    getGuildWebhooks(guildID: string): Promise<Webhook[]>;
    getGuildAuditLogs(guildID: string, limit?: number, before?: string, actionType?: number): Promise<GuildAuditLog>;
    createGuildEmoji(guildID: string, options: EmojiOptions, reason?: string): Promise<Emoji>;
    editGuildEmoji(
      guildID: string,
      emojiID: string,
      options: { name?: string; roles?: string[] },
      reason?: string
    ): Promise<Emoji>;
    deleteGuildEmoji(guildID: string, emojiID: string, reason?: string): Promise<void>;
    createRole(guildID: string, options?: RoleOptions | Role, reason?: string): Promise<Role>;
    editRole(guildID: string, roleID: string, options: RoleOptions, reason?: string): Promise<Role>; // TODO not all options are available?
    editRolePosition(guildID: string, roleID: string, position: number): Promise<void>;
    deleteRole(guildID: string, roleID: string, reason?: string): Promise<void>;
    getPruneCount(guildID: string, options?: GetPruneOptions): Promise<number>;
    pruneMembers(guildID: string, options?: PruneMemberOptions): Promise<number>;
    getVoiceRegions(guildID: string): Promise<VoiceRegion[]>;
    getInvite(inviteID: string, withCounts?: boolean): Promise<RESTInvite>;
    acceptInvite(inviteID: string): Promise<RESTInvite>;
    deleteInvite(inviteID: string, reason?: string): Promise<void>;
    getSelf(): Promise<ExtendedUser>;
    editSelf(options: { username?: string; avatar?: string }): Promise<ExtendedUser>;
    getDMChannel(userID: string): Promise<PrivateChannel>;
    createGroupChannel(userIDs: string[]): Promise<GroupChannel>;
    getMessage(channelID: string, messageID: string): Promise<Message>;
    getMessages(
      channelID: string,
      limit?: number,
      before?: string,
      after?: string,
      around?: string
    ): Promise<Message[]>;
    getPins(channelID: string): Promise<Message[]>;
    createMessage<T extends Textable = TextableChannel>(channelID: string, content: MessageContent, file?: MessageFile | MessageFile[]): Promise<Message<T>>;
    editMessage(channelID: string, messageID: string, content: MessageContent): Promise<Message>;
    pinMessage(channelID: string, messageID: string): Promise<void>;
    unpinMessage(channelID: string, messageID: string): Promise<void>;
    getMessageReaction(
      channelID: string,
      messageID: string,
      reaction: string,
      limit?: number,
      before?: string,
      after?: string
    ): Promise<User[]>;
    addMessageReaction(channelID: string, messageID: string, reaction: string, userID?: string): Promise<void>;
    removeMessageReaction(channelID: string, messageID: string, reaction: string, userID?: string): Promise<void>;
    removeMessageReactions(channelID: string, messageID: string): Promise<void>;
    removeMessageReactionEmoji(channelID: string, messageID: string, reaction: string): Promise<void>;
    deleteMessage(channelID: string, messageID: string, reason?: string): Promise<void>;
    deleteMessages(channelID: string, messageIDs: string[], reason?: string): Promise<void>;
    purgeChannel(
      channelID: string,
      limit?: number,
      filter?: (m: Message) => boolean,
      before?: string,
      after?: string,
      reason?: string
    ): Promise<number>;
    crosspostMessage(channelID: string, messageID: string): Promise<Message>;
    followChannel(channelID: string, webhookChannelID: string): Promise<ChannelFollow>;
    getGuildEmbed(guildID: string): Promise<GuildEmbed>;
    getGuildPreview(guildID: string): Promise<GuildPreview>;
    getGuildIntegrations(guildID: string): Promise<GuildIntegration[]>;
    editGuildIntegration(guildID: string, integrationID: string, options: IntegrationOptions): Promise<void>;
    deleteGuildIntegration(guildID: string, integrationID: string): Promise<void>;
    syncGuildIntegration(guildID: string, integrationID: string): Promise<void>;
    getGuildInvites(guildID: string): Promise<ChannelInvite[]>;
    getGuildVanity(guildID: string): Promise<{ code?: string; uses?: number }>;
    banGuildMember(guildID: string, userID: string, deleteMessageDays?: number, reason?: string): Promise<void>;
    unbanGuildMember(guildID: string, userID: string, reason?: string): Promise<void>;
    createGuild(name: string, options?: CreateGuildOptions): Promise<Guild>;
    editGuild(guildID: string, options: GuildOptions, reason?: string): Promise<Guild>;
    getGuildBans(guildID: string): Promise<{ reason?: string; user: User }[]>;
    getGuildBan(guildID: string, userID: string): Promise<{ reason?: string; user: User }>;
    editGuildMember(guildID: string, memberID: string, options: MemberOptions, reason?: string): Promise<void>;
    addGuildMemberRole(guildID: string, memberID: string, roleID: string, reason?: string): Promise<void>;
    removeGuildMemberRole(guildID: string, memberID: string, roleID: string, reason?: string): Promise<void>;
    editNickname(guildID: string, nick: string, reason?: string): Promise<void>;
    kickGuildMember(guildID: string, userID: string, reason?: string): Promise<void>;
    deleteGuild(guildID: string): Promise<void>;
    leaveGuild(guildID: string): Promise<void>;
    getOAuthApplication(appID?: string): Promise<OAuthApplicationInfo>;
    addRelationship(userID: string, block?: boolean): Promise<void>;
    removeRelationship(userID: string): Promise<void>;
    addGroupRecipient(groupID: string, userID: string): Promise<void>;
    removeGroupRecipient(groupID: string, userID: string): Promise<void>;
    getUserProfile(userID: string): Promise<UserProfile>;
    editUserNote(userID: string, note: string): Promise<void>;
    deleteUserNote(userID: string): Promise<void>;
    getSelfConnections(): Promise<Connection[]>;
    editSelfConnection(
      platform: string,
      id: string,
      data: { friendSync: boolean; visibility: number }
    ): Promise<Connection>;
    deleteSelfConnection(platform: string, id: string): Promise<void>;
    getSelfSettings(): Promise<UserSettings>;
    editSelfSettings(data: UserSettings): Promise<UserSettings>;
    getSelfMFACodes(
      password: string,
      regenerate?: boolean
    ): Promise<{ backup_codes: { code: string; consumed: boolean }[] }>;
    enableSelfMFATOTP(
      secret: string,
      code: string
    ): Promise<{ token: string; backup_codes: { code: string; consumed: boolean }[] }>;
    disableSelfMFATOTP(code: string): Promise<{ token: string }>;
    getSelfBilling(): Promise<{
      premium_subscription?: {
        status: number;
        ended_at?: string;
        canceled_at?: string;
        created_at: string;
        current_period_end?: string;
        current_period_start?: string;
        plan: string;
      };
      payment_source?: {
        type: string;
        brand: string;
        invalid: boolean;
        last_4: number;
        expires_year: number;
        expires_month: number;
      };
      payment_gateway?: string;
    }>;
    getSelfPayments(): Promise<
      {
        status: number;
        amount_refunded: number;
        description: string;
        created_at: string; // date
        currency: string;
        amount: number;
      }[]
    >;
    addSelfPremiumSubscription(token: string, plan: string): Promise<void>;
    deleteSelfPremiumSubscription(): Promise<void>;
    getRESTChannel(channelID: string): Promise<AnyChannel>;
    getRESTGuild(guildID: string, withCounts?: boolean): Promise<Guild>;
    getRESTGuilds(limit?: number, before?: string, after?: string): Promise<Guild[]>;
    getRESTGuildChannels(guildID: string): Promise<AnyGuildChannel[]>;
    getRESTGuildEmojis(guildID: string): Promise<Emoji[]>;
    getRESTGuildEmoji(guildID: string, emojiID: string): Promise<Emoji>;
    getRESTGuildMembers(guildID: string, limit?: number, after?: string): Promise<Member[]>;
    getRESTGuildMember(guildID: string, memberID: string): Promise<Member>;
    getRESTGuildRoles(guildID: string): Promise<Role[]>;
    getRESTUser(userID: string): Promise<User>;
    searchGuildMembers(guildID: string, query: string, limit?: number): Promise<Member[]>;
    searchChannelMessages(channelID: string, query: SearchOptions): Promise<SearchResults>;
    searchGuildMessages(guildID: string, query: SearchOptions): Promise<SearchResults>;
    on: ClientEvents<this>;
    toString(): string;
    toJSON(props?: string[]): JSONCache;
  }

  export class VoiceConnection extends EventEmitter implements SimpleJSON {
    id: string;
    channelID: string;
    connecting: boolean;
    ready: boolean;
    playing: boolean;
    paused: boolean;
    volume: number;
    current?: {
      startTime: number;
      playTime: number;
      pausedTimestamp?: number;
      pausedTime?: number;
      options: VoiceResourceOptions;
    };
    constructor(id: string, options?: { shard?: Shard; shared?: boolean; opusOnly?: boolean });
    pause(): void;
    play(resource: ReadableStream | string, options?: VoiceResourceOptions): void;
    receive(type: string): VoiceDataStream;
    resume(): void;
    setVolume(volume: number): void;
    stopPlaying(): void;
    switchChannel(channelID: string): void;
    updateVoiceState(selfMute: boolean, selfDeaf: boolean): void;
    on(event: "debug" | "warn", listener: (message: string) => void): this;
    on(event: "error" | "disconnect", listener: (err: Error) => void): this;
    on(event: "pong", listener: (latency: number) => void): this;
    on(event: "speakingStart", listener: (userID: string) => void): this;
    on(event: "speakingStop", listener: (userID: string) => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "userDisconnect", listener: (userID: string) => void): this;
    toString(): string;
    toJSON(props?: string[]): JSONCache;
  }

  export class SharedStream extends EventEmitter {
    playing: boolean;
    ended: boolean;
    volume: number;
    speaking: boolean;
    current?: {
      startTime: number;
      playTime: number;
      pausedTimestamp?: number;
      pausedTime?: number;
      options: VoiceResourceOptions;
    };
    add(connection: VoiceConnection): void;
    play(resource: ReadableStream | string, options: VoiceResourceOptions): void;
    remove(connection: VoiceConnection): void;
    setVolume(volume: number): void;
    stopPlaying(): void;
  }

  export class VoiceDataStream extends EventEmitter {
    type: string;
    constructor(type: string);
    on(event: "data", listener: (data: Buffer, userID: string, timestamp: number, sequence: number) => void): this;
  }

  export class VoiceConnectionManager<T extends VoiceConnection> extends Collection<T> implements SimpleJSON {
    // owo an undocumented class
    constructor(vcObject: new () => T);
    join(guildID: string, channelID: string, options: VoiceResourceOptions): Promise<VoiceConnection>;
    leave(guildID: string): void;
    switch(guildID: string, channelID: string): void;
    toString(): string;
    toJSON(props?: string[]): JSONCache;
  }

  class Base implements SimpleJSON {
    id: string;
    createdAt: number;
    constructor(id: string);
    inspect(): this;
    toJSON(props?: string[]): JSONCache;
  }

  export class Bucket {
    tokens: number;
    lastReset: number;
    lastSend: number;
    tokenLimit: number;
    interval: number;
    constructor(tokenLimit: number, interval: number, options: { reservedTokens: number; latencyRef: { latency: number } });
    queue(func: Function, priority?: boolean): void;
  }

  export class Collection<T extends { id: string | number }> extends Map<string | number, T> {
    baseObject: new (...args: any[]) => T;
    limit?: number;
    constructor(baseObject: new (...args: any[]) => T, limit?: number);
    add(obj: T, extra?: any, replace?: boolean): T;
    find(func: (i: T) => boolean): T | undefined;
    random(): T;
    filter(func: (i: T) => boolean): T[];
    map<R>(func: (i: T) => R): R[];
    reduce<U>(func: (accumulator: U, val: T) => U, initialValue?: U): U;
    every(func: (i: T) => boolean): boolean;
    some(func: (i: T) => boolean): boolean;
    update(obj: T, extra?: any, replace?: boolean): T;
    remove(obj: T | { id: string }): T;
  }

  export class Call extends Base {
    id: string;
    createdAt: number;
    channel: GroupChannel;
    voiceStates: Collection<VoiceState>;
    participants: string[];
    endedTimestamp?: number;
    ringing?: string[];
    region?: string;
    unavailable: boolean;
    constructor(data: BaseData, channel: GroupChannel);
  }

  export class Channel extends Base {
    id: string;
    mention: string;
    type: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    client: Client;
    createdAt: number;
    constructor(data: BaseData);
    static from(data: object, client: Client): AnyChannel;
  }

  export class ExtendedUser extends User {
    email: string;
    verified: boolean;
    mfaEnabled: boolean;
  }

  interface FetchMembersOptions {
    presences?: boolean;
    query?: string;
    userIDs?: string[];
    limit?: number;
    timeout?: number;
  }

  export class Guild extends Base {
    id: string;
    createdAt: number;
    name: string;
    verificationLevel: number;
    region: string;
    icon?: string;
    afkChannelID?: string;
    systemChannelID?: string;
    afkTimeout: number;
    defaultNotifications: number;
    mfaLevel: number;
    joinedAt: number;
    ownerID: string;
    splash?: string;
    splashURL: string | null;
    banner?: string;
    bannerURL: string | null;
    premiumTier: number;
    premiumSubscriptionCount?: number;
    vanityURL?: string;
    preferredLocale: string;
    description?: string;
    maxMembers: number;
    unavailable: boolean;
    large: boolean;
    maxPresences: number;
    channels: Collection<AnyGuildChannel>;
    members: Collection<Member>;
    memberCount: number;
    roles: Collection<Role>;
    shard: Shard;
    features: string[];
    emojis: Emoji[];
    iconURL?: string;
    explicitContentFilter: number;
    publicUpdatesChannelID: string;
    rulesChannelID: string;
    maxVideoChannelUsers?: number;
    widgetEnabled?: boolean | null;
    widgetChannelID?: string | null;
    approximateMemberCount?: number;
    approximatePresenceCount?: number;
    constructor(data: BaseData, client: Client);
    fetchAllMembers(timeout?: number): Promise<number>;
    fetchMembers(options?: FetchMembersOptions): Promise<Member[]>;
    dynamicIconURL(format?: string, size?: number): string;
    dynamicBannerURL(format?: string, size?: number): string;
    dynamicSplashURL(format?: string, size?: number): string;
    createChannel(name: string): Promise<TextChannel>;
    createChannel(name: string, type: 0, reason?: string, options?: CreateChannelOptions | string): Promise<TextChannel>;
    createChannel(name: string, type: 2, reason?: string, options?: CreateChannelOptions | string): Promise<VoiceChannel>;
    createChannel(name: string, type: 4, reason?: string, options?: CreateChannelOptions | string): Promise<CategoryChannel>;
    createChannel(name: string, type?: number, reason?: string, options?: CreateChannelOptions | string): Promise<unknown>;
    createChannel(name: string, type: 0, options?: CreateChannelOptions): Promise<TextChannel>;
    createChannel(name: string, type: 2, options?: CreateChannelOptions): Promise<VoiceChannel>;
    createChannel(name: string, type: 4, options?: CreateChannelOptions): Promise<CategoryChannel>;
    createChannel(name: string, type?: number, options?: CreateChannelOptions): Promise<unknown>;
    createEmoji(options: { name: string; image: string; roles?: string[] }, reason?: string): Promise<Emoji>;
    editEmoji(emojiID: string, options: { name: string; roles?: string[] }, reason?: string): Promise<Emoji>;
    deleteEmoji(emojiID: string, reason?: string): Promise<void>;
    createRole(options: RoleOptions | Role, reason?: string): Promise<Role>;
    getPruneCount(options?: GetPruneOptions): Promise<number>;
    pruneMembers(options?: PruneMemberOptions): Promise<number>;
    getRESTChannels(): Promise<AnyGuildChannel[]>;
    getRESTEmojis(): Promise<Emoji[]>;
    getRESTEmoji(emojiID: string): Promise<Emoji>;
    getRESTMembers(limit?: number, after?: string): Promise<Member[]>;
    getRESTMember(memberID: string): Promise<Member>;
    getRESTRoles(): Promise<Role[]>;
    getEmbed(): Promise<GuildEmbed>;
    getVoiceRegions(): Promise<VoiceRegion[]>;
    leaveVoiceChannel(): void;
    editRole(roleID: string, options: RoleOptions): Promise<Role>;
    deleteRole(roleID: string): Promise<void>;
    getAuditLogs(limit?: number, before?: string, actionType?: number): Promise<GuildAuditLog>;
    getIntegrations(): Promise<GuildIntegration>;
    editIntegration(integrationID: string, options: IntegrationOptions): Promise<void>;
    syncIntegration(integrationID: string): Promise<void>;
    deleteIntegration(integrationID: string): Promise<void>;
    getInvites(): Promise<ChannelInvite[]>;
    getVanity(): Promise<{ code?: string; uses?: number }>;
    editMember(memberID: string, options: MemberOptions, reason?: string): Promise<void>;
    addMemberRole(memberID: string, roleID: string, reason?: string): Promise<void>;
    removeMemberRole(memberID: string, roleID: string, reason?: string): Promise<void>;
    kickMember(userID: string, reason?: string): Promise<void>;
    banMember(userID: string, deleteMessageDays?: number, reason?: string): Promise<void>;
    unbanMember(userID: string, reason?: string): Promise<void>;
    edit(options: GuildOptions, reason?: string): Promise<Guild>;
    delete(): Promise<void>;
    leave(): Promise<void>;
    getBans(): Promise<{ reason?: string; user: User }[]>;
    getBan(userID: string): Promise<{ reason?: string; user: User }>;
    editNickname(nick: string): Promise<void>;
    getWebhooks(): Promise<Webhook[]>;
    searchMembers(query: string, limit?: number): Promise<Member[]>;
  }

  export class GuildAuditLogEntry extends Base {
    id: string;
    guild: Guild;
    actionType: number;
    reason?: string;
    user: User;
    targetID: string;
    target?: Guild | AnyGuildChannel | Member | Role | any;
    before?: any;
    after?: any;
    count?: number;
    channel?: AnyGuildChannel;
    deleteMemberDays?: number;
    membersRemoved?: number;
    member?: Member | any;
    role?: Role | any;
    constructor(data: BaseData, guild: Guild);
  }

  export class GuildChannel extends Channel {
    type: 0 | 2 | 4 | 5 | 6;
    guild: Guild;
    parentID?: string;
    name: string;
    position: number;
    permissionOverwrites: Collection<PermissionOverwrite>;
    nsfw: boolean;
    constructor(data: BaseData, guild: Guild);
    getInvites(): Promise<ChannelInvite[]>;
    createInvite(options?: CreateInviteOptions, reason?: string): Promise<ChannelInvite>;
    permissionsOf(memberID: string): Permission;
    edit(
      options: {
        name?: string;
        topic?: string;
        bitrate?: number;
        userLimit?: number;
        rateLimitPerUser?: number;
        nsfw?: boolean;
        parentID?: string;
      },
      reason?: string
    ): Promise<this>;
    editPosition(position: number): Promise<void>;
    delete(reason?: string): Promise<void>;
    editPermission(
      overwriteID: string,
      allow: number,
      deny: number,
      type: "role" | "member",
      reason?: string
    ): Promise<PermissionOverwrite>;
    deletePermission(overwriteID: string, reason?: string): Promise<void>;
  }

  export interface GuildTextable extends Textable {
    topic?: string;
    rateLimitPerUser: number;
    lastPinTimestamp?: number;
    getWebhooks(): Promise<Webhook[]>;
    createWebhook(options: { name: string; avatar: string }, reason?: string): Promise<Webhook>;
    sendTyping(): Promise<void>;
    purge(limit: number, filter?: (message: Message<GuildTextable>) => boolean, before?: string, after?: string, reason?: string): Promise<number>;
    deleteMessages(messageIDs: string[], reason?: string): Promise<void>;
    removeMessageReactions(messageID: string): Promise<void>;
    removeMessageReactionEmoji(messageID: string, reaction: string): Promise<void>;
  }

  export class CategoryChannel extends GuildChannel {
    type: 4;
    channels: Collection<Exclude<AnyGuildChannel, CategoryChannel>>;
    edit(
      options: {
        name?: string;
        topic?: string;
        bitrate?: number;
        userLimit?: number;
        rateLimitPerUser?: number;
        nsfw?: boolean;
        parentID?: string;
      },
      reason?: string
    ): Promise<this>;
  }

  export class StoreChannel extends GuildChannel {
    type: 6;
    edit(
      options: {
        name?: string;
        topic?: string;
        bitrate?: number;
        userLimit?: number;
        rateLimitPerUser?: number;
        nsfw?: boolean;
        parentID?: string;
      },
      reason?: string
    ): Promise<this>;
  }

  export class TextChannel extends GuildChannel implements GuildTextable, Invitable {
    type: 0 | 5;
    rateLimitPerUser: number;
    topic?: string;
    lastMessageID: string;
    messages: Collection<Message<TextChannel>>;
    lastPinTimestamp?: number;
    constructor(data: BaseData, guild: Guild, messageLimit: number);
    getInvites(): Promise<ChannelInvite[]>;
    createInvite(options?: CreateInviteOptions, reason?: string): Promise<ChannelInvite>;
    getWebhooks(): Promise<Webhook[]>;
    createWebhook(options: { name: string; avatar: string }, reason?: string): Promise<Webhook>;
    sendTyping(): Promise<void>;
    getMessage(messageID: string): Promise<Message<TextChannel>>;
    getMessages(limit?: number, before?: string, after?: string, around?: string): Promise<Message<TextChannel>[]>;
    getPins(): Promise<Message<TextChannel>[]>;
    createMessage(content: MessageContent, file?: MessageFile | MessageFile[]): Promise<Message<TextChannel>>;
    editMessage(messageID: string, content: MessageContent): Promise<Message<TextChannel>>;
    pinMessage(messageID: string): Promise<void>;
    unpinMessage(messageID: string): Promise<void>;
    edit(
      options: {
        name?: string;
        topic?: string;
        bitrate?: number;
        userLimit?: number;
        rateLimitPerUser?: number;
        nsfw?: boolean;
        parentID?: string;
      },
      reason?: string
    ): Promise<this>;
    getMessageReaction(
      messageID: string,
      reaction: string,
      limit?: number,
      before?: string,
      after?: string
    ): Promise<User[]>;
    addMessageReaction(messageID: string, reaction: string, userID?: string): Promise<void>;
    removeMessageReaction(messageID: string, reaction: string, userID?: string): Promise<void>;
    removeMessageReactions(messageID: string): Promise<void>;
    removeMessageReactionEmoji(messageID: string, reaction: string): Promise<void>;
    purge(limit: number, filter?: (message: Message<TextChannel>) => boolean, before?: string, after?: string, reason?: string): Promise<number>;
    deleteMessage(messageID: string, reason?: string): Promise<void>;
    deleteMessages(messageIDs: string[], reason?: string): Promise<void>;
    unsendMessage(messageID: string): Promise<void>;
  }

  // News channel rate limit is always 0
  export class NewsChannel extends TextChannel {
    type: 5;
    rateLimitPerUser: 0;
    messages: Collection<Message<NewsChannel>>;
    crosspostMessage(messageID: string): Promise<Message<NewsChannel>>;
    follow(webhookChannelID: string): Promise<ChannelFollow>;
    getMessage(messageID: string): Promise<Message<NewsChannel>>;
    getMessages(limit?: number, before?: string, after?: string, around?: string): Promise<Message<NewsChannel>[]>;
    getPins(): Promise<Message<NewsChannel>[]>;
    createMessage(content: MessageContent, file?: MessageFile | MessageFile[]): Promise<Message<NewsChannel>>;
    editMessage(messageID: string, content: MessageContent): Promise<Message<NewsChannel>>;
    purge(limit: number, filter?: (message: Message<NewsChannel>) => boolean, before?: string, after?: string, reason?: string): Promise<number>;
  }

  export class VoiceChannel extends GuildChannel implements Invitable {
    type: 2;
    bitrate?: number;
    userLimit?: number;
    voiceMembers: Collection<Member>;
    getInvites(): Promise<ChannelInvite[]>;
    createInvite(options?: CreateInviteOptions, reason?: string): Promise<ChannelInvite>;
    join(options: VoiceResourceOptions): Promise<VoiceConnection>;
    leave(): void;
  }

  export class GuildIntegration extends Base {
    id: string;
    createdAt: number;
    name: string;
    type: string;
    roleID: string;
    user: User;
    account: { id: string; name: string };
    enabled: boolean;
    syncing: boolean;
    expireBehavior: number;
    expireGracePeriod: number;
    enableEmoticons: boolean;
    subscriberCount: number;
    syncedAt: number;
    constructor(data: BaseData, guild: Guild);
    edit(options: { expireBehavior: string; expireGracePeriod: string; enableEmoticons: string }): Promise<void>;
    delete(): Promise<void>;
    sync(): Promise<void>;
  }

  export class GuildPreview extends Base {
    id: string;
    name: string;
    icon: string | null;
    iconURL: string | null;
    description: string | null;
    splash: string | null;
    splashURL: string | null;
    discoverySplash: string | null;
    features: string[];
    approximateMemberCount: number;
    approximatePresenceCount: number;
    emojis: Emoji[];
    dynamicIconURL(format?: string, size?: number): string;
    dynamicSplashURL(format?: string, size?: number): string;
  }

  type RESTInvite = RESTChannelInvite | RESTPrivateInvite;
  type AnyInvite = RESTInvite | ChannelInvite;
  interface BaseInvite {
    code: string;
    channel: {
      id: string;
      name?: string;
      type: 0 | 2 | 3 | 4 | 5 | 6;
    };
    inviter?: User;
    delete(reason?: string): Promise<void>;
    toJSON(props?: string[]): JSONCache;
  }

  // when fetched from /channels/:id/invites
  interface GuildInvite extends BaseInvite {
    channel: {
      id: string;
      name: string;
      type: 0 | 2 | 4 | 5 | 6;
    };
    guild: {
      id: string;
      name: string;
      splash?: string;
      banner?: string;
      description?: string;
      icon?: string;
      features: string[];
      verificationLevel?: 0 | 1 | 2 | 3 | 4;
      vanityUrlCode?: string;
    };
  }

  // when fetched from /channels/:id/invites
  interface ChannelInvite extends GuildInvite {
    uses?: number;
    maxUses?: number;
    maxAge?: number;
    temporary?: boolean;
    createdAt?: number;
  }

  // when fetched from /invites/:code (guild invite)
  interface RESTChannelInvite extends GuildInvite {
    presenceCount?: number;
    memberCount?: number;
  }

  // when fetched from /invites/:code (dm group invite)
  interface RESTPrivateInvite extends BaseInvite {
    channel: {
      id: string;
      name?: string;
      icon?: string;
      type: 3;
    };
  }

  interface GetPruneOptions {
    days?: number;
    includeRoles?: string[];
  }

  interface PruneMemberOptions extends GetPruneOptions {
    reason?: string;
  }

  type Status = "online" | "idle" | "dnd" | "offline";

  interface ClientStatus {
    web: Status;
    desktop: Status;
    mobile: Status;
  }

  export class Member extends Base implements Presence {
    id: string;
    mention: string;
    guild: Guild;
    joinedAt: number;
    premiumSince: number;
    voiceState: VoiceState;
    nick?: string;
    roles: string[];
    user: User;
    permission: Permission;
    defaultAvatar: string;
    createdAt: number;
    bot: boolean;
    username: string;
    discriminator: string;
    avatar?: string;
    defaultAvatarURL: string;
    avatarURL: string;
    staticAvatarURL: string;
    game?: Activity;
    status?: Status;
    clientStatus?: ClientStatus;
    activities?: Activity[];
    constructor(data: BaseData, guild: Guild, client: Client);
    edit(options: MemberOptions, reason?: string): Promise<void>;
    addRole(roleID: string, reason?: string): Promise<void>;
    removeRole(roleID: string, reason?: string): Promise<void>;
    kick(reason?: string): Promise<void>;
    ban(deleteMessageDays?: number, reason?: string): Promise<void>;
    unban(reason?: string): Promise<void>;
  }

  export class Message<T extends Textable = TextableChannel> extends Base {
    id: string;
    createdAt: number;
    channel: T;
    guildID?: string;
    timestamp: number;
    type: number;
    author: User;
    member?: Member;
    mentions: User[];
    content: string;
    cleanContent?: string;
    roleMentions: string[];
    channelMentions: string[];
    editedTimestamp?: number;
    tts: boolean;
    mentionEveryone: boolean;
    attachments: Attachment[];
    embeds: Embed[];
    reactions: { [s: string]: any; count: number; me: boolean };
    webhookID?: string;
    prefix?: string;
    command?: Command;
    pinned: boolean;
    constructor(data: BaseData, client: Client);
    edit(content: MessageContent): Promise<Message<T>>;
    pin(): Promise<void>;
    unpin(): Promise<void>;
    getReaction(reaction: string, limit?: number, before?: string, after?: string): Promise<User[]>;
    addReaction(reaction: string, userID?: string): Promise<void>;
    removeReaction(reaction: string, userID?: string): Promise<void>;
    removeReactions(): Promise<void>;
    removeMessageReactionEmoji(reaction: string): Promise<void>;
    delete(reason?: string): Promise<void>;
    crosspost(): Promise<Message<T>>;
  }

  export class Permission {
    allow: number;
    deny: number;
    json: { [s: string]: boolean };
    constructor(allow: number, deny: number);
    has(permission: string): boolean;
  }

  interface Overwrite {
    id: string;
    type: "role" | "member";
    allow: number;
    deny: number;
  }

  export class PermissionOverwrite extends Permission {
    id: string;
    createdAt: number;
    type: string;
    constructor(data: { allow: number; deny: number });
  }

  export class PrivateChannel extends Channel implements Textable {
    type: 1 | 3;
    recipient: User;
    lastMessageID: string;
    messages: Collection<Message<PrivateChannel>>;
    ring(recipient: string[]): void;
    syncCall(): void;
    leave(): Promise<void>;
    sendTyping(): Promise<void>;
    getMessage(messageID: string): Promise<Message<PrivateChannel>>;
    getMessages(limit?: number, before?: string, after?: string, around?: string): Promise<Message<PrivateChannel>[]>;
    getPins(): Promise<Message<PrivateChannel>[]>;
    createMessage(content: MessageContent, file?: MessageFile | MessageFile[]): Promise<Message<PrivateChannel>>;
    editMessage(messageID: string, content: MessageContent): Promise<Message<PrivateChannel>>;
    pinMessage(messageID: string): Promise<void>;
    unpinMessage(messageID: string): Promise<void>;
    getMessageReaction(
      messageID: string,
      reaction: string,
      limit?: number,
      before?: string,
      after?: string
    ): Promise<User[]>;
    addMessageReaction(messageID: string, reaction: string, userID?: string): Promise<void>;
    removeMessageReaction(messageID: string, reaction: string, userID?: string): Promise<void>;
    deleteMessage(messageID: string, reason?: string): Promise<void>;
    unsendMessage(messageID: string): Promise<void>;
  }

  export class GroupChannel extends PrivateChannel {
    type: 3;
    recipients: Collection<User>;
    name: string;
    icon?: string;
    iconURL?: string;
    ownerID: string;
    edit(options: { name?: string; icon?: string; ownerID?: string }): Promise<GroupChannel>;
    addRecipient(userID: string): Promise<void>;
    removeRecipient(userID: string): Promise<void>;
    dynamicIconURL(format?: string, size?: number): string;
  }

  export class Relationship implements Presence {
    id: string;
    user: User;
    type: number;
    game?: Activity;
    status: Status;
    clientStatus?: ClientStatus;
    activities?: Activity[];
    constructor(data: BaseData, client: Client);
  }

  export class Role extends Base {
    id: string;
    createdAt: number;
    guild: Guild;
    mention: string;
    name: string;
    mentionable: boolean;
    managed: boolean;
    hoist: boolean;
    color: number;
    position: number;
    permissions: Permission;
    json: { [s: string]: boolean };
    constructor(data: BaseData, guild: Guild);
    edit(options: RoleOptions, reason?: string): Promise<Role>;
    editPosition(position: number): Promise<void>;
    delete(reason?: string): Promise<void>;
  }

  export class UnavailableGuild extends Base {
    id: string;
    createdAt: number;
    unavailable: boolean;
    shard: Shard;
    constructor(data: BaseData, client: Client);
  }

  export class User extends Base {
    id: string;
    mention: string;
    defaultAvatar: string;
    createdAt: number;
    bot: boolean;
    username: string;
    discriminator: string;
    avatar?: string;
    defaultAvatarURL: string;
    avatarURL: string;
    staticAvatarURL: string;
    system: boolean;
    publicFlags?: number;
    constructor(data: BaseData, client: Client);
    dynamicAvatarURL(format?: string, size?: number): string;
    getDMChannel(): Promise<PrivateChannel>;
    addRelationship(block?: boolean): Promise<void>;
    removeRelationship(): Promise<void>;
    getProfile(): Promise<UserProfile>;
    editNote(note: string): Promise<void>;
    deleteNote(): Promise<void>;
  }

  export class VoiceState extends Base implements NestedJSON {
    id: string;
    createdAt: number;
    sessionID?: string;
    channelID?: string;
    mute: boolean;
    deaf: boolean;
    suppress: boolean;
    selfMute: boolean;
    selfDeaf: boolean;
    selfStream: boolean;
    constructor(data: BaseData);
    toJSON(arg?: any, cache?: (string | any)[]): JSONCache;
  }

  export class Shard extends EventEmitter {
    id: number;
    connecting: boolean;
    ready: boolean;
    discordServerTrace?: string[];
    status: "disconnected" | "connecting" | "handshaking" | "ready" | "resuming";
    lastHeartbeatReceived: number;
    lastHeartbeatSent: number;
    latency: number;
    client: Client;
    presence: Presence;
    constructor(id: number, client: Client);
    connect(): void;
    disconnect(options?: { reconnect: boolean }): void;
    editAFK(afk: boolean): void;
    editStatus(status?: Status, game?: ActivityPartial<BotActivityType>): void;
    on: ShardEvents<this>;
    toString(): string;
    toJSON(props?: string[]): JSONCache;
    sendWS(op: number, _data: object, priority: boolean): void;
  }

  export class Command {
    subcommands: { [s: string]: Command };
    subcommandAliases: { [alias: string]: Command };
    label: string;
    parentCommand?: Command;
    description: string;
    fullDescription: string;
    usage: string;
    aliases: string[];
    caseInsensitive: boolean;
    hooks: Hooks;
    requirements: {
      userIDs?: string[] | GenericCheckFunction<string[]>;
      roleIDs?: string[] | GenericCheckFunction<string[]>;
      roleNames?: string[] | GenericCheckFunction<string[]>;
      permissions?: { [s: string]: boolean } | GenericCheckFunction<{ [s: string]: boolean }>;
      custom?: GenericCheckFunction<void>;
    };
    deleteCommand: boolean;
    argsRequired: boolean;
    guildOnly: boolean;
    dmOnly: boolean;
    cooldown: number;
    cooldownExclusions: {
      userIDs?: string[];
      guildIDs?: string[];
      channelIDs?: string[];
    };
    restartCooldown: boolean;
    cooldownReturns: number;
    cooldownMessage: string | boolean | GenericCheckFunction<string>;
    invalidUsageMessage: string | boolean | GenericCheckFunction<string>;
    permissionMessage: string | boolean | GenericCheckFunction<string>;
    errorMessage: string | GenericCheckFunction<string>;
    reactionButtons: null | {
      emoji: string;
      type: string;
      response: CommandGenerator;
      execute?: () => string;
      responses?: (() => string)[];
    }[];
    reactionButtonTimeout: number;
    defaultSubcommandOptions: CommandOptions;
    hidden: boolean;
    constructor(label: string, generate: CommandGenerator, options?: CommandOptions);
    registerSubcommandAlias(alias: string, label: string): void;
    registerSubcommand(label: string, generator: CommandGenerator, options?: CommandOptions): Command;
    unregisterSubcommand(label: string): void;
    toString(): string;
  }

  export class CommandClient extends Client {
    commands: { [s: string]: Command };
    constructor(token: string, options?: ClientOptions, commandOptions?: CommandClientOptions);
    onMessageCreate(msg: Message): void;
    registerGuildPrefix(guildID: string, prefix: string[] | string): void;
    registerCommandAlias(alias: string, label: string): void;
    registerCommand(label: string, generator: CommandGenerator, options?: CommandOptions): Command;
    unregisterCommand(label: string): void;
    toString(): string;
  }
}

export = Eris;
