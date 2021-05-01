import { EventEmitter } from "events";
import { Duplex, Readable as ReadableStream, Stream } from "stream";
import { Agent as HTTPSAgent } from "https";
import { IncomingMessage, ClientRequest } from "http";
import OpusScript = require("opusscript"); // Thanks TypeScript
import { URL } from "url";
import { Socket as DgramSocket } from "dgram";
import * as WebSocket from "ws";

declare function Eris(token: string, options?: Eris.ClientOptions): Eris.Client;

declare namespace Eris {
  export const Constants: Constants;
  export const VERSION: string;

  // TYPES
  // Cache
  type Uncached = { id: string };

  // Channel
  type AnyChannel = AnyGuildChannel | PrivateChannel;
  type AnyGuildChannel = GuildTextableChannel | AnyVoiceChannel | CategoryChannel | StoreChannel;
  type AnyVoiceChannel = VoiceChannel | StageChannel;
  type ChannelTypes = Constants["ChannelTypes"][keyof Constants["ChannelTypes"]];
  type GuildTextableChannel = TextChannel | NewsChannel;
  type InviteChannel = InvitePartialChannel | Exclude<AnyGuildChannel, CategoryChannel>;
  type PossiblyUncachedTextable = Textable | Uncached;
  type PossiblyUncachedTextableChannel = TextableChannel | Uncached;
  type TextableChannel = (GuildTextable & GuildTextableChannel) | (Textable & PrivateChannel);
  type VideoQualityMode = 1 | 2;

  // Command
  type CommandGenerator = CommandGeneratorFunction | MessageContent | MessageContent[] | CommandGeneratorFunction[];
  type CommandGeneratorFunction = (msg: Message, args: string[]) => GeneratorFunctionReturn;
  type GeneratorFunctionReturn = Promise<MessageContent> | Promise<void> | MessageContent | void;
  type GenericCheckFunction<T> = (msg: Message) => T | Promise<T>;
  type ReactionButtonsFilterFunction = (msg: Message, emoji: Emoji, userID: string) => boolean;
  type ReactionButtonsGenerator = ReactionButtonsGeneratorFunction | MessageContent | MessageContent[] | ReactionButtonsGeneratorFunction[];
  type ReactionButtonsGeneratorFunction = (msg: Message, args: string[], userID: string) => GeneratorFunctionReturn;

  // Gateway/REST
  type IntentStrings = keyof Constants["Intents"];
  type ReconnectDelayFunction = (lastDelay: number, attempts: number) => number;
  type RequestMethod = "GET" | "PATCH" | "DELETE" | "POST" | "PUT";

  // Guild
  type DefaultNotifications = 0 | 1;
  type ExplicitContentFilter = 0 | 1 | 2;
  type PossiblyUncachedGuild = Guild | Uncached;
  type PremiumTier = 0 | 1 | 2 | 3;
  type VerificationLevel = 0 | 1 | 2 | 3 | 4;

  // Message
  type AdvancedMessageContent = {
    allowedMentions?: AllowedMentions;
    content?: string;
    embed?: EmbedOptions;
    flags?: number;
    messageReference?: MessageReferenceReply;
    /** @deprecated */
    messageReferenceID?: string;
    tts?: boolean;
  };
  type ImageFormat = "jpg" | "jpeg" | "png" | "gif" | "webp";
  type MessageContent = string | AdvancedMessageContent;
  type MFALevel = 0 | 1;
  type PossiblyUncachedMessage = Message | { channel: TextableChannel | { id: string; guild?: Uncached }; guildID?: string; id: string };
  type InteractionType = 1 | 2;

  // Permission
  type PermissionType = "role" | "member";

  // Presence/Relationship
  type ActivityType = BotActivityType | 4;
  type BotActivityType = 0 | 1 | 2 | 3 | 5;
  type FriendSuggestionReasons = { name: string; platform_type: string; type: number }[];
  type Status = "online" | "idle" | "dnd" | "offline";

  // Voice
  type ConverterCommand = "./ffmpeg" | "./avconv" | "ffmpeg" | "avconv";

  // Webhook
  type MessageWebhookContent = Pick<WebhookPayload, "content" | "embeds" | "file" | "allowedMentions">;

  // INTERFACES
  // Internals
  interface JSONCache {
    [s: string]: unknown;
  }
  interface NestedJSON {
    toJSON(arg?: unknown, cache?: (string | unknown)[]): JSONCache;
  }
  interface SimpleJSON {
    toJSON(props?: string[]): JSONCache;
  }

  // Channel
  interface ChannelFollow {
    channel_id: string;
    webhook_id: string;
  }
  interface CreateChannelInviteOptions {
    maxAge?: number;
    maxUses?: number;
    temporary?: boolean;
    unique?: boolean;
  }
  interface CreateChannelOptions {
    bitrate?: number;
    nsfw?: boolean;
    parentID?: string;
    permissionOverwrites?: Overwrite[];
    rateLimitPerUser?: number;
    reason?: string;
    topic?: string;
    userLimit?: number;
  }
  interface EditChannelOptions extends Omit<CreateChannelOptions, "permissionOverwrites" | "reason"> {
    icon?: string;
    name?: string;
    ownerID?: string;
    rtcRegion?: string | null;
    videoQualityMode?: VideoQualityMode;
  }
  interface EditChannelPositionOptions {
    lockPermissions?: string;
    parentID?: string;
  }
  interface GetMessagesOptions {
    after?: string;
    around?: string;
    before?: string;
    limit?: number;
  }
  interface GuildTextable extends Textable {
    lastPinTimestamp: number | null;
    rateLimitPerUser: number;
    topic: string | null;
    createWebhook(options: { name: string; avatar?: string | null }, reason?: string): Promise<Webhook>;
    deleteMessages(messageIDs: string[], reason?: string): Promise<void>;
    getWebhooks(): Promise<Webhook[]>;
    purge(limit: number, filter?: (message: Message<this>) => boolean, before?: string, after?: string, reason?: string): Promise<number>;
    removeMessageReactionEmoji(messageID: string, reaction: string): Promise<void>;
    removeMessageReactions(messageID: string): Promise<void>;
    sendTyping(): Promise<void>;
  }
  interface PartialChannel {
    bitrate?: number;
    id?: number;
    name?: string;
    nsfw?: boolean;
    parent_id?: number;
    permission_overwrites?: Overwrite[];
    rate_limit_per_user?: number;
    topic?: string;
    type: number;
    user_limit?: number;
  }
  interface PurgeChannelOptions {
    after?: string;
    before?: string;
    filter?: (m: Message<GuildTextableChannel>) => boolean;
    limit: number;
    reason?: string;
  }
  interface Textable {
    lastMessageID: string;
    messages: Collection<Message<this>>;
    addMessageReaction(messageID: string, reaction: string): Promise<void>;
    /** @deprecated */
    addMessageReaction(messageID: string, reaction: string, userID: string): Promise<void>;
    createMessage(content: MessageContent, file?: MessageFile | MessageFile[]): Promise<Message>;
    deleteMessage(messageID: string, reason?: string): Promise<void>;
    editMessage(messageID: string, content: MessageContent): Promise<Message>;
    getMessage(messageID: string): Promise<Message>;
    getMessageReaction(messageID: string, reaction: string, options?: GetMessageReactionOptions): Promise<User[]>;
    /** @deprecated */
    getMessageReaction(messageID: string, reaction: string, limit?: number, before?: string, after?: string): Promise<User[]>;
    getMessages(options?: GetMessagesOptions): Promise<Message[]>;
    /** @deprecated */
    getMessages(limit?: number, before?: string, after?: string, around?: string): Promise<Message[]>;
    getPins(): Promise<Message[]>;
    pinMessage(messageID: string): Promise<void>;
    removeMessageReaction(messageID: string, reaction: string, userID?: string): Promise<void>;
    sendTyping(): Promise<void>;
    unpinMessage(messageID: string): Promise<void>;
    unsendMessage(messageID: string): Promise<void>;
  }
  interface WebhookData {
    channelID: string;
    guildID: string;
  }

  // Client
  interface ClientOptions {
    /** @deprecated */
    agent?: HTTPSAgent;
    allowedMentions?: AllowedMentions;
    autoreconnect?: boolean;
    compress?: boolean;
    connectionTimeout?: number;
    defaultImageFormat?: string;
    defaultImageSize?: number;
    disableEvents?: { [s: string]: boolean };
    firstShardID?: number;
    getAllUsers?: boolean;
    guildCreateTimeout?: number;
    guildSubscriptions?: boolean;
    intents?: number | IntentStrings[];
    largeThreshold?: number;
    lastShardID?: number;
    /** @deprecated */
    latencyThreshold?: number;
    maxReconnectAttempts?: number;
    maxResumeAttempts?: number;
    maxShards?: number | "auto";
    messageLimit?: number;
    opusOnly?: boolean;
    /** @deprecated */
    ratelimiterOffset?: number;
    reconnectDelay?: ReconnectDelayFunction;
    requestTimeout?: number;
    rest?: RequestHandlerOptions;
    restMode?: boolean;
    seedVoiceConnections?: boolean;
    ws?: unknown;
  }
  interface CommandClientOptions {
    argsSplitter?: (str: string) => string[];
    defaultCommandOptions?: CommandOptions;
    defaultHelpCommand?: boolean;
    description?: string;
    ignoreBots?: boolean;
    ignoreSelf?: boolean;
    name?: string;
    owner?: string;
    prefix?: string | string[];
  }
  interface RequestHandlerOptions {
    agent?: HTTPSAgent;
    baseURL?: string;
    disableLatencyCompensation?: boolean;
    domain?: string;
    latencyThreshold?: number;
    ratelimiterOffset?: number;
    requestTimeout?: number;
  }

  // Command
  interface CommandCooldownExclusions {
    channelIDs?: string[];
    guildIDs?: string[];
    userIDs?: string[];
  }
  interface CommandOptions {
    aliases?: string[];
    argsRequired?: boolean;
    caseInsensitive?: boolean;
    cooldown?: number;
    cooldownExclusions?: CommandCooldownExclusions;
    cooldownMessage?: MessageContent | GenericCheckFunction<MessageContent> | false;
    cooldownReturns?: number;
    defaultSubcommandOptions?: CommandOptions;
    deleteCommand?: boolean;
    description?: string;
    dmOnly?: boolean;
    errorMessage?: MessageContent | GenericCheckFunction<MessageContent>;
    fullDescription?: string;
    guildOnly?: boolean;
    hidden?: boolean;
    hooks?: Hooks;
    invalidUsageMessage?: MessageContent | GenericCheckFunction<MessageContent> | false;
    permissionMessage?: MessageContent | GenericCheckFunction<MessageContent> | false;
    reactionButtons?: CommandReactionButtonsOptions[] | null;
    reactionButtonTimeout?: number;
    requirements?: CommandRequirements;
    restartCooldown?: boolean;
    usage?: string;
  }
  interface CommandReactionButtons extends CommandReactionButtonsOptions {
    execute: (msg: Message, args: string[], userID: string) => string | GeneratorFunctionReturn;
    responses: ((() => string) | ReactionButtonsGeneratorFunction)[];
  }
  interface CommandReactionButtonsOptions {
    emoji: string;
    filter: ReactionButtonsFilterFunction;
    response: string | ReactionButtonsGeneratorFunction;
    type: "edit" | "cancel";
  }
  interface CommandRequirements {
    custom?: GenericCheckFunction<boolean>;
    permissions?: { [s: string]: boolean } | GenericCheckFunction<{ [s: string]: boolean }>;
    roleIDs?: string[] | GenericCheckFunction<string[]>;
    roleNames?: string[] | GenericCheckFunction<string[]>;
    userIDs?: string[] | GenericCheckFunction<string[]>;
  }
  interface Hooks {
    postCheck?: (msg: Message, args: string[], checksPassed: boolean) => void;
    postCommand?: (msg: Message, args: string[], sent?: Message) => void;
    postExecution?: (msg: Message, args: string[], executionSuccess: boolean) => void;
    preCommand?: (msg: Message, args: string[]) => void;
  }

