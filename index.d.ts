declare module "eris" {
  // TODO good hacktoberfest PR: implement ShardManager, RequestHandler and other stuff
  import { EventEmitter } from "events";
  import { Readable as ReadableStream } from "stream";

  interface JSONCache { [s: string]: any; }

  interface SimpleJSON {
    toJSON(simple?: boolean): JSONCache;
  }

  interface NestedJSON {
    toJSON(arg?: any, cache?: Array<string | any>): JSONCache;
  }

  // TODO there's also toJSON(): JSONCache, though, SimpleJSON should suffice

  type TextableChannel = TextChannel | PrivateChannel | GroupChannel;
  type AnyChannel = TextChannel | VoiceChannel | CategoryChannel | PrivateChannel | GroupChannel;
  type AnyGuildChannel = TextChannel | VoiceChannel | CategoryChannel;

  interface CreateInviteOptions {
    maxAge?: number;
    maxUses?: number;
    temporary?: boolean;
  }

  interface Invitable {
    getInvites(): Promise<Invite[]>;
    createInvite(options?: CreateInviteOptions, reason?: string): Promise<Invite>;
  }

  interface Textable {
    lastMessageID: string;
    messages: Collection<Message>;
    sendTyping(): Promise<void>;
    getMessage(messageID: string): Promise<Message>;
    getMessages(limit?: number, before?: string, after?: string, around?: string): Promise<Message[]>;
    getPins(): Promise<Message[]>;
    createMessage(
      content: MessageContent,
      file?: MessageFile,
    ): Promise<Message>;
    editMessage(messageID: string, content: MessageContent): Promise<Message>;
    pinMessage(messageID: string): Promise<void>;
    unpinMessage(messageID: string): Promise<void>;
    getMessageReaction(
      messageID: string,
      reaction: string,
      limit?: number,
      before?: string,
      after?: string,
    ): Promise<User[]>;
    addMessageReaction(messageID: string, reaction: string, userID?: string): Promise<void>;
    removeMessageReaction(messageID: string, reaction: string, userID?: string): Promise<void>;
    removeMessageReactions(messageID: string): Promise<void>;
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

  interface OldChannel {
    name: string;
    position: string;
    topic?: string;
    bitrate?: number;
    permissionOverwrites: Collection<PermissionOverwrite>;
  }

  type FriendSuggestionReasons = Array<{ type: number, platform_type: string, name: string }>;

  interface MemberPartial { id: string; user: User; }

  interface OldPresence {
    status: string;
    game?: {
      name: string,
      type: number,
      url?: string,
    };
  }

  interface OldVoiceState { mute: boolean; deaf: boolean; selfMute: boolean; selfDeaf: boolean; }

  // To anyone snooping around this snippet of code and wondering
  // "Why didn't they use a class for this? It would make the code cleaner!"
  // I could, but TypeScript isn't smart enough to properly inherit overloaded methods,
  // so `on` event listeners would loose their type-safety.
  interface Emittable {
    // tslint:disable-next-line
    on(event: string, listener: Function): this;
    on(event: "ready" | "disconnect", listener: () => void): this;
    on(event: "callCreate" | "callRing" | "callDelete", listener: (call: Call) => void): this;
    on(
      event: "callUpdate",
      listener: (
        call: Call,
        oldCall: OldCall,
      ) => void,
    ): this;
    on(event: "channelCreate" | "channelDelete", listener: (channel: AnyChannel) => void): this;
    on(
      event: "channelPinUpdate",
      listener: (channel: TextableChannel, timestamp: number, oldTimestamp: number) => void,
    ): this;
    on(
      event: "channelRecipientAdd" | "channelRecipientRemove",
      listener: (channel: GroupChannel, user: User) => void,
    ): this;
    on(
      event: "channelUpdate",
      listener: (
        channel: AnyChannel,
        oldChannel: OldChannel,
      ) => void,
    ): this;
    on(
      event: "friendSuggestionCreate",
      listener: (user: User, reasons: FriendSuggestionReasons) => void,
    ): this;
    on(event: "friendSuggestionDelete", listener: (user: User) => void): this;
    on(
      event: "guildAvailable" | "guildBanAdd" | "guildBanRemove",
      listener: (guild: Guild, user: User) => void,
    ): this;
    on(event: "guildDelete" | "guildUnavailable" | "guildCreate", listener: (guild: Guild) => void): this;
    on(event: "guildEmojisUpdate", listener: (guild: Guild, emojis: Emoji[], oldEmojis: Emoji[]) => void): this;
    on(event: "guildMemberAdd", listener: (guild: Guild, member: Member) => void): this;
    on(event: "guildMemberChunk", listener: (guild: Guild, members: Member[]) => void): this;
    on(
      event: "guildMemberRemove",
      listener: (guild: Guild, member: Member | MemberPartial) => void,
    ): this;
    on(
      event: "guildMemberUpdate",
      listener: (guild: Guild, member: Member, oldMember: { roles: string[], nick?: string }) => void,
    ): this;
    on(event: "guildRoleCreate" | "guildRoleDelete", listener: (guild: Guild, role: Role) => void): this;
    on(event: "guildRoleUpdate", listener: (guild: Guild, role: Role, oldRole: RoleOptions) => void): this;
    on(event: "guildUpdate", listener: (guild: Guild, oldGuild: GuildOptions) => void): this;
    on(event: "hello", listener: (trace: string[], id: number) => void): this;
    on(event: "messageCreate", listener: (message: Message) => void): this;
    on(
      event: "messageDelete" | "messageReactionRemoveAll",
      listener: (message: PossiblyUncachedMessage) => void,
    ): this;
    on(event: "messageDeleteBulk", listener: (messages: PossiblyUncachedMessage[]) => void): this;
    on(
      event: "messageReactionAdd" | "messageReactionRemove",
      listener: (message: PossiblyUncachedMessage, emoji: Emoji, userID: string) => void,
    ): this;
    on(event: "messageUpdate", listener: (message: Message, oldMessage?: {
      attachments: Attachment[],
      embeds: Embed[],
      content: string,
      editedTimestamp?: number,
      mentionedBy?: any,
      tts: boolean,
      mentions: string[],
      roleMentions: string[],
      channelMentions: string[],
    }) => void): this;
    on(event: "presenceUpdate", listener: (other: Member | Relationship, oldPresence?: OldPresence) => void): this;
    on(event: "rawWS" | "unknown", listener: (packet: RawPacket, id: number) => void): this;
    on(event: "relationshipAdd" | "relationshipRemove", listener: (relationship: Relationship) => void): this;
    on(
      event: "relationshipUpdate",
      listener: (relationship: Relationship, oldRelationship: { type: number }) => void,
    ): this;
    on(event: "shardPreReady" | "connect", listener: (id: number) => void): this;
    on(event: "typingStart", listener: (channel: TextableChannel, user: User) => void): this;
    on(event: "unavailableGuildCreate", listener: (guild: UnavailableGuild) => void): this;
    on(
      event: "userUpdate",
      listener: (user: User, oldUser: { username: string, discriminator: string, avatar?: string }) => void,
    ): this;
    on(event: "voiceChannelJoin", listener: (member: Member, newChannel: VoiceChannel) => void): this;
    on(event: "voiceChannelLeave", listener: (member: Member, oldChannel: VoiceChannel) => void): this;
    on(
      event: "voiceChannelSwitch",
      listener: (member: Member, newChannel: VoiceChannel, oldChannel: VoiceChannel) => void,
    ): this;
    on(
      event: "voiceStateUpdate",
      listener: (
        member: Member,
        oldState: OldVoiceState,
      ) => void,
    ): this;
    on(event: "warn" | "debug", listener: (message: string, id: number) => void): this;
  }

  interface Constants {
    DefaultAvatarHashes: string[];
    ImageFormats: string[];
    GatewayOPCodes: {[key: string]: number};
    GATEWAY_VERSION: number;
    Permissions: {[key: string]: number};
    VoiceOPCodes: {[key: string]: number};
    SystemJoinMessages: string[];
    AuditLogActions: {[key: string]: number};
  }

  export const Constants: Constants;

  interface WebhookPayload {
    content?: string;
    file?: { file: Buffer, name: string } | Array<{ file: Buffer, name: string}>;
    embeds?: EmbedOptions[];
    username?: string;
    avatarURL?: string;
    tts?: boolean;
    wait?: boolean;
    disableEveryone?: boolean;
  }

  interface EmbedBase {
    title?: string;
    description?: string;
    url?: string;
    timestamp?: string;
    color?: number;
    footer?: { text: string, icon_url?: string, proxy_icon_url?: string };
    image?: { url?: string, proxy_url?: string, height?: number, width?: number };
    thumbnail?: { url?: string, proxy_url?: string, height?: number, width?: number };
    video?: { url: string, height?: number, width?: number };
    provider?: { name: string, url?: string };
    fields?: Array<{ name?: string, value?: string, inline?: boolean }>;
    author?: { name: string, url?: string, icon_url?: string, proxy_icon_url?: string };
  }
  type Embed = {
    type: string,
  } & EmbedBase;
  type EmbedOptions = {
    type?: string,
  } & EmbedBase;

  interface Webhook {
    name: string;
    channel_id: string;
    token: string;
    avatar?: string;
    guild_id: string;
    id: string;
    user: {
      username: string,
      discriminator: string,
      id: string,
      avatar?: string,
    };
  }

  interface GuildEmbed {
    channel_id?: string;
    enabled: boolean;
  }

  interface Attachment { url: string; proxy_url: string; size: number; id: string; filename: string; }

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
      all: boolean, // not sure about other keys, abal heeeelp
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
    channel_override: Array<{
      muted: boolean,
      message_notifications: number,
      channel_id: string,
    }>;
  }

  interface UserProfile {
    premium_since?: number;
    mutual_guilds: Array<{ nick?: string, id: string }>;
    user: { username: string, discriminator: string, flags: number, id: string, avatar?: string };
    connected_accounts: Array<{ verified: boolean, type: string, id: string, name: string }>;
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

  type MessageContent = string | { content?: string, tts?: boolean, disableEveryone?: boolean, embed?: EmbedOptions };
  interface MessageFile { file: Buffer | string; name: string; }
  interface EmojiBase {
    name: string;
    icon?: string;
  }
  type EmojiOptions = {
    roles?: string[],
  } & EmojiBase;
  type Emoji = {
    roles: string[],
  } & EmojiBase;
  interface IntegrationOptions { expireBehavior: string; expireGracePeriod: string; enableEmoticons: string; }
  interface GuildOptions {
    name?: string;
    region?: string;
    icon?: string;
    verificationLevel?: number;
    defaultNotifications?: number;
    afkChannelID?: string;
    afkTimeout?: number;
    ownerID?: string;
    splash?: string;
  }
  interface MemberOptions { roles?: string[]; nick?: string; mute?: boolean; deaf?: boolean; channelID?: string; }
  interface RoleOptions { name?: string; permissions?: number; color?: number; hoist?: boolean; mentionable?: boolean; }
  interface GamePresence { name: string; type?: number; url?: string; }
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
    channelIDs: string[];
  }
  interface SearchResults { totalResults: number; results: Array<Array<Message & { hit?: boolean }>>; }
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
  type PossiblyUncachedMessage = Message | { id: string, channel: TextableChannel };
  interface RawPacket { op: number; t?: string; d?: any; s?: number; }
  interface ClientOptions {
    autoreconnect?: boolean;
    compress?: boolean;
    connectionTimeout?: number;
    disableEvents?: { [s: string]: boolean };
    disableEveryone?: boolean;
    firstShardID?: number;
    getAllUsers?: boolean;
    guildCreateTimeout?: number;
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
      userIDs?: string[] | GenericCheckFunction<string[]>,
      roleIDs?: string[] | GenericCheckFunction<string[]>,
      roleNames?: string[] | GenericCheckFunction<string[]>,
      permissions?: { [s: string]: boolean } | GenericCheckFunction<{ [s: string]: boolean }>,
      custom?: GenericCheckFunction<void>,
    };
    cooldown?: number;
    cooldownExclusions?: {
      userIDs?: string[],
      guildIDs?: string[],
      channelIDs?: string[],
    };
    restartCooldown?: boolean;
    cooldownReturns?: number;
    cooldownMessage?: string | GenericCheckFunction<string>;
    invalidUsageMessage?: string | GenericCheckFunction<string>;
    permissionMessage?: string | GenericCheckFunction<string>;
    errorMessage?: string | GenericCheckFunction<string>;
    reactionButtons?: Array<{ emoji: string, type: string, response: CommandGenerator }>;
    reactionButtonTimeout?: number;
    defaultSubcommandOptions?: CommandOptions;
    hidden?: boolean;
  }
  type CommandGeneratorFunction = (msg: Message, args: string[]) => Promise<MessageContent> | Promise<void> | MessageContent | void;
  type CommandGenerator = CommandGeneratorFunction | MessageContent | MessageContent[] | CommandGeneratorFunction[];

  export class ShardManager extends Collection<Shard> {
    public constructor(client: Client);
    public connect(shard: Shard): void;
    public spawn(id: number): void;
    public toJSON(): string;
  }

  export class Client extends EventEmitter implements SimpleJSON, Emittable {
    public token?: string;
    public gatewayURL?: string;
    public bot?: boolean;
    public options: ClientOptions;
    public channelGuildMap: { [s: string]: string };
    public shards: ShardManager;
    public guilds: Collection<Guild>;
    public privateChannelMap: { [s: string]: string };
    public privateChannels: Collection<PrivateChannel>;
    public groupChannels: Collection<GroupChannel>;
    public voiceConnections: Collection<VoiceConnection>;
    public guildShardMap: { [s: string]: number };
    public startTime: number;
    public unavailableGuilds: Collection<UnavailableGuild>;
    public uptime: number;
    public user: ExtendedUser;
    public users: Collection<User>;
    public relationships: Collection<Relationship>;
    public userGuildSettings: { [s: string]: GuildSettings };
    public userSettings: UserSettings;
    public notes: { [s: string]: string };
    public constructor(token: string, options?: ClientOptions);
    public connect(): Promise<void>;
    public getGateway(): Promise<string>;
    public getBotGateway(): Promise<{ url: string, shards: number }>;
    public disconnect(options: { reconnect: boolean }): void;
    public joinVoiceChannel(
      channelID: string,
      options?: { shared?: boolean, opusOnly?: boolean },
    ): Promise<VoiceConnection>;
    public leaveVoiceChannel(channelID: string): void;
    public closeVoiceConnection(guildID: string): void;
    public editAFK(afk: boolean): void;
    public editStatus(status?: string, game?: GamePresence): void;
    public getChannel(channelID: string): AnyChannel;
    public createChannel(
      guildID: string,
      name: string,
      type?: number,
      reason?: string,
      parentID?: string,
    ): Promise<AnyGuildChannel>;
    public editChannel(channelID: string, options: {
      name?: string,
      icon?: string,
      ownerID?: string,
      topic?: string,
      bitrate?: number,
      userLimit?: number,
      nsfw?: boolean,
      parentID?: string,
    },                 reason?: string): Promise<GroupChannel | AnyGuildChannel>;
    public editChannelPosition(channelID: string, position: number): Promise<void>;
    public deleteChannel(channelID: string, reason?: string): Promise<void>;
    public sendChannelTyping(channelID: string): Promise<void>;
    public editChannelPermission(
      channelID: string,
      overwriteID: string,
      allow: number,
      deny: number,
      type: string,
      reason?: string,
    ): Promise<void>;
    public deleteChannelPermission(channelID: string, overwriteID: string, reason?: string): Promise<void>;
    public getChannelInvites(channelID: string): Promise<Invite[]>;
    public createChannelInvite(
      channelID: string,
      options?: { maxAge?: number, maxUses?: number, temporary?: boolean, unique?: boolean },
      reason?: string,
    ): Promise<Invite>;
    public getChannelWebhooks(channelID: string): Promise<Webhook[]>;
    public getWebhook(webhookID: string, token?: string): Promise<Webhook>;
    public createChannelWebhook(
      channelID: string,
      options: { name: string, avatar: string },
      reason?: string,
    ): Promise<Webhook>;
    public editWebhook(
      webhookID: string,
      options: { name?: string, avatar?: string },
      token?: string,
      reason?: string,
    ): Promise<Webhook>;
    public executeWebhook(webhookID: string, token: string, options: WebhookPayload): Promise<void>;
    public executeSlackWebhook(webhookID: string, token: string, options?: { wait?: boolean }): Promise<void>;
    public deleteWebhook(webhookID: string, token?: string, reason?: string): Promise<void>;
    public getGuildWebhooks(guildID: string): Promise<Webhook[]>;
    public getGuildAuditLogs(
      guildID: string,
      limit?: number,
      before?: string,
      actionType?: number,
    ): Promise<GuildAuditLog>;
    public createGuildEmoji(guildID: string, options: EmojiOptions, reason?: string): Promise<Emoji>;
    public editGuildEmoji(
      guildID: string,
      emojiID: string,
      options: { name?: string, roles?: string[] },
      reason?: string,
    ): Promise<Emoji>;
    public deleteGuildEmoji(guildID: string, emojiID: string, reason?: string): Promise<void>;
    public createRole(guildID: string, options?: RoleOptions, reason?: string): Promise<Role>;
    public editRole(
      guildID: string,
      roleID: string,
      options: RoleOptions,
      reason?: string,
    ): Promise<Role>; // TODO not all options are available?
    public editRolePosition(guildID: string, roleID: string, position: number): Promise<void>;
    public deleteRole(guildID: string, roleID: string, reason?: string): Promise<void>;
    public getPruneCount(guildID: string, days: number): Promise<number>;
    public pruneMembers(guildID: string, days: number, reason?: string): Promise<number>;
    public getVoiceRegions(guildID: string): Promise<VoiceRegion[]>;
    public getInvite(inviteID: string, withCounts?: boolean): Promise<Invite>;
    public acceptInvite(inviteID: string): Promise<Invite>;
    public deleteInvite(inviteID: string, reason?: string): Promise<void>;
    public getSelf(): Promise<ExtendedUser>;
    public editSelf(options: { username?: string, avatar?: string }): Promise<ExtendedUser>;
    public getDMChannel(userID: string): Promise<PrivateChannel>;
    public createGroupChannel(userIDs: string[]): Promise<GroupChannel>;
    public getMessage(channelID: string, messageID: string): Promise<Message>;
    public getMessages(
      channelID: string,
      limit?: number,
      before?: string,
      after?: string,
      around?: string,
    ): Promise<Message[]>;
    public getPins(channelID: string): Promise<Message[]>;
    public createMessage(channelID: string, content: MessageContent, file?: MessageFile): Promise<Message>;
    public editMessage(channelID: string, messageID: string, content: MessageContent): Promise<Message>;
    public pinMessage(channelID: string, messageID: string): Promise<void>;
    public unpinMessage(channelID: string, messageID: string): Promise<void>;
    public getMessageReaction(
      channelID: string,
      messageID: string,
      reaction: string,
      limit?: number,
      before?: string,
      after?: string,
    ): Promise<User[]>;
    public addMessageReaction(channelID: string, messageID: string, reaction: string, userID?: string): Promise<void>;
    public removeMessageReaction(
      channelID: string,
      messageID: string,
      reaction: string,
      userID?: string,
    ): Promise<void>;
    public removeMessageReactions(channelID: string, messageID: string): Promise<void>;
    public deleteMessage(channelID: string, messageID: string, reason?: string): Promise<void>;
    public deleteMessages(channelID: string, messageIDs: string[], reason?: string): Promise<void>;
    public purgeChannel(
      channelID: string,
      limit?: number,
      filter?: (m: Message) => boolean,
      before?: string,
      after?: string,
    ): Promise<number>;
    public getGuildEmbed(guildID: string): Promise<GuildEmbed>;
    public getGuildIntegrations(guildID: string): Promise<GuildIntegration[]>;
    public editGuildIntegration(guildID: string, integrationID: string, options: IntegrationOptions): Promise<void>;
    public deleteGuildIntegration(guildID: string, integrationID: string): Promise<void>;
    public syncGuildIntegration(guildID: string, integrationID: string): Promise<void>;
    public getGuildInvites(guildID: string): Promise<Invite[]>;
    public banGuildMember(guildID: string, userID: string, deleteMessageDays?: number, reason?: string): Promise<void>;
    public unbanGuildMember(guildID: string, userID: string, reason?: string): Promise<void>;
    public createGuild(name: string, region: string, icon?: string): Promise<Guild>;
    public editGuild(guildID: string, options: GuildOptions, reason?: string): Promise<Guild>;
    public getGuildBans(guildID: string): Promise<Array<{ reason?: string, user: User }>>;
    public editGuildMember(guildID: string, memberID: string, options: MemberOptions, reason?: string): Promise<void>;
    public addGuildMemberRole(guildID: string, memberID: string, roleID: string, reason?: string): Promise<void>;
    public removeGuildMemberRole(guildID: string, memberID: string, roleID: string, reason?: string): Promise<void>;
    public editNickname(guildID: string, nick: string, reason?: string): Promise<void>;
    public kickGuildMember(guildID: string, userID: string, reason?: string): Promise<void>;
    public deleteGuild(guildID: string): Promise<void>;
    public leaveGuild(guildID: string): Promise<void>;
    public getOAuthApplication(appID?: string): Promise<{
      description: string,
      name: string,
      owner: {
        username: string,
        discriminator: string,
        id: string,
        avatar?: string,
      },
      bot_public: boolean,
      bot_require_code_grant: boolean,
      id: string,
      icon?: string,
    }>;
    public addRelationship(userID: string, block?: boolean): Promise<void>;
    public removeRelationship(userID: string): Promise<void>;
    public addGroupRecipient(groupID: string, userID: string): Promise<void>;
    public removeGroupRecipient(groupID: string, userID: string): Promise<void>;
    public getUserProfile(userID: string): Promise<UserProfile>;
    public editUserNote(userID: string, note: string): Promise<void>;
    public deleteUserNote(userID: string): Promise<void>;
    public getSelfConnections(): Promise<Connection[]>;
    public editSelfConnection(
      platform: string,
      id: string,
      data: { friendSync: boolean, visibility: number },
    ): Promise<Connection>;
    public deleteSelfConnection(platform: string, id: string): Promise<void>;
    public getSelfSettings(): Promise<UserSettings>;
    public editSelfSettings(data: UserSettings): Promise<UserSettings>;
    public getSelfMFACodes(
      password: string,
      regenerate?: boolean,
    ): Promise<{ backup_codes: Array<{ code: string, consumed: boolean }> }>;
    public enableSelfMFATOTP(
      secret: string,
      code: string,
    ): Promise<{ token: string, backup_codes: Array<{ code: string, consumed: boolean }> }>;
    public disableSelfMFATOTP(code: string): Promise<{ token: string }>;
    public getSelfBilling(): Promise<{
      premium_subscription?: {
        status: number,
        ended_at?: string,
        canceled_at?: string,
        created_at: string,
        current_period_end?: string,
        current_period_start?: string,
        plan: string,
      },
      payment_source?: {
        type: string,
        brand: string,
        invalid: boolean,
        last_4: number,
        expires_year: number,
        expires_month: number,
      },
      payment_gateway?: string,
    }>;
    public getSelfPayments(): Promise<Array<{
      status: number,
      amount_refunded: number,
      description: string,
      created_at: string, // date
      currency: string,
      amount: number,
    }>>;
    public addSelfPremiumSubscription(token: string, plan: string): Promise<void>;
    public deleteSelfPremiumSubscription(): Promise<void>;
    public getRESTChannel(channelID: string): Promise<AnyChannel>;
    public getRESTGuild(guildID: string): Promise<Guild>;
    public getRESTGuilds(limit?: number, before?: string, after?: string): Promise<Guild[]>;
    public getRESTGuildChannels(guildID: string): Promise<AnyGuildChannel[]>;
    public getRESTGuildEmojis(guildID: string): Promise<Emoji[]>;
    public getRESTGuildEmoji(guildID: string, emojiID: string): Promise<Emoji>;
    public getRESTGuildMembers(guildID: string, limit?: number, after?: string): Promise<Member[]>;
    public getRESTGuildMember(guildID: string, memberID: string): Promise<Member>;
    public getRESTGuildRoles(guildID: string): Promise<Role[]>;
    public getRESTUser(userID: string): Promise<User>;
    public searchChannelMessages(channelID: string, query: SearchOptions): Promise<SearchResults>;
    public searchGuildMessages(guildID: string, query: SearchOptions): Promise<SearchResults>;
    // tslint:disable-next-line
    public on(event: string, listener: Function): this;
    public on(event: "ready" | "disconnect", listener: () => void): this;
    public on(event: "callCreate" | "callRing" | "callDelete", listener: (call: Call) => void): this;
    public on(
      event: "callUpdate",
      listener: (
        call: Call,
        oldCall: OldCall,
      ) => void,
    ): this;
    public on(event: "channelCreate" | "channelDelete", listener: (channel: AnyChannel) => void): this;
    public on(
      event: "channelPinUpdate",
      listener: (channel: TextableChannel, timestamp: number, oldTimestamp: number) => void,
    ): this;
    public on(
      event: "channelRecipientAdd" | "channelRecipientRemove",
      listener: (channel: GroupChannel, user: User) => void,
    ): this;
    public on(
      event: "channelUpdate",
      listener: (
        channel: AnyChannel,
        oldChannel: OldChannel,
      ) => void,
    ): this;
    public on(
      event: "friendSuggestionCreate",
      listener: (user: User, reasons: FriendSuggestionReasons) => void,
    ): this;
    public on(event: "friendSuggestionDelete", listener: (user: User) => void): this;
    public on(
      event: "guildAvailable" | "guildBanAdd" | "guildBanRemove",
      listener: (guild: Guild, user: User) => void,
    ): this;
    public on(event: "guildDelete" | "guildUnavailable" | "guildCreate", listener: (guild: Guild) => void): this;
    public on(event: "guildEmojisUpdate", listener: (guild: Guild, emojis: Emoji[], oldEmojis: Emoji[]) => void): this;
    public on(event: "guildMemberAdd", listener: (guild: Guild, member: Member) => void): this;
    public on(event: "guildMemberChunk", listener: (guild: Guild, members: Member[]) => void): this;
    public on(
      event: "guildMemberRemove",
      listener: (guild: Guild, member: Member | MemberPartial) => void,
    ): this;
    public on(
      event: "guildMemberUpdate",
      listener: (guild: Guild, member: Member, oldMember: { roles: string[], nick?: string }) => void,
    ): this;
    public on(event: "guildRoleCreate" | "guildRoleDelete", listener: (guild: Guild, role: Role) => void): this;
    public on(event: "guildRoleUpdate", listener: (guild: Guild, role: Role, oldRole: RoleOptions) => void): this;
    public on(event: "guildUpdate", listener: (guild: Guild, oldGuild: GuildOptions) => void): this;
    public on(event: "hello", listener: (trace: string[], id: number) => void): this;
    public on(event: "messageCreate", listener: (message: Message) => void): this;
    public on(
      event: "messageDelete" | "messageReactionRemoveAll",
      listener: (message: PossiblyUncachedMessage) => void,
    ): this;
    public on(event: "messageDeleteBulk", listener: (messages: PossiblyUncachedMessage[]) => void): this;
    public on(
      event: "messageReactionAdd" | "messageReactionRemove",
      listener: (message: PossiblyUncachedMessage, emoji: Emoji, userID: string) => void,
    ): this;
    public on(event: "messageUpdate", listener: (message: Message, oldMessage?: {
      attachments: Attachment[],
      embeds: Embed[],
      content: string,
      editedTimestamp?: number,
      mentionedBy?: any,
      tts: boolean,
      mentions: string[],
      roleMentions: string[],
      channelMentions: string[],
    }) => void): this;
    public on(
      event: "presenceUpdate",
      listener: (
        other: Member | Relationship,
        oldPresence?: OldPresence,
      ) => void,
    ): this;
    public on(event: "rawWS" | "unknown", listener: (packet: RawPacket, id: number) => void): this;
    public on(event: "relationshipAdd" | "relationshipRemove", listener: (relationship: Relationship) => void): this;
    public on(
      event: "relationshipUpdate",
      listener: (relationship: Relationship, oldRelationship: { type: number }) => void,
    ): this;
    public on(event: "typingStart", listener: (channel: TextableChannel, user: User) => void): this;
    public on(event: "unavailableGuildCreate", listener: (guild: UnavailableGuild) => void): this;
    public on(
      event: "userUpdate",
      listener: (user: User, oldUser: { username: string, discriminator: string, avatar?: string }) => void,
    ): this;
    public on(event: "voiceChannelJoin", listener: (member: Member, newChannel: VoiceChannel) => void): this;
    public on(event: "voiceChannelLeave", listener: (member: Member, oldChannel: VoiceChannel) => void): this;
    public on(
      event: "voiceChannelSwitch",
      listener: (member: Member, newChannel: VoiceChannel, oldChannel: VoiceChannel) => void,
    ): this;
    public on(
      event: "voiceStateUpdate",
      listener: (
        member: Member,
        oldState: OldVoiceState,
      ) => void,
    ): this;
    public on(event: "warn" | "debug", listener: (message: string, id: number) => void): this;
    public on(
      event: "shardDisconnect" | "error" | "shardPreReady" | "connect",
      listener: (err: Error, id: number) => void,
    ): this;
    public on(event: "shardReady" | "shardResume", listener: (id: number) => void): this;
    public toJSON(simple?: boolean): JSONCache;
  }

  export class VoiceConnection extends EventEmitter implements SimpleJSON {
    public id: string;
    public channelID: string;
    public connecting: boolean;
    public ready: boolean;
    public playing: boolean;
    public paused: boolean;
    public volume: number;
    public current?: {
      startTime: number,
      playTime: number,
      pausedTimestamp?: number,
      pausedTime?: number,
      options: VoiceResourceOptions,
    };
    public constructor(id: string, options?: { shard?: Shard, shared?: boolean, opusOnly?: boolean });
    public pause(): void;
    public play(resource: ReadableStream | string, options?: VoiceResourceOptions): void;
    public receive(type: string): VoiceDataStream;
    public resume(): void;
    public setVolume(volume: number): void;
    public stopPlaying(): void;
    public switchChannel(channelID: string): void;
    public updateVoiceState(selfMute: boolean, selfDeaf: boolean): void;
    public on(event: "debug" | "warn", listener: (message: string) => void): this;
    public on(event: "error" | "disconnect", listener: (err: Error) => void): this;
    public on(event: "pong", listener: (latency: number) => void): this;
    public on(event: "speakingStart", listener: (userID: string) => void): this;
    public on(event: "end", listener: () => void): this;
    public toJSON(simple?: boolean): JSONCache;
  }

  export class SharedStream extends EventEmitter {
    public playing: boolean;
    public ended: boolean;
    public volume: number;
    public speaking: boolean;
    public current?: {
      startTime: number,
      playTime: number,
      pausedTimestamp?: number,
      pausedTime?: number,
      options: VoiceResourceOptions,
    };
    public add(connection: VoiceConnection): void;
    public play(resource: ReadableStream | string, options: VoiceResourceOptions): void;
    public remove(connection: VoiceConnection): void;
    public setVolume(volume: number): void;
    public stopPlaying(): void;
  }

  class VoiceDataStream {
    public type: string;
    public constructor(type: string);
  }

  // tslint:disable-next-line
  export class VoiceConnectionManager<T extends VoiceConnection> extends Collection<T> implements SimpleJSON { // owo an undocumented class
    public constructor(vcObject: new () => T);
    public join(guildID: string, channelID: string, options: VoiceResourceOptions): Promise<VoiceConnection>;
    public leave(guildID: string): void;
    public switch(guildID: string, channelID: string): void;
    public toJSON(simple?: boolean): JSONCache;
  }

  class Base implements SimpleJSON {
    public id: string;
    public createdAt: number;
    public constructor(id: string);
    public inspect(): this;
    public toJSON(simple?: boolean): JSONCache;
  }

  export class Bucket {
    public tokens: number;
    public lastReset: number;
    public lastSend: number;
    public tokenLimit: number;
    public interval: number;
    public constructor(tokenLimit: number, interval: number, latencyRef: { latency: number });
    // tslint:disable-next-line
    public queue(func: Function): void;
  }

  export class Collection<T extends { id: string | number }> extends Map<string | number, T> {
    public baseObject: new (...args: any[]) => T;
    public limit?: number;
    public constructor(baseObject: new (...args: any[]) => T, limit?: number);
    public add(obj: T, extra?: any, replace?: boolean): T;
    public find(func: (i: T) => boolean): T;
    public random(): T;
    public filter(func: (i: T) => boolean): T[];
    public map<R>(func: (i: T) => R): R[];
    public update(obj: T, extra?: any, replace?: boolean): T;
    public remove(obj: T | { id: string }): T;
  }

  export class Call extends Base {
    public id: string;
    public createdAt: number;
    public channel: GroupChannel;
    public voiceStates: Collection<VoiceState>;
    public participants: string[];
    public endedTimestamp?: number;
    public ringing?: string[];
    public region?: string;
    public unavailable: boolean;
    public constructor(data: BaseData, channel: GroupChannel);
  }

  export class Channel extends Base {
    public id: string;
    public mention: string;
    public type: number;
    public createdAt: number;
    public constructor(data: BaseData);
  }

  export class ExtendedUser extends User {
    public email: string;
    public verified: boolean;
    public mfaEnabled: boolean;
  }

  export class GroupChannel extends PrivateChannel {
    public recipients: Collection<User>;
    public name: string;
    public icon?: string;
    public iconURL?: string;
    public ownerID: string;
    public edit(options: { name?: string, icon?: string, ownerID?: string }): Promise<GroupChannel>;
    public addRecipient(userID: string): Promise<void>;
    public removeRecipient(userID: string): Promise<void>;
    public dynamicIconURL(format: string, size: number): string;
  }

  export class Guild extends Base {
    public id: string;
    public createdAt: number;
    public name: string;
    public verificationLevel: number;
    public region: string;
    public icon?: string;
    public afkChannelID?: string;
    public systemChannelID?: string;
    public afkTimeout: number;
    public defaultNotifications: number;
    public mfaLevel: number;
    public joinedAt: number;
    public ownerID: string;
    public splash?: string;
    public unavailable: boolean;
    public large: boolean;
    public maxPresences: number;
    public channels: Collection<AnyGuildChannel>;
    public members: Collection<Member>;
    public memberCount: number;
    public roles: Collection<Role>;
    public shard: Shard;
    public features: string[];
    public emojis: Emoji[];
    public iconURL?: string;
    public explicitContentFilter: number;
    public constructor(data: BaseData, client: Client);
    public fetchAllMembers(): void;
    public dynamicIconURL(format: string, size: number): string;
    public createChannel(name: string, type: string, parentID?: string): Promise<AnyGuildChannel>;
    public createEmoji(
      options: { name: string, image: string, roles?: string[] },
      reason?: string,
    ): Promise<EmojiOptions>;
    public editEmoji(
      emojiID: string,
      options: { name: string, roles?: string[] },
      reason?: string,
    ): Promise<EmojiOptions>;
    public deleteEmoji(emojiID: string, reason?: string): Promise<void>;
    public createRole(options: RoleOptions, reason?: string): Promise<Role>;
    public getPruneCount(days: number): Promise<number>;
    public pruneMembers(days: number, reason?: string): Promise<number>;
    public getRESTChannels(): Promise<AnyGuildChannel[]>;
    public getRESTEmojis(): Promise<Emoji[]>;
    public getRESTEmoji(emojiID: string): Promise<Emoji>;
    public getRESTMembers(limit?: number, after?: string): Promise<Member[]>;
    public getRESTMember(memberID: string): Promise<Member>;
    public getRESTRoles(): Promise<Role[]>;
    public getEmbed(): Promise<GuildEmbed>;
    public getVoiceRegions(): Promise<VoiceRegion[]>;
    public leaveVoiceChannel(): void;
    public editRole(roleID: string, options: RoleOptions): Promise<Role>;
    public deleteRole(roleID: string): Promise<void>;
    public getAuditLogs(limit?: number, before?: string, actionType?: number): Promise<GuildAuditLog>;
    public getIntegrations(): Promise<GuildIntegration>;
    public editIntegration(integrationID: string, options: IntegrationOptions): Promise<void>;
    public syncIntegration(integrationID: string): Promise<void>;
    public deleteIntegration(integrationID: string): Promise<void>;
    public getInvites(): Promise<Invite[]>;
    public editMember(memberID: string, options: MemberOptions, reason?: string): Promise<void>;
    public addMemberRole(memberID: string, roleID: string, reason?: string): Promise<void>;
    public removeMemberRole(memberID: string, roleID: string, reason?: string): Promise<void>;
    public kickMember(userID: string, reason?: string): Promise<void>;
    public banMember(userID: string, deleteMessageDays?: number, reason?: string): Promise<void>;
    public unbanMember(userID: string, reason?: string): Promise<void>;
    public edit(
      options: GuildOptions, reason?: string,
    ): Promise<Guild>;
    public delete(): Promise<void>;
    public leave(): Promise<void>;
    public getBans(): Promise<User[]>;
    public editNickname(nick: string): Promise<void>;
    public getWebhooks(): Promise<Webhook[]>;
  }

  export class GuildAuditLogEntry extends Base {
    public id: string;
    public guild: Guild;
    public actionType: number;
    public reason?: string;
    public user: User;
    public targetID: string;
    public target?: Guild | AnyGuildChannel | Member | Invite | Role | any;
    public before?: any;
    public after?: any;
    public count?: number;
    public channel?: AnyGuildChannel;
    public deleteMemberDays?: number;
    public membersRemoved?: number;
    public member?: Member | any;
    public role?: Role | any;
    public constructor(data: BaseData, guild: Guild);
  }

  export class GuildChannel extends Channel {
    public guild: Guild;
    public parentID?: string;
    public name: string;
    public position: number;
    public permissionOverwrites: Collection<PermissionOverwrite>;
    public nsfw: boolean;
    public constructor(data: BaseData, guild: Guild);
    public getInvites(): Promise<Invite[]>;
    public createInvite(options?: CreateInviteOptions, reason?: string): Promise<Invite>;
    public permissionsOf(memberID: string): Permission;
    public edit(
      options: {
        name?: string,
        topic?: string,
        bitrate?: number,
        userLimit?: number,
        nsfw?: boolean,
      },
      reason?: string,
    ): Promise<AnyGuildChannel>;
    public editPosition(position: number): Promise<void>;
    public delete(reason?: string): Promise<void>;
    public editPermission(
      overwriteID: string,
      allow: number,
      deny: number,
      type: string,
      reason?: string,
    ): Promise<PermissionOverwrite>;
    public deletePermission(overwriteID: string, reason?: string): Promise<void>;
  }

  export class CategoryChannel extends GuildChannel {
    public channels?: Collection<AnyGuildChannel>;
  }

  export class TextChannel extends GuildChannel implements Textable, Invitable {
    public topic?: string;
    public lastMessageID: string;
    public messages: Collection<Message>;
    public constructor(data: BaseData, guild: Guild, messageLimit: number);
    public getInvites(): Promise<Invite[]>;
    public createInvite(options?: CreateInviteOptions, reason?: string): Promise<Invite>;
    public getWebhooks(): Promise<Webhook[]>;
    public createWebhook(options: { name: string, avatar: string }, reason?: string): Promise<Webhook>;
    public sendTyping(): Promise<void>;
    public getMessage(messageID: string): Promise<Message>;
    public getMessages(limit?: number, before?: string, after?: string, around?: string): Promise<Message[]>;
    public getPins(): Promise<Message[]>;
    public createMessage(
      content: MessageContent,
      file?: MessageFile,
    ): Promise<Message>;
    public editMessage(messageID: string, content: MessageContent): Promise<Message>;
    public pinMessage(messageID: string): Promise<void>;
    public unpinMessage(messageID: string): Promise<void>;
    public getMessageReaction(
      messageID: string,
      reaction: string,
      limit?: number,
      before?: string,
      after?: string,
    ): Promise<User[]>;
    public addMessageReaction(messageID: string, reaction: string, userID?: string): Promise<void>;
    public removeMessageReaction(messageID: string, reaction: string, userID?: string): Promise<void>;
    public removeMessageReactions(messageID: string): Promise<void>;
    public deleteMessage(messageID: string, reason?: string): Promise<void>;
    public unsendMessage(messageID: string): Promise<void>;
  }

  export class VoiceChannel extends GuildChannel implements Invitable {
    public bitrate?: number;
    public userLimit?: number;
    public voiceMembers?: Collection<Member>;
    public getInvites(): Promise<Invite[]>;
    public createInvite(options: CreateInviteOptions, reason?: string): Promise<Invite>;
    public join(options: VoiceResourceOptions): Promise<VoiceConnection>;
    public leave(): void;
  }

  export class GuildIntegration extends Base {
    public id: string;
    public createdAt: number;
    public name: string;
    public type: string;
    public roleID: string;
    public user: User;
    public account: { id: string, name: string };
    public enabled: boolean;
    public syncing: boolean;
    public expireBehavior: number;
    public expireGracePeriod: number;
    public enableEmoticons: boolean;
    public subscriberCount: number;
    public syncedAt: number;
    public constructor(data: BaseData, guild: Guild);
    public edit(options: { expireBehavior: string, expireGracePeriod: string, enableEmoticons: string }): Promise<void>;
    public delete(): Promise<void>;
    public sync(): Promise<void>;
  }

  export class Invite implements SimpleJSON {
    public code: string;
    public channel: { id: string, name: string };
    public guild: {
      id: string,
      name: string,
      splash?: string,
      icon?: string,
      textChannelCount?: number,
      voiceChannelCount?: number,
    };
    public inviter?: User;
    public uses?: number;
    public maxUses?: number;
    public maxAge?: number;
    public temporary?: boolean;
    public createdAt?: number;
    public revoked?: boolean;
    public presenceCount?: number;
    public memberCount?: number;
    public constructor(data: BaseData, client: Client);
    public delete(reason?: string): Promise<void>;
    public toJSON(simple?: boolean): JSONCache;
  }

  export class Member extends Base {
    public id: string;
    public mention: string;
    public guild: Guild;
    public joinedAt: number;
    public status: string;
    public game?: GamePresence;
    public voiceState: VoiceState;
    public nick?: string;
    public roles: string[];
    public user: User;
    public permission: Permission;
    public defaultAvatar: string;
    public createdAt: number;
    public bot: boolean;
    public username: string;
    public discriminator: string;
    public avatar?: string;
    public defaultAvatarURL: string;
    public avatarURL: string;
    public staticAvatarURL: string;
    public constructor(data: BaseData, guild: Guild);
    public edit(
      options: MemberOptions, reason?: string,
    ): Promise<void>;
    public addRole(roleID: string, reason?: string): Promise<void>;
    public removeRole(roleID: string, reason?: string): Promise<void>;
    public kick(reason?: string): Promise<void>;
    public ban(deleteMessageDays?: number, reason?: string): Promise<void>;
    public unban(reason?: string): Promise<void>;
  }

  export class Message extends Base {
    public id: string;
    public createdAt: number;
    public channel: TextableChannel;
    public timestamp: number;
    public type: number;
    public author: User;
    public member?: Member;
    public mentions: User[];
    public content: string;
    public cleanContent?: string;
    public roleMentions: string[];
    public channelMentions?: string[];
    public editedTimestamp?: number;
    public tts: boolean;
    public mentionEveryone: boolean;
    public attachments: Attachment[];
    public embeds: Embed[];
    public reactions: { [s: string]: any, count: number, me: boolean };
    public prefix?: string;
    public command?: Command;
    public constructor(data: BaseData, client: Client);
    public edit(content: MessageContent): Promise<Message>;
    public pin(): Promise<void>;
    public unpin(): Promise<void>;
    public getReaction(reaction: string, limit?: number, before?: string, after?: string): Promise<User[]>;
    public addReaction(reaction: string, userID?: string): Promise<void>;
    public removeReaction(reaction: string, userID?: string): Promise<void>;
    public removeReactions(): Promise<void>;
    public delete(reason?: string): Promise<void>;
  }

  export class Permission {
    public allow: number;
    public deny: number;
    public json: { [s: string]: boolean };
    public constructor(allow: number, deny: number);
    public has(permission: string): boolean;
  }

  export class PermissionOverwrite extends Permission {
    public id: string;
    public createdAt: number;
    public type: string;
    public constructor(data: { allow: number, deny: number });
  }

  export class PrivateChannel extends Channel implements Textable {
    public lastMessageID: string;
    public recipient: User;
    public messages: Collection<Message>;
    public ring(recipient: string[]): void;
    public syncCall(): void;
    public leave(): Promise<void>;
    public sendTyping(): Promise<void>;
    public getMessage(messageID: string): Promise<Message>;
    public getMessages(limit?: number, before?: string, after?: string, around?: string): Promise<Message[]>;
    public getPins(): Promise<Message[]>;
    public createMessage(
      content: MessageContent,
      file?: MessageFile,
    ): Promise<Message>;
    public editMessage(messageID: string, content: MessageContent): Promise<Message>;
    public pinMessage(messageID: string): Promise<void>;
    public unpinMessage(messageID: string): Promise<void>;
    public getMessageReaction(
      messageID: string,
      reaction: string,
      limit?: number,
      before?: string,
      after?: string,
    ): Promise<User[]>;
    public addMessageReaction(messageID: string, reaction: string, userID?: string): Promise<void>;
    public removeMessageReaction(messageID: string, reaction: string, userID?: string): Promise<void>;
    public removeMessageReactions(messageID: string): Promise<void>;
    public deleteMessage(messageID: string, reason?: string): Promise<void>;
    public unsendMessage(messageID: string): Promise<void>;
  }

  export class Relationship {
    public id: string;
    public user: User;
    public type: number;
    public status: string;
    public game?: GamePresence;
    public constructor(data: BaseData, client: Client);
  }

  export class Role extends Base {
    public id: string;
    public createdAt: number;
    public guild: Guild;
    public mention: string;
    public name: string;
    public mentionable: boolean;
    public managed: boolean;
    public hoist: boolean;
    public color: number;
    public position: number;
    public permissions: Permission;
    public json: { [s: string]: boolean };
    public constructor(data: BaseData, guild: Guild);
    public edit(options: RoleOptions, reason?: string): Promise<Role>;
    public editPosition(position: number): Promise<void>;
    public delete(reason?: string): Promise<void>;
  }

  export class UnavailableGuild extends Base {
    public id: string;
    public createdAt: number;
    public unavailable: boolean;
    public shard: Shard;
    public constructor(data: BaseData, client: Client);
  }

  export class User extends Base {
    public id: string;
    public mention: string;
    public defaultAvatar: string;
    public createdAt: number;
    public bot: boolean;
    public username: string;
    public discriminator: string;
    public avatar?: string;
    public defaultAvatarURL: string;
    public avatarURL: string;
    public staticAvatarURL: string;
    public constructor(data: BaseData, client: Client);
    public dynamicAvatarURL(format?: string, size?: number): string;
    public getDMChannel(): Promise<PrivateChannel>;
    public addRelationship(block?: boolean): Promise<void>;
    public removeRelationship(): Promise<void>;
    public getProfile(): Promise<UserProfile>;
    public editNote(note: string): Promise<void>;
    public deleteNote(): Promise<void>;
  }

  export class VoiceState extends Base implements NestedJSON {
    public id: string;
    public createdAt: number;
    public sessionID?: string;
    public channelID?: string;
    public mute: boolean;
    public deaf: boolean;
    public suppress: boolean;
    public selfMute: boolean;
    public selfDeaf: boolean;
    public constructor(data: BaseData);
    public toJSON(arg?: any, cache?: Array<string | any>): JSONCache;
  }

  export class Shard extends EventEmitter implements SimpleJSON, Emittable {
    public id: number;
    public connecting: boolean;
    public ready: boolean;
    public discordServerTrace?: string[];
    public status: string;
    public lastHeartbeatReceived: number;
    public lastHeartbeatSent: number;
    public latency: number;
    public constructor(id: number, client: Client);
    public connect(): void;
    public disconnect(options?: { reconnect: boolean }): void;
    public editAFK(afk: boolean): void;
    public editStatus(status?: string, game?: GamePresence): void;
    // tslint:disable-next-line
    public on(event: string, listener: Function): this;
    public on(event: "ready" | "disconnect", listener: () => void): this;
    public on(event: "callCreate" | "callRing" | "callDelete", listener: (call: Call) => void): this;
    public on(
      event: "callUpdate",
      listener: (
        call: Call,
        oldCall: OldCall,
      ) => void,
    ): this;
    public on(event: "channelCreate" | "channelDelete", listener: (channel: AnyChannel) => void): this;
    public on(
      event: "channelPinUpdate",
      listener: (channel: TextableChannel, timestamp: number, oldTimestamp: number) => void,
    ): this;
    public on(
      event: "channelRecipientAdd" | "channelRecipientRemove",
      listener: (channel: GroupChannel, user: User) => void,
    ): this;
    public on(
      event: "channelUpdate",
      listener: (
        channel: AnyChannel,
        oldChannel: OldChannel,
      ) => void,
    ): this;
    public on(
      event: "friendSuggestionCreate",
      listener: (user: User, reasons: FriendSuggestionReasons) => void,
    ): this;
    public on(event: "friendSuggestionDelete", listener: (user: User) => void): this;
    public on(
      event: "guildAvailable" | "guildBanAdd" | "guildBanRemove",
      listener: (guild: Guild, user: User) => void,
    ): this;
    public on(event: "guildDelete" | "guildUnavailable" | "guildCreate", listener: (guild: Guild) => void): this;
    public on(event: "guildEmojisUpdate", listener: (guild: Guild, emojis: Emoji[], oldEmojis: Emoji[]) => void): this;
    public on(event: "guildMemberAdd", listener: (guild: Guild, member: Member) => void): this;
    public on(event: "guildMemberChunk", listener: (guild: Guild, members: Member[]) => void): this;
    public on(
      event: "guildMemberRemove",
      listener: (guild: Guild, member: Member | MemberPartial) => void,
    ): this;
    public on(
      event: "guildMemberUpdate",
      listener: (guild: Guild, member: Member, oldMember: { roles: string[], nick?: string }) => void,
    ): this;
    public on(event: "guildRoleCreate" | "guildRoleDelete", listener: (guild: Guild, role: Role) => void): this;
    public on(event: "guildRoleUpdate", listener: (guild: Guild, role: Role, oldRole: RoleOptions) => void): this;
    public on(event: "guildUpdate", listener: (guild: Guild, oldGuild: GuildOptions) => void): this;
    public on(event: "hello", listener: (trace: string[], id: number) => void): this;
    public on(event: "messageCreate", listener: (message: Message) => void): this;
    public on(
      event: "messageDelete" | "messageReactionRemoveAll",
      listener: (message: PossiblyUncachedMessage) => void,
    ): this;
    public on(event: "messageDeleteBulk", listener: (messages: PossiblyUncachedMessage[]) => void): this;
    public on(
      event: "messageReactionAdd" | "messageReactionRemove",
      listener: (message: PossiblyUncachedMessage, emoji: Emoji, userID: string) => void,
    ): this;
    public on(event: "messageUpdate", listener: (message: Message, oldMessage?: {
      attachments: Attachment[],
      embeds: Embed[],
      content: string,
      editedTimestamp?: number,
      mentionedBy?: any,
      tts: boolean,
      mentions: string[],
      roleMentions: string[],
      channelMentions: string[],
    }) => void): this;
    public on(
      event: "presenceUpdate",
      listener: (
        other: Member | Relationship,
        oldPresence?: OldPresence,
      ) => void,
    ): this;
    public on(event: "rawWS" | "unknown", listener: (packet: RawPacket, id: number) => void): this;
    public on(event: "relationshipAdd" | "relationshipRemove", listener: (relationship: Relationship) => void): this;
    public on(
      event: "relationshipUpdate",
      listener: (relationship: Relationship, oldRelationship: { type: number }) => void,
    ): this;
    public on(event: "shardPreReady" | "connect", listener: (id: number) => void): this;
    public on(event: "typingStart", listener: (channel: TextableChannel, user: User) => void): this;
    public on(event: "unavailableGuildCreate", listener: (guild: UnavailableGuild) => void): this;
    public on(
      event: "userUpdate",
      listener: (user: User, oldUser: { username: string, discriminator: string, avatar?: string }) => void,
    ): this;
    public on(event: "voiceChannelJoin", listener: (member: Member, newChannel: VoiceChannel) => void): this;
    public on(event: "voiceChannelLeave", listener: (member: Member, oldChannel: VoiceChannel) => void): this;
    public on(
      event: "voiceChannelSwitch",
      listener: (member: Member, newChannel: VoiceChannel, oldChannel: VoiceChannel) => void,
    ): this;
    public on(
      event: "voiceStateUpdate",
      listener: (
        member: Member,
        oldState: OldVoiceState,
      ) => void,
    ): this;
    public on(event: "warn" | "debug", listener: (message: string, id: number) => void): this;
    public on(event: "disconnect", listener: (err: Error) => void): this;
    // FIXME
    // tslint:disable-next-line
    public on(event: "resume", listener: () => void): this;
    public toJSON(simple?: boolean): JSONCache;
    // tslint:disable-next-line
    public sendWS(op: number, _data: object): void;
  }

  // TODO: Do we need all properties of Command, as it has a lot of stuff
  export class Command {
    public subcommands: { [s: string]: Command };
    public constructor(label: string, generate: CommandGenerator, options?: CommandOptions);
    public registerSubcommandAlias(alias: string, label: string): void;
    public registerSubcommand(label: string, generator: CommandGenerator, options?: CommandOptions): void;
    public unregisterSubcommand(label: string): void;
  }

  export class CommandClient extends Client {
    public commands: { [s: string]: Command };
    public constructor(token: string, options?: ClientOptions, commandOptions?: CommandClientOptions);
    public onMessageCreate(msg: Message): void;
    public registerGuildPrefix(guildID: string, prefix: string[] | string): void;
    public registerCommandAlias(alias: string, label: string): void;
    public registerCommand(label: string, generator: CommandGenerator, options?: CommandOptions): Command;
    public unregisterCommand(label: string): void;
  }
}
