import { EventEmitter } from "events";
import { Duplex, Readable as ReadableStream, Stream } from "stream";
import { Agent as HTTPSAgent } from "https";
import { IncomingMessage, ClientRequest } from "http";
import OpusScript = require("opusscript"); // Thanks TypeScript

declare function Eris(token: string, options?: Eris.ClientOptions): Eris.Client;

declare namespace Eris {
  export const Constants: Constants;
  export const VERSION: string;

  // TYPES
  // Channel
  type AnyChannel = AnyGuildChannel | PrivateChannel;
  type AnyGuildChannel = GuildTextableChannel | VoiceChannel | CategoryChannel | StoreChannel;
  type ChannelTypes = Constants["ChannelTypes"][keyof Constants["ChannelTypes"]];
  type GuildTextableChannel = TextChannel | NewsChannel;
  type InviteChannel = InvitePartialChannel | Exclude<AnyGuildChannel, CategoryChannel>;
  type TextableChannel = (GuildTextable & GuildTextableChannel) | (Textable & PrivateChannel);

  // Command
  type CommandGenerator = CommandGeneratorFunction | MessageContent | MessageContent[] | CommandGeneratorFunction[];
  type CommandGeneratorFunction = (msg: Message, args: string[]) => GeneratorFunctionReturn;
  type GeneratorFunctionReturn = Promise<MessageContent> | Promise<void> | MessageContent | void;
  type GenericCheckFunction<T> = (msg: Message) => T;
  type ReactionButtonsFilterFunction = (msg: Message, emoji: Emoji, userID: string) => boolean;
  type ReactionButtonsGeneratorFunction = (msg: Message, args: string[], userID: string) => GeneratorFunctionReturn;
  type ReactionButtonsGenerator = ReactionButtonsGeneratorFunction | MessageContent | MessageContent[] | ReactionButtonsGeneratorFunction[];

  // Gateway/REST
  type IntentStrings = keyof Constants["Intents"];
  type ReconnectDelayFunction = (lastDelay: number, attempts: number) => number;
  type RequestMethod = "GET" | "PATCH" | "DELETE" | "POST" | "PUT";

  // Guild
  type PossiblyUncachedGuild = Guild | { id: string };

  // Message
  type AdvancedMessageContent = {
    allowedMentions?: AllowedMentions;
    content?: string;
    embed?: EmbedOptions;
    flags?: number;
    tts?: boolean;
  };
  type ImageFormat = "jpg" | "jpeg" | "png" | "gif" | "webp";
  type MessageContent = string | AdvancedMessageContent;
  type PossiblyUncachedMessage = Message | { channel: TextableChannel | { id: string; guild: { id: string } }; guildID: string; id: string };

  // Permission
  type PermissionType = "role" | "member";

  // Presence/Relationship
  type ActivityType = BotActivityType | 4;
  type BotActivityType = 0 | 1 | 2 | 3;
  type FriendSuggestionReasons = { name: string; platform_type: string; type: number }[];
  type Status = "online" | "idle" | "dnd" | "offline";