  // Embed
  // Omit<T, K> used to override
  interface Embed extends Omit<EmbedOptions, "footer" | "image" | "thumbnail" | "author"> {
    author?: EmbedAuthor;
    footer?: EmbedFooter;
    image?: EmbedImage;
    provider?: EmbedProvider;
    thumbnail?: EmbedImage;
    type: string;
    video?: EmbedVideo;
  }
  interface EmbedAuthor extends EmbedAuthorOptions {
    proxy_icon_url?: string;
  }
  interface EmbedAuthorOptions {
    icon_url?: string;
    name: string;
    url?: string;
  }
  interface EmbedField {
    inline?: boolean;
    name: string;
    value: string;
  }
  interface EmbedFooter extends EmbedFooterOptions {
    proxy_icon_url?: string;
  }
  interface EmbedFooterOptions {
    icon_url?: string;
    text: string;
  }
  interface EmbedImage extends EmbedImageOptions {
    height?: number;
    proxy_url?: string;
    width?: number;
  }
  interface EmbedImageOptions {
    url?: string;
  }
  interface EmbedOptions {
    author?: EmbedAuthorOptions;
    color?: number;
    description?: string;
    fields?: EmbedField[];
    footer?: EmbedFooterOptions;
    image?: EmbedImageOptions;
    thumbnail?: EmbedImageOptions;
    timestamp?: Date | string;
    title?: string;
    url?: string;
  }
  interface EmbedProvider {
    name?: string;
    url?: string;
  }
  interface EmbedVideo {
    height?: number;
    url?: string;
    width?: number;
  }

  // Emoji
  interface Emoji extends EmojiBase {
    animated: boolean;
    available: boolean;
    id: string;
    managed: boolean;
    require_colons: boolean;
    roles: string[];
    user?: PartialUser;
  }
  interface EmojiBase {
    icon?: string;
    name: string;
  }
  interface EmojiOptions extends Exclude<EmojiBase, "icon"> {
    image: string;
    roles?: string[];
  }
  interface PartialEmoji {
    id: string | null;
    name: string;
    animated?: boolean;
  }

  // Events
  interface OldCall {
    endedTimestamp?: number;
    participants: string[];
    region: string;
    ringing: string[];
    unavailable: boolean;
  }
  interface OldGroupChannel {
    name: string;
    ownerID: string;
    icon: string;
  }
  interface OldGuild {
    afkChannelID: string | null;
    afkTimeout: number;
    banner: string | null;
    defaultNotifications: DefaultNotifications;
    description: string | null;
    discoverySplash: string | null;
    emojis: Omit<Emoji, "user" | "icon">[];
    explicitContentFilter: ExplicitContentFilter;
    features: string[];
    icon: string | null;
    large: boolean;
    maxMembers?: number;
    maxVideoChannelUsers?: number;
    mfaLevel: MFALevel;
    name: string;
    nsfw: boolean;
    ownerID: string;
    preferredLocale?: string;
    premiumSubscriptionCount?: number;
    premiumTier: PremiumTier;
    publicUpdatesChannelID: string | null;
    region: string;
    rulesChannelID: string | null;
    splash: string | null;
    systemChannelFlags: number;
    systemChannelID: string | null;
    vanityURL: string | null;
    verificationLevel: VerificationLevel;
  }
  interface OldGuildChannel {
    bitrate?: number;
    name: string;
    nsfw?: boolean;
    parentID: string | null;
    permissionOverwrites: Collection<PermissionOverwrite>;
    position: number;
    rateLimitPerUser?: number;
    rtcRegion?: string | null;
    topic?: string | null;
    type: Exclude<ChannelTypes, 1 | 3>;
  }
  interface OldGuildTextChannel extends OldGuildChannel {
    nsfw: boolean;
    rateLimitPerUser: number;
    topic: string | null;
    type: 0 | 5;
  }
  interface OldGuildVoiceChannel extends OldGuildChannel {
    bitrate: number;
    rtcRegion: string | null;
    type: 2 | 13;
    userLimit: number;
    videoQualityMode: VideoQualityMode;
  }
  interface OldMember {
    roles: string[];
    nick: string | null;
    premiumSince: number;
    pending?: boolean;
  }
  interface OldMessage {
    attachments: Attachment[];
    channelMentions: string[];
    content: string;
    editedTimestamp?: number;
    embeds: Embed[];
    flags: number;
    mentionedBy?: unknown;
    mentions: string[];
    pinned: boolean;
    roleMentions: string[];
    tts: boolean;
  }
  interface OldRole {
    color: number;
    hoist: boolean;
    managed: boolean;
    mentionable: boolean;
    name: string;
    permissions: Permission;
    position: number;
  }
  interface OldVoiceState {
    deaf: boolean;
    mute: boolean;
    selfDeaf: boolean;
    selfMute: boolean;
    selfStream: boolean;
    selfVideo: boolean;
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
    (event: "channelUpdate", listener: (channel: AnyGuildChannel, oldChannel: OldGuildChannel | OldGuildTextChannel | OldGuildVoiceChannel) => void): T;
    (event: "channelUpdate", listener: (channel: GroupChannel, oldChannel: OldGroupChannel) => void): T;
    (event: "connect" | "shardPreReady", listener: (id: number) => void): T;
    (event: "error", listener: (err: Error, id: number) => void): T;
    (event: "friendSuggestionCreate", listener: (user: User, reasons: FriendSuggestionReasons) => void): T;
    (event: "friendSuggestionDelete", listener: (user: User) => void): T;
    (event: "guildBanAdd" | "guildBanRemove", listener: (guild: Guild, user: User) => void): T;
    (event: "guildAvailable" | "guildCreate", listener: (guild: Guild) => void): T;
    (event: "guildDelete", listener: (guild: PossiblyUncachedGuild) => void): T;
    (event: "guildEmojisUpdate", listener: (guild: PossiblyUncachedGuild, emojis: Emoji[], oldEmojis: Emoji[] | null) => void): T;
    (event: "guildMemberAdd", listener: (guild: Guild, member: Member) => void): T;
    (event: "guildMemberChunk", listener: (guild: Guild, members: Member[]) => void): T;
    (event: "guildMemberRemove", listener: (guild: Guild, member: Member | MemberPartial) => void): T;
    (
      event: "guildMemberUpdate",
      listener: (guild: Guild, member: Member, oldMember: OldMember | null) => void
    ): T;
    (event: "guildRoleCreate" | "guildRoleDelete", listener: (guild: Guild, role: Role) => void): T;
    (event: "guildRoleUpdate", listener: (guild: Guild, role: Role, oldRole: OldRole) => void): T;
    (event: "guildUnavailable" | "unavailableGuildCreate", listener: (guild: UnavailableGuild) => void): T;
    (event: "guildUpdate", listener: (guild: Guild, oldGuild: OldGuild) => void): T;
    (event: "hello", listener: (trace: string[], id: number) => void): T;
    (event: "inviteCreate" | "inviteDelete", listener: (guild: Guild, invite: Invite) => void): T;
    (event: "messageCreate", listener: (message: Message<PossiblyUncachedTextableChannel>) => void): T;
    (event: "messageDelete" | "messageReactionRemoveAll", listener: (message: PossiblyUncachedMessage) => void): T;
    (event: "messageReactionRemoveEmoji", listener: (message: PossiblyUncachedMessage, emoji: PartialEmoji) => void): T;
    (event: "messageDeleteBulk", listener: (messages: PossiblyUncachedMessage[]) => void): T;
    (
      event: "messageReactionAdd",
      listener: (message: PossiblyUncachedMessage, emoji: PartialEmoji, reactor: Member | Uncached) => void
    ): T;
    (
      event: "messageReactionRemove",
      listener: (message: PossiblyUncachedMessage, emoji: PartialEmoji, userID: string) => void
    ): T;
    (event: "messageUpdate", listener: (message: Message<PossiblyUncachedTextableChannel>, oldMessage: OldMessage | null) => void
    ): T;
    (event: "presenceUpdate", listener: (other: Member | Relationship, oldPresence: Presence | null) => void): T;
    (event: "rawREST", listener: (request: RawRESTRequest) => void): T;
    (event: "rawWS" | "unknown", listener: (packet: RawPacket, id: number) => void): T;
    (event: "relationshipAdd" | "relationshipRemove", listener: (relationship: Relationship) => void): T;
    (
      event: "relationshipUpdate",
      listener: (relationship: Relationship, oldRelationship: { type: number }) => void
    ): T;
    (event: "typingStart", listener: (channel: GuildTextableChannel | Uncached, user: User | Uncached, member: Member) => void): T;
    (event: "typingStart", listener: (channel: PrivateChannel | Uncached, user: User | Uncached, member: null) => void): T;
    (
      event: "userUpdate",
      listener: (user: User, oldUser: PartialUser | null) => void
    ): T;
    (event: "voiceChannelJoin" | "voiceChannelLeave", listener: (member: Member, channel: AnyVoiceChannel) => void): T;
    (
      event: "voiceChannelSwitch",
      listener: (member: Member, newChannel: AnyVoiceChannel, oldChannel: AnyVoiceChannel) => void
    ): T;
    (event: "voiceStateUpdate", listener: (member: Member, oldState: OldVoiceState) => void): T;
    (event: "warn" | "debug", listener: (message: string, id: number) => void): T;
    (event: "webhooksUpdate", listener: (data: WebhookData) => void): T;
    (event: string, listener: (...args: any[]) => void): T;
  }
  interface ClientEvents<T> extends EventListeners<T> {
    (event: "shardReady" | "shardResume", listener: (id: number) => void): T;
    (event: "shardDisconnect", listener: (err: Error | undefined, id: number) => void): T;
  }
  interface ShardEvents<T> extends EventListeners<T> {
    (event: "resume", listener: () => void): T;
  }
  interface StreamEvents<T> extends EventListeners<T> {
    (event: "end" | "start", listener: () => void): T;
    (event: "error", listener: (err: Error) => void): T;
  }
  interface VoiceEvents<T> {
    (event: "connect" | "end" | "ready" | "start", listener: () => void): T;
    (event: "debug" | "warn", listener: (message: string) => void): T;
    (event: "disconnect", listener: (err?: Error) => void): T;
    (event: "error", listener: (err: Error) => void): T;
    (event: "pong", listener: (latency: number) => void): T;
    (event: "speakingStart" | "speakingStop" | "userDisconnect", listener: (userID: string) => void): T;
    (event: "unknown", listener: (packet: unknown) => void): T;
  }

  // Gateway/REST
  interface HTTPResponse {
    code: number;
    message: string;
  }
  interface LatencyRef {
    lastTimeOffsetCheck: number;
    latency: number;
    raw: number[];
    timeOffset: number;
    timeOffsets: number[];
  }
  interface RawPacket {
    d?: unknown;
    op: number;
    s?: number;
    t?: string;
  }
  interface RawRESTRequest {
    auth: boolean;
    body?: unknown;
    file?: MessageFile;
    method: string;
    resp: IncomingMessage;
    route: string;
    short: boolean;
    url: string;
  }
  interface RequestMembersPromise {
    members: Member;
    received: number;
    res: (value: Member[]) => void;
    timeout: NodeJS.Timeout;
  }

  // Guild
  interface CreateGuildOptions {
    afkChannelID?: string;
    afkTimeout?: number;
    channels?: PartialChannel[];
    defaultNotifications?: DefaultNotifications;
    explicitContentFilter?: ExplicitContentFilter;
    icon?: string;
    region?: string;
    roles?: PartialRole[];
    systemChannelID: string;
    verificationLevel?: VerificationLevel;
  }
  interface DiscoveryCategory {
    id: number;
    is_primary: boolean;
    name: {
      default: string;
      localizations?: { [lang: string]: string };
    };
  }
  interface DiscoveryMetadata {
    category_ids: number[];
    emoji_discoverability_enabled: boolean;
    guild_id: string;
    keywords: string[] | null;
    primary_category_id: number;
  }
  interface DiscoveryOptions {
    emojiDiscoverabilityEnabled?: boolean;
    keywords?: string[];
    primaryCategoryID?: string;
    reason?: string;
  }
  interface DiscoverySubcategoryResponse {
    category_id: number;
    guild_id: string;
  }
  interface GetGuildAuditLogOptions {
    actionType?: number;
    before?: string;
    limit?: number;
    userID?: string;
  }
  interface GetGuildIntegrationsOptions {
    includeApplications?: boolean;
  }
  interface GetPruneOptions {
    days?: number;
    includeRoles?: string[];
  }
  interface GetRESTGuildMembersOptions {
    after?: string;
    limit?: number;
  }
  interface GetRESTGuildsOptions {
    after?: string;
    before?: string;
    limit?: number;
  }
  interface GuildAuditLog {
    entries: GuildAuditLogEntry[];
    integrations: GuildIntegration[];
    users: User[];
    webhooks: Webhook[];
  }
  interface GuildOptions {
    afkChannelID?: string;
    afkTimeout?: number;
    banner?: string;
    defaultNotifications?: DefaultNotifications;
    description?: string;
    discoverySplash?: string;
    explicitContentFilter?: ExplicitContentFilter;
    features?: string[];
    icon?: string;
    name?: string;
    ownerID?: string;
    preferredLocale?: string;
    publicUpdatesChannelID?: string;
    region?: string;
    rulesChannelID?: string;
    splash?: string;
    systemChannelFlags?: number;
    systemChannelID?: string;
    verificationLevel?: VerificationLevel;
  }
  interface GuildTemplateOptions {
    name?: string;
    description?: string | null;
  }
  interface GuildVanity {
    code: string | null;
    uses: number;
  }
  interface IntegrationApplication {
    bot?: User;
    description: string;
    icon: string | null;
    id: string;
    name: string;
    summary: string;
  }
  interface IntegrationOptions {
    enableEmoticons: string;
    expireBehavior: string;
    expireGracePeriod: string;
  }
  interface PruneMemberOptions extends GetPruneOptions {
    computePruneCount?: boolean;
    reason?: string;
  }
  interface VoiceRegion {
    custom: boolean;
    deprecated: boolean;
    id: string;
    name: string;
    optimal: boolean;
    vip: boolean;
  }
  interface WelcomeChannel {
    channelID: string;
    description: string;
    emojiID: string | null;
    emojiName: string | null;
  }
  interface WelcomeScreen {
    description: string;
    welcomeChannels: WelcomeChannel[];
  }
  interface WelcomeScreenOptions extends WelcomeScreen {
    enabled: boolean;
  }
  interface Widget {
    channel_id?: string;
    enabled: boolean;
  }

  // Invite
  interface CreateInviteOptions {
    maxAge?: number;
    maxUses?: number;
    temporary?: boolean;
    unique?: boolean;
  }
  interface Invitable {
    createInvite(options?: CreateInviteOptions, reason?: string): Promise<Invite>;
    getInvites(): Promise<Invite[]>;
  }
  interface InvitePartialChannel {
    icon?: string | null;
    id: string;
    name: string | null;
    recipients?: { username: string }[];
    type: Exclude<ChannelTypes, 1>;
  }

  // Member/User
  interface FetchMembersOptions {
    limit?: number;
    presences?: boolean;
    query?: string;
    timeout?: number;
    userIDs?: string[];
  }
  interface MemberOptions {
    channelID?: string | null;
    deaf?: boolean;
    mute?: boolean;
    nick?: string;
    roles?: string[];
  }
  interface MemberPartial {
    id: string;
    user: User;
  }
  interface PartialUser {
    avatar: string | null;
    discriminator: string;
    id: string;
    username: string;
  }
  interface RequestGuildMembersOptions extends Omit<FetchMembersOptions, "userIDs"> {
    nonce: string;
    user_ids?: string[];
  }
  interface RequestGuildMembersReturn {
    members: Member[];
    received: number;
    res: (value?: unknown) => void;
    timeout: NodeJS.Timer;
  }

  // Message
  interface ActiveMessages {
    args: string[];
    command: Command;
    timeout: NodeJS.Timer;
  }
  interface AllowedMentions {
    everyone?: boolean;
    repliedUser?: boolean;
    roles?: boolean | string[];
    users?: boolean | string[];
  }
  interface Attachment {
    content_type?: string;
    filename: string;
    height?: number;
    id: string;
    proxy_url: string;
    size: number;
    url: string;
    width?: number;
  }
  interface GetMessageReactionOptions {
    after?: string;
    /** @deprecated */
    before?: string;
    limit?: number;
  }
  interface MessageActivity {
    party_id?: string;
    type: Constants["MessageActivityTypes"][keyof Constants["MessageActivityTypes"]];
  }
  interface MessageApplication {
    cover_image?: string;
    description: string;
    icon: string | null;
    id: string;
    name: string;
  }
  interface MessageFile {
    file: Buffer | string;
    name: string;
  }
  interface MessageInteraction {
    id: string;
    member: Member | null;
    name: string;
    type: InteractionType;
    user: User;
  }
  interface MessageReference extends MessageReferenceBase {
    channelID: string;
  }
  interface MessageReferenceBase {
    channelID?: string;
    guildID?: string;
    messageID?: string;
  }
  interface MessageReferenceReply extends MessageReferenceBase {
    messageID: string;
    failIfNotExists?: boolean;
  }
  interface Sticker {
    asset: string;
    description: string;
    format_type: Constants["StickerFormats"][keyof Constants["StickerFormats"]];
    id: string;
    name: string;
    pack_id: string;
    tags?: string;
  }

  // Presence
  interface Activity extends ActivityPartial<ActivityType> {
    application_id?: string;
    assets?: {
      large_image?: string;
      large_text?: string;
      small_image?: string;
      small_text?: string;
      [key: string]: unknown;
    };
    created_at: number;
    details?: string;
    emoji?: { animated?: boolean; id?: string; name: string };
    flags?: number;
    instance?: boolean;
    party?: { id?: string; size?: [number, number] };
    secrets?: { join?: string; spectate?: string; match?: string };
    state?: string;
    timestamps?: { end?: number; start: number };
    // the stuff attached to this object apparently varies even more than documented, so...
    [key: string]: unknown;
  }
  interface ActivityPartial<T extends ActivityType = BotActivityType> {
    name?: string;
    type?: T;
    url?: string;
  }
  interface ClientStatus {
    desktop: Status;
    mobile: Status;
    web: Status;
  }
  interface Presence {
    activities?: Activity[];
    clientStatus?: ClientStatus;
    game: Activity | null;
    status?: Status;
  }

  // Role
  interface Overwrite {
    allow: bigint | number;
    deny: bigint | number;
    id: string;
    type: PermissionType;
  }
  interface PartialRole {
    color?: number;
    hoist?: boolean;
    id?: number;
    mentionable?: boolean;
    name?: string;
    permissions?: number;
    position?: number;
  }
  interface RoleOptions {
    color?: number;
    hoist?: boolean;
    mentionable?: boolean;
    name?: string;
    permissions?: bigint | number;
  }
  interface RoleTags {
    bot_id?: string;
    integration_id?: string;
    premium_subscriber?: true;
  }

  // Voice
  interface VoiceConnectData {
    channel_id: string;
    endpoint: string;
    session_id: string;
    token: string;
    user_id: string;
  }
  interface VoiceResourceOptions {
    encoderArgs?: string[];
    format?: string;
    frameDuration?: number;
    frameSize?: number;
    inlineVolume?: boolean;
    inputArgs?: string[];
    pcmSize?: number;
    samplingRate?: number;
    voiceDataTimeout?: number;
  }
  interface VoiceServerUpdateData extends Omit<VoiceConnectData, "channel_id"> {
    guild_id: string;
    shard: Shard;
  }
  interface VoiceStateOptions {
    channelID: string;
    requestToSpeakTimestamp?: Date | null;
    suppress?: boolean;
  }
  interface VoiceStreamCurrent {
    buffer: Buffer | null;
    bufferingTicks: number;
    options: VoiceResourceOptions;
    pausedTime?: number;
    pausedTimestamp?: number;
    playTime: number;
    startTime: number;
    timeout: NodeJS.Timeout | null;
  }

  // Webhook
  interface Webhook {
    avatar?: string;
    channel_id: string;
    guild_id: string;
    id: string;
    name: string;
    token: string;
    user: PartialUser;
  }
  interface WebhookOptions {
    avatar?: string;
    channelID?: string;
    name?: string;
  }
  interface WebhookPayload {
    allowedMentions?: AllowedMentions;
    auth?: boolean;
    avatarURL?: string;
    content?: string;
    embeds?: EmbedOptions[];
    file?: MessageFile | MessageFile[];
    tts?: boolean;
    username?: string;
    wait?: boolean;
  }