  // Voice
  type ConverterCommand = "./ffmpeg" | "./avconv" | "ffmpeg" | "avconv";


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
  }
  export interface GuildTextable extends Textable {
    lastPinTimestamp: number | null;
    rateLimitPerUser: number;
    topic: string | null;
    createWebhook(options: { name: string; avatar: string }, reason?: string): Promise<Webhook>;
    deleteMessages(messageIDs: string[], reason?: string): Promise<void>;
    getWebhooks(): Promise<Webhook[]>;
    purge(limit: number, filter?: (message: Message<GuildTextable>) => boolean, before?: string, after?: string, reason?: string): Promise<number>;
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
  interface Textable {
    lastMessageID: string;
    messages: Collection<Message>;
    /** @deprecated */
    addMessageReaction(messageID: string, reaction: string, userID: string): Promise<void>;
    addMessageReaction(messageID: string, reaction: string): Promise<void>;
    createMessage(content: MessageContent, file?: MessageFile | MessageFile[]): Promise<Message>;
    deleteMessage(messageID: string, reason?: string): Promise<void>;
    editMessage(messageID: string, content: MessageContent): Promise<Message>;
    getMessage(messageID: string): Promise<Message>;
    getMessageReaction(
      messageID: string,
      reaction: string,
      limit?: number,
      before?: string,
      after?: string
    ): Promise<User[]>;
    getMessages(limit?: number, before?: string, after?: string, around?: string): Promise<Message[]>;
    getPins(): Promise<Message[]>;
    pinMessage(messageID: string): Promise<void>;
    removeMessageReaction(messageID: string, reaction: string, userID: string): Promise<void>;
    removeMessageReaction(messageID: string, reaction: string): Promise<void>;
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
    latencyThreshold?: number;
    maxReconnectAttempts?: number;
    maxResumeAttempts?: number;
    maxShards?: number | "auto";
    messageLimit?: number;
    opusOnly?: boolean;
    rateLimiterOffset?: number;
    requestTimeout?: number;
    reconnectDelay?: ReconnectDelayFunction;
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
    cooldownMessage?: string | GenericCheckFunction<string> | false;
    cooldownReturns?: number;
    defaultSubcommandOptions?: CommandOptions;
    deleteCommand?: boolean;
    description?: string;
    dmOnly?: boolean;
    errorMessage?: string | GenericCheckFunction<string>;
    fullDescription?: string;
    guildOnly?: boolean;
    hidden?: boolean;
    hooks?: Hooks;
    invalidUsageMessage?: string | GenericCheckFunction<string> | false;
    permissionMessage?: string | GenericCheckFunction<string> | false;
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
    custom?: GenericCheckFunction<void>;
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
    id: string;
    managed: boolean;
    require_colons: boolean;
    roles: string[];
    user: PartialUser;
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
  interface OldGuild {
    afkChannelID?: string;
    afkTimeout: number;
    banner?: string;
    defaultNotifications: 0 | 1;
    description?: string;
    emojis: (Omit<Emoji, "user" | "icon"> & { available: boolean })[];
    explicitContentFilter: 0 | 1 | 2;
    features: string[];
    icon: string;
    large: boolean;
    maxPresences?: number;
    mfaLevel: 0 | 1;
    name: string;
    ownerID: string;
    preferredLocale?: string;
    publicUpdatesChannelID?: string;
    region: string;
    rulesChannelID?: string;
    splash?: string;
    systemChannelID?: string;
    verificationLevel: 0 | 1 | 2 | 3 | 4;
  }
  interface OldGuildChannel {
    bitrate?: number;
    name: string;
    nsfw: boolean;
    parentID?: string;
    permissionOverwrites: Collection<PermissionOverwrite>;
    rateLimitPerUser?: number;
    position: number;
    topic?: string;
    type: Exclude<ChannelTypes, 1 | 3>;
    userLimit?: number;
  }
  interface OldMessage {
    attachments: Attachment[];
    channelMentions: string[];
    content: string;
    editedTimestamp?: number;
    embeds: Embed[];
    mentionedBy?: unknown;
    mentions: string[];
    pinned: boolean;
    roleMentions: string[];
    tts: boolean;
  }
  interface OldGroupChannel {
    name: string;
    ownerID: string;
    icon: string;
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
    (event: "channelUpdate", listener: (channel: AnyChannel, oldChannel: OldGuildChannel | OldGroupChannel) => void): T;
    (event: "connect" | "shardPreReady", listener: (id: number) => void): T;
    (event: "friendSuggestionCreate", listener: (user: User, reasons: FriendSuggestionReasons) => void): T;
    (event: "friendSuggestionDelete", listener: (user: User) => void): T;
    (event: "guildBanAdd" | "guildBanRemove", listener: (guild: Guild, user: User) => void): T;
    (event: "guildAvailable" | "guildCreate", listener: (guild: Guild) => void): T;
    (event: "guildDelete", listener: (guild: PossiblyUncachedGuild) => void): T;
    (event: "guildEmojisUpdate", listener: (guild: Guild, emojis: Emoji[], oldEmojis: Emoji[]) => void): T;
    (event: "guildMemberAdd", listener: (guild: Guild, member: Member) => void): T;
    (event: "guildMemberChunk", listener: (guild: Guild, members: Member[]) => void): T;
    (event: "guildMemberRemove", listener: (guild: Guild, member: Member | MemberPartial) => void): T;
    (
      event: "guildMemberUpdate",
      listener: (guild: Guild, member: Member, oldMember: { nick?: string; premiumSince: number; roles: string[] } | null) => void
    ): T;
    (event: "guildRoleCreate" | "guildRoleDelete", listener: (guild: Guild, role: Role) => void): T;
    (event: "guildRoleUpdate", listener: (guild: Guild, role: Role, oldRole: OldRole) => void): T;
    (event: "guildUnavailable" | "unavailableGuildCreate", listener: (guild: UnavailableGuild) => void): T;
    (event: "guildUpdate", listener: (guild: Guild, oldGuild: OldGuild) => void): T;
    (event: "hello", listener: (trace: string[], id: number) => void): T;
    (event: "inviteCreate" | "inviteDelete", listener: (guild: Guild, invite: Invite & InviteWithMetadata) => void): T;
    (event: "messageCreate", listener: (message: Message) => void): T;
    (event: "messageDelete" | "messageReactionRemoveAll", listener: (message: PossiblyUncachedMessage) => void): T;
    (event: "messageReactionRemoveEmoji", listener: (message: PossiblyUncachedMessage, emoji: PartialEmoji) => void): T;
    (event: "messageDeleteBulk", listener: (messages: PossiblyUncachedMessage[]) => void): T;
    (
      event: "messageReactionAdd",
      listener: (message: PossiblyUncachedMessage, emoji: Emoji, reactor: Member | { id: string }) => void
    ): T;
    (
      event: "messageReactionRemove",
      listener: (message: PossiblyUncachedMessage, emoji: PartialEmoji, userID: string) => void
    ): T;
    (event: "messageUpdate", listener: (message: Message, oldMessage: OldMessage | null) => void
    ): T;
    (event: "presenceUpdate", listener: (other: Member | Relationship, oldPresence: Presence | null) => void): T;
    (event: "rawREST", listener: (request: RawRESTRequest) => void): T;
    (event: "rawWS" | "unknown", listener: (packet: RawPacket, id: number) => void): T;
    (event: "relationshipAdd" | "relationshipRemove", listener: (relationship: Relationship) => void): T;
    (
      event: "relationshipUpdate",
      listener: (relationship: Relationship, oldRelationship: { type: number }) => void
    ): T;
    (event: "typingStart", listener: (channel: TextableChannel | { id: string }, user: User | { id: string }) => void): T;
    (
      event: "userUpdate",
      listener: (user: User, oldUser: PartialUser | null) => void
    ): T;
    (event: "voiceChannelJoin", listener: (member: Member, newChannel: VoiceChannel) => void): T;
    (event: "voiceChannelLeave", listener: (member: Member, oldChannel: VoiceChannel) => void): T;
    (
      event: "voiceChannelSwitch",
      listener: (member: Member, newChannel: VoiceChannel, oldChannel: VoiceChannel) => void
    ): T;
    (event: "voiceStateUpdate", listener: (member: Member, oldState: OldVoiceState) => void): T;
    (event: "warn" | "debug", listener: (message: string, id: number) => void): T;
    (event: "webhooksUpdate", listener: (data: WebhookData) => void): T;
    (event: string, listener: (...args: any[]) => void): T;
  }
  interface ClientEvents<T> extends EventListeners<T> {
    (event: "shardReady" | "shardResume", listener: (id: number) => void): T;
    (
      event: "shardDisconnect" | "error",
      listener: (err: Error, id: number) => void
    ): T;
  }
  interface ShardEvents<T> extends EventListeners<T> {
    (event: "disconnect", listener: (err: Error) => void): T;
    (event: "resume", listener: () => void): T;
  }
  interface VoiceEvents<T> {
    (event: "debug" | "warn", listener: (message: string) => void): T;
    (event: "error" | "disconnect", listener: (err: Error) => void): T;
    (event: "pong", listener: (latency: number) => void): T;
    (event: "speakingStart", listener: (userID: string) => void): T;
    (event: "speakingStop", listener: (userID: string) => void): T;
    (event: "end", listener: () => void): T;
    (event: "userDisconnect", listener: (userID: string) => void): T;
  }

  // Gateway/REST
  interface HTTPResponse {
    message: string;
    code: number;
  }
  interface LatencyRef {
    lastTimeOffsetCheck: number;
    latency: number;
    offset: number;
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
    body: unknown;
    file?: MessageFile;
    method: string;
    resp: IncomingMessage;
    route: string;
    short: boolean;
    url: string;
  }

  // Guild
  interface CreateGuildOptions {
    afkChannelID?: string;
    afkTimeout?: number;
    channels?: PartialChannel[];
    defaultNotifications?: number;
    explicitContentFilter?: number;
    icon?: string;
    region?: string;
    roles?: PartialRole[];
    systemChannelID: string;
    verificationLevel?: number;
  }
  interface GetPruneOptions {
    days?: number;
    includeRoles?: string[];
  }
  interface GuildAuditLog {
    entries: GuildAuditLogEntry[];
    users: User[];
  }
  interface Widget {
    channel_id?: string;
    enabled: boolean;
  }
  interface GuildOptions {
    afkChannelID?: string;
    afkTimeout?: number;
    banner?: string;
    defaultNotifications?: number;
    description?: string;
    explicitContentFilter?: number;
    icon?: string;
    name?: string;
    ownerID?: string;
    preferredLocale?: string;
    publicUpdatesChannelID?: string;
    region?: string;
    rulesChannelID?: string;
    splash?: string;
    systemChannelID?: string;
    verificationLevel?: number;
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

  // Invite
  interface CreateInviteOptions {
    maxAge?: number;
    maxUses?: number;
    temporary?: boolean;
    unique?: boolean;
  }
  interface Invitable {
    createInvite(options?: CreateInviteOptions, reason?: string): Promise<Invite & InviteWithoutMetadata<null>>;
    getInvites(): Promise<(Invite & InviteWithMetadata)[]>;
  }
  interface InviteWithMetadata<T extends Exclude<AnyGuildChannel, CategoryChannel | StoreChannel> = Exclude<AnyGuildChannel, CategoryChannel | StoreChannel>> {
    channel: T;
    createdAt: number;
    guild: Guild;
    maxAge: number;
    maxUses: number;
    memberCount: null;
    presenceCount: null;
    temporary: boolean;
    uses: number;
  }
  interface InviteWithoutMetadata<T extends boolean | null, C extends InviteChannel = InviteChannel> {
    channel: C;
    createdAt: null;
    guild: C extends Exclude<InviteChannel, InvitePartialChannel> ? Guild : Guild | undefined;
    maxAge: null;
    maxUses: null;
    memberCount: T;
    presenceCount: T;
    temporary: null;
    uses: null;
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
    user_ids?: string[];
    nonce: string;
  }
  interface RequestGuildMembersReturn {
    members: Member[];
    res: (value?: unknown) => void;
    received: number;
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
    roles?: boolean | string[];
    users?: boolean | string[];
  }
  interface Attachment {
    filename: string;
    id: string;
    proxy_url: string;
    size: number;
    url: string;
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
  interface MessageReference {
    channelID: string;
    guildID: string;
    messageID: string;
  }

  // Presence
  interface Activity extends ActivityPartial<ActivityType> {
    application_id?: string;
    assets?: {
      small_text?: string;
      small_image?: string;
      large_text?: string;
      large_image?: string;
      [key: string]: unknown;
    };
    created_at: number;
    details?: string;
    emoji?: { name: string; id?: string; animated?: boolean };
    flags?: number;
    instance?: boolean;
    party?: { id?: string; size?: [number, number] };
    secrets?: { join?: string; spectate?: string; match?: string };
    state?: string;
    timestamps?: { start: number; end?: number };
    // the stuff attached to this object apparently varies even more than documented, so...
    [key: string]: unknown;
  }
  interface ActivityPartial<T extends ActivityType = BotActivityType> {
    name: string;
    type: T;
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
    allow: number;
    deny: number;
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
    permissions?: number;
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
    sampleRate?: number;
    voiceDataTimeout?: number;
  }
  interface VoiceServerUpdateData extends Omit<VoiceConnectData, "channel_id"> {
    guild_id: string;
    shard: Shard;
  }
  interface VoiceStreamCurrent {
    options: VoiceResourceOptions;
    pausedTime?: number;
    pausedTimestamp?: number;
    playTime: number;
    startTime: number;
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
    file?: { file: Buffer; name: string } | { file: Buffer; name: string }[];
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
    members: OAuthTeamMember;
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
      [key: string]: number;
    };
    ChannelTypes: {
      GUILD_TEXT: 0;
      DM: 1;
      GUILD_VOICE: 2;
      GROUP_DM: 3;
      GUILD_CATEGORY: 4;
      GUILD_NEWS: 5;
      GUILD_STORE: 6;
      [key: string]: number;
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
      [key: string]: number;
    };
    ImageFormats: ["jpg", "jpeg", "png", "webp", "gif"];
    ImageSizeBoundaries: {
      MAXIMUM: 4096;
      MINIMUM: 16;
      [key: string]: number;
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
      [key: string]: number;
    };
    MessageActivityTypes: {
      JOIN: 1;
      SPECTATE: 2;
      LISTEN: 3;
      JOIN_REQUEST: 5;
      [key: string]: number;
    };
    MessageFlags: {
      CROSSPOSTED: 0;
      IS_CROSSPOST: 2;
      SUPPRESS_EMBEDS: 4;
      SOURCE_MESSAGE_DELETED: 8;
      URGENT: 16;
      [key: string]: number;
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
      [key: string]: number;
    };
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
      [key: string]: number;
    };
    REST_VERSION: 7;
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
      [key: string]: number;
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
      [key: string]: number;
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
      muted: boolean;
      message_notifications: number;
      channel_id: string;
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
    connected_accounts: { verified: boolean; type: string; id: string; name: string }[];
    mutual_guilds: { nick?: string; id: string }[];
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
    restricted_guilds: string[];
    render_reactions: boolean;
    show_current_game: boolean;
    status: string;
    theme: string;
  }


  class Base implements SimpleJSON {
    createdAt: number;
    id: string;
    constructor(id: string);
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
    bot?: boolean;
    channelGuildMap: { [s: string]: string };
    gatewayURL?: string;
    groupChannels: Collection<GroupChannel>;
    guilds: Collection<Guild>;
    guildShardMap: { [s: string]: number };
    notes: { [s: string]: string };
    options: ClientOptions;
    privateChannelMap: { [s: string]: string };
    privateChannels: Collection<PrivateChannel>;
    relationships: Collection<Relationship>;
    requestHandler: RequestHandler;
    shards: ShardManager;
    startTime: number;
    token?: string;
    unavailableGuilds: Collection<UnavailableGuild>;
    uptime: number;
    user: ExtendedUser;
    userGuildSettings: { [s: string]: GuildSettings };
    users: Collection<User>;
    userSettings: UserSettings;
    voiceConnections: VoiceConnectionManager;
    constructor(token: string, options?: ClientOptions);
    acceptInvite(inviteID: string): Promise<Invite & InviteWithoutMetadata<null>>;
    addGroupRecipient(groupID: string, userID: string): Promise<void>;
    addGuildMemberRole(guildID: string, memberID: string, roleID: string, reason?: string): Promise<void>;
    /** @deprecated */
    addMessageReaction(channelID: string, messageID: string, reaction: string, userID: string): Promise<void>;
    addMessageReaction(channelID: string, messageID: string, reaction: string): Promise<void>;
    addRelationship(userID: string, block?: boolean): Promise<void>;
    addSelfPremiumSubscription(token: string, plan: string): Promise<void>;
    banGuildMember(guildID: string, userID: string, deleteMessageDays?: number, reason?: string): Promise<void>;
    closeVoiceConnection(guildID: string): void;
    connect(): Promise<void>;
    createChannel(guildID: string, name: string): Promise<TextChannel>;
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
      type?: number,
      options?: CreateChannelOptions
    ): Promise<unknown>;
    createChannelInvite(
      channelID: string,
      options?: CreateChannelInviteOptions,
      reason?: string
    ): Promise<Invite & InviteWithoutMetadata<null>>;
    createChannelWebhook(
      channelID: string,
      options: { name: string; avatar: string },
      reason?: string
    ): Promise<Webhook>;
    createGroupChannel(userIDs: string[]): Promise<GroupChannel>;
    createGuild(name: string, options?: CreateGuildOptions): Promise<Guild>;
    createGuildEmoji(guildID: string, options: EmojiOptions, reason?: string): Promise<Emoji>;
    createMessage(channelID: string, content: MessageContent, file?: MessageFile | MessageFile[]): Promise<Message>;
    createRole(guildID: string, options?: RoleOptions | Role, reason?: string): Promise<Role>;
    crosspostMessage(channelID: string, messageID: string): Promise<Message>;
    deleteChannel(channelID: string, reason?: string): Promise<void>;
    deleteChannelPermission(channelID: string, overwriteID: string, reason?: string): Promise<void>;
    deleteGuild(guildID: string): Promise<void>;
    deleteGuildEmoji(guildID: string, emojiID: string, reason?: string): Promise<void>;
    deleteGuildIntegration(guildID: string, integrationID: string): Promise<void>;
    deleteInvite(inviteID: string, reason?: string): Promise<void>;
    deleteMessage(channelID: string, messageID: string, reason?: string): Promise<void>;
    deleteMessages(channelID: string, messageIDs: string[], reason?: string): Promise<void>;
    deleteRole(guildID: string, roleID: string, reason?: string): Promise<void>;
    deleteSelfConnection(platform: string, id: string): Promise<void>;
    deleteSelfPremiumSubscription(): Promise<void>;
    deleteUserNote(userID: string): Promise<void>;
    deleteWebhook(webhookID: string, token?: string, reason?: string): Promise<void>;
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
      allow: number,
      deny: number,
      type: string,
      reason?: string
    ): Promise<void>;
    editChannelPosition(channelID: string, position: number): Promise<void>;
    editGuild(guildID: string, options: GuildOptions, reason?: string): Promise<Guild>;
    editGuildEmoji(
      guildID: string,
      emojiID: string,
      options: { name?: string; roles?: string[] },
      reason?: string
    ): Promise<Emoji>;
    editGuildIntegration(guildID: string, integrationID: string, options: IntegrationOptions): Promise<void>;
    editGuildMember(guildID: string, memberID: string, options: MemberOptions, reason?: string): Promise<void>;
    editGuildWidget(guildID: string, options: Widget): Promise<Widget>
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
    enableSelfMFATOTP(
      secret: string,
      code: string
    ): Promise<{ backup_codes: { code: string; consumed: boolean }[]; token: string }>;
    executeSlackWebhook(webhookID: string, token: string, options: Record<string, unknown> & { auth?: boolean }): Promise<void>;
    executeSlackWebhook(webhookID: string, token: string, options: Record<string, unknown> & { auth?: boolean; wait: true }): Promise<Message<GuildTextableChannel>>;
    executeWebhook(webhookID: string, token: string, options: WebhookPayload & { wait: true }): Promise<Message<GuildTextableChannel>>;
    executeWebhook(webhookID: string, token: string, options: WebhookPayload): Promise<void>;
    followChannel(channelID: string, webhookChannelID: string): Promise<ChannelFollow>;
    getBotGateway(): Promise<{ session_start_limit: { remaining: number; reset_after: number; total: number }; shards: number; url: string }>; // max_concurrency: number; in session_start_limit?
    getChannel(channelID: string): AnyChannel;
    getChannelInvites(channelID: string): Promise<(Invite & InviteWithMetadata)[]>;
    getChannelWebhooks(channelID: string): Promise<Webhook[]>;
    getDMChannel(userID: string): Promise<PrivateChannel>;
    getGateway(): Promise<{ url: string }>;
    getGuildAuditLogs(guildID: string, limit?: number, before?: string, actionType?: number): Promise<GuildAuditLog>;
    getGuildBan(guildID: string, userID: string): Promise<{ reason?: string; user: User }>;
    getGuildBans(guildID: string): Promise<{ reason?: string; user: User }[]>;
    /** @deprecated */
    getGuildEmbed(guildID: string): Promise<Widget>;
    getGuildIntegrations(guildID: string): Promise<GuildIntegration[]>;
    getGuildInvites(guildID: string): Promise<(Invite & InviteWithMetadata)[]>;
    getGuildPreview(guildID: string): Promise<GuildPreview>;
    getGuildVanity(guildID: string): Promise<{ code?: string; uses?: number }>;
    getGuildWebhooks(guildID: string): Promise<Webhook[]>;
    getGuildWidget(guildID: string): Promise<Widget>;
    getInvite(inviteID: string, withCounts?: false): Promise<Invite & InviteWithoutMetadata<null>>;
    getInvite(inviteID: string, withCounts: true): Promise<Invite & InviteWithoutMetadata<boolean>>;
    getMessage(channelID: string, messageID: string): Promise<Message>;
    getMessageReaction(
      channelID: string,
      messageID: string,
      reaction: string,
      limit?: number,
      before?: string,
      after?: string
    ): Promise<User[]>;
    getMessages(
      channelID: string,
      limit?: number,
      before?: string,
      after?: string,
      around?: string
    ): Promise<Message[]>;
    getOAuthApplication(appID?: string): Promise<OAuthApplicationInfo>;
    getPins(channelID: string): Promise<Message[]>;
    getPruneCount(guildID: string, options?: GetPruneOptions): Promise<number>;
    getRESTChannel(channelID: string): Promise<AnyChannel>;
    getRESTGuild(guildID: string, withCounts?: boolean): Promise<Guild>;
    getRESTGuildChannels(guildID: string): Promise<AnyGuildChannel[]>;
    getRESTGuildEmoji(guildID: string, emojiID: string): Promise<Emoji>;
    getRESTGuildEmojis(guildID: string): Promise<Emoji[]>;
    getRESTGuildMember(guildID: string, memberID: string): Promise<Member>;
    getRESTGuildMembers(guildID: string, limit?: number, after?: string): Promise<Member[]>;
    getRESTGuildRoles(guildID: string): Promise<Role[]>;
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
    joinVoiceChannel(channelID: string, options?: { opusOnly?: boolean; shared?: boolean }): Promise<VoiceConnection>;
    kickGuildMember(guildID: string, userID: string, reason?: string): Promise<void>;
    leaveGuild(guildID: string): Promise<void>;
    leaveVoiceChannel(channelID: string): void;
    pinMessage(channelID: string, messageID: string): Promise<void>;
    pruneMembers(guildID: string, options?: PruneMemberOptions): Promise<number>;
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
    /** @deprecated */
    removeMessageReaction(channelID: string, messageID: string, reaction: string, userID: string): Promise<void>;
    removeMessageReaction(channelID: string, messageID: string, reaction: string): Promise<void>;
    removeMessageReactionEmoji(channelID: string, messageID: string, reaction: string): Promise<void>;
    removeMessageReactions(channelID: string, messageID: string): Promise<void>;
    removeRelationship(userID: string): Promise<void>;
    searchChannelMessages(channelID: string, query: SearchOptions): Promise<SearchResults>;
    searchGuildMembers(guildID: string, query: string, limit?: number): Promise<Member[]>;
    searchGuildMessages(guildID: string, query: SearchOptions): Promise<SearchResults>;
    sendChannelTyping(channelID: string): Promise<void>;
    syncGuildIntegration(guildID: string, integrationID: string): Promise<void>;
    unbanGuildMember(guildID: string, userID: string, reason?: string): Promise<void>;
    unpinMessage(channelID: string, messageID: string): Promise<void>;
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
    remove(obj: T | { id: string }): T | null;
    some(func: (i: T) => boolean): boolean;
    update(obj: T, extra?: unknown, replace?: boolean): T;
  }

  export class Command implements CommandOptions, SimpleJSON {
    aliases: string[];
    argsRequired: boolean;
    caseInsensitive: boolean;
    cooldown: number;
    cooldownExclusions: CommandCooldownExclusions;
    cooldownMessage: string | false | GenericCheckFunction<string>;
    cooldownReturns: number;
    defaultSubcommandOptions: CommandOptions;
    deleteCommand: boolean;
    description: string;
    dmOnly: boolean;
    errorMessage: string | GenericCheckFunction<string>;
    fullDescription: string;
    fullLabel: string;
    guildOnly: boolean;
    hidden: boolean;
    hooks: Hooks;
    invalidUsageMessage: string | false | GenericCheckFunction<string>;
    label: string;
    parentCommand?: Command;
    permissionMessage: string | false | GenericCheckFunction<string>;
    reactionButtons: null | CommandReactionButtons[];
    reactionButtonTimeout: number;
    requirements: CommandRequirements;
    restartCooldown: boolean;
    subcommandAliases: { [alias: string]: Command };
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
    onMessageReactionEvent(msg: Message, emoji: Emoji, userID: string): Promise<void>
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
    approximateMemberCount?: number;
    approximatePresenceCount?: number;
    banner: string | null;
    bannerURL: string | null;
    channels: Collection<AnyGuildChannel>;
    createdAt: number;
    defaultNotifications: number;
    description: string | null;
    emojis: Emoji[];
    explicitContentFilter: number;
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
    mfaLevel: number;
    name: string;
    ownerID: string;
    preferredLocale: string;
    premiumSubscriptionCount?: number;
    premiumTier: number;
    publicUpdatesChannelID: string;
    region: string;
    roles: Collection<Role>;
    rulesChannelID: string | null;
    shard: Shard;
    splash: string | null;
    splashURL: string | null;
    systemChannelID: string | null;
    unavailable: boolean;
    vanityURL: string | null;
    verificationLevel: number;
    voiceStates: Collection<VoiceState>;
    widgetChannelID?: string | null;
    widgetEnabled?: boolean | null;
    constructor(data: BaseData, client: Client);
    addMemberRole(memberID: string, roleID: string, reason?: string): Promise<void>;
    banMember(userID: string, deleteMessageDays?: number, reason?: string): Promise<void>;
    createChannel(name: string): Promise<TextChannel>;
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
    createChannel(name: string, type?: number, reason?: string, options?: CreateChannelOptions | string): Promise<unknown>;
    createChannel(name: string, type: 0, options?: CreateChannelOptions): Promise<TextChannel>;
    createChannel(name: string, type: 2, options?: CreateChannelOptions): Promise<VoiceChannel>;
    createChannel(name: string, type: 4, options?: CreateChannelOptions): Promise<CategoryChannel>;
    createChannel(name: string, type: 5, options?: CreateChannelOptions | string): Promise<NewsChannel>;
    createChannel(name: string, type: 6, options?: CreateChannelOptions | string): Promise<StoreChannel>;
    createChannel(name: string, type?: number, options?: CreateChannelOptions): Promise<unknown>;
    createEmoji(options: { image: string; name: string; roles?: string[] }, reason?: string): Promise<Emoji>;
    createRole(options: RoleOptions | Role, reason?: string): Promise<Role>;
    delete(): Promise<void>;
    deleteEmoji(emojiID: string, reason?: string): Promise<void>;
    deleteIntegration(integrationID: string): Promise<void>;
    deleteRole(roleID: string): Promise<void>;
    dynamicBannerURL(format?: ImageFormat, size?: number): string;
    dynamicDiscoverySplashURL(format?: ImageFormat, size?: number): string;
    dynamicIconURL(format?: ImageFormat, size?: number): string;
    dynamicSplashURL(format?: ImageFormat, size?: number): string;
    edit(options: GuildOptions, reason?: string): Promise<Guild>;
    editEmoji(emojiID: string, options: { name: string; roles?: string[] }, reason?: string): Promise<Emoji>;
    editIntegration(integrationID: string, options: IntegrationOptions): Promise<void>;
    editMember(memberID: string, options: MemberOptions, reason?: string): Promise<void>;
    editNickname(nick: string): Promise<void>;
    editRole(roleID: string, options: RoleOptions): Promise<Role>;
    editWidget(options: Widget): Promise<Widget>;
    fetchAllMembers(timeout?: number): Promise<number>;
    fetchMembers(options?: FetchMembersOptions): Promise<Member[]>;
    getAuditLogs(limit?: number, before?: string, actionType?: number): Promise<GuildAuditLog>;
    getBan(userID: string): Promise<{ reason?: string; user: User }>;
    getBans(): Promise<{ reason?: string; user: User }[]>;
    /** @deprecated */
    getEmbed(): Promise<Widget>;
    getIntegrations(): Promise<GuildIntegration>;
    getInvites(): Promise<(Invite & InviteWithMetadata)[]>;
    getPruneCount(options?: GetPruneOptions): Promise<number>;
    getRESTChannels(): Promise<AnyGuildChannel[]>;
    getRESTEmoji(emojiID: string): Promise<Emoji>;
    getRESTEmojis(): Promise<Emoji[]>;
    getRESTMember(memberID: string): Promise<Member>;
    getRESTMembers(limit?: number, after?: string): Promise<Member[]>;
    getRESTRoles(): Promise<Role[]>;
    getVanity(): Promise<{ code?: string; uses?: number }>;
    getVoiceRegions(): Promise<VoiceRegion[]>;
    getWebhooks(): Promise<Webhook[]>;
    getWidget(): Promise<Widget>;
    kickMember(userID: string, reason?: string): Promise<void>;
    leave(): Promise<void>;
    leaveVoiceChannel(): void;
    permissionsOf(memberID: string | Member): Permission;
    pruneMembers(options?: PruneMemberOptions): Promise<number>;
    removeMemberRole(memberID: string, roleID: string, reason?: string): Promise<void>;
    searchMembers(query: string, limit?: number): Promise<Member[]>;
    syncIntegration(integrationID: string): Promise<void>;
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
    reason: string | null;
    role?: Role | { id: string; name: string };
    target?: Guild | AnyGuildChannel | Member | Role | Invite | Emoji | Message | null;
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
      allow: number,
      deny: number,
      type: PermissionType,
      reason?: string
    ): Promise<PermissionOverwrite>;
    editPosition(position: number): Promise<void>;
    getInvites(): Promise<(Invite & InviteWithMetadata)[]>;
    permissionsOf(memberID: string | Member): Permission;
  }

  export class GuildIntegration extends Base {
    account: { id: string; name: string };
    createdAt: number;
    enabled: boolean;
    enableEmoticons: boolean;
    expireBehavior: number;
    expireGracePeriod: number;
    id: string;
    name: string;
    roleID: string;
    subscriberCount: number;
    syncedAt: number;
    syncing: boolean;
    type: string;
    user: User;
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
    emojis: Emoji[];
    features: string[];
    icon: string | null;
    iconURL: string | null;
    id: string;
    name: string;
    splash: string | null;
    splashURL: string | null;
    constructor(data: BaseData, client: Client);
    dynamicIconURL(format?: ImageFormat, size?: number): string;
    dynamicSplashURL(format?: ImageFormat, size?: number): string;
  }

  export class Invite extends Base {
    channel: InvitePartialChannel | Exclude<AnyGuildChannel, CategoryChannel>;
    code: string;
    // @ts-expect-error: Property is only not null when invite metadata is supplied
    createdAt: number | null;
    guild?: Guild;
    inviter?: User;
    maxAge: number | null;
    maxUses: number | null;
    memberCount: number | null;
    presenceCount: number | null;
    temporary: boolean | null;
    uses: number | null;
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

  export class Message<T extends Textable = TextableChannel> extends Base {
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
    guildID?: string;
    id: string;
    jumpLink: string;
    member: Member | null;
    mentionEveryone: boolean;
    mentions: User[];
    messageReference: MessageReference | null;
    pinned: boolean;
    prefix?: string;
    reactions: { [s: string]: unknown; count: number; me: boolean };
    roleMentions: string[];
    timestamp: number;
    tts: boolean;
    type: number;
    webhookID?: string;
    constructor(data: BaseData, client: Client);
    /** @deprecated */
    addReaction(reaction: string, userID: string): Promise<void>;
    addReaction(reaction: string): Promise<void>;
    crosspost(): T extends NewsChannel ? Promise<Message<NewsChannel>> : never;
    delete(reason?: string): Promise<void>;
    edit(content: MessageContent): Promise<Message<T>>;
    getReaction(reaction: string, limit?: number, before?: string, after?: string): Promise<User[]>;
    pin(): Promise<void>;
    /** @deprecated */
    removeReaction(reaction: string, userID: string): Promise<void>;
    removeReaction(reaction: string): Promise<void>;
    removeReactionEmoji(reaction: string): Promise<void>;
    removeReactions(): Promise<void>;
    unpin(): Promise<void>;
  }

  // News channel rate limit is always 0
  export class NewsChannel extends TextChannel {
    messages: Collection<Message<NewsChannel>>;
    rateLimitPerUser: 0;
    type: 5;
    createInvite(options?: CreateInviteOptions, reason?: string): Promise<Invite & InviteWithoutMetadata<null, NewsChannel>>;
    createMessage(content: MessageContent, file?: MessageFile | MessageFile[]): Promise<Message<NewsChannel>>;
    crosspostMessage(messageID: string): Promise<Message<NewsChannel>>;
    editMessage(messageID: string, content: MessageContent): Promise<Message<NewsChannel>>;
    follow(webhookChannelID: string): Promise<ChannelFollow>;
    getInvites(): Promise<(Invite & InviteWithMetadata<NewsChannel>)[]>;
    getMessage(messageID: string): Promise<Message<NewsChannel>>;
    getMessages(limit?: number, before?: string, after?: string, around?: string): Promise<Message<NewsChannel>[]>;
    getPins(): Promise<Message<NewsChannel>[]>;
    purge(limit: number, filter?: (message: Message<NewsChannel>) => boolean, before?: string, after?: string, reason?: string): Promise<number>;
  }

  export class Permission extends Base {
    allow: number;
    deny: number;
    json: { [s: string]: boolean };
    constructor(allow: number, deny: number);
    has(permission: string): boolean;
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
    messages: Collection<Message<PrivateChannel>>;
    recipient: User;
    type: 1 | 3;
    /** @deprecated */
    addMessageReaction(messageID: string, reaction: string, userID: string): Promise<void>;
    addMessageReaction(messageID: string, reaction: string): Promise<void>;
    createMessage(content: MessageContent, file?: MessageFile | MessageFile[]): Promise<Message<PrivateChannel>>;
    deleteMessage(messageID: string, reason?: string): Promise<void>;
    editMessage(messageID: string, content: MessageContent): Promise<Message<PrivateChannel>>;
    getMessage(messageID: string): Promise<Message<PrivateChannel>>;
    getMessageReaction(
      messageID: string,
      reaction: string,
      limit?: number,
      before?: string,
      after?: string
    ): Promise<User[]>;
    getMessages(limit?: number, before?: string, after?: string, around?: string): Promise<Message<PrivateChannel>[]>;
    getPins(): Promise<Message<PrivateChannel>[]>;
    leave(): Promise<void>;
    pinMessage(messageID: string): Promise<void>;
    /** @deprecated */
    removeMessageReaction(messageID: string, reaction: string, userID: string): Promise<void>;
    removeMessageReaction(messageID: string, reaction: string): Promise<void>;
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
    agent: HTTPSAgent;
    baseURL: string;
    globalBlock: boolean;
    latencyRef: LatencyRef;
    ratelimits: { [route: string]: SequentialBucket };
    readyQueue: (() => void)[];
    requestTimeout: number;
    userAgent: string;
    constructor(client: Client, forceQueueing?: boolean);
    globalUnblock(): void;
    request(method: RequestMethod, url: string, auth?: boolean, body?: { [s: string]: unknown }, file?: MessageFile, _route?: string, short?: boolean): Promise<Record<string, unknown>>;
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
    connecting: boolean;
    discordServerTrace?: string[];
    id: number;
    lastHeartbeatReceived: number;
    lastHeartbeatSent: number;
    latency: number;
    presence: Presence;
    ready: boolean;
    status: "disconnected" | "connecting" | "handshaking" | "ready" | "resuming";
    constructor(id: number, client: Client);
    checkReady(): void;
    connect(): void;
    createGuild(_guild: Guild): Guild;
    disconnect(options?: { reconnect?: boolean | "auto" }, error?: Error): void;
    editAFK(afk: boolean): void;
    editStatus(status?: Status, game?: ActivityPartial<BotActivityType>): void;
    editStatus(game?: ActivityPartial<BotActivityType>): void;
    // @ts-expect-error: Method override
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
  }

  export class StoreChannel extends GuildChannel {
    type: 6;
    edit(options: Omit<EditChannelOptions, "icon" | "ownerID">, reason?: string): Promise<this>;
  }

  export class TextChannel extends GuildChannel implements GuildTextable, Invitable {
    lastMessageID: string;
    lastPinTimestamp: number | null;
    messages: Collection<Message<TextChannel>>;
    rateLimitPerUser: number;
    topic: string | null;
    type: 0 | 5;
    constructor(data: BaseData, guild: Guild, messageLimit: number);
    /** @deprecated */
    addMessageReaction(messageID: string, reaction: string, userID: string): Promise<void>;
    addMessageReaction(messageID: string, reaction: string): Promise<void>;
    createInvite(options?: CreateInviteOptions, reason?: string): Promise<Invite & InviteWithoutMetadata<null, TextChannel>>;
    createMessage(content: MessageContent, file?: MessageFile | MessageFile[]): Promise<Message<TextChannel>>;
    createWebhook(options: { name: string; avatar: string }, reason?: string): Promise<Webhook>;
    deleteMessage(messageID: string, reason?: string): Promise<void>;
    deleteMessages(messageIDs: string[], reason?: string): Promise<void>;
    edit(options: Omit<EditChannelOptions, "icon" | "ownerID">, reason?: string): Promise<this>;
    editMessage(messageID: string, content: MessageContent): Promise<Message<TextChannel>>;
    getInvites(): Promise<(Invite & InviteWithMetadata<TextChannel>)[]>;
    getMessage(messageID: string): Promise<Message<TextChannel>>;
    getMessageReaction(
      messageID: string,
      reaction: string,
      limit?: number,
      before?: string,
      after?: string
    ): Promise<User[]>;
    getMessages(limit?: number, before?: string, after?: string, around?: string): Promise<Message<TextChannel>[]>;
    getPins(): Promise<Message<TextChannel>[]>;
    getWebhooks(): Promise<Webhook[]>;
    pinMessage(messageID: string): Promise<void>;
    purge(limit: number, filter?: (message: Message<TextChannel>) => boolean, before?: string, after?: string, reason?: string): Promise<number>;
    /** @deprecated */
    removeMessageReaction(messageID: string, reaction: string, userID: string): Promise<void>;
    removeMessageReaction(messageID: string, reaction: string): Promise<void>;
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
    bitrate?: number;
    type: 2;
    userLimit?: number;
    voiceMembers: Collection<Member>;
    createInvite(options?: CreateInviteOptions, reason?: string): Promise<Invite & InviteWithoutMetadata<null, VoiceChannel>>;
    getInvites(): Promise<(Invite & InviteWithMetadata<VoiceChannel>)[]>;
    join(options: { opusOnly?: boolean; shared?: boolean }): Promise<VoiceConnection>;
    leave(): void;
  }

  export class VoiceConnection extends EventEmitter implements SimpleJSON {
    channelID: string;
    connecting: boolean;
    current?: VoiceStreamCurrent;
    id: string;
    paused: boolean;
    playing: boolean;
    ready: boolean;
    volume: number;
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
    channelID?: string;
    createdAt: number;
    deaf: boolean;
    id: string;
    mute: boolean;
    selfDeaf: boolean;
    selfMute: boolean;
    selfStream: boolean;
    sessionID?: string;
    suppress: boolean;

    constructor(data: BaseData);
  }
}

export = Eris;