  // TODO: Does this have more stuff?
  interface BaseData {
    id: string;
    [key: string]: unknown;
  }
  interface OAuthApplicationInfo {
    bot_public: boolean;
    bot_require_code_grant: boolean;
    description: string;
    icon?: string;
    id: string;
    name: string;
    owner: {
      avatar?: string;
      discriminator: string;
      id: string;
      username: string;
    };
    team: OAuthTeamInfo | null;
  }
  interface OAuthTeamInfo {
    icon: string | null;
    id: string;
    members: OAuthTeamMember[];
    owner_user_id: string;
  }
  interface OAuthTeamMember {
    membership_state: number;
    permissions: string[];
    team_id: string;
    user: PartialUser;
  }
  interface Constants {
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
    ChannelTypes: {
      GUILD_TEXT: 0;
      DM: 1;
      GUILD_VOICE: 2;
      GROUP_DM: 3;
      GUILD_CATEGORY: 4;
      GUILD_NEWS: 5;
      GUILD_STORE: 6;
      GUILD_STAGE: 13;
    };
    GATEWAY_VERSION: 6;
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
    ImageFormats: ["jpg", "jpeg", "png", "webp", "gif"];
    ImageSizeBoundaries: {
      MAXIMUM: 4096;
      MINIMUM: 16;
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
    MessageActivityTypes: {
      JOIN: 1;
      SPECTATE: 2;
      LISTEN: 3;
      JOIN_REQUEST: 5;
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
      GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING: 16;
      GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING: 17;
      REPLY: 19;
      APPLICATION_COMMAND: 20;

      GUILD_INVITE_REMINDER: 22;
    };
    Permissions: {
      createInstantInvite: 1n;
      kickMembers: 2n;
      banMembers: 4n;
      administrator: 8n;
      manageChannels: 16n;
      manageGuild: 32n;
      addReactions: 64n;
      viewAuditLog: 128n;
      /** @deprecated */
      viewAuditLogs: 128n;
      voicePrioritySpeaker: 256n;
      voiceStream: 512n;
      /** @deprecated */
      stream: 512n;
      viewChannel: 1024n;
      /** @deprecated */
      readMessages: 1024n;
      sendMessages: 2048n;
      sendTTSMessages: 4096n;
      manageMessages: 8192n;
      embedLinks: 16384n;
      attachFiles: 32768n;
      readMessageHistory: 65536n;
      mentionEveryone: 131072n;
      useExternalEmojis: 262144n;
      /** @deprecated */
      externalEmojis: 262144n;
      viewGuildInsights: 524288n;
      voiceConnect: 1048576n;
      voiceSpeak: 2097152n;
      voiceMuteMembers: 4194304n;
      voiceDeafenMembers: 8388608n;
      voiceMoveMembers: 16777216n;
      voiceUseVAD: 33554432n;
      changeNickname: 67108864n;
      manageNicknames: 134217728n;
      manageRoles: 268435456n;
      manageWebhooks: 536870912n;
      manageEmojis: 1073741824n;
      useSlashCommands: 2147483648n;
      voiceRequestToSpeak: 4294967296n;
      allGuild: 2080899262n;
      allText: 2953313361n;
      allVoice: 4629464849n;
      all: 8589934591n;
    };
    REST_VERSION: 7;
    StickerFormats: {
      PNG: 1;
      APNG: 2;
      LOTTIE: 3;
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
    VoiceOPCodes: {
      IDENTIFY: 0;
      SELECT_PROTOCOL: 1;
      READY: 2;
      HEARTBEAT: 3;
      SESSION_DESCRIPTION: 4;
      SPEAKING: 5;
      HEARTBEAT_ACK: 6;
      RESUME: 7;
      HELLO: 8;
      RESUMED: 9;
      DISCONNECT: 13;
    };
  }

  // Selfbot
  interface Connection {
    friend_sync: boolean;
    id: string;
    integrations: unknown[]; // TODO ????
    name: string;
    revoked: boolean;
    type: string;
    verified: boolean;
    visibility: number;
  }
  interface GuildSettings {
    channel_override: {
      channel_id: string;
      message_notifications: number;
      muted: boolean;
    }[];
    guild_id: string;
    message_notifications: number;
    mobile_push: boolean;
    muted: boolean;
    suppress_everyone: boolean;
  }
  interface SearchOptions {
    attachmentExtensions?: string;
    attachmentFilename?: string;
    authorID?: string;
    channelIDs?: string[];
    content?: string;
    contextSize?: number;
    embedProviders?: string;
    embedTypes?: string;
    has?: string;
    limit?: number;
    maxID?: string;
    minID?: string;
    offset?: number;
    sortBy?: string;
    sortOrder?: string;
  }
  interface SearchResults {
    results: (Message & { hit?: boolean })[][];
    totalResults: number;
  }
  interface UserProfile {
    connected_accounts: { id: string; name: string; type: string; verified: boolean }[];
    mutual_guilds: { id: string; nick?: string }[];
    premium_since?: number;
    user: PartialUser & { flags: number };
  }
  interface UserSettings {
    afk_timeout: number;
    convert_emojis: boolean;
    default_guilds_restricted: boolean;
    detect_platform_accounts: boolean;
    developer_mode: boolean;
    enable_tts_command: boolean;
    explicit_content_filter: number;
    friend_source_flags: {
      all: boolean; // not sure about other keys, abal heeeelp
    };
    inline_attachment_media: boolean;
    inline_embed_media: boolean;
    guild_positions: string[];
    locale: string;
    message_display_compact: boolean;
    render_embeds: boolean;
    render_reactions: boolean;
    restricted_guilds: string[];
    show_current_game: boolean;
    status: string;
    theme: string;
  }

  class Base implements SimpleJSON {
    createdAt: number;
    id: string;
    constructor(id: string);
    static getCreatedAt(id: string): number;
    inspect(): this;
    toString(): string;
    toJSON(props?: string[]): JSONCache;
  }

  export class Bucket {
    interval: number;
    lastReset: number;
    lastSend: number;
    tokenLimit: number;
    tokens: number;
    constructor(tokenLimit: number, interval: number, options: { latencyRef: { latency: number }; reservedTokens: number });
    check(): void;
    queue(func: () => void, priority?: boolean): void;
  }

  export class BrowserWebSocket extends EventEmitter {
    static CONNECTING: 0;
    static OPEN: 1;
    static CLOSING: 2;
    static CLOSED: 3;
    readyState: number;
    constructor(url: string);
    close(code?: number, reason?: string): void;
    removeEventListener(event: string | symbol, listener: (...args: any[]) => void): this;
    // @ts-ignore: DOM
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
    terminate(): void;
  }

  export class BrowserWebSocketError extends Error {
    // @ts-ignore: DOM
    event: Event;
    // @ts-ignore: DOM
    constructor(message: string, event: Event);
  }

  export class Call extends Base {
    channel: GroupChannel;
    createdAt: number;
    endedTimestamp: number | null;
    id: string;
    participants: string[];
    region: string | null;
    ringing: string[];
    unavailable: boolean;
    voiceStates: Collection<VoiceState>;
    constructor(data: BaseData, channel: GroupChannel);
  }

  export class CategoryChannel extends GuildChannel {
    channels: Collection<Exclude<AnyGuildChannel, CategoryChannel>>;
    type: 4;
    edit(options: Omit<CreateChannelOptions, "permissionOverwrites" | "reason">, reason?: string): Promise<this>;
  }

  export class Channel extends Base {
    client: Client;
    createdAt: number;
    id: string;
    mention: string;
    type: ChannelTypes;
    constructor(data: BaseData);
    static from(data: BaseData, client: Client): AnyChannel;
  }

  export class Client extends EventEmitter {
    application?: { id: string; flags: number };
    bot: boolean;
    channelGuildMap: { [s: string]: string };
    gatewayURL?: string;
    groupChannels: Collection<GroupChannel>;
    guilds: Collection<Guild>;
    guildShardMap: { [s: string]: number };
    lastConnect: number;
    lastReconnectDelay: number;
    notes: { [s: string]: string };
    options: ClientOptions;
    presence: Presence;
    privateChannelMap: { [s: string]: string };
    privateChannels: Collection<PrivateChannel>;
    ready: boolean;
    reconnectAttempts: number;
    relationships: Collection<Relationship>;
    requestHandler: RequestHandler;
    shards: ShardManager;
    startTime: number;
    unavailableGuilds: Collection<UnavailableGuild>;
    uptime: number;
    user: ExtendedUser;
    userGuildSettings: { [s: string]: GuildSettings };
    users: Collection<User>;
    userSettings: UserSettings;
    voiceConnections: VoiceConnectionManager;
    constructor(token: string, options?: ClientOptions);
    acceptInvite(inviteID: string): Promise<Invite<"withoutCount">>;
    addGroupRecipient(groupID: string, userID: string): Promise<void>;
    addGuildDiscoverySubcategory(guildID: string, categoryID: string, reason?: string): Promise<DiscoverySubcategoryResponse>;
    addGuildMemberRole(guildID: string, memberID: string, roleID: string, reason?: string): Promise<void>;
    addMessageReaction(channelID: string, messageID: string, reaction: string): Promise<void>;
    /** @deprecated */
    addMessageReaction(channelID: string, messageID: string, reaction: string, userID: string): Promise<void>;
    addRelationship(userID: string, block?: boolean): Promise<void>;
    addSelfPremiumSubscription(token: string, plan: string): Promise<void>;
    banGuildMember(guildID: string, userID: string, deleteMessageDays?: number, reason?: string): Promise<void>;
    closeVoiceConnection(guildID: string): void;
    connect(): Promise<void>;
    createChannel(guildID: string, name: string): Promise<TextChannel>;
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
      type: 5,
      options?: CreateChannelOptions
    ): Promise<NewsChannel>;
    createChannel(
      guildID: string,
      name: string,
      type: 6,
      options?: CreateChannelOptions
    ): Promise<StoreChannel>;
    createChannel(
      guildID: string,
      name: string,
      type: 13,
      options?: CreateChannelOptions
    ): Promise<StageChannel>;
    createChannel(
      guildID: string,
      name: string,
      type?: number,
      options?: CreateChannelOptions
    ): Promise<unknown>;
    /** @deprecated */
    createChannel(
      guildID: string,
      name: string,
      type: 0,
      reason?: string,
      options?: CreateChannelOptions | string
    ): Promise<TextChannel>;
    /** @deprecated */
    createChannel(
      guildID: string,
      name: string,
      type: 2,
      reason?: string,
      options?: CreateChannelOptions | string
    ): Promise<VoiceChannel>;
    /** @deprecated */
    createChannel(
      guildID: string,
      name: string,
      type: 4,
      reason?: string,
      options?: CreateChannelOptions | string
    ): Promise<CategoryChannel>;
    /** @deprecated */
    createChannel(
      guildID: string,
      name: string,
      type: 5,
      reason?: string,
      options?: CreateChannelOptions | string
    ): Promise<NewsChannel>;
    /** @deprecated */
    createChannel(
      guildID: string,
      name: string,
      type: 6,
      reason?: string,
      options?: CreateChannelOptions | string
    ): Promise<StoreChannel>;
    /** @deprecated */
    createChannel(
      guildID: string,
      name: string,
      type: 13,
      reason?: string,
      options?: CreateChannelOptions | string
    ): Promise<StageChannel>;
    /** @deprecated */
    createChannel(
      guildID: string,
      name: string,
      type?: number,
      reason?: string,
      options?: CreateChannelOptions | string
    ): Promise<unknown>;
    createChannelInvite(
      channelID: string,
      options?: CreateChannelInviteOptions,
      reason?: string
    ): Promise<Invite<"withoutCount">>;
    createChannelWebhook(
      channelID: string,
      options: { name: string; avatar?: string | null },
      reason?: string
    ): Promise<Webhook>;
    createGroupChannel(userIDs: string[]): Promise<GroupChannel>;
    createGuild(name: string, options?: CreateGuildOptions): Promise<Guild>;
    createGuildEmoji(guildID: string, options: EmojiOptions, reason?: string): Promise<Emoji>;
    createGuildFromTemplate(code: string, name: string, icon?: string): Promise<Guild>;
    createGuildTemplate(guildID: string, name: string, description?: string | null): Promise<GuildTemplate>;
    createMessage(channelID: string, content: MessageContent, file?: MessageFile | MessageFile[]): Promise<Message>;
    createRole(guildID: string, options?: RoleOptions | Role, reason?: string): Promise<Role>;
    crosspostMessage(channelID: string, messageID: string): Promise<Message>;
    deleteChannel(channelID: string, reason?: string): Promise<void>;
    deleteChannelPermission(channelID: string, overwriteID: string, reason?: string): Promise<void>;
    deleteGuild(guildID: string): Promise<void>;
    deleteGuildDiscoverySubcategory(guildID: string, categoryID: string, reason?: string): Promise<void>;
    deleteGuildEmoji(guildID: string, emojiID: string, reason?: string): Promise<void>;
    deleteGuildIntegration(guildID: string, integrationID: string): Promise<void>;
    deleteGuildTemplate(guildID: string, code: string): Promise<GuildTemplate>;
    deleteInvite(inviteID: string, reason?: string): Promise<void>;
    deleteMessage(channelID: string, messageID: string, reason?: string): Promise<void>;
    deleteMessages(channelID: string, messageIDs: string[], reason?: string): Promise<void>;
    deleteRole(guildID: string, roleID: string, reason?: string): Promise<void>;
    deleteSelfConnection(platform: string, id: string): Promise<void>;
    deleteSelfPremiumSubscription(): Promise<void>;
    deleteUserNote(userID: string): Promise<void>;
    deleteWebhook(webhookID: string, token?: string, reason?: string): Promise<void>;
    deleteWebhookMessage(webhookID: string, token: string, messageID: string): Promise<void>;
    disableSelfMFATOTP(code: string): Promise<{ token: string }>;
    disconnect(options: { reconnect?: boolean | "auto" }): void;
    editAFK(afk: boolean): void;
    editChannel(
      channelID: string,
      options: EditChannelOptions,
      reason?: string
    ): Promise<GroupChannel | AnyGuildChannel>;
    editChannelPermission(
      channelID: string,
      overwriteID: string,
      allow: bigint | number,
      deny: bigint | number,
      type: string,
      reason?: string
    ): Promise<void>;
    editChannelPosition(channelID: string, position: number, options?: EditChannelPositionOptions): Promise<void>;
    editGuild(guildID: string, options: GuildOptions, reason?: string): Promise<Guild>;
    editGuildDiscovery(guildID: string, options?: DiscoveryOptions): Promise<DiscoveryMetadata>;
    editGuildEmoji(
      guildID: string,
      emojiID: string,
      options: { name?: string; roles?: string[] },
      reason?: string
    ): Promise<Emoji>;
    editGuildIntegration(guildID: string, integrationID: string, options: IntegrationOptions): Promise<void>;
    editGuildMember(guildID: string, memberID: string, options: MemberOptions, reason?: string): Promise<void>;
    editGuildTemplate(guildID: string, code: string, options: GuildTemplateOptions): Promise<GuildTemplate>;
    editGuildVanity(guildID: string, code: string | null): Promise<GuildVanity>;
    editGuildVoiceState(guildID: string, options: VoiceStateOptions, userID?: string): Promise<void>;
    editGuildWelcomeScreen(guildID: string, options: WelcomeScreenOptions): Promise<WelcomeScreen>;
    editGuildWidget(guildID: string, options: Widget): Promise<Widget>;
    editMessage(channelID: string, messageID: string, content: MessageContent): Promise<Message>;
    editNickname(guildID: string, nick: string, reason?: string): Promise<void>;
    editRole(guildID: string, roleID: string, options: RoleOptions, reason?: string): Promise<Role>; // TODO not all options are available?
    editRolePosition(guildID: string, roleID: string, position: number): Promise<void>;
    editSelf(options: { avatar?: string; username?: string }): Promise<ExtendedUser>;
    editSelfConnection(
      platform: string,
      id: string,
      data: { friendSync: boolean; visibility: number }
    ): Promise<Connection>;
    editSelfSettings(data: UserSettings): Promise<UserSettings>;
    editStatus(status?: Status, game?: ActivityPartial<BotActivityType>): void;
    editUserNote(userID: string, note: string): Promise<void>;
    editWebhook(
      webhookID: string,
      options: WebhookOptions,
      token?: string,
      reason?: string
    ): Promise<Webhook>;
    editWebhookMessage(
      webhookID: string,
      token: string,
      messageID: string,
      options: MessageWebhookContent
    ): Promise<Message<GuildTextableChannel>>;
    enableSelfMFATOTP(
      secret: string,
      code: string
    ): Promise<{ backup_codes: { code: string; consumed: boolean }[]; token: string }>;
    executeSlackWebhook(webhookID: string, token: string, options: Record<string, unknown> & { auth?: boolean }): Promise<void>;
    executeSlackWebhook(webhookID: string, token: string, options: Record<string, unknown> & { auth?: boolean; wait: true }): Promise<Message<GuildTextableChannel>>;
    executeWebhook(webhookID: string, token: string, options: WebhookPayload & { wait: true }): Promise<Message<GuildTextableChannel>>;
    executeWebhook(webhookID: string, token: string, options: WebhookPayload): Promise<void>;
    followChannel(channelID: string, webhookChannelID: string): Promise<ChannelFollow>;
    getBotGateway(): Promise<{ session_start_limit: { max_concurrency: number; remaining: number; reset_after: number; total: number }; shards: number; url: string }>;
    getChannel(channelID: string): AnyChannel;
    getChannelInvites(channelID: string): Promise<Invite[]>;
    getChannelWebhooks(channelID: string): Promise<Webhook[]>;
    getDiscoveryCategories(): Promise<DiscoveryCategory[]>;
    getDMChannel(userID: string): Promise<PrivateChannel>;
    getGateway(): Promise<{ url: string }>;
    getGuildAuditLog(guildID: string, options?: GetGuildAuditLogOptions): Promise<GuildAuditLog>;
    /** @deprecated */
    getGuildAuditLogs(guildID: string, limit?: number, before?: string, actionType?: number, userID?: string): Promise<GuildAuditLog>;
    getGuildBan(guildID: string, userID: string): Promise<{ reason?: string; user: User }>;
    getGuildBans(guildID: string): Promise<{ reason?: string; user: User }[]>;
    getGuildDiscovery(guildID: string): Promise<DiscoveryMetadata>;
    /** @deprecated */
    getGuildEmbed(guildID: string): Promise<Widget>;
    getGuildIntegrations(guildID: string, options?: GetGuildIntegrationsOptions): Promise<GuildIntegration[]>;
    getGuildInvites(guildID: string): Promise<Invite[]>;
    getGuildPreview(guildID: string): Promise<GuildPreview>;
    getGuildTemplate(code: string): Promise<GuildTemplate>;
    getGuildTemplates(guildID: string): Promise<GuildTemplate[]>;
    getGuildVanity(guildID: string): Promise<GuildVanity>;
    getGuildWebhooks(guildID: string): Promise<Webhook[]>;
    getGuildWelcomeScreen(guildID: string): Promise<WelcomeScreen>;
    getGuildWidget(guildID: string): Promise<Widget>;
    getInvite(inviteID: string, withCounts?: false): Promise<Invite<"withoutCount">>;
    getInvite(inviteID: string, withCounts: true): Promise<Invite<"withCount">>;
    getMessage(channelID: string, messageID: string): Promise<Message>;
    getMessageReaction(channelID: string, messageID: string, reaction: string, options?: GetMessageReactionOptions): Promise<User[]>;
    /** @deprecated */
    getMessageReaction(channelID: string, messageID: string, reaction: string, limit?: number, before?: string, after?: string): Promise<User[]>;
    getMessages(channelID: string, options?: GetMessagesOptions): Promise<Message[]>;
    /** @deprecated */
    getMessages(channelID: string, limit?: number, before?: string, after?: string, around?: string): Promise<Message[]>;
    getOAuthApplication(appID?: string): Promise<OAuthApplicationInfo>;
    getPins(channelID: string): Promise<Message[]>;
    getPruneCount(guildID: string, options?: GetPruneOptions): Promise<number>;
    getRESTChannel(channelID: string): Promise<AnyChannel>;
    getRESTGuild(guildID: string, withCounts?: boolean): Promise<Guild>;
    getRESTGuildChannels(guildID: string): Promise<AnyGuildChannel[]>;
    getRESTGuildEmoji(guildID: string, emojiID: string): Promise<Emoji>;
    getRESTGuildEmojis(guildID: string): Promise<Emoji[]>;
    getRESTGuildMember(guildID: string, memberID: string): Promise<Member>;
    getRESTGuildMembers(guildID: string, options?: GetRESTGuildMembersOptions): Promise<Member[]>;
    /** @deprecated */
    getRESTGuildMembers(guildID: string, limit?: number, after?: string): Promise<Member[]>;
    getRESTGuildRoles(guildID: string): Promise<Role[]>;
    getRESTGuilds(options?: GetRESTGuildsOptions): Promise<Guild[]>;
    /** @deprecated */
    getRESTGuilds(limit?: number, before?: string, after?: string): Promise<Guild[]>;
    getRESTUser(userID: string): Promise<User>;
    getSelf(): Promise<ExtendedUser>;
    getSelfBilling(): Promise<{
      payment_gateway?: string;
      payment_source?: {
        brand: string;
        expires_month: number;
        expires_year: number;
        invalid: boolean;
        last_4: number;
        type: string;
      };
      premium_subscription?: {
        canceled_at?: string;
        created_at: string;
        current_period_end?: string;
        current_period_start?: string;
        ended_at?: string;
        plan: string;
        status: number;
      };
    }>;
    getSelfConnections(): Promise<Connection[]>;
    getSelfMFACodes(
      password: string,
      regenerate?: boolean
    ): Promise<{ backup_codes: { code: string; consumed: boolean }[] }>;
    getSelfPayments(): Promise<{
      amount: number;
      amount_refunded: number;
      created_at: string; // date
      currency: string;
      description: string;
      status: number;
    }[]>;
    getSelfSettings(): Promise<UserSettings>;
    getUserProfile(userID: string): Promise<UserProfile>;
    getVoiceRegions(guildID?: string): Promise<VoiceRegion[]>;
    getWebhook(webhookID: string, token?: string): Promise<Webhook>;
    getWebhookMessage(webhookID: string, token: string, messageID: string): Promise<Message<GuildTextableChannel>>;
    joinVoiceChannel(channelID: string, options?: { opusOnly?: boolean; shared?: boolean }): Promise<VoiceConnection>;
    kickGuildMember(guildID: string, userID: string, reason?: string): Promise<void>;
    leaveGuild(guildID: string): Promise<void>;
    leaveVoiceChannel(channelID: string): void;
    pinMessage(channelID: string, messageID: string): Promise<void>;
    pruneMembers(guildID: string, options?: PruneMemberOptions): Promise<number>;
    purgeChannel(channelID: string, options: PurgeChannelOptions): Promise<number>;
    /** @deprecated */
    purgeChannel(
      channelID: string,
      limit?: number,
      filter?: (m: Message<GuildTextableChannel>) => boolean,
      before?: string,
      after?: string,
      reason?: string
    ): Promise<number>;
    removeGroupRecipient(groupID: string, userID: string): Promise<void>;
    removeGuildMemberRole(guildID: string, memberID: string, roleID: string, reason?: string): Promise<void>;
    removeMessageReaction(channelID: string, messageID: string, reaction: string, userID?: string): Promise<void>;
    removeMessageReactionEmoji(channelID: string, messageID: string, reaction: string): Promise<void>;
    removeMessageReactions(channelID: string, messageID: string): Promise<void>;
    removeRelationship(userID: string): Promise<void>;
    searchChannelMessages(channelID: string, query: SearchOptions): Promise<SearchResults>;
    searchGuildMembers(guildID: string, query: string, limit?: number): Promise<Member[]>;
    searchGuildMessages(guildID: string, query: SearchOptions): Promise<SearchResults>;
    sendChannelTyping(channelID: string): Promise<void>;
    syncGuildIntegration(guildID: string, integrationID: string): Promise<void>;
    syncGuildTemplate(guildID: string, code: string): Promise<GuildTemplate>;
    unbanGuildMember(guildID: string, userID: string, reason?: string): Promise<void>;
    unpinMessage(channelID: string, messageID: string): Promise<void>;
    validateDiscoverySearchTerm(term: string): Promise<{ valid: boolean }>;
    on: ClientEvents<this>;
    toString(): string;
  }

  export class Collection<T extends { id: string | number }> extends Map<string | number, T> {
    baseObject: new (...args: any[]) => T;
    limit?: number;
    constructor(baseObject: new (...args: any[]) => T, limit?: number);
    add(obj: T, extra?: unknown, replace?: boolean): T;
    every(func: (i: T) => boolean): boolean;
    filter(func: (i: T) => boolean): T[];
    find(func: (i: T) => boolean): T | undefined;
    map<R>(func: (i: T) => R): R[];
    random(): T | undefined;
    reduce<U>(func: (accumulator: U, val: T) => U, initialValue?: U): U;
    remove(obj: T | Uncached): T | null;
    some(func: (i: T) => boolean): boolean;
    update(obj: T, extra?: unknown, replace?: boolean): T;
  }

  export class Command implements CommandOptions, SimpleJSON {
    aliases: string[];
    argsRequired: boolean;
    caseInsensitive: boolean;
    cooldown: number;
    cooldownExclusions: CommandCooldownExclusions;
    cooldownMessage: MessageContent | false | GenericCheckFunction<MessageContent>;
    cooldownReturns: number;
    defaultSubcommandOptions: CommandOptions;
    deleteCommand: boolean;
    description: string;
    dmOnly: boolean;
    errorMessage: MessageContent | GenericCheckFunction<MessageContent>;
    fullDescription: string;
    fullLabel: string;
    guildOnly: boolean;
    hidden: boolean;
    hooks: Hooks;
    invalidUsageMessage: MessageContent | false | GenericCheckFunction<MessageContent>;
    label: string;
    parentCommand?: Command;
    permissionMessage: MessageContent | false | GenericCheckFunction<MessageContent>;
    reactionButtons: null | CommandReactionButtons[];
    reactionButtonTimeout: number;
    requirements: CommandRequirements;
    restartCooldown: boolean;
    subcommandAliases: { [alias: string]: string };
    subcommands: { [s: string]: Command };
    usage: string;
    constructor(label: string, generate: CommandGenerator, options?: CommandOptions);
    cooldownCheck(msg: Message): boolean;
    cooldownExclusionCheck(msg: Message): boolean;
    executeCommand(msg: Message, args: string[]): Promise<GeneratorFunctionReturn>;
    permissionCheck(msg: Message): Promise<boolean>;
    process(args: string[], msg: Message): Promise<void | GeneratorFunctionReturn>;
    registerSubcommand(label: string, generator: CommandGenerator, options?: CommandOptions): Command;
    registerSubcommandAlias(alias: string, label: string): void;
    unregisterSubcommand(label: string): void;
    toString(): string;
    toJSON(props?: string[]): JSONCache;
  }

  export class CommandClient extends Client {
    activeMessages: { [s: string]: ActiveMessages };
    commandAliases: { [s: string]: string };
    commandOptions: CommandClientOptions;
    commands: { [s: string]: Command };
    guildPrefixes: { [s: string]: string | string[] };
    preReady?: true;
    constructor(token: string, options?: ClientOptions, commandOptions?: CommandClientOptions);
    checkPrefix(msg: Message): string;
    onMessageCreate(msg: Message): Promise<void>;
    onMessageReactionEvent(msg: Message, emoji: Emoji, reactor: Member | Uncached | string): Promise<void>
    registerCommand(label: string, generator: CommandGenerator, options?: CommandOptions): Command;
    registerCommandAlias(alias: string, label: string): void;
    registerGuildPrefix(guildID: string, prefix: string[] | string): void;
    resolveCommand(label: string): Command;
    unregisterCommand(label: string): void;
    unwatchMessage(id: string, channelID: string): void;
    toString(): string;
  }

  export class DiscordHTTPError extends Error {
    code: number;
    name: "DiscordHTTPError";
    req: ClientRequest;
    res: IncomingMessage;
    response: HTTPResponse;
    constructor(req: ClientRequest, res: IncomingMessage, response: HTTPResponse, stack: string);
    flattenErrors(errors: HTTPResponse, keyPrefix?: string): string[];
  }

  export class DiscordRESTError extends Error {
    code: number;
    name: string;
    req: ClientRequest;
    res: IncomingMessage;
    response: HTTPResponse;
    constructor(req: ClientRequest, res: IncomingMessage, response: HTTPResponse, stack: string);
    flattenErrors(errors: HTTPResponse, keyPrefix?: string): string[];
  }

  export class ExtendedUser extends User {
    email: string;
    mfaEnabled: boolean;
    premiumType: 0 | 1 | 2;
    verified: boolean;
  }

  export class GroupChannel extends PrivateChannel {
    icon: string | null;
    iconURL: string | null;
    name: string;
    ownerID: string;
    recipients: Collection<User>;
    type: 3;
    addRecipient(userID: string): Promise<void>;
    dynamicIconURL(format?: ImageFormat, size?: number): string;
    edit(options: { icon?: string; name?: string; ownerID?: string }): Promise<GroupChannel>;
    removeRecipient(userID: string): Promise<void>;
  }

  export class Guild extends Base {
    afkChannelID: string | null;
    afkTimeout: number;
    applicationID: string | null;
    approximateMemberCount?: number;
    approximatePresenceCount?: number;
    autoRemoved?: boolean;
    banner: string | null;
    bannerURL: string | null;
    channels: Collection<AnyGuildChannel>;
    createdAt: number;
    defaultNotifications: DefaultNotifications;
    description: string | null;
    discoverySplash: string | null;
    discoverySplashURL: string | null;
    emojiCount?: number;
    emojis: Emoji[];
    explicitContentFilter: ExplicitContentFilter;
    features: string[];
    icon: string | null;
    iconURL: string | null;
    id: string;
    joinedAt: number;
    large: boolean;
    maxMembers: number;
    maxPresences: number;
    maxVideoChannelUsers?: number;
    memberCount: number;
    members: Collection<Member>;
    mfaLevel: MFALevel;
    name: string;
    nsfw: boolean;
    ownerID: string;
    preferredLocale: string;
    premiumSubscriptionCount?: number;
    premiumTier: PremiumTier;
    primaryCategory?: DiscoveryCategory;
    primaryCategoryID?: number;
    publicUpdatesChannelID: string;
    region: string;
    roles: Collection<Role>;
    rulesChannelID: string | null;
    shard: Shard;
    splash: string | null;
    splashURL: string | null;
    systemChannelFlags: number;
    systemChannelID: string | null;
    unavailable: boolean;
    vanityURL: string | null;
    verificationLevel: VerificationLevel;
    voiceStates: Collection<VoiceState>;
    welcomeScreen?: WelcomeScreen;
    widgetChannelID?: string | null;
    widgetEnabled?: boolean | null;
    constructor(data: BaseData, client: Client);
    addDiscoverySubcategory(categoryID: string, reason?: string): Promise<DiscoverySubcategoryResponse>;
    addMemberRole(memberID: string, roleID: string, reason?: string): Promise<void>;
    banMember(userID: string, deleteMessageDays?: number, reason?: string): Promise<void>;
    createChannel(name: string): Promise<TextChannel>;
    createChannel(name: string, type: 0, options?: CreateChannelOptions): Promise<TextChannel>;
    createChannel(name: string, type: 2, options?: CreateChannelOptions): Promise<VoiceChannel>;
    createChannel(name: string, type: 4, options?: CreateChannelOptions): Promise<CategoryChannel>;
    createChannel(name: string, type: 5, options?: CreateChannelOptions | string): Promise<NewsChannel>;
    createChannel(name: string, type: 6, options?: CreateChannelOptions | string): Promise<StoreChannel>;
    createChannel(name: string, type: 13, options?: CreateChannelOptions | string): Promise<StageChannel>;
    createChannel(name: string, type?: number, options?: CreateChannelOptions): Promise<unknown>;
    /** @deprecated */
    createChannel(name: string, type: 0, reason?: string, options?: CreateChannelOptions | string): Promise<TextChannel>;
    /** @deprecated */
    createChannel(name: string, type: 2, reason?: string, options?: CreateChannelOptions | string): Promise<VoiceChannel>;
    /** @deprecated */
    createChannel(name: string, type: 4, reason?: string, options?: CreateChannelOptions | string): Promise<CategoryChannel>;
    /** @deprecated */
    createChannel(name: string, type: 5, reason?: string, options?: CreateChannelOptions | string): Promise<NewsChannel>;
    /** @deprecated */
    createChannel(name: string, type: 6, reason?: string, options?: CreateChannelOptions | string): Promise<StoreChannel>;
    /** @deprecated */
    createChannel(name: string, type: 13, reason?: string, options?: CreateChannelOptions | string): Promise<StageChannel>;
    /** @deprecated */
    createChannel(name: string, type?: number, reason?: string, options?: CreateChannelOptions | string): Promise<unknown>;
    createEmoji(options: { image: string; name: string; roles?: string[] }, reason?: string): Promise<Emoji>;
    createRole(options: RoleOptions | Role, reason?: string): Promise<Role>;
    createTemplate(name: string, description?: string | null): Promise<GuildTemplate>;
    delete(): Promise<void>;
    deleteDiscoverySubcategory(categoryID: string, reason?: string): Promise<void>;
    deleteEmoji(emojiID: string, reason?: string): Promise<void>;
    deleteIntegration(integrationID: string): Promise<void>;
    deleteRole(roleID: string): Promise<void>;
    deleteTemplate(code: string): Promise<GuildTemplate>;
    dynamicBannerURL(format?: ImageFormat, size?: number): string;
    dynamicDiscoverySplashURL(format?: ImageFormat, size?: number): string;
    dynamicIconURL(format?: ImageFormat, size?: number): string;
    dynamicSplashURL(format?: ImageFormat, size?: number): string;
    edit(options: GuildOptions, reason?: string): Promise<Guild>;
    editDiscovery(options?: DiscoveryOptions): Promise<DiscoveryMetadata>;
    editEmoji(emojiID: string, options: { name: string; roles?: string[] }, reason?: string): Promise<Emoji>;
    editIntegration(integrationID: string, options: IntegrationOptions): Promise<void>;
    editMember(memberID: string, options: MemberOptions, reason?: string): Promise<void>;
    editNickname(nick: string): Promise<void>;
    editRole(roleID: string, options: RoleOptions): Promise<Role>;
    editTemplate(code: string, options: GuildTemplateOptions): Promise<GuildTemplate>;
    editVanity(code: string | null): Promise<GuildVanity>;
    editVoiceState(options: VoiceStateOptions, userID?: string): Promise<void>;
    editWelcomeScreen(options: WelcomeScreenOptions): Promise<WelcomeScreen>;
    editWidget(options: Widget): Promise<Widget>;
    fetchAllMembers(timeout?: number): Promise<number>;
    fetchMembers(options?: FetchMembersOptions): Promise<Member[]>;
    getAuditLog(options?: GetGuildAuditLogOptions): Promise<GuildAuditLog>;
    /** @deprecated */
    getAuditLogs(limit?: number, before?: string, actionType?: number, userID?: string): Promise<GuildAuditLog>;
    getBan(userID: string): Promise<{ reason?: string; user: User }>;
    getBans(): Promise<{ reason?: string; user: User }[]>;
    getDiscovery(): Promise<DiscoveryMetadata>;
    /** @deprecated */
    getEmbed(): Promise<Widget>;
    getIntegrations(options?: GetGuildIntegrationsOptions): Promise<GuildIntegration>;
    getInvites(): Promise<Invite[]>;
    getPruneCount(options?: GetPruneOptions): Promise<number>;
    getRESTChannels(): Promise<AnyGuildChannel[]>;
    getRESTEmoji(emojiID: string): Promise<Emoji>;
    getRESTEmojis(): Promise<Emoji[]>;
    getRESTMember(memberID: string): Promise<Member>;
    getRESTMembers(options?: GetRESTGuildMembersOptions): Promise<Member[]>;
    /** @deprecated */
    getRESTMembers(limit?: number, after?: string): Promise<Member[]>;
    getRESTRoles(): Promise<Role[]>;
    getTemplates(): Promise<GuildTemplate[]>;
    getVanity(): Promise<GuildVanity>;
    getVoiceRegions(): Promise<VoiceRegion[]>;
    getWebhooks(): Promise<Webhook[]>;
    getWelcomeScreen(): Promise<WelcomeScreen>;
    getWidget(): Promise<Widget>;
    kickMember(userID: string, reason?: string): Promise<void>;
    leave(): Promise<void>;
    leaveVoiceChannel(): void;
    permissionsOf(memberID: string | Member): Permission;
    pruneMembers(options?: PruneMemberOptions): Promise<number>;
    removeMemberRole(memberID: string, roleID: string, reason?: string): Promise<void>;
    searchMembers(query: string, limit?: number): Promise<Member[]>;
    syncIntegration(integrationID: string): Promise<void>;
    syncTemplate(code: string): Promise<GuildTemplate>;
    unbanMember(userID: string, reason?: string): Promise<void>;
  }

  export class GuildAuditLogEntry extends Base {
    actionType: number;
    after: { [key: string]: unknown } | null;
    before: { [key: string]: unknown } | null;
    channel?: AnyGuildChannel;
    count?: number;
    deleteMemberDays?: number;
    guild: Guild;
    id: string;
    member?: Member | unknown;
    membersRemoved?: number;
    message?: Message<GuildTextableChannel>;
    reason: string | null;
    role?: Role | { id: string; name: string };
    target?: Guild | AnyGuildChannel | Member | Role | Invite | Emoji | Message<GuildTextableChannel> | null;
    targetID: string;
    user: User;
    constructor(data: BaseData, guild: Guild);
  }

  export class GuildChannel extends Channel {
    guild: Guild;
    name: string;
    nsfw: boolean;
    parentID: string | null;
    permissionOverwrites: Collection<PermissionOverwrite>;
    position: number;
    type: Exclude<ChannelTypes, 1 | 3>;
    constructor(data: BaseData, guild: Guild);
    delete(reason?: string): Promise<void>;
    deletePermission(overwriteID: string, reason?: string): Promise<void>;
    edit(options: Omit<EditChannelOptions, "icon" | "ownerID">, reason?: string): Promise<this>;
    editPermission(
      overwriteID: string,
      allow: bigint | number,
      deny: bigint | number,
      type: PermissionType,
      reason?: string
    ): Promise<PermissionOverwrite>;
    editPosition(position: number, options?: EditChannelPositionOptions): Promise<void>;
    getInvites(): Promise<Invite[]>;
    permissionsOf(memberID: string | Member): Permission;
  }

  export class GuildIntegration extends Base {
    account: { id: string; name: string };
    application?: IntegrationApplication;
    createdAt: number;
    enabled: boolean;
    enableEmoticons: boolean;
    expireBehavior: number;
    expireGracePeriod: number;
    id: string;
    name: string;
    revoked: boolean;
    roleID: string;
    subscriberCount: number;
    syncedAt: number;
    syncing: boolean;
    type: string;
    user?: User;
    constructor(data: BaseData, guild: Guild);
    delete(): Promise<void>;
    edit(options: { enableEmoticons: string; expireBehavior: string; expireGracePeriod: string }): Promise<void>;
    sync(): Promise<void>;
  }

  export class GuildPreview extends Base {
    approximateMemberCount: number;
    approximatePresenceCount: number;
    description: string | null;
    discoverySplash: string | null;
    discoverySplashURL: string | null;
    emojis: Emoji[];
    features: string[];
    icon: string | null;
    iconURL: string | null;
    id: string;
    name: string;
    splash: string | null;
    splashURL: string | null;
    constructor(data: BaseData, client: Client);
    dynamicDiscoverySplashURL(format?: ImageFormat, size?: number): string;
    dynamicIconURL(format?: ImageFormat, size?: number): string;
    dynamicSplashURL(format?: ImageFormat, size?: number): string;
  }

  export class GuildTemplate {
    code: string;
    createdAt: number;
    creator: User;
    description: string | null;
    isDirty: string | null;
    name: string;
    serializedSourceGuild: Guild;
    sourceGuild: Guild | Uncached;
    updatedAt: number;
    usageCount: number;
    constructor(data: BaseData, client: Client);
    createGuild(name: string, icon?: string): Promise<Guild>;
    delete(): Promise<GuildTemplate>;
    edit(options: GuildTemplateOptions): Promise<GuildTemplate>;
    sync(): Promise<GuildTemplate>;
    toJSON(props?: string[]): JSONCache;
  }

  // If CT (count) is "withMetadata", it will not have count properties
  export class Invite<CT extends "withMetadata" | "withCount" | "withoutCount" = "withMetadata", CH extends InviteChannel = InviteChannel> extends Base {
    channel: CH;
    code: string;
    // @ts-ignore: Property is only not null when invite metadata is supplied
    createdAt: CT extends "withMetadata" ? number : null;
    guild: CT extends "withMetadata"
      ? Guild // Invite with Metadata always has guild prop
      : CH extends Extract<InviteChannel, GroupChannel> // Invite without Metadata
        ? never // If the channel is GroupChannel, there is no guild
        : CH extends Exclude<InviteChannel, InvitePartialChannel> // Invite without Metadata and not GroupChanel
          ? Guild // If the invite channel is not partial
          : Guild | undefined; // If the invite channel is partial
    inviter?: User;
    maxAge: CT extends "withMetadata" ? number : null;
    maxUses: CT extends "withMetadata" ? number : null;
    memberCount: CT extends "withMetadata" | "withoutCount" ? null : number;
    presenceCount: CT extends "withMetadata" | "withoutCount" ? null : number;
    temporary: CT extends "withMetadata" ? boolean : null;
    uses: CT extends "withMetadata" ? number : null;
    constructor(data: BaseData, client: Client);
    delete(reason?: string): Promise<void>;
  }

  export class Member extends Base implements Presence {
    activities?: Activity[];
    avatar: string | null;
    avatarURL: string;
    bot: boolean;
    clientStatus?: ClientStatus;
    createdAt: number;
    defaultAvatar: string;
    defaultAvatarURL: string;
    discriminator: string;
    game: Activity | null;
    guild: Guild;
    id: string;
    joinedAt: number;
    mention: string;
    nick: string | null;
    pending?: boolean;
    /** @deprecated */
    permission: Permission;
    permissions: Permission;
    premiumSince: number;
    roles: string[];
    staticAvatarURL: string;
    status?: Status;
    user: User;
    username: string;
    voiceState: VoiceState;
    constructor(data: BaseData, guild?: Guild, client?: Client);
    addRole(roleID: string, reason?: string): Promise<void>;
    ban(deleteMessageDays?: number, reason?: string): Promise<void>;
    edit(options: MemberOptions, reason?: string): Promise<void>;
    kick(reason?: string): Promise<void>;
    removeRole(roleID: string, reason?: string): Promise<void>;
    unban(reason?: string): Promise<void>;
  }

  export class Message<T extends PossiblyUncachedTextable = TextableChannel> extends Base {
    activity?: MessageActivity;
    application?: MessageApplication;
    attachments: Attachment[];
    author: User;
    channel: T;
    channelMentions: string[];
    /** @deprecated */
    cleanContent: string;
    command?: Command;
    content: string;
    createdAt: number;
    editedTimestamp?: number;
    embeds: Embed[];
    flags: number;
    guildID: T extends GuildTextable ? string : undefined;
    id: string;
    interaction: MessageInteraction | null;
    jumpLink: string;
    member: T extends GuildTextable ? Member : null;
    mentionEveryone: boolean;
    mentions: User[];
    messageReference: MessageReference | null;
    pinned: boolean;
    prefix?: string;
    reactions: { [s: string]: { count: number; me: boolean } };
    referencedMessage?: Message | null;
    roleMentions: string[];
    stickers?: Sticker[];
    timestamp: number;
    tts: boolean;
    type: number;
    webhookID: T extends GuildTextable ? string | undefined : undefined;
    constructor(data: BaseData, client: Client);
    addReaction(reaction: string): Promise<void>;
    /** @deprecated */
    addReaction(reaction: string, userID: string): Promise<void>;
    crosspost(): Promise<T extends NewsChannel ? Message<NewsChannel> : never>;
    delete(reason?: string): Promise<void>;
    deleteWebhook(token: string): Promise<void>;
    edit(content: MessageContent): Promise<Message<T>>;
    editWebhook(token: string, options: MessageWebhookContent): Promise<Message<T>>;
    getReaction(reaction: string, options?: GetMessageReactionOptions): Promise<User[]>;
    /** @deprecated */
    getReaction(reaction: string, limit?: number, before?: string, after?: string): Promise<User[]>;
    pin(): Promise<void>;
    removeReaction(reaction: string, userID?: string): Promise<void>;
    removeReactionEmoji(reaction: string): Promise<void>;
    removeReactions(): Promise<void>;
    unpin(): Promise<void>;
  }

  // News channel rate limit is always 0
  export class NewsChannel extends TextChannel {
    rateLimitPerUser: 0;
    type: 5;
    createInvite(options?: CreateInviteOptions, reason?: string): Promise<Invite<"withMetadata", NewsChannel>>;
    createMessage(content: MessageContent, file?: MessageFile | MessageFile[]): Promise<Message<NewsChannel>>;
    crosspostMessage(messageID: string): Promise<Message<NewsChannel>>;
    editMessage(messageID: string, content: MessageContent): Promise<Message<NewsChannel>>;
    follow(webhookChannelID: string): Promise<ChannelFollow>;
    getInvites(): Promise<(Invite<"withMetadata", NewsChannel>)[]>;
    getMessage(messageID: string): Promise<Message<NewsChannel>>;
    getMessages(options?: GetMessagesOptions): Promise<Message<NewsChannel>[]>;
    /** @deprecated */
    getMessages(limit?: number, before?: string, after?: string, around?: string): Promise<Message<NewsChannel>[]>;
    getPins(): Promise<Message<NewsChannel>[]>;
  }

  export class Permission extends Base {
    allow: bigint;
    deny: bigint;
    json: Record<keyof Constants["Permissions"], boolean>;
    constructor(allow: number | string | bigint, deny?: number | string | bigint);
    has(permission: keyof Constants["Permissions"]): boolean;
  }

  export class PermissionOverwrite extends Permission {
    id: string;
    type: PermissionType;
    constructor(data: Overwrite);
  }

  export class Piper extends EventEmitter {
    converterCommand: ConverterCommand;
    dataPacketCount: number;
    encoding: boolean;
    libopus: boolean;
    opus: OpusScript | null;
    opusFactory: () => OpusScript;
    volumeLevel: number;
    constructor(converterCommand: string, opusFactory: OpusScript);
    addDataPacket(packet: unknown): void;
    encode(source: string | Stream, options: VoiceResourceOptions): boolean;
    getDataPacket(): Buffer;
    reset(): void;
    resetPackets(): void;
    setVolume(volume: number): void;
    stop(e: Error, source: Duplex): void;
  }

  export class PrivateChannel extends Channel implements Textable {
    lastMessageID: string;
    messages: Collection<Message<this>>;
    recipient: User;
    type: 1 | 3;
    addMessageReaction(messageID: string, reaction: string): Promise<void>;
    /** @deprecated */
    addMessageReaction(messageID: string, reaction: string, userID: string): Promise<void>;
    createMessage(content: MessageContent, file?: MessageFile | MessageFile[]): Promise<Message<PrivateChannel>>;
    deleteMessage(messageID: string, reason?: string): Promise<void>;
    editMessage(messageID: string, content: MessageContent): Promise<Message<PrivateChannel>>;
    getMessage(messageID: string): Promise<Message<PrivateChannel>>;
    getMessageReaction(messageID: string, reaction: string, options?: GetMessageReactionOptions): Promise<User[]>;
    /** @deprecated */
    getMessageReaction(messageID: string, reaction: string, limit?: number, before?: string, after?: string): Promise<User[]>;
    getMessages(options?: GetMessagesOptions): Promise<Message<PrivateChannel>[]>;
    /** @deprecated */
    getMessages(limit?: number, before?: string, after?: string, around?: string): Promise<Message<PrivateChannel>[]>;
    getPins(): Promise<Message<PrivateChannel>[]>;
    leave(): Promise<void>;
    pinMessage(messageID: string): Promise<void>;
    removeMessageReaction(messageID: string, reaction: string): Promise<void>;
    /** @deprecated */
    removeMessageReaction(messageID: string, reaction: string, userID: string): Promise<void>;
    ring(recipient: string[]): void;
    sendTyping(): Promise<void>;
    syncCall(): void;
    unpinMessage(messageID: string): Promise<void>;
    unsendMessage(messageID: string): Promise<void>;
  }

  export class Relationship extends Base implements Presence {
    activities?: Activity[];
    clientStatus?: ClientStatus;
    game: Activity | null;
    id: string;
    status: Status;
    type: number;
    user: User;
    constructor(data: BaseData, client: Client);
  }

  export class RequestHandler implements SimpleJSON {
    globalBlock: boolean;
    latencyRef: LatencyRef;
    options: RequestHandlerOptions;
    ratelimits: { [route: string]: SequentialBucket };
    readyQueue: (() => void)[];
    userAgent: string;
    constructor(client: Client, options?: RequestHandlerOptions);
    /** @deprecated */
    constructor(client: Client, forceQueueing?: boolean);
    globalUnblock(): void;
    request(method: RequestMethod, url: string, auth?: boolean, body?: { [s: string]: unknown }, file?: MessageFile, _route?: string, short?: boolean): Promise<unknown>;
    routefy(url: string, method: RequestMethod): string;
    toString(): string;
    toJSON(props?: string[]): JSONCache;
  }

  export class Role extends Base {
    color: number;
    createdAt: number;
    guild: Guild;
    hoist: boolean;
    id: string;
    json: Partial<Record<Exclude<keyof Constants["Permissions"], "all" | "allGuild" | "allText" | "allVoice">, boolean>>;
    managed: boolean;
    mention: string;
    mentionable: boolean;
    name: string;
    permissions: Permission;
    position: number;
    tags?: RoleTags;
    constructor(data: BaseData, guild: Guild);
    delete(reason?: string): Promise<void>;
    edit(options: RoleOptions, reason?: string): Promise<Role>;
    editPosition(position: number): Promise<void>;
  }

  class SequentialBucket {
    latencyRef: LatencyRef;
    limit: number;
    processing: boolean;
    remaining: number;
    reset: number;
    constructor(limit: number, latencyRef?: LatencyRef);
    check(override?: boolean): void;
    queue(func: (cb: () => void) => void, short?: boolean): void;
  }

  export class Shard extends EventEmitter implements SimpleJSON {
    client: Client;
    connectAttempts: number;
    connecting: boolean;
    connectTimeout: NodeJS.Timeout | null;
    discordServerTrace?: string[];
    getAllUsersCount: { [guildID: string]: boolean };
    getAllUsersLength: number;
    getAllUsersQueue: string;
    globalBucket: Bucket;
    guildCreateTimeout: NodeJS.Timeout | null;
    guildSyncQueue: string[];
    guildSyncQueueLength: number;
    heartbeatInterval: NodeJS.Timeout | null;
    id: number;
    lastHeartbeatAck: boolean;
    lastHeartbeatReceived: number | null;
    lastHeartbeatSent: number | null;
    latency: number;
    preReady: boolean;
    presence: Presence;
    presenceUpdateBucket: Bucket;
    ready: boolean;
    reconnectInterval: number;
    requestMembersPromise: { [s: string]: RequestMembersPromise };
    seq: number;
    sessionID: string | null;
    status: "disconnected" | "connecting" | "handshaking" | "ready" | "resuming";
    unsyncedGuilds: number;
    ws: WebSocket | BrowserWebSocket | null;
    constructor(id: number, client: Client);
    checkReady(): void;
    connect(): void;
    createGuild(_guild: Guild): Guild;
    disconnect(options?: { reconnect?: boolean | "auto" }, error?: Error): void;
    editAFK(afk: boolean): void;
    editStatus(status?: Status, game?: ActivityPartial<BotActivityType>): void;
    editStatus(game?: ActivityPartial<BotActivityType>): void;
    // @ts-ignore: Method override
    emit(event: string, ...args: any[]): void;
    getGuildMembers(guildID: string, timeout: number): void;
    hardReset(): void;
    heartbeat(normal?: boolean): void;
    identify(): void;
    initializeWS(): void;
    onPacket(packet: RawPacket): void;
    requestGuildMembers(guildID: string, options?: RequestGuildMembersOptions): Promise<RequestGuildMembersReturn>;
    requestGuildSync(guildID: string): void;
    reset(): void;
    restartGuildCreateTimeout(): void;
    resume(): void;
    sendStatusUpdate(): void;
    sendWS(op: number, _data: Record<string, unknown>, priority?: boolean): void;
    syncGuild(guildID: string): void;
    wsEvent(packet: Required<RawPacket>): void;
    on: ShardEvents<this>;
    toJSON(props?: string[]): JSONCache;
  }

  export class ShardManager extends Collection<Shard> implements SimpleJSON {
    connectQueue: Shard[];
    connectTimeout: NodeJS.Timer | null;
    lastConnect: number;
    constructor(client: Client);
    connect(shard: Shard): void;
    spawn(id: number): void;
    tryConnect(): void;
    toString(): string;
    toJSON(props?: string[]): JSONCache;
  }

  export class SharedStream extends EventEmitter {
    bitrate: number;
    channels: number;
    current?: VoiceStreamCurrent;
    ended: boolean;
    frameDuration: number;
    piper: Piper;
    playing: boolean;
    samplingRate: number;
    speaking: boolean;
    voiceConnections: Collection<VoiceConnection>;
    volume: number;
    add(connection: VoiceConnection): void;
    play(resource: ReadableStream | string, options?: VoiceResourceOptions): void;
    remove(connection: VoiceConnection): void;
    setSpeaking(value: boolean): void;
    setVolume(volume: number): void;
    stopPlaying(): void;
    on: StreamEvents<this>;
  }

  export class StageChannel extends VoiceChannel {
    topic?: string;
    type: 13;
  }

  export class StoreChannel extends GuildChannel {
    type: 6;
    edit(options: Omit<EditChannelOptions, "icon" | "ownerID">, reason?: string): Promise<this>;
  }

  export class TextChannel extends GuildChannel implements GuildTextable, Invitable {
    lastMessageID: string;
    lastPinTimestamp: number | null;
    messages: Collection<Message<this>>;
    rateLimitPerUser: number;
    topic: string | null;
    type: 0 | 5;
    constructor(data: BaseData, guild: Guild, messageLimit: number);
    addMessageReaction(messageID: string, reaction: string): Promise<void>;
    /** @deprecated */
    addMessageReaction(messageID: string, reaction: string, userID: string): Promise<void>;
    createInvite(options?: CreateInviteOptions, reason?: string): Promise<Invite<"withMetadata", TextChannel>>;
    createMessage(content: MessageContent, file?: MessageFile | MessageFile[]): Promise<Message<TextChannel>>;
    createWebhook(options: { name: string; avatar?: string | null}, reason?: string): Promise<Webhook>;
    deleteMessage(messageID: string, reason?: string): Promise<void>;
    deleteMessages(messageIDs: string[], reason?: string): Promise<void>;
    edit(options: Omit<EditChannelOptions, "icon" | "ownerID">, reason?: string): Promise<this>;
    editMessage(messageID: string, content: MessageContent): Promise<Message<TextChannel>>;
    getInvites(): Promise<(Invite<"withMetadata", TextChannel>)[]>;
    getMessage(messageID: string): Promise<Message<TextChannel>>;
    getMessageReaction(messageID: string, reaction: string, options?: GetMessageReactionOptions): Promise<User[]>;
    /** @deprecated */
    getMessageReaction(messageID: string, reaction: string, limit?: number, before?: string, after?: string): Promise<User[]>;
    getMessages(options?: GetMessagesOptions): Promise<Message<TextChannel>[]>;
    /** @deprecated */
    getMessages(limit?: number, before?: string, after?: string, around?: string): Promise<Message<TextChannel>[]>;
    getPins(): Promise<Message<TextChannel>[]>;
    getWebhooks(): Promise<Webhook[]>;
    pinMessage(messageID: string): Promise<void>;
    purge(options: PurgeChannelOptions): Promise<number>;
    /** @deprecated */
    purge(limit: number, filter?: (message: Message<this>) => boolean, before?: string, after?: string, reason?: string): Promise<number>;
    removeMessageReaction(messageID: string, reaction: string, userID?: string): Promise<void>;
    removeMessageReactionEmoji(messageID: string, reaction: string): Promise<void>;
    removeMessageReactions(messageID: string): Promise<void>;
    sendTyping(): Promise<void>;
    unpinMessage(messageID: string): Promise<void>;
    unsendMessage(messageID: string): Promise<void>;
  }

  export class UnavailableGuild extends Base {
    createdAt: number;
    id: string;
    shard: Shard;
    unavailable: boolean;
    constructor(data: BaseData, client: Client);
  }

  export class User extends Base {
    avatar: string | null;
    avatarURL: string;
    bot: boolean;
    createdAt: number;
    defaultAvatar: string;
    defaultAvatarURL: string;
    discriminator: string;
    id: string;
    mention: string;
    publicFlags?: number;
    staticAvatarURL: string;
    system: boolean;
    username: string;
    constructor(data: BaseData, client: Client);
    addRelationship(block?: boolean): Promise<void>;
    deleteNote(): Promise<void>;
    dynamicAvatarURL(format?: ImageFormat, size?: number): string;
    editNote(note: string): Promise<void>;
    getDMChannel(): Promise<PrivateChannel>;
    getProfile(): Promise<UserProfile>;
    removeRelationship(): Promise<void>;
  }

  export class VoiceChannel extends GuildChannel implements Invitable {
    bitrate: number;
    rtcRegion: string | null;
    type: 2 | 13;
    userLimit: number;
    videoQualityMode: VideoQualityMode;
    voiceMembers: Collection<Member>;
    createInvite(options?: CreateInviteOptions, reason?: string): Promise<Invite<"withMetadata", VoiceChannel>>;
    getInvites(): Promise<(Invite<"withMetadata", VoiceChannel>)[]>;
    join(options: { opusOnly?: boolean; shared?: boolean }): Promise<VoiceConnection>;
    leave(): void;
  }

  export class VoiceConnection extends EventEmitter implements SimpleJSON {
    bitrate: number;
    channelID: string | null;
    channels: number;
    connecting: boolean;
    connectionTimeout: NodeJS.Timeout | null;
    current?: VoiceStreamCurrent | null;
    ended?: boolean;
    endpoint: URL;
    frameDuration: number;
    frameSize: number;
    heartbeatInterval: NodeJS.Timeout | null;
    id: string;
    mode?: string;
    modes?: string;
    /** Optional dependencies OpusScript (opusscript) or OpusEncoder (@discordjs/opus) */
    opus: { [userID: string]: unknown };
    opusOnly: boolean;
    paused: boolean;
    pcmSize: number;
    piper: Piper;
    playing: boolean;
    ready: boolean;
    receiveStreamOpus?: VoiceDataStream | null;
    receiveStreamPCM?: VoiceDataStream | null;
    reconnecting: boolean;
    samplingRate: number;
    secret: Buffer;
    sendBuffer: Buffer;
    sendNonce: Buffer;
    sequence: number;
    shard: Shard | Record<string, never>;
    shared: boolean;
    speaking: boolean;
    ssrc?: number;
    ssrcUserMap: { [s: number]: string };
    timestamp: number;
    udpIP?: string;
    udpPort?: number;
    udpSocket: DgramSocket | null;
    volume: number;
    ws: BrowserWebSocket | WebSocket | null;
    constructor(id: string, options?: { shard?: Shard; shared?: boolean; opusOnly?: boolean });
    connect(data: VoiceConnectData): NodeJS.Timer | void;
    disconnect(error?: Error, reconnecting?: boolean): void;
    heartbeat(): void;
    pause(): void;
    play(resource: ReadableStream | string, options?: VoiceResourceOptions): void;
    receive(type: "opus" | "pcm"): VoiceDataStream;
    registerReceiveEventHandler(): void;
    resume(): void;
    sendWS(op: number, data: Record<string, unknown>): void;
    setSpeaking(value: boolean): void;
    setVolume(volume: number): void;
    stopPlaying(): void;
    switchChannel(channelID: string): void;
    updateVoiceState(selfMute: boolean, selfDeaf: boolean): void;
    on: VoiceEvents<this>;
    toJSON(props?: string[]): JSONCache;
  }

  export class VoiceConnectionManager<T extends VoiceConnection = VoiceConnection> extends Collection<T> implements SimpleJSON {
    constructor(vcObject: new () => T);
    join(guildID: string, channelID: string, options: VoiceResourceOptions): Promise<VoiceConnection>;
    leave(guildID: string): void;
    switch(guildID: string, channelID: string): void;
    voiceServerUpdate(data: VoiceServerUpdateData): void;
    toJSON(props?: string[]): JSONCache;
  }

  export class VoiceDataStream extends EventEmitter {
    type: "opus" | "pcm";
    constructor(type: string);
    on(event: "data", listener: (data: Buffer, userID: string, timestamp: number, sequence: number) => void): this;
  }

  export class VoiceState extends Base {
    channelID: string | null;
    createdAt: number;
    deaf: boolean;
    id: string;
    mute: boolean;
    requestToSpeakTimestamp: number | null;
    selfDeaf: boolean;
    selfMute: boolean;
    selfStream: boolean;
    selfVideo: boolean;
    sessionID: string | null;
    suppress: boolean;
    constructor(data: BaseData);
  }
}

export = Eris;
