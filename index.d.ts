import { EventEmitter } from "events";
import { Duplex, Readable as ReadableStream, Stream } from "stream";
import { Agent as HTTPSAgent } from "https";
import { IncomingMessage, ClientRequest, IncomingHttpHeaders } from "http";
import OpusScript = require("opusscript"); // Thanks TypeScript
import { URL } from "url";
import { Socket as DgramSocket } from "dgram";
import * as WebSocket from "ws";
import type Constants from "./lib/Constants.d.ts";

declare function Eris(token: string, options?: Eris.ClientOptions): Eris.Client;

declare namespace Eris {
  export const Constants: Constants;
  export const VERSION: string;

  /** @deprecated */
  export const PrivateChannel: typeof DMChannel;

  // TYPES

  // Application Commands
  type ApplicationCommandOptions = ApplicationCommandOptionsSubCommand | ApplicationCommandOptionsSubCommandGroup | ApplicationCommandOptionsWithValue;
  type ApplicationCommandOptionsBoolean = ApplicationCommandOption<Constants["ApplicationCommandOptionTypes"]["BOOLEAN"]>;
  type ApplicationCommandOptionsChannel = ApplicationCommandOption<Constants["ApplicationCommandOptionTypes"]["CHANNEL"]>;
  type ApplicationCommandOptionsInteger = ApplicationCommandOptionsIntegerWithAutocomplete | ApplicationCommandOptionsIntegerWithoutAutocomplete | ApplicationCommandOptionsIntegerWithMinMax;
  type ApplicationCommandOptionsIntegerWithAutocomplete = Omit<ApplicationCommandOptionWithChoices<Constants["ApplicationCommandOptionTypes"]["INTEGER"]>, "choices" | "min_value" | "max_value"> & AutocompleteEnabled;
  type ApplicationCommandOptionsIntegerWithoutAutocomplete = Omit<ApplicationCommandOptionWithChoices<Constants["ApplicationCommandOptionTypes"]["INTEGER"]>, "autocomplete" | "min_value" | "max_value"> & AutocompleteDisabledInteger;
  type ApplicationCommandOptionsIntegerWithMinMax = Omit<ApplicationCommandOptionWithChoices<Constants["ApplicationCommandOptionTypes"]["INTEGER"]>, "choices" | "autocomplete"> & AutocompleteDisabledIntegerMinMax;
  type ApplicationCommandOptionsMentionable = ApplicationCommandOption<Constants["ApplicationCommandOptionTypes"]["MENTIONABLE"]>;
  type ApplicationCommandOptionsNumber = ApplicationCommandOptionsNumberWithAutocomplete | ApplicationCommandOptionsNumberWithoutAutocomplete | ApplicationCommandOptionsNumberWithMinMax;
  type ApplicationCommandOptionsNumberWithAutocomplete = Omit<ApplicationCommandOptionWithChoices<Constants["ApplicationCommandOptionTypes"]["NUMBER"]>, "choices" | "min_value" | "max_value"> & AutocompleteEnabled;
  type ApplicationCommandOptionsNumberWithoutAutocomplete = Omit<ApplicationCommandOptionWithChoices<Constants["ApplicationCommandOptionTypes"]["NUMBER"]>, "autocomplete" | "min_value" | "max_value"> & AutocompleteDisabledInteger;
  type ApplicationCommandOptionsNumberWithMinMax = Omit<ApplicationCommandOptionWithChoices<Constants["ApplicationCommandOptionTypes"]["NUMBER"]>, "choices" | "autocomplete"> & AutocompleteDisabledIntegerMinMax;
  type ApplicationCommandOptionsRole = ApplicationCommandOption<Constants["ApplicationCommandOptionTypes"]["ROLE"]>;
  type ApplicationCommandOptionsString = ApplicationCommandOptionsStringWithAutocomplete | ApplicationCommandOptionsStringWithoutAutocomplete;
  type ApplicationCommandOptionsStringWithAutocomplete = Omit<ApplicationCommandOptionWithChoices<Constants["ApplicationCommandOptionTypes"]["STRING"]>, "choices"> & AutocompleteEnabled;
  type ApplicationCommandOptionsStringWithoutAutocomplete = Omit<ApplicationCommandOptionWithChoices<Constants["ApplicationCommandOptionTypes"]["STRING"]>, "autocomplete"> & AutocompleteDisabled;
  type ApplicationCommandOptionsUser = ApplicationCommandOption<Constants["ApplicationCommandOptionTypes"]["USER"]>;
  type ApplicationCommandOptionsWithValue = ApplicationCommandOptionsString | ApplicationCommandOptionsInteger | ApplicationCommandOptionsBoolean | ApplicationCommandOptionsUser | ApplicationCommandOptionsChannel | ApplicationCommandOptionsRole | ApplicationCommandOptionsMentionable | ApplicationCommandOptionsNumber;
  type ApplicationCommandPermissionTypes = Constants["ApplicationCommandPermissionTypes"][keyof Constants["ApplicationCommandPermissionTypes"]];
  type ApplicationCommandTypes = Constants["ApplicationCommandTypes"][keyof Constants["ApplicationCommandTypes"]];
  type ModalSubmitInteractionDataComponent = ModalSubmitInteractionDataTextInputComponent;

  // Auto Moderation
  type AutoModerationActionType = Constants["AutoModerationActionTypes"][keyof Constants["AutoModerationActionTypes"]];
  type AutoModerationEventType = Constants["AutoModerationEventTypes"][keyof Constants["AutoModerationEventTypes"]];
  type AutoModerationKeywordPresetType = Constants["AutoModerationKeywordPresetTypes"][keyof Constants["AutoModerationKeywordPresetTypes"]];
  type AutoModerationTriggerType = Constants["AutoModerationTriggerTypes"][keyof Constants["AutoModerationTriggerTypes"]];

  // Cache
  interface Uncached { id: string }

  // Channel
  type AnyChannel = AnyGuildChannel | AnyThreadChannel | DMChannel | GroupChannel;
  type AnyGuildChannel = AnyGuildTextableChannel | AnyThreadChannel | CategoryChannel | ForumChannel | MediaChannel;
  type AnyGuildTextableChannel = TextChannel | VoiceChannel | NewsChannel | StageChannel;
  type AnyThreadChannel = NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel | ThreadChannel;
  type AnyVoiceChannel = VoiceChannel | StageChannel;
  type ChannelTypeConversion<T extends GuildChannelTypes> =
    T extends Constants["ChannelTypes"]["GUILD_TEXT"] ? TextChannel :
      T extends Constants["ChannelTypes"]["GUILD_VOICE"] ? VoiceChannel :
        T extends Constants["ChannelTypes"]["GUILD_CATEGORY"] ? CategoryChannel :
          T extends Constants["ChannelTypes"]["GUILD_NEWS"] ? NewsChannel :
            T extends Constants["ChannelTypes"]["GUILD_STAGE_VOICE"] ? StageChannel :
              T extends Constants["ChannelTypes"]["GUILD_FORUM"] ? ForumChannel :
                T extends Constants["ChannelTypes"]["GUILD_MEDIA"] ? MediaChannel :
                  never;
  type EditGuildChannelOptions = EditForumChannelOptions | EditMediaChannelOptions | EditGuildTextableChannelOptions;
  type EditGuildTextableChannelOptions = EditNewsChannelOptions | EditTextChannelOptions | EditThreadChannelOptions | EditVoiceChannelOptions;
  type GuildTextableWithThreads = AnyGuildTextableChannel | GuildTextableChannel | AnyThreadChannel;
  type InviteChannel = InvitePartialChannel | Exclude<AnyGuildChannel, CategoryChannel | AnyThreadChannel>;
  type PossiblyUncachedSpeakableChannel = AnyVoiceChannel | Uncached;
  type PossiblyUncachedTextableChannel = TextableChannel | Uncached;
  type TextableChannel = GuildTextableWithThreads | DMChannel;
  type VideoQualityMode = Constants["VideoQualityModes"][keyof Constants["VideoQualityModes"]];

  // Channel Types
  type ChannelTypes = GuildChannelTypes | PrivateChannelTypes;
  type GuildChannelTypes = Exclude<Constants["ChannelTypes"][keyof Constants["ChannelTypes"]], PrivateChannelTypes>;
  type GuildTextChannelTypes = Constants["ChannelTypes"][keyof Pick<Constants["ChannelTypes"], "GUILD_TEXT" | "GUILD_NEWS">];
  type GuildVoiceChannelTypes = Constants["ChannelTypes"][keyof Pick<Constants["ChannelTypes"], "GUILD_VOICE" | "GUILD_STAGE_VOICE">];
  type GuildThreadChannelTypes = Constants["ChannelTypes"][keyof Pick<Constants["ChannelTypes"], "GUILD_NEWS_THREAD" | "GUILD_PRIVATE_THREAD" | "GUILD_PUBLIC_THREAD">];
  type GuildPublicThreadChannelTypes = Exclude<GuildThreadChannelTypes, Constants["ChannelTypes"]["GUILD_PRIVATE_THREAD"]>;
  type PrivateChannelTypes = Constants["ChannelTypes"][keyof Pick<Constants["ChannelTypes"], "DM" | "GROUP_DM">];
  type TextChannelTypes = GuildTextChannelTypes | PrivateChannelTypes;
  type TextVoiceChannelTypes = Constants["ChannelTypes"][keyof Pick<Constants["ChannelTypes"], "GUILD_VOICE">];

  // Client
  type ApplicationRoleConnectionMetadataTypes = Constants["RoleConnectionMetadataTypes"][keyof Constants["RoleConnectionMetadataTypes"]];
  type MembershipStates = Constants["MembershipState"][keyof Constants["MembershipState"]];
  type OAuthTeamMemberRoleTypes = Constants["OAuthTeamMemberRoleTypes"][keyof Constants["OAuthTeamMemberRoleTypes"]];

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
  type DefaultNotifications = Constants["DefaultMessageNotificationLevels"][keyof Constants["DefaultMessageNotificationLevels"]];
  type ExplicitContentFilter = Constants["ExplicitContentFilterLevels"][keyof Constants["ExplicitContentFilterLevels"]];
  type GuildFeatures = Constants["GuildFeatures"][number];
  type GuildIntegrationExpireBehavior = Constants["GuildIntegrationExpireBehavior"][keyof Constants["GuildIntegrationExpireBehavior"]];
  type GuildIntegrationTypes = Constants["GuildIntegrationTypes"][number];
  type GuildScheduledEventEditOptions<T extends GuildScheduledEventEntityTypes> = GuildScheduledEventEditOptionsExternal | GuildScheduledEventEditOptionsDiscord | GuildScheduledEventEditOptionsBase<T>;
  type GuildScheduledEventEntityTypes = Constants["GuildScheduledEventEntityTypes"][keyof Constants["GuildScheduledEventEntityTypes"]];
  type GuildScheduledEventOptions<T extends GuildScheduledEventEntityTypes> = GuildScheduledEventOptionsExternal | GuildScheduledEventOptionsDiscord | GuildScheduledEventOptionsBase<T>;
  type GuildScheduledEventPrivacyLevel = Constants["GuildScheduledEventPrivacyLevel"][keyof Constants["GuildScheduledEventPrivacyLevel"]];
  type GuildScheduledEventStatus = Constants["GuildScheduledEventStatus"][keyof Constants["GuildScheduledEventStatus"]];
  type GuildWidgetStyles = Constants["GuildWidgetStyles"][keyof Constants["GuildWidgetStyles"]];
  type MFALevel = Constants["MFALevels"][keyof Constants["MFALevels"]];
  type NSFWLevel = Constants["GuildNSFWLevels"][keyof Constants["GuildNSFWLevels"]];
  type OnboardingModes = Constants["GuildOnboardingModes"][keyof Constants["GuildOnboardingModes"]];
  type OnboardingPromptTypes = Constants["GuildOnboardingPromptTypes"][keyof Constants["GuildOnboardingPromptTypes"]];
  type PermissionValueTypes = bigint | number | string;
  type PossiblyUncachedGuild = Guild | Uncached;
  type PossiblyUncachedGuildScheduledEvent = GuildScheduledEvent | Uncached;
  type PossiblyUncachedGuildSoundboardSound = SoundboardSound | { id: string; guild: PossiblyUncachedGuild };
  type PremiumTier = Constants["PremiumTiers"][keyof Constants["PremiumTiers"]];
  type SystemChannelFlags = Constants["SystemChannelFlags"][keyof Constants["SystemChannelFlags"]];
  type VerificationLevel = Constants["VerificationLevels"][keyof Constants["VerificationLevels"]];

  // Interaction
  type AnyInteraction = PingInteraction | CommandInteraction | ComponentInteraction | AutocompleteInteraction | ModalSubmitInteraction;
  type InteractionCallbackData = InteractionAutocomplete | InteractionContent | InteractionModal;
  type InteractionContent = Pick<WebhookPayload, "content" | "embeds" | "allowedMentions" | "tts" | "flags" | "components" | "poll">;
  type InteractionContentEdit = Pick<WebhookPayload, "content" | "embeds" | "allowedMentions" | "components" | "poll">;
  type InteractionDataOptions = InteractionDataOptionsSubCommand | InteractionDataOptionsSubCommandGroup | InteractionDataOptionsWithValue;
  type InteractionDataOptionsBoolean = InteractionDataOptionWithValue<Constants["ApplicationCommandOptionTypes"]["BOOLEAN"], boolean>;
  type InteractionDataOptionsChannel = InteractionDataOptionWithValue<Constants["ApplicationCommandOptionTypes"]["CHANNEL"], string>;
  type InteractionDataOptionsInteger = InteractionDataOptionWithValue<Constants["ApplicationCommandOptionTypes"]["INTEGER"], number>;
  type InteractionDataOptionsMentionable = InteractionDataOptionWithValue<Constants["ApplicationCommandOptionTypes"]["MENTIONABLE"], string>;
  type InteractionDataOptionsNumber = InteractionDataOptionWithValue<Constants["ApplicationCommandOptionTypes"]["NUMBER"], number>;
  type InteractionDataOptionsRole = InteractionDataOptionWithValue<Constants["ApplicationCommandOptionTypes"]["ROLE"], string>;
  type InteractionDataOptionsString = InteractionDataOptionWithValue<Constants["ApplicationCommandOptionTypes"]["STRING"], string>;
  type InteractionDataOptionsUser = InteractionDataOptionWithValue<Constants["ApplicationCommandOptionTypes"]["USER"], string>;
  type InteractionDataOptionsWithValue = InteractionDataOptionsString | InteractionDataOptionsInteger | InteractionDataOptionsBoolean | InteractionDataOptionsUser | InteractionDataOptionsChannel | InteractionDataOptionsRole | InteractionDataOptionsMentionable | InteractionDataOptionsNumber;
  type InteractionResponseTypes = Constants["InteractionResponseTypes"][keyof Constants["InteractionResponseTypes"]];
  type InteractionTypes = Constants["InteractionTypes"][keyof Constants["InteractionTypes"]];
  type LocaleStrings = Constants["Locales"][keyof Constants["Locales"]];

  // Invite
  type InviteTargetTypes = Constants["InviteTargetTypes"][keyof Constants["InviteTargetTypes"]];

  // Message
  type ActionRowComponents = Button | SelectMenu;
  type Button = InteractionButton | URLButton;
  type ButtonStyles = Constants["ButtonStyles"][keyof Constants["ButtonStyles"]];
  type Component = ActionRow | ActionRowComponents;
  type ImageFormat = Constants["ImageFormats"][number];
  type MessageActivityTypes = Constants["MessageActivityTypes"][keyof Constants["MessageActivityTypes"]];
  type MessageContent = string | AdvancedMessageContent;
  type MessageContentEdit = string | AdvancedMessageContentEdit;
  type MessageReferenceTypes = Constants["MessageReferenceTypes"][keyof Constants["MessageReferenceTypes"]];
  type PollLayoutTypes = Constants["PollLayoutTypes"][keyof Constants["PollLayoutTypes"]];
  type PossiblyUncachedMessage = Message | { channel: TextableChannel | { id: string; guild?: Uncached }; guildID?: string; id: string };
  type ReactionTypes = Constants["ReactionTypes"][keyof Constants["ReactionTypes"]];
  type SelectMenu = StringSelectMenu | ChannelSelectMenu | ResolvedSelectMenus;
  type SelectMenuNonResolvedTypes = Constants["ComponentTypes"][keyof Pick<Constants["ComponentTypes"], "STRING_SELECT">];
  type SelectMenuResolvedTypes = Constants["ComponentTypes"][keyof Pick<Constants["ComponentTypes"], "USER_SELECT" | "ROLE_SELECT" | "MENTIONABLE_SELECT" | "CHANNEL_SELECT">];
  type SelectMenuTypes = SelectMenuNonResolvedTypes | SelectMenuResolvedTypes;

  // Permission
  type PermissionType = Constants["PermissionOverwriteTypes"][keyof Constants["PermissionOverwriteTypes"]];

  // Presence
  type ActivityFlags = Constants["ActivityFlags"][keyof Constants["ActivityFlags"]];
  type ActivityType = Constants["ActivityTypes"][keyof Constants["ActivityTypes"]];
  type SelfStatus = Status | "invisible";
  type Status = "online" | "idle" | "dnd";
  type UserStatus = Status | "offline";

  // Sticker
  type StickerFormats = Constants["StickerFormats"][keyof Constants["StickerFormats"]];
  type StickerTypes = Constants["StickerTypes"][keyof Constants["StickerTypes"]];

  // Thread/Forum
  type AutoArchiveDuration = 60 | 1440 | 4320 | 10080;
  type ChannelFlags = Constants["ChannelFlags"][keyof Constants["ChannelFlags"]];
  type ForumLayoutTypes = Constants["ForumLayoutTypes"][keyof Constants["ForumLayoutTypes"]];
  type SortOrderTypes = Constants["SortOrderTypes"][keyof Constants["SortOrderTypes"]];

  // User
  type PossiblyUncachedUser = User | Uncached;
  type PremiumTypes = Constants["PremiumTypes"][keyof Constants["PremiumTypes"]];

  // Voice
  type ConverterCommand = "./ffmpeg" | "./avconv" | "ffmpeg" | "avconv";
  type StageInstancePrivacyLevel = Constants["StageInstancePrivacyLevel"][keyof Constants["StageInstancePrivacyLevel"]];
  type VoiceChannelEffectAnimationType = Constants["VoiceChannelEffectAnimationTypes"][keyof Constants["VoiceChannelEffectAnimationTypes"]];

  // Webhook
  type WebhookPayloadEdit = Pick<WebhookPayload, "attachments" | "content" | "embed" | "embeds" | "file" | "allowedMentions" | "components">;
  type WebhookTypes = Constants["WebhookTypes"][keyof Constants["WebhookTypes"]];

  // INTERFACES
  // Internals
  type JSONCache = Record<string, unknown>;
  interface NestedJSON {
    toJSON(arg?: unknown, cache?: (string | unknown)[]): JSONCache;
  }
  interface SimpleJSON {
    toJSON(props?: string[]): JSONCache;
  }

  // Application Commands
  /** Generic T is `true` if editing Guild scoped commands, and `false` if not */
  interface ApplicationCommandEditOptions<T extends boolean, U = ApplicationCommandTypes> {
    defaultMemberPermissions?: bigint | number | string | Permission | null;
    /** @deprecated */
    defaultPermission?: boolean;
    description?: U extends Constants["ApplicationCommandTypes"]["CHAT_INPUT"] ? string : "" | void;
    descriptionLocalizations?: U extends Constants["ApplicationCommandTypes"]["CHAT_INPUT"] ? Record<LocaleStrings, string> | null : null;
    dmPermission?: T extends true ? never : boolean | null;
    name?: string;
    nameLocalizations?: Record<LocaleStrings, string> | null;
    nsfw?: boolean;
    options?: ApplicationCommandOptions[];
  }
  /** Generic T is `true` if creating Guild scoped commands, and `false` if not */
  interface ApplicationCommandCreateOptions<T extends boolean, U = ApplicationCommandTypes> extends ApplicationCommandEditOptions<T, U> {
    description: U extends Constants["ApplicationCommandTypes"]["CHAT_INPUT"] ? string : "" | void;
    name: string;
    type?: U;
  }
  /** Generic T is `true` if editing Guild scoped commands, and `false` if not */
  interface ApplicationCommandBulkEditOptions<T extends boolean, U = ApplicationCommandTypes> extends ApplicationCommandCreateOptions<T, U> {
    id?: string;
  }
  interface ApplicationCommandOption<T extends Constants["ApplicationCommandOptionTypes"][Exclude<keyof Constants["ApplicationCommandOptionTypes"], "SUB_COMMAND" | "SUB_COMMAND_GROUP">]> {
    channel_types: T extends Constants["ApplicationCommandOptionTypes"]["CHANNEL"] ? ChannelTypes[] | undefined : never;
    description: string;
    descriptionLocalizations?: Record<LocaleStrings, string> | null;
    name: string;
    nameLocalizations?: Record<LocaleStrings, string> | null;
    required?: boolean;
    type: T;
  }
  interface ApplicationCommandOptionChoice<T extends Constants["ApplicationCommandOptionTypes"][keyof Pick<Constants["ApplicationCommandOptionTypes"], "STRING" | "INTEGER" | "NUMBER">] | unknown = unknown> {
    name: string;
    value: T extends Constants["ApplicationCommandOptionTypes"]["STRING"]
      ? string
      : T extends Constants["ApplicationCommandOptionTypes"]["NUMBER"]
        ? number
        : T extends Constants["ApplicationCommandOptionTypes"]["INTEGER"]
          ? number
          : number | string;
  }
  interface ApplicationCommandOptionsSubCommand {
    description: string;
    descriptionLocalizations?: Record<LocaleStrings, string> | null;
    name: string;
    nameLocalizations?: Record<LocaleStrings, string> | null;
    options?: ApplicationCommandOptionsWithValue[];
    type: Constants["ApplicationCommandOptionTypes"]["SUB_COMMAND"];
  }
  interface ApplicationCommandOptionsSubCommandGroup {
    description: string;
    descriptionLocalizations?: Record<LocaleStrings, string> | null;
    name: string;
    nameLocalizations?: Record<LocaleStrings, string> | null;
    options?: (ApplicationCommandOptionsSubCommand | ApplicationCommandOptionsWithValue)[];
    type: Constants["ApplicationCommandOptionTypes"]["SUB_COMMAND_GROUP"];
  }
  interface ApplicationCommandOptionWithChoices<T extends Constants["ApplicationCommandOptionTypes"][keyof Pick<Constants["ApplicationCommandOptionTypes"], "STRING" | "INTEGER" | "NUMBER">] = Constants["ApplicationCommandOptionTypes"][keyof Pick<Constants["ApplicationCommandOptionTypes"], "STRING" | "INTEGER" | "NUMBER">]> {
    autocomplete?: boolean;
    choices?: ApplicationCommandOptionChoice<T>[];
    description: string;
    descriptionLocalizations?: Record<LocaleStrings, string> | null;
    name: string;
    nameLocalizations?: Record<LocaleStrings, string> | null;
    required?: boolean;
    type: T;
  }
  interface ApplicationCommandOptionWithMinMax<T extends Constants["ApplicationCommandOptionTypes"][keyof Pick<Constants["ApplicationCommandOptionTypes"], "INTEGER" | "NUMBER">] = Constants["ApplicationCommandOptionTypes"][keyof Pick<Constants["ApplicationCommandOptionTypes"], "INTEGER" | "NUMBER">]> {
    autocomplete?: boolean;
    choices?: ApplicationCommandOptionChoice<T>[];
    description: string;
    descriptionLocalizations?: Record<LocaleStrings, string> | null;
    max_value?: number;
    min_value?: number;
    name: string;
    nameLocalizations?: Record<LocaleStrings, string> | null;
    required?: boolean;
    type: T;
  }
  interface ApplicationCommandPermissions {
    id: string;
    permission: boolean;
    type: ApplicationCommandPermissionTypes;
  }
  interface AutocompleteEnabled {
    autocomplete: true;
  }
  interface AutocompleteDisabled {
    autocomplete?: false;
  }
  interface AutocompleteDisabledInteger extends AutocompleteDisabled {
    min_value?: null;
    max_value?: null;
  }
  interface AutocompleteDisabledIntegerMinMax extends AutocompleteDisabled {
    choices?: null;
  }
  interface GuildApplicationCommandPermissions {
    application_id: string;
    guild_id: string;
    id: string;
    permissions: ApplicationCommandPermissions[];
  }

  // Auto Moderation
  interface AutoModerationAction<T = AutoModerationActionType> {
    metadata: T extends Constants["AutoModerationActionTypes"]["BLOCK_MEMBER_INTERACTION"] ? never : AutoModerationActionMetadata<T>;
    type: T;
  }
  interface AutoModerationActionExecution {
    action: AutoModerationAction;
    alertSystemMessageID?: string;
    channelID?: string;
    content?: string;
    guildID: string;
    matchedContent?: string | null;
    matchedKeyword: string | null;
    messageID?: string;
    ruleID: string;
    ruleTriggerType: AutoModerationTriggerType;
    userID: string;
  }
  interface AutoModerationActionMetadata<T = AutoModerationActionType> {
    channelID: T extends Constants["AutoModerationActionTypes"]["SEND_ALERT_MESSAGE"] ? string : never;
    customMessage: T extends Constants["AutoModerationActionTypes"]["BLOCK_MESSAGE"] ? string : never;
    durationSeconds: T extends Constants["AutoModerationActionTypes"]["TIMEOUT"] ? number : never;
  }
  interface AutoModerationCreateOptions<T = AutoModerationTriggerType> {
    actions: AutoModerationAction[];
    eventType: AutoModerationEventType;
    name: string;
    triggerMetadata: T extends Constants["AutoModerationTriggerTypes"]["SPAM"] ? never : AutoModerationTriggerMetadata<T>;
    triggerType: T;
  }
  interface AutoModerationEditOptions<T extends AutoModerationTriggerType> {
    actions?: AutoModerationAction[];
    enabled?: boolean;
    eventType?: AutoModerationEventType;
    exemptChannels?: string[];
    exemptRoles?: string[];
    name?: string;
    reason?: string;
    triggerMetadata: T extends Constants["AutoModerationTriggerTypes"]["SPAM"] ? never : AutoModerationTriggerMetadata<T> | undefined;
  }
  interface AutoModerationTriggerMetadata<T = AutoModerationTriggerType> {
    allowList: T extends Constants["AutoModerationTriggerTypes"]["KEYWORD" | "KEYWORD_PRESET" | "MEMBER_PROFILE"] ? string[] : never;
    keywordFilter: T extends Constants["AutoModerationTriggerTypes"]["KEYWORD" | "MEMBER_PROFILE"] ? string[] : never;
    mentionRaidProtectionEnabled: T extends Constants["AutoModerationTriggerTypes"]["MENTION_SPAM"] ? boolean : never;
    mentionTotalLimit: T extends Constants["AutoModerationTriggerTypes"]["MENTION_SPAM"] ? number : never;
    presets: T extends Constants["AutoModerationTriggerTypes"]["KEYWORD_PRESET"] ? AutoModerationKeywordPresetType[] : never;
    regexPatterns: T extends Constants["AutoModerationTriggerTypes"]["KEYWORD" | "MEMBER_PROFILE"] ? string[] : never;
  }

  // Channel
  interface ChannelFollow {
    channel_id: string;
    webhook_id: string;
  }
  interface ChannelPosition extends EditChannelPositionOptions {
    id: string;
    position?: number;
  }
  interface CreateChannelOptions {
    availableTags?: ForumTag[];
    bitrate?: number;
    defaultAutoArchiveDuration?: AutoArchiveDuration;
    defaultForumLayout?: ForumLayoutTypes;
    defaultReactionEmoji?: DefaultReactionEmoji;
    defaultSortOrder?: SortOrderTypes;
    defaultThreadRateLimitPerUser?: number;
    nsfw?: boolean;
    parentID?: string;
    permissionOverwrites?: Overwrite[];
    position?: number;
    rateLimitPerUser?: number;
    reason?: string;
    topic?: string;
    userLimit?: number;
  }
  interface EditChannelOptionsBase {
    name?: string;
    position?: number;
    permissionOverwrites?: Overwrite[];
  }
  interface EditNewsChannelOptions extends EditChannelOptionsBase {
    defaultAutoArchiveDuration?: AutoArchiveDuration | null;
    nsfw?: boolean | null;
    parentID?: string | null;
    topic?: string | null;
    type?: GuildTextChannelTypes;
  }
  interface EditTextChannelOptions extends EditNewsChannelOptions {
    defaultThreadRateLimitPerUser?: number | null;
    rateLimitPerUser?: number | null;
  }
  interface EditVoiceChannelOptions extends EditChannelOptionsBase {
    bitrate?: number | null;
    nsfw?: boolean | null;
    parentID?: string | null;
    rateLimitPerUser?: number | null;
    rtcRegion?: string | null;
    userLimit?: number | null;
    videoQualityMode?: VideoQualityMode | null;
  }
  interface EditMediaChannelOptions extends EditChannelOptionsBase {
    availableTags?: ForumTag[];
    defaultAutoArchiveDuration?: AutoArchiveDuration | null;
    defaultReactionEmoji?: DefaultReactionEmoji | null;
    defaultSortOrder?: SortOrderTypes | null;
    defaultThreadRateLimitPerUser?: number;
    flags?: ChannelFlags;
    nsfw?: boolean | null;
    parentID?: string | null;
    rateLimitPerUser?: number | null;
    topic?: string | null;
  }
  interface EditForumChannelOptions extends EditMediaChannelOptions {
    defaultForumLayout?: ForumLayoutTypes | null;
  }
  interface EditThreadChannelOptions {
    appliedTags?: string[];
    archived?: boolean;
    autoArchiveDuration?: AutoArchiveDuration;
    flags?: ChannelFlags;
    invitable?: boolean;
    locked?: boolean;
    name?: string;
    rateLimitPerUser?: number | null;
  }
  interface EditChannelPositionOptions {
    lockPermissions?: boolean;
    parentID?: string;
  }
  interface EditGroupChannelOptions {
    icon?: string | null;
    name?: string;
  }
  interface GetMessagesOptions {
    after?: string;
    around?: string;
    before?: string;
    limit?: number;
  }
  interface GroupRecipientOptions {
    accessToken: string;
    nick?: string;
  }
  interface PartialChannel {
    bitrate?: number;
    id: string;
    name?: string;
    nsfw?: boolean;
    parent_id?: number;
    permission_overwrites?: Overwrite[];
    rate_limit_per_user?: number;
    topic?: string | null;
    type: number;
    user_limit?: number;
  }
  interface Permissionable {
    permissionOverwrites: Collection<PermissionOverwrite>;
    position: number;
    deletePermission(overwriteID: string, reason?: string): Promise<void>;
    editPermission(overwriteID: string, allow: PermissionValueTypes, deny: PermissionValueTypes, type: PermissionType, reason?: string): Promise<PermissionOverwrite>;
  }
  interface Pinnable {
    lastPinTimestamp: number | null;
    getPins(): Promise<Message[]>;
    pinMessage(messageID: string): Promise<void>;
    unpinMessage(messageID: string): Promise<void>;
  }
  interface PurgeChannelOptions {
    after?: string;
    before?: string;
    filter?: (m: Message<AnyGuildTextableChannel>) => boolean;
    limit: number;
    reason?: string;
  }
  interface WebhookData {
    channelID: string;
    guildID: string;
  }

  // Client
  interface ApplicationRoleConnectionMetadata {
    description: string;
    description_localizations?: Record<LocaleStrings, string>;
    key: string;
    name: string;
    name_localizations?: Record<LocaleStrings, string>;
    type: ApplicationRoleConnectionMetadataTypes;
  }
  interface ClientOptions {
    /** @deprecated */
    agent?: HTTPSAgent;
    allowedMentions?: AllowedMentions;
    autoreconnect?: boolean;
    compress?: boolean;
    connectionTimeout?: number;
    defaultImageFormat?: string;
    defaultImageSize?: number;
    disableEvents?: Record<string, boolean>;
    firstShardID?: number;
    getAllUsers?: boolean;
    guildCreateTimeout?: number;
    intents: number | (IntentStrings | number)[];
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
    shardConcurrency?: number | "auto";
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
  interface EditSelfOptions {
    avatar?: string | null;
    banner?: string | null;
    username?: string;
  }
  interface RequestHandlerOptions {
    agent?: HTTPSAgent;
    baseURL?: string;
    decodeReasons?: boolean;
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
    permissions?: Record<string, boolean> | GenericCheckFunction<Record<string, boolean>>;
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
    proxy_url?: string;
    url?: string;
    width?: number;
  }
  interface PollEmbed {
    fields: PollEmbedField[];
    type: "poll_result";
  }
  interface PollEmbedField extends EmbedField {
    /** Only `poll_question_text`, `victor_answer_votes` and `total_votes` are guaranteed. Other names are optional and may not be present. */
    name: "poll_question_text" | "victor_answer_votes" | "total_votes" | "victor_answer_id" | "victor_answer_text" | "victor_answer_emoji_id" | "victor_answer_emoji_name" | "victor_answer_emoji_animated"; // REVIEW Is there a better way to do this?
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
  interface EditApplicationEmojiOptions {
    name: string;
  }
  interface ApplicationEmojiOptions extends EditApplicationEmojiOptions {
    image: string;
  }
  interface ApplicationEmojis {
    items: Emoji[];
  }
  interface PartialEmoji {
    id: string | null;
    name: string;
    animated?: boolean;
  }

  // Events
  interface OldAutoModerationRule {
    actions: AutoModerationAction[];
    enabled: boolean;
    eventType: AutoModerationEventType;
    exemptChannels: string[];
    exemptRoles: string[];
    name: string;
    triggerMetadata: AutoModerationTriggerMetadata;
  }
  interface OldCall {
    endedTimestamp?: number;
    participants: string[];
    region: string;
    ringing: string[];
    unavailable: boolean;
  }
  interface OldForumChannel extends OldGuildChannel {
    availableTags: ForumTag[];
    defaultAutoArchiveDuration: AutoArchiveDuration;
    defaultForumLayout: ForumLayoutTypes;
    defaultReactionEmoji: DefaultReactionEmoji;
    defaultSortOrder: SortOrderTypes;
    defaultThreadRateLimitPerUser: number;
  }
  interface OldGroupChannel {
    icon: string;
    name: string;
    ownerID: string;
    type: Constants["ChannelTypes"]["GROUP_DM"];
  }
  interface OldGuild {
    afkChannelID: string | null;
    afkTimeout: number;
    autoRemoved: boolean | null;
    banner: string | null;
    defaultNotifications: DefaultNotifications;
    description: string | null;
    discoverySplash: string | null;
    emojiCount: number | null;
    emojis: Omit<Emoji, "user" | "icon">[];
    explicitContentFilter: ExplicitContentFilter;
    features: GuildFeatures[];
    icon: string | null;
    keywords: string[] | null;
    large: boolean;
    maxMembers?: number;
    maxVideoChannelUsers?: number;
    mfaLevel: MFALevel;
    name: string;
    /** @deprecated */
    nsfw: boolean;
    nsfwLevel: NSFWLevel;
    ownerID: string;
    preferredLocale?: LocaleStrings;
    premiumProgressBarEnabled: boolean;
    premiumSubscriptionCount?: number;
    premiumTier: PremiumTier;
    primaryCategory?: DiscoveryCategory;
    primaryCategoryID: number | null;
    publicUpdatesChannelID: string | null;
    rulesChannelID: string | null;
    splash: string | null;
    stickers?: Sticker[];
    systemChannelFlags: number;
    systemChannelID: string | null;
    vanityURL: string | null;
    verificationLevel: VerificationLevel;
    welcomeScreen?: WelcomeScreen;
  }
  interface OldGuildChannel {
    bitrate?: number;
    flags?: number;
    name: string;
    nsfw?: boolean;
    parentID: string | null;
    permissionOverwrites: Collection<PermissionOverwrite>;
    position: number;
    rateLimitPerUser?: number;
    rtcRegion?: string | null;
    topic?: string | null;
    type: GuildChannelTypes;
  }
  interface OldGuildScheduledEvent {
    channel: PossiblyUncachedSpeakableChannel | null;
    description?: string | null;
    entityID: string | null;
    entityMetadata: GuildScheduledEventMetadata | null;
    entityType: GuildScheduledEventEntityTypes;
    image?: string;
    name: string;
    privacyLevel: GuildScheduledEventPrivacyLevel;
    scheduledEndTime: number | null;
    scheduledStartTime: number;
    status: GuildScheduledEventStatus;
  }
  interface OldGuildSoundboardSound {
    available: boolean;
    emojiID: string | null;
    emojiName: string | null;
    name: string;
    volume: number;
  }
  interface OldGuildTextChannel extends OldGuildChannel {
    nsfw: boolean;
    rateLimitPerUser: number;
    topic?: string | null;
    type: GuildTextChannelTypes;
  }
  interface OldMember {
    avatar: string | null;
    avatarDecorationData?: AvatarDecorationData | null;
    communicationDisabledUntil?: number | null;
    flags?: number;
    nick: string | null;
    pending?: boolean;
    premiumSince?: number | null;
    roles: string[];
  }
  interface OldMessage {
    attachments: Attachment[];
    channelMentions: string[];
    content: string;
    editedTimestamp?: number;
    embeds: Embed[];
    flags: number;
    mentionedBy?: unknown;
    mentions: User[];
    pinned: boolean;
    poll?: Poll;
    roleMentions: string[];
    tts: boolean;
  }
  interface OldRole {
    color: number;
    flags: number;
    hoist: boolean;
    icon: string | null;
    managed: boolean;
    mentionable: boolean;
    name: string;
    permissions: Permission;
    position: number;
    unicodeEmoji: string | null;
  }
  interface OldStageInstance {
    discoverableDisabled: boolean;
    privacyLevel: StageInstancePrivacyLevel;
    topic: string;
  }
  interface OldVoiceChannel extends OldGuildChannel {
    bitrate: number;
    rtcRegion: string | null;
    type: GuildVoiceChannelTypes;
    userLimit: number;
    videoQualityMode: VideoQualityMode;
  }
  interface OldThread {
    appliedTags: string[];
    autoArchiveDuration: number;
    name: string;
    rateLimitPerUser: number;
    threadMetadata: ThreadMetadata;
  }
  interface OldThreadMember {
    flags: number;
  }
  interface OldVoiceState {
    deaf: boolean;
    mute: boolean;
    selfDeaf: boolean;
    selfMute: boolean;
    selfStream: boolean;
    selfVideo: boolean;
  }
  interface EventListeners {
    applicationCommandPermissionsUpdate: [applicationCommandPermissions: GuildApplicationCommandPermissions];
    autoModerationActionExecution: [guild: Guild, action: AutoModerationActionExecution];
    autoModerationRuleCreate: [guild: Guild, rule: AutoModerationRule];
    autoModerationRuleDelete: [guild: Guild, rule: AutoModerationRule];
    autoModerationRuleUpdate: [guild: Guild, rule: AutoModerationRule, oldRule: OldAutoModerationRule | null];
    channelCreate: [channel: AnyGuildChannel];
    channelDelete: [channel: Exclude<AnyChannel, GroupChannel>];
    channelPinUpdate: [channel: TextableChannel, timestamp: number, oldTimestamp: number];
    channelUpdate: [channel: AnyGuildChannel, oldChannel: OldGuildChannel | OldForumChannel | OldGuildTextChannel | OldVoiceChannel]
      | [channel: GroupChannel, oldChannel: OldGroupChannel];
    connect: [id: number];
    debug: [message: string, id?: number];
    disconnect: [];
    error: [err: Error, id?: number];
    guildAuditLogEntryCreate: [guildAuditLogEntry: GuildAuditLogEntry];
    guildAvailable: [guild: Guild];
    guildBanAdd: [guild: Guild, user: User];
    guildBanRemove: [guild: Guild, user: User];
    guildCreate: [guild: Guild];
    guildDelete: [guild: PossiblyUncachedGuild];
    guildEmojisUpdate: [guild: PossiblyUncachedGuild, emojis: Emoji[], oldEmojis: Emoji[] | null];
    guildIntegrationsUpdate: [guild: PossiblyUncachedGuild];
    guildMemberAdd: [guild: Guild, member: Member];
    guildMemberChunk: [guild: Guild, member: Member[]];
    guildMemberRemove: [guild: Guild, member: Member | MemberPartial];
    guildMemberUpdate: [guild: Guild, member: Member, oldMember: OldMember | null];
    guildRoleCreate: [guild: Guild, role: Role];
    guildRoleDelete: [guild: Guild, role: Role];
    guildRoleUpdate: [guild: Guild, role: Role, oldRole: OldRole];
    guildScheduledEventCreate: [event: GuildScheduledEvent];
    guildScheduledEventDelete: [event: GuildScheduledEvent];
    guildScheduledEventUpdate: [event: GuildScheduledEvent, oldEvent: OldGuildScheduledEvent | null];
    guildScheduledEventUserAdd: [event: PossiblyUncachedGuildScheduledEvent, user: PossiblyUncachedUser];
    guildScheduledEventUserRemove: [event: PossiblyUncachedGuildScheduledEvent, user: PossiblyUncachedUser];
    guildSoundboardSoundCreate: [sound: SoundboardSound];
    guildSoundboardSoundDelete: [sound: PossiblyUncachedGuildSoundboardSound];
    guildSoundboardSoundUpdate: [sound: SoundboardSound, oldSound: OldGuildSoundboardSound | null];
    guildSoundboardSoundsUpdate: [guild: PossiblyUncachedGuild, sounds: SoundboardSound[], oldSounds: (OldGuildSoundboardSound | null)[]];
    guildStickersUpdate: [guild: PossiblyUncachedGuild, stickers: Sticker[], oldStickers: Sticker[] | null];
    guildUnavailable: [guild: UnavailableGuild];
    guildUpdate: [guild: Guild, oldGuild: OldGuild];
    hello: [trace: string[], id: number];
    interactionCreate: [interaction: PingInteraction | CommandInteraction | ComponentInteraction | AutocompleteInteraction | ModalSubmitInteraction | UnknownInteraction];
    inviteCreate: [guild: Guild, invite: Invite];
    inviteDelete: [guild: Guild, invite: Invite];
    messageCreate: [message: Message<PossiblyUncachedTextableChannel>];
    messageDelete: [message: PossiblyUncachedMessage];
    messageDeleteBulk: [messages: PossiblyUncachedMessage[]];
    messagePollVoteAdd: [message: PossiblyUncachedMessage, user: PossiblyUncachedUser, answerID: number];
    messagePollVoteRemove: [message: PossiblyUncachedMessage, user: PossiblyUncachedUser, answerID: number];
    messageReactionAdd: [message: PossiblyUncachedMessage, emoji: PartialEmoji, reactor: Member | Uncached, burst: boolean];
    messageReactionRemove: [message: PossiblyUncachedMessage, emoji: PartialEmoji, userID: string, burst: boolean];
    messageReactionRemoveAll: [message: PossiblyUncachedMessage];
    messageReactionRemoveEmoji: [message: PossiblyUncachedMessage, emoji: PartialEmoji];
    messageUpdate: [message: Message<PossiblyUncachedTextableChannel>, oldMessage: OldMessage | null];
    presenceUpdate: [other: Member, oldPresence: Presence | null];
    rawREST: [request: RawRESTRequest];
    rawWS: [packet: RawPacket, id: number];
    ready: [];
    shardPreReady: [id: number];
    soundboardSounds: [guild: PossiblyUncachedGuild, sounds: SoundboardSound[]];
    stageInstanceCreate: [stageInstance: StageInstance];
    stageInstanceDelete: [stageInstance: StageInstance];
    stageInstanceUpdate: [stageInstance: StageInstance, oldStageInstance: OldStageInstance | null];
    threadCreate: [channel: AnyThreadChannel];
    threadDelete: [channel: AnyThreadChannel];
    threadListSync: [guild: Guild, deletedThreads: (AnyThreadChannel | Uncached)[], activeThreads: AnyThreadChannel[], joinedThreadsMember: ThreadMember[]];
    threadMembersUpdate: [channel: AnyThreadChannel, addedMembers: ThreadMember[], removedMembers: (ThreadMember | Uncached)[]];
    threadMemberUpdate: [channel: AnyThreadChannel, member: ThreadMember, oldMember: OldThreadMember];
    threadUpdate: [channel: AnyThreadChannel, oldChannel: OldThread | null];
    typingStart: [channel: AnyGuildTextableChannel | Uncached, user: PossiblyUncachedUser, member: Member]
      | [channel: DMChannel | Uncached, user: PossiblyUncachedUser, member: null];
    unavailableGuildCreate: [guild: UnavailableGuild];
    unknown: [packet: RawPacket, id?: number];
    userUpdate: [user: User, oldUser: PartialUser | null];
    voiceChannelEffectSend: [effect: VoiceChannelEffect];
    voiceChannelJoin: [member: Member, channel: AnyVoiceChannel];
    voiceChannelLeave: [member: Member, channel: AnyVoiceChannel];
    voiceChannelStatusUpdate: [channel: AnyVoiceChannel, oldChannel: VoiceStatus];
    voiceChannelSwitch: [member: Member, newChannel: AnyVoiceChannel, oldChannel: AnyVoiceChannel];
    voiceStateUpdate: [member: Member, oldState: OldVoiceState];
    warn: [message: string, id?: number];
    webhooksUpdate: [data: WebhookData];
  }
  interface ClientEvents extends EventListeners {
    shardDisconnect: [err: Error | undefined, id: number];
    shardReady: [id: number];
    shardResume: [id: number];
  }
  interface ShardEvents extends EventListeners {
    resume: [];
  }
  interface StreamEvents {
    end: [];
    error: [err: Error];
    start: [];
  }
  interface VoiceEvents {
    connect: [];
    debug: [message: string];
    disconnect: [err?: Error];
    end: [];
    error: [err: Error];
    pong: [latency: number];
    ready: [];
    speakingStart: [userID: string];
    speakingStop: [userID: string];
    start: [];
    unknown: [packet: RawPacket];
    usersConnect: [userIDs: string[]];
    userDisconnect: [userID: string];
    warn: [message: string];
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
    file?: FileContent;
    latency: number;
    method: string;
    resp: IncomingMessage;
    route: string;
    short: boolean;
    url: string;
  }
  interface RequestMembersPromise {
    members: Member[];
    received: number;
    res: (value: Member[]) => void;
    timeout: NodeJS.Timeout;
  }
  interface RequestSoundboardSoundsPromise {
    res: (value: Record<string, SoundboardSound[]>) => void;
    soundboardSounds: Record<string, SoundboardSound[]>;
    timeout: NodeJS.Timeout;
  }
  interface ShardManagerOptions {
    concurrency?: number | "auto";
  }

  // Guild
  interface AddGuildMemberOptions {
    deaf?: boolean;
    mute?: boolean;
    nick?: string;
    roles?: string[];
  }
  interface BanMemberOptions {
    /** @deprecated */
    deleteMessageDays?: number;
    deleteMessageSeconds?: number;
    reason?: string;
  }
  interface BulkBanMembersOptions extends Omit<BanMemberOptions, "deleteMessageDays"> {
    userIDs: string[];
  }
  interface BulkBanMembersResponse {
    banned_users: string[];
    failed_users: string[];
  }
  interface CreateGuildOptions {
    afkChannelID?: string;
    afkTimeout?: number;
    channels?: PartialChannel[];
    defaultNotifications?: DefaultNotifications;
    explicitContentFilter?: ExplicitContentFilter;
    icon?: string;
    roles?: PartialRole[];
    systemChannelID: string;
    verificationLevel?: VerificationLevel;
  }
  interface DiscoveryCategory {
    id: number;
    is_primary: boolean;
    name: {
      default: string;
      localizations?: Record<LocaleStrings, string>;
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
  interface GetGuildBansOptions {
    after?: string;
    before?: string;
    limit?: number;
  }
  interface GetGuildScheduledEventOptions {
    withUserCount?: boolean;
  }
  interface GetGuildScheduledEventUsersOptions {
    after?: string;
    before?: string;
    limit?: number;
    withMember?: boolean;
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
    withCounts?: boolean;
  }
  interface GuildAuditLog {
    entries: GuildAuditLogEntry[];
    integrations: GuildIntegration[];
    threads: AnyThreadChannel[];
    users: User[];
    webhooks: Webhook[];
  }
  interface GuildBan {
    reason?: string;
    user: User;
  }
  interface GuildOnboarding {
    default_channel_ids: string[];
    enabled: boolean;
    guild_id: string;
    mode: OnboardingModes;
    prompts: GuildOnboardingPrompt[];
  }
  interface GuildOnboardingOptions extends Omit<GuildOnboarding, "guild_id" | "prompt"> {
    prompts: GuildOnboardingPromptOptions[];
  }
  interface GuildOnboardingPrompt {
    id: string;
    in_onboarding: boolean;
    options: GuildOnboardingPromptOption[];
    required: boolean;
    single_select: boolean;
    title: string;
    type: OnboardingPromptTypes;
  }
  interface GuildOnboardingPromptOption {
    channel_ids: string[];
    description: string | null;
    emoji?: PartialEmoji;
    id: string;
    role_ids: string[];
    title: string;
  }
  interface GuildOnboardingPromptOptionOptions<T = boolean> extends Omit<GuildOnboardingPromptOption, "emoji"> {
    emoji_animated: T extends true ? boolean : never;
    emoji_id: T extends true ? string : never;
    emoji_name: T extends true ? string : never;
  }
  interface GuildOnboardingPromptOptions extends Omit<GuildOnboardingPrompt, "options"> {
    options: GuildOnboardingPromptOptionOptions[];
  }
  interface GuildOptions {
    afkChannelID?: string | null;
    afkTimeout?: number;
    banner?: string | null;
    defaultNotifications?: DefaultNotifications | null;
    description?: string | null;
    discoverySplash?: string | null;
    explicitContentFilter?: ExplicitContentFilter | null;
    features?: GuildFeatures[]; // Though only some are editable?
    icon?: string | null;
    name?: string;
    ownerID?: string;
    preferredLocale?: LocaleStrings | null;
    publicUpdatesChannelID?: string | null;
    rulesChannelID?: string | null;
    safetyAlertsChannelID?: string | null;
    splash?: string | null;
    systemChannelFlags?: number;
    systemChannelID?: string | null;
    verificationLevel?: VerificationLevel | null;
  }
  interface GuildScheduledEventEditOptionsBase<T extends GuildScheduledEventEntityTypes = GuildScheduledEventEntityTypes> {
    channelID?: T extends Constants["GuildScheduledEventEntityTypes"]["EXTERNAL"] ? null : string;
    description?: string | null;
    entityMetadata?: T extends Constants["GuildScheduledEventEntityTypes"]["EXTERNAL"] ? Required<GuildScheduledEventMetadata> : GuildScheduledEventMetadata | null;
    entityType?: T;
    image?: string;
    name?: string;
    privacyLevel?: GuildScheduledEventPrivacyLevel;
    scheduledEndTime?: T extends Constants["GuildScheduledEventEntityTypes"]["EXTERNAL"] ? Date : Date | undefined;
    scheduledStartTime?: Date;
    status?: GuildScheduledEventStatus;
  }
  interface GuildScheduledEventEditOptionsDiscord extends GuildScheduledEventEditOptionsBase<Exclude<GuildScheduledEventEntityTypes, Constants["GuildScheduledEventEntityTypes"]["EXTERNAL"]>> {
    channelID: string;
    entityMetadata: GuildScheduledEventMetadata;
  }
  interface GuildScheduledEventEditOptionsExternal extends GuildScheduledEventEditOptionsBase<Constants["GuildScheduledEventEntityTypes"]["EXTERNAL"]> {
    channelID: null;
    entityMetadata: Required<GuildScheduledEventMetadata>;
    scheduledEndTime: Date;
  }
  interface GuildScheduledEventMetadata {
    location?: string;
  }
  interface GuildScheduledEventOptionsBase<T extends GuildScheduledEventEntityTypes> extends Omit<GuildScheduledEventEditOptionsBase<T>, "entityMetadata" | "status"> {
    channelID: T extends Constants["GuildScheduledEventEntityTypes"]["EXTERNAL"] ? never : string;
    entityMetadata?: T extends Constants["GuildScheduledEventEntityTypes"]["EXTERNAL"] ? Required<GuildScheduledEventMetadata> : GuildScheduledEventMetadata | undefined;
    entityType: T;
    name: string;
    privacyLevel: GuildScheduledEventPrivacyLevel;
    scheduledStartTime: Date;
  }
  interface GuildScheduledEventOptionsDiscord extends GuildScheduledEventEditOptionsBase<Exclude<GuildScheduledEventEntityTypes, Constants["GuildScheduledEventEntityTypes"]["EXTERNAL"]>> {
    channelID: string;
    entityMetadata: GuildScheduledEventMetadata;
  }
  interface GuildScheduledEventOptionsExternal extends GuildScheduledEventOptionsBase<Constants["GuildScheduledEventEntityTypes"]["EXTERNAL"]> {
    channelID: never;
    entityMetadata: Required<GuildScheduledEventMetadata>;
    scheduledEndTime: Date;
  }
  interface GuildScheduledEventUser {
    guildScheduledEventID: string;
    member?: Member;
    user: User;
  }
  interface GuildSoundboardSoundBase {
    emojiID?: string | null;
    emojiName?: string | null;
    name?: string;
    volume?: number | null;
  }
  interface GuildSoundboardSoundCreate extends GuildSoundboardSoundBase {
    name: string;
    sound: string;
  }
  interface GuildSoundboardSoundEdit extends GuildSoundboardSoundBase {
    reason?: string;
  }
  interface GuildSoundboardSoundSend {
    soundID: string;
    sourceGuildID?: string;
  }
  interface GuildTemplateOptions {
    description?: string | null;
    name?: string;
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
  }
  interface IntegrationOptions {
    enableEmoticons?: string;
    expireBehavior?: string;
    expireGracePeriod?: string;
  }
  interface MFALevelResponse {
    level: MFALevel;
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
  interface Widget extends Omit<WidgetOptions, "channelID" | "reason"> {
    channel_id: string | null;
    enabled: boolean;
  }
  interface WidgetChannel {
    id: string;
    name: string;
    position: number;
  }
  interface WidgetData {
    channels: WidgetChannel[];
    id: string;
    instant_invite: string;
    members: WidgetMember[];
    name: string;
    presence_count: number;
  }
  interface WidgetMember {
    avatar: string | null;
    avatar_url: string;
    discriminator: string;
    id: string;
    status: string;
    username: string;
  }
  interface WidgetOptions {
    channelID?: string | null;
    channel_id?: string | null;
    enabled?: boolean;
    reason?: string;
  }

  // Interaction
  interface AutocompleteInteractionData {
    id: string;
    name: string;
    type: Constants["ApplicationCommandTypes"]["CHAT_INPUT"];
    target_id?: string;
    options: InteractionDataOptions[];
  }
  interface CommandInteractionData {
    id: string;
    name: string;
    type: ApplicationCommandTypes;
    target_id?: string;
    resolved?: CommandInteractionResolvedData;
    options?: InteractionDataOptions[];
  }
  interface CommandInteractionResolvedData extends InteractionResolvedData {
    messages?: Collection<Message>;
  }
  interface ComponentInteractionButtonData {
    component_type: Constants["ComponentTypes"]["BUTTON"];
    custom_id: string;
  }
  interface ComponentInteractionSelectMenuData {
    component_type: SelectMenuTypes;
    custom_id: string;
    values: string[];
    resolved?: InteractionResolvedData;
  }
  interface InteractionAutocomplete {
    choices: ApplicationCommandOptionChoice[];
  }
  interface InteractionDataOptionsSubCommand {
    name: string;
    options?: InteractionDataOptions[];
    type: Constants["ApplicationCommandOptionTypes"]["SUB_COMMAND"];
  }
  interface InteractionDataOptionsSubCommandGroup {
    name: string;
    options: InteractionDataOptions[];
    type: Constants["ApplicationCommandOptionTypes"]["SUB_COMMAND_GROUP"];
  }
  interface InteractionDataOptionWithValue<T extends Constants["ApplicationCommandOptionTypes"][Exclude<keyof Constants["ApplicationCommandOptionTypes"], "SUB_COMMAND" | "SUB_COMMAND_GROUP">] = Constants["ApplicationCommandOptionTypes"][Exclude<keyof Constants["ApplicationCommandOptionTypes"], "SUB_COMMAND" | "SUB_COMMAND_GROUP">], V = unknown> {
    focused?: boolean;
    name: string;
    type: T;
    value: V;
  }
  interface InteractionModal {
    title: string;
    custom_id: string;
    components: ModalContentActionRow[];
  }
  interface InteractionOptions {
    data?: InteractionCallbackData;
    type: InteractionResponseTypes;
  }
  interface InteractionResolvedData {
    channels?: Collection<AnyChannel>;
    members?: Collection<Member>;
    roles?: Collection<Role>;
    users?: Collection<User>;
  }

  // Invite
  interface CreateChannelInviteOptions extends CreateInviteOptions {
    targetApplicationID?: string;
    targetType?: InviteTargetTypes;
    targetUserID?: string;
  }
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
  interface InviteStageInstance {
    members: Member[];
    participantCount: number;
    speakerCount: number;
    topic: string;
  }

  // Member/User
  interface AvatarDecorationData {
    asset: string;
    sku_id: string;
  }
  interface MemberOptions {
    channelID?: string | null;
    communicationDisabledUntil?: Date | null;
    deaf?: boolean;
    flags?: number;
    mute?: boolean;
    nick?: string | null;
    roles?: string[];
  }
  interface MemberPartial {
    id: string;
    user: User;
  }
  interface MemberRoles extends BaseData {
    roles: string[];
  }
  interface PartialUser {
    accentColor?: number | null;
    avatar: string | null;
    avatarDecorationData?: AvatarDecorationData | null;
    banner?: string | null;
    discriminator: string;
    id: string;
    username: string;
  }
  interface RequestGuildMembersOptions {
    limit?: number;
    presences?: boolean;
    query?: string;
    timeout?: number;
    userIDs?: string[];
  }
  interface RequestGuildSoundboardSoundsOptions {
    guildIDs: string[];
    timeout?: number;
  }

  // Message
  interface ActionRow {
    components: ActionRowComponents[];
    type: Constants["ComponentTypes"]["ACTION_ROW"];
  }
  interface ModalContentActionRow {
    components: TextInput[];
    type: Constants["ComponentTypes"]["ACTION_ROW"];
  }
  interface ActiveMessages {
    args: string[];
    command: Command;
    timeout: NodeJS.Timer;
  }
  interface AdvancedMessageContent extends AdvancedMessageContentEdit {
    messageReference?: MessageReferenceReply | MessageReferenceForward;
    /** @deprecated */
    messageReferenceID?: string;
    poll?: PollCreateOptions;
    stickerIDs?: string[];
    tts?: boolean;
  }
  interface AdvancedMessageContentEdit {
    allowedMentions?: AllowedMentions;
    attachments?: PartialAttachment[];
    components?: ActionRow[];
    content?: string;
    /** @deprecated */
    embed?: EmbedOptions;
    embeds?: EmbedOptions[];
    enforceNonce?: boolean;
    file?: FileContent | FileContent[];
    flags?: number;
  }
  interface AllowedMentions {
    everyone?: boolean;
    repliedUser?: boolean;
    roles?: boolean | string[];
    users?: boolean | string[];
  }
  interface Attachment extends PartialAttachment {
    content_type?: string;
    duration_secs?: number;
    ephemeral?: boolean;
    filename: string;
    flags?: number;
    height?: number;
    id: string;
    proxy_url: string;
    size: number;
    url: string;
    waveform?: string;
    width?: number;
  }
  interface ButtonBase {
    disabled?: boolean;
    emoji?: Partial<PartialEmoji>;
    label?: string;
    type: Constants["ComponentTypes"]["BUTTON"];
  }
  interface CreateStickerOptions extends Required<Pick<EditStickerOptions, "name" | "tags">> {
    file: FileContent;
  }
  interface EditStickerOptions {
    description?: string;
    name?: string;
    tags?: string;
  }
  interface FileContent {
    file: Buffer | string;
    name: string;
  }
  interface TextInput {
    custom_id: string;
    label: string;
    max_length?: number;
    min_length?: number;
    placeholder?: string;
    required?: boolean;
    style: Constants["TextInputStyles"][keyof Constants["TextInputStyles"]];
    type: Constants["ComponentTypes"]["TEXT_INPUT"];
    value?: string;
  }
  interface GetMessageReactionOptions {
    after?: string;
    /** @deprecated */
    before?: string;
    limit?: number;
    type?: ReactionTypes;
  }
  interface GetPollAnswerVotersOptions {
    after?: string;
    limit?: number;
  }
  interface InteractionButton extends ButtonBase {
    custom_id: string;
    style: Exclude<ButtonStyles, Constants["ButtonStyles"]["LINK"]>;
  }
  interface MessageActivity {
    party_id?: string;
    type: MessageActivityTypes;
  }
  interface MessageApplication {
    cover_image?: string;
    description: string;
    icon: string | null;
    id: string;
    name: string;
  }
  interface MessageCall {
    endedTimestamp: number | null;
    participants: string[];
  }
  interface MessageInteraction {
    id: string;
    member: Member | null;
    name: string;
    type: InteractionTypes;
    user: User;
  }
  interface MessageReference extends MessageReferenceBase {
    channelID: string;
  }
  interface MessageReferenceBase {
    channelID?: string;
    guildID?: string;
    messageID?: string;
    type?: MessageReferenceTypes;
  }
  interface MessageReferenceForward extends MessageReferenceBase {
    channelID: string;
    messageID: string;
    type: Constants["MessageReferenceTypes"]["FORWARD"];
  }
  interface MessageReferenceReply extends MessageReferenceBase {
    messageID: string;
    failIfNotExists?: boolean;
    type?: Constants["MessageReferenceTypes"]["DEFAULT"];
  }
  interface MessageSnapshot {
    guildID?: string;
    message: Pick<Message, "attachments" | "components" | "content" | "editedTimestamp" | "embeds" | "flags" | "id" | "mentions" | "roleMentions" | "stickerItems" | "stickers" | "timestamp" | "type">;
  }
  interface PartialAttachment {
    description?: string;
    filename?: string;
    id: string | number;
  }
  interface Poll {
    allow_multiselect: boolean;
    answers: PollAnswer[];
    expiry: number | null;
    layout_type: PollLayoutTypes;
    question: Pick<PollMedia, "text">;
    results?: PollResult;
  }
  interface PollAnswer {
    answer_id: number;
    poll_media: PollMedia;
  }
  interface PollCreateOptions extends Omit<Poll, "expiry" | "results"> {
    duration: number;
  }
  interface PollMedia {
    emoji?: PartialEmoji;
    text: string;
  }
  interface PollResult {
    answer_counts: PollAnswerCount[];
    is_finalized: boolean;
  }
  interface PollAnswerCount {
    count: number;
    id: number;
    me_voted: boolean;
  }
  interface Reaction {
    burst_colors: string[];
    count: number;
    count_details: ReactionCountDetails;
    me: boolean;
    me_burst: boolean;
    type: ReactionTypes;
  }
  interface ReactionCountDetails {
    burst: number;
    normal: number;
  }
  interface SelectMenuBase {
    custom_id: string;
    disabled?: boolean;
    max_values?: number;
    min_values?: number;
    placeholder?: string;
    type: SelectMenuTypes;
  }
  interface ChannelSelectMenu extends SelectMenuBase {
    channel_types?: ChannelTypes[];
    type: Constants["ComponentTypes"]["CHANNEL_SELECT"];
  }
  interface StringSelectMenu extends SelectMenuBase {
    options: StringSelectOptions[];
    type: Constants["ComponentTypes"]["STRING_SELECT"];
  }
  interface StringSelectOptions {
    default?: boolean;
    description?: string;
    emoji?: Partial<PartialEmoji>;
    label: string;
    value: string;
  }
  interface ResolvedSelectMenus extends SelectMenuBase {
    default_values?: SelectDefaultValues[];
    type: SelectMenuResolvedTypes;
  }
  interface SelectDefaultValues {
    id: string;
    type: "user" | "role" | "channel";
  }
  interface Sticker extends StickerItems {
    available?: boolean;
    description: string;
    guild_id?: string;
    pack_id?: string;
    sort_value?: number;
    tags: string;
    type: StickerTypes;
    user?: User;
  }
  interface StickerItems {
    format_type: StickerFormats;
    id: string;
    name: string;
  }
  interface StickerPack {
    banner_asset_id: string;
    cover_sticker_id?: string;
    description: string;
    id: string;
    name: string;
    sku_id: string;
    stickers: Sticker[];
  }
  interface URLButton extends ButtonBase {
    style: Constants["ButtonStyles"]["LINK"];
    url: string;
  }

  // Presence
  interface Activity<T extends ActivityType = ActivityType> extends ActivityPartial<T> {
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
    type: T;
    // the stuff attached to this object apparently varies even more than documented, so...
    [key: string]: unknown;
  }
  interface ActivityPartial<T extends ActivityType> {
    name: string;
    state?: string;
    type?: T;
    url?: string;
  }
  interface ClientPresence {
    activities: Activity[] | null;
    afk: boolean;
    since: number | null;
    status: SelfStatus;
  }
  interface ClientStatus {
    desktop: UserStatus;
    mobile: UserStatus;
    web: UserStatus;
  }
  interface Presence {
    activities?: Activity[];
    clientStatus?: ClientStatus;
    status?: UserStatus;
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
    flags?: number;
    hoist?: boolean;
    id: string;
    mentionable?: boolean;
    name?: string;
    permissions?: number;
    position?: number;
  }
  interface RoleOptions {
    color?: number;
    hoist?: boolean;
    icon?: string;
    mentionable?: boolean;
    name?: string;
    permissions?: bigint | number | string | Permission;
    unicodeEmoji?: string;
  }
  interface RoleSubscriptionData {
    is_renewal: boolean;
    role_subscription_listing_id: string;
    tier_name: string;
    total_months_subscribed: number;
  }
  interface RoleTags {
    bot_id?: string;
    integration_id?: string;
    premium_subscriber?: true;
    subscription_listing_id?: string;
    available_for_purchase?: true;
    guild_connections?: true;
  }

  // Forum/Thread
  interface CreateThreadOptions {
    autoArchiveDuration?: AutoArchiveDuration;
    name: string;
    rateLimitPerUser?: number;
    reason?: string;
  }
  interface CreateForumThreadOptions extends CreateThreadOptions {
    appliedTags?: string[];
    message: Omit<AdvancedMessageContent, "messageReference" | "messageReferenceID" | "tts"> & FileContent[];
  }
  interface CreateThreadWithoutMessageOptions<T = AnyThreadChannel["type"]> extends CreateThreadOptions {
    invitable?: T extends PrivateThreadChannel["type"] ? boolean : never;
    type?: T;
  }
  interface DefaultReactionEmoji {
    emoji_id?: string;
    emoji_name?: string;
  }
  interface ForumTag extends DefaultReactionEmoji {
    id: string;
    name: string;
    moderated: boolean;
  }
  interface GetArchivedThreadsOptions {
    before?: Date;
    limit?: number;
  }
  interface GetThreadMembersOptions {
    after?: string;
    limit?: number;
    withMember?: boolean;
  }
  interface ListedChannelThreads<T extends ThreadChannel = AnyThreadChannel> extends ListedGuildThreads<T> {
    hasMore: boolean;
  }
  interface ListedGuildThreads<T extends ThreadChannel = AnyThreadChannel> {
    members: ThreadMember[];
    threads: T[];
  }
  interface PrivateThreadMetadata extends ThreadMetadata {
    invitable: boolean;
  }
  interface ThreadMetadata {
    archived: boolean;
    archiveTimestamp: number;
    autoArchiveDuration: AutoArchiveDuration;
    createTimestamp?: number | null;
    locked: boolean;
  }

  // Modals
  interface ModalSubmitInteractionDataComponents {
    components: ModalSubmitInteractionDataComponent[];
    type: Constants["ComponentTypes"]["ACTION_ROW"];
  }

  interface ModalSubmitInteractionDataTextInputComponent {
    custom_id: string;
    type: Constants["ComponentTypes"]["TEXT_INPUT"];
    value: string;
  }

  interface ModalSubmitInteractionData {
    custom_id: string;
    components: ModalSubmitInteractionDataComponents[];
  }

  // Voice
  interface JoinVoiceChannelOptions {
    opusOnly?: boolean;
    selfDeaf?: boolean;
    selfMute?: boolean;
    shared?: boolean;
  }
  interface StageInstanceOptions {
    privacyLevel?: StageInstancePrivacyLevel;
    topic?: string;
  }
  interface UncachedMemberVoiceState {
    id: string;
    voiceState: OldVoiceState;
  }
  interface VoiceChannelEffect {
    animationID?: number;
    animationType?: VoiceChannelEffectAnimationType | null;
    channel: PossiblyUncachedSpeakableChannel;
    emoji?: PartialEmoji | null;
    guild: PossiblyUncachedGuild;
    soundID?: string | number;
    soundVolume?: number;
    user: PossiblyUncachedUser;
  }
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
  interface VoiceStatus {
    status: string;
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
    application_id: string | null;
    avatar: string | null;
    channel_id: string | null;
    guild_id: string | null;
    id: string;
    name: string;
    source_channel?: { id: string; name: string };
    source_guild: { icon: string | null; id: string; name: string };
    token?: string;
    type: WebhookTypes;
    url?: string;
    user?: PartialUser;
  }
  interface WebhookCreateOptions extends Omit<WebhookEditOptions, "channelID"> {
    name: string;
  }
  interface WebhookEditOptions {
    avatar?: string | null;
    channelID?: string;
    name?: string;
  }
  interface WebhookPayload {
    allowedMentions?: AllowedMentions;
    attachments?: PartialAttachment[];
    auth?: boolean;
    avatarURL?: string;
    components?: ActionRow[];
    content?: string;
    /** @deprecated */
    embed?: EmbedOptions;
    embeds?: EmbedOptions[];
    file?: FileContent | FileContent[];
    flags?: number;
    poll?: PollCreateOptions;
    threadID?: string;
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
    bot?: PartialUser;
    bot_public: boolean;
    bot_require_code_grant: boolean;
    description: string;
    icon: string | null;
    id: string;
    name: string;
    owner: PartialUser;
    privacy_policy_url?: string;
    role_connections_verification_url?: string;
    rpc_origins?: string[];
    team: OAuthTeamInfo | null;
    terms_of_service_url?: string;
    verify_key: string;
  }
  interface OAuthTeamInfo {
    icon: string | null;
    id: string;
    members: OAuthTeamMember[];
    name: string;
    owner_user_id: string;
  }
  interface OAuthTeamMember {
    membership_state: MembershipStates;
    role: OAuthTeamMemberRoleTypes;
    team_id: string;
    user: PartialUser;
  }

  // Classes
  export class AutoModerationRule<T extends AutoModerationTriggerType = AutoModerationTriggerType> extends Base {
    actions: AutoModerationAction[];
    creator: PossiblyUncachedUser;
    enabled: boolean;
    eventType: AutoModerationEventType;
    exemptChannels: string[];
    exemptRoles: string[];
    guild: PossiblyUncachedGuild;
    name: string;
    triggerMetadata: AutoModerationTriggerMetadata<T>;
    triggerType: T;
    constructor(data: BaseData, client: Client);
    delete(reason?: string): Promise<void>;
    edit(options: AutoModerationEditOptions<T>): Promise<AutoModerationRule<T>>;
  }
  /** Generic T is `true` if a Guild scoped command, and `false` if not */
  export class ApplicationCommand<T extends boolean, U = ApplicationCommandTypes> extends Base {
    applicationID: string;
    defaultMemberPermissions: Permission;
    /** @deprecated */
    defaultPermission?: boolean | null;
    description: U extends Constants["ApplicationCommandTypes"]["CHAT_INPUT"] ? string : "";
    descriptionLocalizations?: U extends "CHAT_INPUT" ? Record<LocaleStrings, string> | null : null;
    dmPermission?: boolean;
    guild: T extends true ? PossiblyUncachedGuild : never;
    name: string;
    nameLocalizations?: Record<LocaleStrings, string> | null;
    nsfw?: boolean;
    options?: ApplicationCommandOptions[];
    type?: U;
    version: string;
    delete(): Promise<void>;
    edit(options: ApplicationCommandEditOptions<T, U>): Promise<ApplicationCommand<T, U>>;
  }

  class Base implements SimpleJSON {
    createdAt: number;
    id: string;
    constructor(id: string);
    static getCreatedAt(id: string): number;
    static getDiscordEpoch(id: string): number;
    toString(): string;
    toJSON(props?: string[]): JSONCache;
  }

  export class BrowserWebSocket extends EventEmitter {
    readyState: number;
    constructor(url: string);
    close(code?: number, reason?: string): void;
    removeEventListener(event: string | symbol, listener: (...args: any[]) => void): this;
    // @ts-ignore: DOM
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
    terminate(): void;
    /* eslint-disable sort-class-members/sort-class-members */
    static CONNECTING: 0;
    static OPEN: 1;
    static CLOSING: 2;
    static CLOSED: 3;
    /* eslint-enable sort-class-members/sort-class-members */
  }

  export class BrowserWebSocketError extends Error {
    // @ts-ignore: DOM
    event: Event;
    // @ts-ignore: DOM
    constructor(message: string, event: Event);
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

  export class CategoryChannel extends GuildChannel implements Permissionable {
    channels: Collection<Exclude<AnyGuildChannel, CategoryChannel>>;
    permissionOverwrites: Collection<PermissionOverwrite>;
    position: number;
    type: Constants["ChannelTypes"]["GUILD_CATEGORY"];
    deletePermission(overwriteID: string, reason?: string): Promise<void>;
    edit(options: EditChannelOptionsBase, reason?: string): Promise<this>;
    editPermission(overwriteID: string, allow: PermissionValueTypes, deny: PermissionValueTypes, type: PermissionType, reason?: string): Promise<PermissionOverwrite>;
  }

  export class Channel extends Base {
    mention: string;
    type: ChannelTypes;
    constructor(data: BaseData, client: Client);
    static from(data: BaseData, client: Client): AnyChannel;
  }

  export class Client extends EventEmitter {
    application?: { id: string; flags: number };
    bot: boolean;
    channelGuildMap: Record<string, string>;
    dmChannelMap: Record<string, string>;
    dmChannels: Collection<DMChannel>;
    gatewayURL?: string;
    guilds: Collection<Guild>;
    guildShardMap: Record<string, number>;
    lastConnect: number;
    lastReconnectDelay: number;
    options: ClientOptions;
    presence: ClientPresence;
    /** @deprecated */
    privateChannelMap: Record<string, string>;
    /** @deprecated */
    privateChannels: Collection<DMChannel>;
    ready: boolean;
    reconnectAttempts: number;
    requestHandler: RequestHandler;
    shards: ShardManager;
    startTime: number;
    threadGuildMap: Record<string, string>;
    unavailableGuilds: Collection<UnavailableGuild>;
    uptime: number;
    user: ExtendedUser;
    users: Collection<User>;
    voiceConnections: VoiceConnectionManager;
    constructor(token: string, options?: ClientOptions);
    addGroupRecipient(groupID: string, userID: string): Promise<void>;
    addGuildDiscoverySubcategory(guildID: string, categoryID: string, reason?: string): Promise<DiscoverySubcategoryResponse>;
    addGuildMember(guildID: string, userID: string, accessToken: string, options?: AddGuildMemberOptions): Promise<void>;
    addGuildMemberRole(guildID: string, memberID: string, roleID: string, reason?: string): Promise<void>;
    addMessageReaction(channelID: string, messageID: string, reaction: string): Promise<void>;
    banGuildMember(guildID: string, userID: string, options?: BanMemberOptions): Promise<void>;
    /** @deprecated */
    banGuildMember(guildID: string, userID: string, deleteMessageDays?: number, reason?: string): Promise<void>;
    bulkBanGuildMembers(guildID: string, options: BulkBanMembersOptions): Promise<BulkBanMembersResponse>;
    bulkEditCommands(commands: ApplicationCommandBulkEditOptions<false>[]): Promise<ApplicationCommand<false>[]>;
    bulkEditGuildCommands(guildID: string, commands: ApplicationCommandBulkEditOptions<true>[]): Promise<ApplicationCommand<true>[]>;
    closeVoiceConnection(guildID: string): void;
    connect(): Promise<void>;
    createAutoModerationRule(guildID: string, rule: AutoModerationCreateOptions): Promise<AutoModerationRule>;
    createChannel(guildID: string, name: string): Promise<TextChannel>;
    createChannel<T extends GuildChannelTypes>(guildID: string, name: string, type: T, options?: CreateChannelOptions): Promise<ChannelTypeConversion<T>>;
    /** @deprecated */
    createChannel<T extends GuildChannelTypes>(guildID: string, name: string, type: T, options?: CreateChannelOptions | string): Promise<ChannelTypeConversion<T>>;
    createChannelInvite(
      channelID: string,
      options?: CreateChannelInviteOptions,
      reason?: string
    ): Promise<Invite<"withoutCount">>;
    createChannelWebhook(
      channelID: string,
      options: WebhookCreateOptions,
      reason?: string
    ): Promise<Webhook>;
    createCommand<T extends ApplicationCommandTypes>(command: ApplicationCommandCreateOptions<false, T>): Promise<ApplicationCommand<false, T>>;
    createEmoji(options: ApplicationEmojiOptions): Promise<Emoji>;
    createGroupChannel(userIDs: string[]): Promise<GroupChannel>;
    createGuild(name: string, options?: CreateGuildOptions): Promise<Guild>;
    createGuildCommand<T extends ApplicationCommandTypes>(guildID: string, command: ApplicationCommandCreateOptions<true, T>): Promise<ApplicationCommand<true, T>>;
    createGuildEmoji(guildID: string, options: EmojiOptions, reason?: string): Promise<Emoji>;
    createGuildFromTemplate(code: string, name: string, icon?: string): Promise<Guild>;
    createGuildScheduledEvent<T extends GuildScheduledEventEntityTypes>(guildID: string, event: GuildScheduledEventOptions<T>, reason?: string): Promise<GuildScheduledEvent<T>>;
    createGuildSoundboardSound(guildID: string, sound: GuildSoundboardSoundCreate, reason?: string): Promise<SoundboardSound>;
    createGuildSticker(guildID: string, options: CreateStickerOptions, reason?: string): Promise<Sticker>;
    createGuildTemplate(guildID: string, name: string, description?: string | null): Promise<GuildTemplate>;
    createInteractionResponse(interactionID: string, interactionToken: string, options: InteractionOptions, file?: FileContent | FileContent[]): Promise<void>;
    createMessage(channelID: string, content: MessageContent, file?: FileContent | FileContent[]): Promise<Message>;
    createRole(guildID: string, options?: Role | RoleOptions, reason?: string): Promise<Role>;
    createStageInstance(channelID: string, options: StageInstanceOptions): Promise<StageInstance>;
    createThread(channelID: string, options: CreateForumThreadOptions, file?: FileContent | FileContent[]): Promise<PublicThreadChannel<true>>;
    createThread(channelID: string, options: CreateThreadWithoutMessageOptions, file?: FileContent | FileContent[]): Promise<NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel>;
    createThreadWithMessage(channelID: string, messageID: string, options: CreateThreadOptions): Promise<NewsThreadChannel | PublicThreadChannel>;
    /** @deprecated */
    createThreadWithoutMessage(channelID: string, options: CreateThreadWithoutMessageOptions): Promise<NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel>;
    crosspostMessage(channelID: string, messageID: string): Promise<Message>;
    deleteAutoModerationRule(guildID: string, ruleID: string, reason?: string): Promise<void>;
    deleteChannel(channelID: string, reason?: string): Promise<void>;
    deleteChannelPermission(channelID: string, overwriteID: string, reason?: string): Promise<void>;
    deleteCommand(commandID: string): Promise<void>;
    deleteEmoji(emojiID: string): Promise<void>;
    deleteGuild(guildID: string): Promise<void>;
    deleteGuildCommand(guildID: string, commandID: string): Promise<void>;
    deleteGuildDiscoverySubcategory(guildID: string, categoryID: string, reason?: string): Promise<void>;
    deleteGuildEmoji(guildID: string, emojiID: string, reason?: string): Promise<void>;
    deleteGuildIntegration(guildID: string, integrationID: string): Promise<void>;
    deleteGuildScheduledEvent(guildID: string, eventID: string): Promise<void>;
    deleteGuildSoundboardSound(guildID: string, soundID: string, reason?: string): Promise<void>;
    deleteGuildSticker(guildID: string, stickerID: string, reason?: string): Promise<void>;
    deleteGuildTemplate(guildID: string, code: string): Promise<GuildTemplate>;
    deleteInvite(inviteID: string, reason?: string): Promise<void>;
    deleteMessage(channelID: string, messageID: string, reason?: string): Promise<void>;
    deleteMessages(channelID: string, messageIDs: string[], reason?: string): Promise<void>;
    deleteRole(guildID: string, roleID: string, reason?: string): Promise<void>;
    deleteStageInstance(channelID: string): Promise<void>;
    deleteWebhook(webhookID: string, token?: string, reason?: string): Promise<void>;
    deleteWebhookMessage(webhookID: string, token: string, messageID: string): Promise<void>;
    disconnect(options: { reconnect?: boolean | "auto" }): void;
    editAFK(afk: boolean): void;
    editAutoModerationRule<T extends AutoModerationTriggerType>(guildID: string, ruleID: string, options: AutoModerationEditOptions<T>): Promise<AutoModerationRule>;
    editChannel(
      channelID: string,
      options: EditGuildChannelOptions | EditGroupChannelOptions,
      reason?: string
    ): Promise<GroupChannel | AnyGuildChannel>;
    editChannelPermission(
      channelID: string,
      overwriteID: string,
      allow: bigint | number,
      deny: bigint | number,
      type: PermissionType,
      reason?: string
    ): Promise<void>;
    editChannelPosition(channelID: string, position: number, options?: EditChannelPositionOptions): Promise<void>;
    editChannelPositions(guildID: string, channelPositions: ChannelPosition[]): Promise<void>;
    editCommand<T extends ApplicationCommandTypes>(commandID: string, command: ApplicationCommandEditOptions<false, T>): Promise<ApplicationCommand<false, T>>;
    editEmoji(emojiID: string, options: EditApplicationEmojiOptions): Promise<Emoji>;
    editCommandPermissions(guildID: string, commandID: string, permissions: ApplicationCommandPermissions[], reason?: string): Promise<GuildApplicationCommandPermissions>;
    editGuild(guildID: string, options: GuildOptions, reason?: string): Promise<Guild>;
    editGuildCommand<T extends ApplicationCommandTypes>(guildID: string, commandID: string, command: ApplicationCommandEditOptions<true, T>): Promise<ApplicationCommand<true, T>>;
    editGuildDiscovery(guildID: string, options?: DiscoveryOptions): Promise<DiscoveryMetadata>;
    editGuildEmoji(
      guildID: string,
      emojiID: string,
      options: { name?: string; roles?: string[] },
      reason?: string
    ): Promise<Emoji>;
    editGuildMember(guildID: string, memberID: string, options: MemberOptions, reason?: string): Promise<Member>;
    editGuildMFALevel(guildID: string, level: MFALevel, reason?: string): Promise<MFALevelResponse>;
    editGuildOnboarding(guildID: string, options: GuildOnboardingOptions, reason?: string): Promise<GuildOnboarding>;
    editGuildScheduledEvent<T extends GuildScheduledEventEntityTypes>(guildID: string, eventID: string, event: GuildScheduledEventEditOptions<T>, reason?: string): Promise<GuildScheduledEvent<T>>;
    editGuildSoundboardSound(guildID: string, soundID: string, options: GuildSoundboardSoundEdit): Promise<SoundboardSound>;
    editGuildSticker(guildID: string, stickerID: string, options?: EditStickerOptions, reason?: string): Promise<Sticker>;
    editGuildTemplate(guildID: string, code: string, options: GuildTemplateOptions): Promise<GuildTemplate>;
    editGuildVanity(guildID: string, code: string | null): Promise<GuildVanity>;
    editGuildVoiceState(guildID: string, options: VoiceStateOptions, userID?: string): Promise<void>;
    editGuildWelcomeScreen(guildID: string, options: WelcomeScreenOptions): Promise<WelcomeScreen>;
    editGuildWidget(guildID: string, options: WidgetOptions): Promise<Widget>;
    editMessage(channelID: string, messageID: string, content: MessageContentEdit): Promise<Message>;
    /** @deprecated */
    editNickname(guildID: string, nick: string, reason?: string): Promise<void>;
    editRole(guildID: string, roleID: string, options: RoleOptions, reason?: string): Promise<Role>; // TODO not all options are available?
    editRoleConnectionMetadataRecords(data: ApplicationRoleConnectionMetadata[]): Promise<ApplicationRoleConnectionMetadata[]>;
    editRolePosition(guildID: string, roleID: string, position: number): Promise<void>;
    editSelf(options: EditSelfOptions): Promise<ExtendedUser>;
    editStageInstance(channelID: string, options: StageInstanceOptions): Promise<StageInstance>;
    editStatus(status: SelfStatus, activities?: ActivityPartial<ActivityType>[] | ActivityPartial<ActivityType>): void;
    editStatus(activities?: ActivityPartial<ActivityType>[] | ActivityPartial<ActivityType>): void;
    editWebhook(
      webhookID: string,
      options: WebhookEditOptions,
      token?: string,
      reason?: string
    ): Promise<Webhook>;
    editWebhookMessage(
      webhookID: string,
      token: string,
      messageID: string,
      options: WebhookPayloadEdit
    ): Promise<Message<AnyGuildTextableChannel>>;
    emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean;
    emit(event: string, ...args: any[]): boolean;
    endPoll(channelID: string, messageID: string): Promise<Message<AnyGuildTextableChannel>>;
    executeSlackWebhook(webhookID: string, token: string, options: Record<string, unknown> & { auth?: boolean; threadID?: string }): Promise<void>;
    executeSlackWebhook(webhookID: string, token: string, options: Record<string, unknown> & { auth?: boolean; threadID?: string; wait: true }): Promise<Message<AnyGuildTextableChannel>>;
    executeWebhook(webhookID: string, token: string, options: WebhookPayload & { wait: true }): Promise<Message<AnyGuildTextableChannel>>;
    executeWebhook(webhookID: string, token: string, options: WebhookPayload): Promise<void>;
    followChannel(channelID: string, webhookChannelID: string, reason?: string): Promise<ChannelFollow>;
    getActiveGuildThreads(guildID: string): Promise<ListedGuildThreads>;
    getArchivedThreads(channelID: string, type: "private", options?: GetArchivedThreadsOptions): Promise<ListedChannelThreads<PrivateThreadChannel>>;
    getArchivedThreads(channelID: string, type: "public", options?: GetArchivedThreadsOptions): Promise<ListedChannelThreads<PublicThreadChannel<boolean>>>;
    getAutoModerationRule(guildID: string, ruleID: string): Promise<AutoModerationRule>;
    getAutoModerationRules(guildID: string): Promise<AutoModerationRule[]>;
    getBotGateway(): Promise<{ session_start_limit: { max_concurrency: number; remaining: number; reset_after: number; total: number }; shards: number; url: string }>;
    getChannel(channelID: string): Exclude<AnyChannel, GroupChannel>;
    getChannelInvites(channelID: string): Promise<Invite[]>;
    getChannelWebhooks(channelID: string): Promise<Webhook[]>;
    getCommand(commandID: string): Promise<ApplicationCommand<false>>;
    getCommandPermissions(guildID: string, commandID: string): Promise<GuildApplicationCommandPermissions>;
    getCommands(): Promise<ApplicationCommand<false>[]>;
    getDiscoveryCategories(): Promise<DiscoveryCategory[]>;
    getDMChannel(userID: string): Promise<DMChannel>;
    getEmoji(emojiID: string): Promise<Emoji>;
    getEmojis(): Promise<ApplicationEmojis>;
    getEmojiGuild(emojiID: string): Promise<Guild>;
    getGateway(): Promise<{ url: string }>;
    getGuildAuditLog(guildID: string, options?: GetGuildAuditLogOptions): Promise<GuildAuditLog>;
    /** @deprecated */
    getGuildAuditLogs(guildID: string, limit?: number, before?: string, actionType?: number, userID?: string): Promise<GuildAuditLog>;
    getGuildBan(guildID: string, userID: string): Promise<GuildBan>;
    getGuildBans(guildID: string, options?: GetGuildBansOptions): Promise<GuildBan[]>;
    getGuildCommand(guildID: string, commandID: string): Promise<ApplicationCommand<true>>;
    getGuildCommandPermissions(guildID: string): Promise<GuildApplicationCommandPermissions[]>;
    getGuildCommands(guildID: string): Promise<ApplicationCommand<true>[]>;
    getGuildDiscovery(guildID: string): Promise<DiscoveryMetadata>;
    /** @deprecated */
    getGuildEmbed(guildID: string): Promise<Widget>;
    getGuildIntegrations(guildID: string): Promise<GuildIntegration[]>;
    getGuildInvites(guildID: string): Promise<Invite[]>;
    getGuildOnboarding(guildID: string): Promise<GuildOnboarding>;
    getGuildPreview(guildID: string): Promise<GuildPreview>;
    getGuildScheduledEvents(guildID: string, options?: GetGuildScheduledEventOptions): Promise<GuildScheduledEvent[]>;
    getGuildScheduledEventUsers(guildID: string, eventID: string, options?: GetGuildScheduledEventUsersOptions): Promise<GuildScheduledEventUser[]>;
    getGuildSoundboardSound(guildID: string, soundID: string): Promise<SoundboardSound>;
    getGuildSoundboardSounds(guildID: string): Promise<SoundboardSound[]>;
    getGuildTemplate(code: string): Promise<GuildTemplate>;
    getGuildTemplates(guildID: string): Promise<GuildTemplate[]>;
    getGuildVanity(guildID: string): Promise<GuildVanity>;
    getGuildVoiceState(guildID: string, userID: string): Promise<VoiceState>;
    getGuildWebhooks(guildID: string): Promise<Webhook[]>;
    getGuildWelcomeScreen(guildID: string): Promise<WelcomeScreen>;
    getGuildWidget(guildID: string): Promise<WidgetData>;
    getGuildWidgetImageURL(guildID: string, style?: GuildWidgetStyles): string;
    getGuildWidgetSettings(guildID: string): Promise<Widget>;
    getInvite(inviteID: string, withCounts?: false, withExpiration?: boolean, guildScheduledEventID?: string): Promise<Invite<"withoutCount">>;
    getInvite(inviteID: string, withCounts: true, withExpiration?: boolean, guildScheduledEventID?: string): Promise<Invite<"withCount">>;
    getJoinedPrivateArchivedThreads(channelID: string, options?: GetArchivedThreadsOptions): Promise<ListedChannelThreads<PrivateThreadChannel>>;
    getMessage(channelID: string, messageID: string): Promise<Message>;
    getMessageReaction(channelID: string, messageID: string, reaction: string, options?: GetMessageReactionOptions): Promise<User[]>;
    /** @deprecated */
    getMessageReaction(channelID: string, messageID: string, reaction: string, limit?: number, before?: string, after?: string): Promise<User[]>;
    getMessages(channelID: string, options?: GetMessagesOptions): Promise<Message[]>;
    /** @deprecated */
    getMessages(channelID: string, limit?: number, before?: string, after?: string, around?: string): Promise<Message[]>;
    getNitroStickerPacks(): Promise<{ sticker_packs: StickerPack[] }>;
    getOAuthApplication(): Promise<OAuthApplicationInfo>;
    getPins(channelID: string): Promise<Message[]>;
    getPollAnswerVoters(channelID: string, messageID: string, answerID: string, options?: GetPollAnswerVotersOptions): Promise<User[]>;
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
    getRESTGuildRole(guildID: string, roleID: string): Promise<Role>;
    getRESTGuildRoles(guildID: string): Promise<Role[]>;
    getRESTGuilds(options?: GetRESTGuildsOptions): Promise<Guild[]>;
    /** @deprecated */
    getRESTGuilds(limit?: number, before?: string, after?: string): Promise<Guild[]>;
    getRESTGuildScheduledEvent(guildID: string, eventID: string, options?: GetGuildScheduledEventOptions): Promise<GuildScheduledEvent>;
    getRESTGuildSticker(guildID: string, stickerID: string): Promise<Sticker>;
    getRESTGuildStickers(guildID: string): Promise<Sticker[]>;
    getRESTSticker(stickerID: string): Promise<Sticker>;
    getRESTUser(userID: string): Promise<User>;
    getRoleConnectionMetadataRecords(): Promise<ApplicationRoleConnectionMetadata[]>;
    getSelf(): Promise<ExtendedUser>;
    getSoundboardSounds(): Promise<SoundboardSound<false>[]>;
    getStageInstance(channelID: string): Promise<StageInstance>;
    getStickerPack(packID: string): Promise<StickerPack>;
    getThreadMember(channelID: string, userID: string, withMember?: boolean): Promise<ThreadMember>;
    getThreadMembers(channelID: string, options?: GetThreadMembersOptions): Promise<ThreadMember[]>;
    getVoiceRegions(guildID?: string): Promise<VoiceRegion[]>;
    getWebhook(webhookID: string, token?: string): Promise<Webhook>;
    getWebhookMessage(webhookID: string, token: string, messageID: string): Promise<Message<AnyGuildTextableChannel>>;
    joinThread(channelID: string, userID?: string): Promise<void>;
    joinVoiceChannel(channelID: string, options?: JoinVoiceChannelOptions): Promise<VoiceConnection>;
    kickGuildMember(guildID: string, userID: string, reason?: string): Promise<void>;
    leaveGuild(guildID: string): Promise<void>;
    leaveThread(channelID: string, userID?: string): Promise<void>;
    leaveVoiceChannel(channelID: string): void;
    off<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
    once<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this;
    once(event: string, listener: (...args: any[]) => void): this;
    pinMessage(channelID: string, messageID: string): Promise<void>;
    pruneMembers(guildID: string, options?: PruneMemberOptions): Promise<number>;
    purgeChannel(channelID: string, options: PurgeChannelOptions): Promise<number>;
    /** @deprecated */
    purgeChannel(
      channelID: string,
      limit?: number,
      filter?: (m: Message<AnyGuildTextableChannel>) => boolean,
      before?: string,
      after?: string,
      reason?: string
    ): Promise<number>;
    removeGroupRecipient(groupID: string, userID: string): Promise<void>;
    removeGuildMemberRole(guildID: string, memberID: string, roleID: string, reason?: string): Promise<void>;
    removeMessageReaction(channelID: string, messageID: string, reaction: string, userID?: string): Promise<void>;
    removeMessageReactionEmoji(channelID: string, messageID: string, reaction: string): Promise<void>;
    removeMessageReactions(channelID: string, messageID: string): Promise<void>;
    searchGuildMembers(guildID: string, query: string, limit?: number): Promise<Member[]>;
    sendChannelTyping(channelID: string): Promise<void>;
    sendSoundboardSound(channelID: string, options: GuildSoundboardSoundSend): Promise<void>;
    setVoiceChannelStatus(channelID: string, status: string, reason?: string): Promise<void>;
    syncGuildIntegration(guildID: string, integrationID: string): Promise<void>;
    syncGuildTemplate(guildID: string, code: string): Promise<GuildTemplate>;
    unbanGuildMember(guildID: string, userID: string, reason?: string): Promise<void>;
    unpinMessage(channelID: string, messageID: string): Promise<void>;
    validateDiscoverySearchTerm(term: string): Promise<{ valid: boolean }>;
    on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
    toString(): string;
  }

  export class Collection<T extends { id: string | number }> extends Map<string | number, T> {
    baseObject: new (...args: any[]) => T;
    limit?: number;
    constructor(baseObject: new (...args: any[]) => T, limit?: number);
    update(obj: T, extra?: unknown, replace?: boolean): T;
    add(obj: T, extra?: unknown, replace?: boolean): T;
    every(func: (i: T) => boolean): boolean;
    filter(func: (i: T) => boolean): T[];
    find(func: (i: T) => boolean): T | undefined;
    map<R>(func: (i: T) => R): R[];
    random(): T | undefined;
    reduce<U>(func: (accumulator: U, val: T) => U, initialValue?: U): U;
    remove(obj: T | Uncached): T | null;
    some(func: (i: T) => boolean): boolean;
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
    subcommandAliases: Record<string, string>;
    subcommands: Record<string, Command>;
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
    activeMessages: Record<string, ActiveMessages>;
    commandAliases: Record<string, string>;
    commandOptions: CommandClientOptions;
    commands: Record<string, Command>;
    guildPrefixes: Record<string, string | string[]>;
    preReady?: true;
    constructor(token: string, options: ClientOptions, commandOptions?: CommandClientOptions);
    checkPrefix(msg: Message): string;
    onMessageCreate(msg: Message): Promise<void>;
    onMessageReactionEvent(msg: Message, emoji: Emoji, reactor: Member | Uncached | string): Promise<void>;
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
    headers: IncomingHttpHeaders;
    name: "DiscordHTTPError";
    req: ClientRequest;
    res: IncomingMessage;
    response: HTTPResponse;
    constructor(req: ClientRequest, res: IncomingMessage, response: HTTPResponse, stack: string);
    flattenErrors(errors: HTTPResponse, keyPrefix?: string): string[];
  }

  export class DiscordRESTError extends Error {
    code: number;
    headers: IncomingHttpHeaders;
    name: string;
    req: ClientRequest;
    res: IncomingMessage;
    response: HTTPResponse;
    constructor(req: ClientRequest, res: IncomingMessage, response: HTTPResponse, stack: string);
    flattenErrors(errors: HTTPResponse, keyPrefix?: string): string[];
  }

  export class DMChannel extends Channel implements Pinnable {
    lastMessageID: string | null;
    lastPinTimestamp: number | null;
    messages: Collection<Message<this>>;
    recipients: Collection<User>;
    type: Constants["ChannelTypes"]["DM"];
    constructor(data: BaseData, client: Client);
    addMessageReaction(messageID: string, reaction: string): Promise<void>;
    createMessage(content: MessageContent, file?: FileContent | FileContent[]): Promise<Message<this>>;
    delete(): Promise<DMChannel>;
    deleteMessage(messageID: string): Promise<void>;
    editMessage(messageID: string, content: MessageContentEdit): Promise<Message<this>>;
    getMessage(messageID: string): Promise<Message<this>>;
    getMessageReaction(messageID: string, reaction: string, options: GetMessageReactionOptions): Promise<User[]>;
    /** @deprecated */
    getMessageReaction(messageID: string, reaction: string, limit?: number, before?: string, after?: string): Promise<User[]>;
    getMessages(options: GetMessagesOptions): Promise<Message<this>[]>;
    /** @deprecated */
    getMessages(limit?: number, before?: string, after?: string, around?: string): Promise<Message<this>[]>;
    getPins(): Promise<Message<this>[]>;
    pinMessage(messageID: string): Promise<void>;
    removeMessageReaction(messageID: string, reaction: string): Promise<void>;
    /** @deprecated */
    removeMessageReaction(messageID: string, reaction: string, userID?: string): Promise<void>;
    sendTyping(): Promise<void>;
    unpinMessage(messageID: string): Promise<void>;
    unsendMessage(messageID: string): Promise<void>;
  }

  export class ExtendedUser extends User {
    email: string;
    mfaEnabled: boolean;
    premiumType: PremiumTypes;
    verified: boolean;
  }

  export class ForumChannel extends MediaChannel {
    defaultForumLayout: ForumLayoutTypes;
  }

  export class GroupChannel extends Channel {
    applicationID: string;
    icon: string | null;
    iconURL: string | null;
    lastMessageID: string | null;
    lastPinTimestamp: number | null;
    managed: boolean;
    name: string;
    ownerID: string;
    recipients: Collection<User>;
    type: Constants["ChannelTypes"]["GROUP_DM"];
    addRecipient(userID: string, options: GroupRecipientOptions): Promise<void>;
    delete(): Promise<GroupChannel>;
    dynamicIconURL(format?: ImageFormat, size?: number): string | null;
    edit(options: EditGroupChannelOptions): Promise<GroupChannel>;
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
    events: Collection<GuildScheduledEvent>;
    explicitContentFilter: ExplicitContentFilter;
    features: GuildFeatures[];
    icon: string | null;
    iconURL: string | null;
    id: string;
    joinedAt: number;
    large: boolean;
    maxMembers?: number;
    maxPresences?: number | null;
    maxStageVideoChannelUsers?: number;
    maxVideoChannelUsers?: number;
    memberCount: number;
    members: Collection<Member>;
    mfaLevel: MFALevel;
    name: string;
    /** @deprecated */
    nsfw: boolean;
    nsfwLevel: NSFWLevel;
    ownerID: string;
    preferredLocale: LocaleStrings;
    premiumProgressBarEnabled: boolean;
    premiumSubscriptionCount?: number;
    premiumTier: PremiumTier;
    primaryCategory?: DiscoveryCategory;
    primaryCategoryID?: number;
    publicUpdatesChannelID: string | null;
    roles: Collection<Role>;
    rulesChannelID: string | null;
    safetyAlertsChannelID: string | null;
    shard: Shard;
    soundboardSounds: Collection<SoundboardSound>;
    splash: string | null;
    splashURL: string | null;
    stageInstances: Collection<StageInstance>;
    stickers?: Sticker[];
    systemChannelFlags: number;
    systemChannelID: string | null;
    threads: Collection<ThreadChannel>;
    unavailable: boolean;
    vanityURL: string | null;
    verificationLevel: VerificationLevel;
    voiceStates: Collection<VoiceState>;
    welcomeScreen?: WelcomeScreen;
    widgetChannelID?: string | null;
    widgetEnabled?: boolean;
    constructor(data: BaseData, client: Client);
    addDiscoverySubcategory(categoryID: string, reason?: string): Promise<DiscoverySubcategoryResponse>;
    addMember(userID: string, accessToken: string, options?: AddGuildMemberOptions): Promise<void>;
    addMemberRole(memberID: string, roleID: string, reason?: string): Promise<void>;
    banMember(userID: string, options?: BanMemberOptions): Promise<void>;
    /** @deprecated */
    banMember(userID: string, deleteMessageDays?: number, reason?: string): Promise<void>;
    bulkBanMembers(options: BulkBanMembersOptions): Promise<BulkBanMembersResponse>;
    bulkEditCommands<T extends ApplicationCommandTypes>(commands: ApplicationCommandBulkEditOptions<true, T>[]): Promise<ApplicationCommand<true, T>[]>;
    createAutoModerationRule(rule: AutoModerationCreateOptions): Promise<AutoModerationRule>;
    createChannel(name: string): Promise<TextChannel>;
    createChannel<T extends GuildChannelTypes>(name: string, type: T, options?: CreateChannelOptions): Promise<ChannelTypeConversion<T>>;
    /** @deprecated */
    createChannel<T extends GuildChannelTypes>(name: string, type: T, options?: CreateChannelOptions | string): Promise<ChannelTypeConversion<T>>;
    createCommand<T extends ApplicationCommandTypes>(command: ApplicationCommandCreateOptions<true, T>): Promise<ApplicationCommand<true, T>>;
    createEmoji(options: { image: string; name: string; roles?: string[] }, reason?: string): Promise<Emoji>;
    createRole(options: RoleOptions, reason?: string): Promise<Role>;
    createRole(options: Role, reason?: string): Promise<Role>;
    createScheduledEvent<T extends GuildScheduledEventEntityTypes>(event: GuildScheduledEventOptions<T>, reason?: string): Promise<GuildScheduledEvent<T>>;
    createSoundboardSound(sound: GuildSoundboardSoundCreate, reason?: string): Promise<SoundboardSound>;
    createSticker(options: CreateStickerOptions, reason?: string): Promise<Sticker>;
    createTemplate(name: string, description?: string | null): Promise<GuildTemplate>;
    delete(): Promise<void>;
    deleteAutoModerationRule(ruleID: string, reason?: string): Promise<void>;
    deleteCommand(commandID: string): Promise<void>;
    deleteDiscoverySubcategory(categoryID: string, reason?: string): Promise<void>;
    deleteEmoji(emojiID: string, reason?: string): Promise<void>;
    deleteIntegration(integrationID: string): Promise<void>;
    deleteRole(roleID: string): Promise<void>;
    deleteScheduledEvent(eventID: string): Promise<void>;
    deleteSoundboardSound(soundID: string, reason?: string): Promise<void>;
    deleteSticker(stickerID: string, reason?: string): Promise<void>;
    deleteTemplate(code: string): Promise<GuildTemplate>;
    dynamicBannerURL(format?: ImageFormat, size?: number): string | null;
    dynamicDiscoverySplashURL(format?: ImageFormat, size?: number): string | null;
    dynamicIconURL(format?: ImageFormat, size?: number): string | null;
    dynamicSplashURL(format?: ImageFormat, size?: number): string | null;
    edit(options: GuildOptions, reason?: string): Promise<Guild>;
    editAutoModerationRule<T extends AutoModerationTriggerType>(ruleID: string, options: AutoModerationEditOptions<T>): Promise<AutoModerationRule>;
    editChannelPositions(channelPositions: ChannelPosition[]): Promise<void>;
    editCommand<T extends ApplicationCommandTypes>(commandID: string, command: ApplicationCommandEditOptions<true, T>): Promise<ApplicationCommand<true, T>>;
    editCommandPermissions(permissions: ApplicationCommandPermissions[], reason?: string): Promise<GuildApplicationCommandPermissions[]>;
    editDiscovery(options?: DiscoveryOptions): Promise<DiscoveryMetadata>;
    editEmoji(emojiID: string, options: { name: string; roles?: string[] }, reason?: string): Promise<Emoji>;
    editMember(memberID: string, options: MemberOptions, reason?: string): Promise<Member>;
    editMFALevel(level: MFALevel, reason?: string): Promise<MFALevelResponse>;
    /** @deprecated */
    editNickname(nick: string): Promise<void>;
    editOnboarding(options: GuildOnboardingOptions, reason?: string): Promise<GuildOnboarding>;
    editRole(roleID: string, options: RoleOptions): Promise<Role>;
    editScheduledEvent<T extends GuildScheduledEventEntityTypes>(eventID: string, event: GuildScheduledEventEditOptions<T>, reason?: string): Promise<GuildScheduledEvent<T>>;
    editSticker(stickerID: string, options?: EditStickerOptions, reason?: string): Promise<Sticker>;
    editTemplate(code: string, options: GuildTemplateOptions): Promise<GuildTemplate>;
    editVanity(code: string | null): Promise<GuildVanity>;
    editVoiceState(options: VoiceStateOptions, userID?: string): Promise<void>;
    editWelcomeScreen(options: WelcomeScreenOptions): Promise<WelcomeScreen>;
    editWidget(options: WidgetOptions): Promise<Widget>;
    fetchAllMembers(timeout?: number): Promise<number>;
    fetchMembers(options?: RequestGuildMembersOptions): Promise<Member[]>;
    fetchSoundboardSounds(options?: Omit<RequestGuildSoundboardSoundsOptions, "guildIDs">): Promise<SoundboardSound[]>;
    getActiveThreads(): Promise<ListedGuildThreads>;
    getAuditLog(options?: GetGuildAuditLogOptions): Promise<GuildAuditLog>;
    /** @deprecated */
    getAuditLogs(limit?: number, before?: string, actionType?: number, userID?: string): Promise<GuildAuditLog>;
    getAutoModerationRule(guildID: string, ruleID: string): Promise<AutoModerationRule>;
    getAutoModerationRules(guildID: string): Promise<AutoModerationRule[]>;
    getBan(userID: string): Promise<GuildBan>;
    getBans(options?: GetGuildBansOptions): Promise<GuildBan[]>;
    getCommand(commandID: string): Promise<ApplicationCommand<true>>;
    getCommandPermissions(): Promise<GuildApplicationCommandPermissions[]>;
    getCommands(): Promise<ApplicationCommand<true>[]>;
    getDiscovery(): Promise<DiscoveryMetadata>;
    /** @deprecated */
    getEmbed(): Promise<Widget>;
    getIntegrations(): Promise<GuildIntegration>;
    getInvites(): Promise<Invite[]>;
    getOnboarding(): Promise<GuildOnboarding>;
    getPruneCount(options?: GetPruneOptions): Promise<number>;
    getRESTChannels(): Promise<AnyGuildChannel[]>;
    getRESTEmoji(emojiID: string): Promise<Emoji>;
    getRESTEmojis(): Promise<Emoji[]>;
    getRESTMember(memberID: string): Promise<Member>;
    getRESTMembers(options?: GetRESTGuildMembersOptions): Promise<Member[]>;
    /** @deprecated */
    getRESTMembers(limit?: number, after?: string): Promise<Member[]>;
    getRESTRole(roleID: string): Promise<Role>;
    getRESTRoles(): Promise<Role[]>;
    getRESTScheduledEvent(eventID: string): Promise<GuildScheduledEvent>;
    getRESTSticker(stickerID: string): Promise<Sticker>;
    getRESTStickers(): Promise<Sticker[]>;
    getScheduledEvents(options?: GetGuildScheduledEventOptions): Promise<GuildScheduledEvent[]>;
    getScheduledEventUsers(eventID: string, options?: GetGuildScheduledEventUsersOptions): Promise<GuildScheduledEventUser[]>;
    getSoundboardSound(soundID: string): Promise<SoundboardSound>;
    getSoundboardSounds(): Promise<SoundboardSound[]>;
    getTemplates(): Promise<GuildTemplate[]>;
    getVanity(): Promise<GuildVanity>;
    getVoiceRegions(): Promise<VoiceRegion[]>;
    getVoiceState(userID: string): Promise<VoiceState>;
    getWebhooks(): Promise<Webhook[]>;
    getWelcomeScreen(): Promise<WelcomeScreen>;
    getWidget(): Promise<WidgetData>;
    getWidgetImageURL(style?: GuildWidgetStyles): string;
    getWidgetSettings(): Promise<Widget>;
    kickMember(userID: string, reason?: string): Promise<void>;
    leave(): Promise<void>;
    leaveVoiceChannel(): void;
    permissionsOf(memberID: string | Member | MemberRoles): Permission;
    pruneMembers(options?: PruneMemberOptions): Promise<number>;
    removeMemberRole(memberID: string, roleID: string, reason?: string): Promise<void>;
    searchMembers(query: string, limit?: number): Promise<Member[]>;
    syncTemplate(code: string): Promise<GuildTemplate>;
    unbanMember(userID: string, reason?: string): Promise<void>;
  }

  export class GuildAuditLogEntry extends Base {
    actionType: number;
    after: Record<string, unknown> | null;
    autoModerationRuleName?: string;
    autoModerationRuleTriggerType?: AutoModerationTriggerType;
    before: Record<string, unknown> | null;
    channel?: AnyGuildChannel | Uncached;
    count?: number;
    deleteMemberDays?: number;
    guild: Guild | Uncached;
    id: string;
    member?: Member | Uncached;
    membersRemoved?: number;
    message?: Message<AnyGuildTextableChannel> | Uncached;
    reason: string | null;
    role?: Role | { id: string; name: string };
    status?: string;
    target?: Guild | AnyGuildChannel | Member | Role | Invite | Emoji | Sticker | Message<AnyGuildTextableChannel> | null;
    targetID: string;
    user: PossiblyUncachedUser;
    constructor(data: BaseData, guild: Guild);
  }

  export class GuildChannel extends Channel {
    flags: number;
    guild: Guild;
    name: string;
    parentID: string | null;
    type: GuildChannelTypes;
    delete(reason?: string): Promise<AnyGuildChannel>;
    edit(options: EditGuildChannelOptions, reason?: string): Promise<this>;
    permissionsOf(memberID: string | Member | MemberRoles): Permission;
  }

  export class GuildIntegration extends Base {
    account: { id: string; name: string };
    application?: IntegrationApplication;
    createdAt: number;
    enabled: boolean;
    enableEmoticons?: boolean;
    expireBehavior?: GuildIntegrationExpireBehavior;
    expireGracePeriod?: number;
    id: string;
    name: string;
    revoked?: boolean;
    roleID?: string;
    subscriberCount?: number;
    syncedAt?: number;
    syncing?: boolean;
    type: GuildIntegrationTypes;
    user?: User;
    constructor(data: BaseData, guild: Guild);
    delete(): Promise<void>;
  }

  export class GuildPreview extends Base {
    approximateMemberCount: number;
    approximatePresenceCount: number;
    description: string | null;
    discoverySplash: string | null;
    discoverySplashURL: string | null;
    emojis: Emoji[];
    features: GuildFeatures[];
    icon: string | null;
    iconURL: string | null;
    id: string;
    name: string;
    splash: string | null;
    splashURL: string | null;
    constructor(data: BaseData, client: Client);
    dynamicDiscoverySplashURL(format?: ImageFormat, size?: number): string | null;
    dynamicIconURL(format?: ImageFormat, size?: number): string | null;
    dynamicSplashURL(format?: ImageFormat, size?: number): string | null;
  }

  export class GuildScheduledEvent<T extends GuildScheduledEventEntityTypes = GuildScheduledEventEntityTypes> extends Base {
    channelID: T extends Constants["GuildScheduledEventEntityTypes"]["EXTERNAL"] ? null : PossiblyUncachedSpeakableChannel;
    creator?: User;
    description?: string;
    entityID: string | null;
    entityMetadata: T extends Constants["GuildScheduledEventEntityTypes"]["EXTERNAL"] ? Required<GuildScheduledEventMetadata> : null;
    entityType: T;
    guild: PossiblyUncachedGuild;
    id: string;
    image?: string;
    name: string;
    privacyLevel: GuildScheduledEventPrivacyLevel;
    scheduledEndTime: T extends Constants["GuildScheduledEventEntityTypes"]["EXTERNAL"] ? number : number | null;
    scheduledStartTime: number;
    status: GuildScheduledEventStatus;
    userCount?: number;
    delete(): Promise<void>;
    edit<U extends GuildScheduledEventEntityTypes>(event: GuildScheduledEventEditOptions<U>, reason?: string): Promise<GuildScheduledEvent<U>>;
    getUsers(options?: GetGuildScheduledEventUsersOptions): Promise<GuildScheduledEventUser[]>;
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

  export class GuildTextableChannel extends GuildChannel {
    lastMessageID: string | null;
    messages: Collection<Message<this>>;
    rateLimitPerUser: number;
    type: GuildTextChannelTypes | GuildVoiceChannelTypes | GuildThreadChannelTypes;
    constructor(data: BaseData, client: Client, messageLimit?: number);
    addMessageReaction(messageID: string, reaction: string): Promise<void>;
    createMessage(content: MessageContent, file?: FileContent | FileContent[]): Promise<Message<this>>;
    deleteMessage(messageID: string, reason?: string): Promise<void>;
    deleteMessages(messageIDs: string[], reason?: string): Promise<void>;
    edit(options: EditGuildTextableChannelOptions, reason?: string): Promise<this>;
    editMessage(messageID: string, content: MessageContentEdit): Promise<Message<this>>;
    endPoll(messageID: string): Promise<Message<this>>;
    getMessage(messageID: string): Promise<Message<this>>;
    getMessageReaction(messageID: string, reaction: string, options?: GetMessageReactionOptions): Promise<User[]>;
    /** @deprecated */
    getMessageReaction(messageID: string, reaction: string, limit?: number, before?: string, after?: string): Promise<User[]>;
    getMessages(options?: GetMessagesOptions): Promise<Message<this>[]>;
    /** @deprecated */
    getMessages(limit?: number, before?: string, after?: string, around?: string): Promise<Message<this>[]>;
    getPollAnswerVoters(messageID: string, answerID: string, options?: GetPollAnswerVotersOptions): Promise<User[]>;
    purge(options: PurgeChannelOptions): Promise<number>;
    /** @deprecated */
    purge(limit: number, filter?: (message: Message<this>) => boolean, before?: string, after?: string, reason?: string): Promise<number>;
    removeMessageReaction(messageID: string, reaction: string, userID?: string): Promise<void>;
    removeMessageReactionEmoji(messageID: string, reaction: string): Promise<void>;
    removeMessageReactions(messageID: string): Promise<void>;
    sendTyping(): Promise<void>;
    unsendMessage(messageID: string): Promise<void>;
  }

  export class MediaChannel extends GuildChannel implements Invitable, Permissionable {
    availableTags: ForumTag[];
    defaultAutoArchiveDuration: AutoArchiveDuration;
    defaultReactionEmoji: DefaultReactionEmoji;
    defaultSortOrder: SortOrderTypes;
    defaultThreadRateLimitPerUser: number;
    lastMessageID: string | null;
    nsfw: boolean;
    permissionOverwrites: Collection<PermissionOverwrite>;
    position: number;
    rateLimitPerUser: number;
    threads: PublicThreadChannel<true>[];
    topic?: string;
    createInvite(options?: CreateInviteOptions, reason?: string): Promise<Invite<"withMetadata", this>>;
    createThread(options: CreateForumThreadOptions, file?: FileContent | FileContent[]): Promise<PublicThreadChannel<true>>;
    createWebhook(options: WebhookCreateOptions, reason?: string): Promise<Webhook>;
    deletePermission(overwriteID: string, reason?: string): Promise<void>;
    edit(options: EditForumChannelOptions, reason?: string): Promise<this>;
    editPermission(overwriteID: string, allow: PermissionValueTypes, deny: PermissionValueTypes, type: PermissionType, reason?: string): Promise<PermissionOverwrite>;
    getArchivedThreads(options?: GetArchivedThreadsOptions): Promise<ListedChannelThreads<PublicThreadChannel<true>>>;
    getInvites(): Promise<Invite<"withMetadata", this>[]>;
    getWebhooks(): Promise<Webhook[]>;
  }

  // Interactions
  export class AutocompleteInteraction<T extends PossiblyUncachedTextableChannel = TextableChannel> extends Interaction {
    appPermissions?: Permission;
    channel: T;
    data: AutocompleteInteractionData;
    guildID: T extends AnyGuildChannel ? string : undefined;
    member: T extends AnyGuildChannel ? Member : undefined;
    type: Constants["InteractionTypes"]["APPLICATION_COMMAND_AUTOCOMPLETE"];
    user: T extends AnyGuildChannel ? undefined : User;
    acknowledge(choices: ApplicationCommandOptionChoice[]): Promise<void>;
    result(choices: ApplicationCommandOptionChoice[]): Promise<void>;
  }

  export class Interaction extends Base {
    acknowledged: boolean;
    applicationID: string;
    id: string;
    token: string;
    type: number;
    version: number;
    static from(data: BaseData): AnyInteraction;
  }

  export class PingInteraction extends Interaction {
    type: Constants["InteractionTypes"]["PING"];
    acknowledge(): Promise<void>;
    pong(): Promise<void>;
  }

  export class CommandInteraction<T extends PossiblyUncachedTextableChannel = TextableChannel> extends Interaction {
    appPermissions?: Permission;
    channel: T;
    data: CommandInteractionData;
    guildID: T extends AnyGuildChannel ? string : undefined;
    member: T extends AnyGuildChannel ? Member : undefined;
    type: Constants["InteractionTypes"]["APPLICATION_COMMAND"];
    user: T extends AnyGuildChannel ? undefined : User;
    acknowledge(flags?: number): Promise<void>;
    createFollowup(content: string | InteractionContent, file?: FileContent | FileContent[]): Promise<Message>;
    createMessage(content: string | InteractionContent, file?: FileContent | FileContent[]): Promise<void>;
    createModal(content: InteractionModal): Promise<void>;
    defer(flags?: number): Promise<void>;
    deleteMessage(messageID: string): Promise<void>;
    deleteOriginalMessage(): Promise<void>;
    editMessage(messageID: string, content: string | InteractionContentEdit, file?: FileContent | FileContent[]): Promise<Message<T>>;
    editOriginalMessage(content: string | InteractionContentEdit, file?: FileContent | FileContent[]): Promise<Message<T>>;
    getOriginalMessage(): Promise<Message<T>>;
  }

  export class ComponentInteraction<T extends PossiblyUncachedTextableChannel = TextableChannel> extends Interaction {
    appPermissions?: Permission;
    channel: T;
    data: ComponentInteractionButtonData | ComponentInteractionSelectMenuData;
    guildID: T extends AnyGuildChannel ? string : undefined;
    member: T extends AnyGuildChannel ? Member : undefined;
    message: Message<T>;
    type: Constants["InteractionTypes"]["MESSAGE_COMPONENT"];
    user: T extends AnyGuildChannel ? undefined : User;
    acknowledge(): Promise<void>;
    createFollowup(content: string | InteractionContent, file?: FileContent | FileContent[]): Promise<Message>;
    createMessage(content: string | InteractionContent, file?: FileContent | FileContent[]): Promise<void>;
    createModal(content: InteractionModal): Promise<void>;
    defer(flags?: number): Promise<void>;
    deferUpdate(): Promise<void>;
    deleteMessage(messageID: string): Promise<void>;
    deleteOriginalMessage(): Promise<void>;
    editMessage(messageID: string, content: string | InteractionContentEdit, file?: FileContent | FileContent[]): Promise<Message<T>>;
    editOriginalMessage(content: string | InteractionContentEdit, file?: FileContent | FileContent[]): Promise<Message<T>>;
    editParent(content: Omit<InteractionContentEdit, "poll">, file?: FileContent | FileContent[]): Promise<void>;
    getOriginalMessage(): Promise<Message<T>>;
  }

  export class UnknownInteraction<T extends PossiblyUncachedTextableChannel = TextableChannel> extends Interaction {
    appPermissions?: Permission;
    channel?: T;
    data?: unknown;
    guildID: T extends AnyGuildChannel ? string : undefined;
    member: T extends AnyGuildChannel ? Member : undefined;
    message?: Message<T>;
    type: number;
    user: T extends AnyGuildChannel ? undefined : User;
    acknowledge(data: InteractionOptions): Promise<void>;
    createFollowup(content: string | InteractionContent, file?: FileContent | FileContent[]): Promise<Message>;
    createMessage(content: string | InteractionContent, file?: FileContent | FileContent[]): Promise<void>;
    defer(flags?: number): Promise<void>;
    deferUpdate(): Promise<void>;
    deleteMessage(messageID: string): Promise<void>;
    deleteOriginalMessage(): Promise<void>;
    editMessage(messageID: string, content: string | InteractionContentEdit, file?: FileContent | FileContent[]): Promise<Message<T>>;
    editOriginalMessage(content: string | InteractionContentEdit, file?: FileContent | FileContent[]): Promise<Message<T>>;
    editParent(content: Omit<InteractionContentEdit, "poll">, file?: FileContent | FileContent[]): Promise<void>;
    getOriginalMessage(): Promise<Message<T>>;
    pong(): Promise<void>;
    result(choices: ApplicationCommandOptionChoice[]): Promise<void>;
  }

  // If CT (count) is "withMetadata", it will not have count properties
  export class Invite<CT extends "withMetadata" | "withCount" | "withoutCount" = "withMetadata", CH extends InviteChannel = InviteChannel> extends Base {
    channel: CH;
    code: string;
    // @ts-ignore: Property is only not null when invite metadata is supplied
    createdAt: CT extends "withMetadata" ? number : null;
    expiresAt?: CT extends "withCount" ? number | null : null;
    guild: CT extends "withMetadata"
      ? Guild // Invite with Metadata always has guild prop
      : CH extends Extract<InviteChannel, GroupChannel> // Invite without Metadata
        ? never // If the channel is GroupChannel, there is no guild
        : CH extends Exclude<InviteChannel, InvitePartialChannel> // Invite without Metadata and not GroupChanel
          ? Guild // If the invite channel is not partial
          : Guild | Uncached | undefined; // If the invite channel is partial

    inviter?: User;
    maxAge: CT extends "withMetadata" ? number : null;
    maxUses: CT extends "withMetadata" ? number : null;
    memberCount: CT extends "withMetadata" | "withoutCount" ? null : number;
    presenceCount: CT extends "withMetadata" | "withoutCount" ? null : number;
    /** @deprecated */
    stageInstance: CH extends StageChannel ? InviteStageInstance : null;
    temporary: CT extends "withMetadata" ? boolean : null;
    uses: CT extends "withMetadata" ? number : null;
    constructor(data: BaseData, client: Client);
    delete(reason?: string): Promise<void>;
  }

  export class Member extends Base implements Presence {
    accentColor?: number | null;
    activities?: Activity[];
    avatar: string | null;
    avatarDecorationData?: AvatarDecorationData | null;
    avatarDecorationURL: string | null;
    avatarURL: string;
    banner?: string | null;
    bannerURL: string | null;
    bot: boolean;
    clientStatus?: ClientStatus;
    communicationDisabledUntil?: number | null;
    createdAt: number;
    defaultAvatar: string;
    defaultAvatarURL: string;
    discriminator: string;
    flags: number;
    game: Activity | null;
    globalName: string | null;
    guild: Guild;
    id: string;
    joinedAt: number | null;
    mention: string;
    nick: string | null;
    pending?: boolean;
    /** @deprecated */
    permission: Permission;
    permissions: Permission;
    premiumSince?: number | null;
    roles: string[];
    staticAvatarURL: string;
    status?: UserStatus;
    user: User;
    username: string;
    voiceState: VoiceState;
    constructor(data: BaseData, guild?: Guild, client?: Client);
    addRole(roleID: string, reason?: string): Promise<void>;
    ban(options?: BanMemberOptions): Promise<void>;
    /** @deprecated */
    ban(deleteMessageDays?: number, reason?: string): Promise<void>;
    dynamicAvatarURL(format?: ImageFormat, size?: number): string;
    edit(options: MemberOptions, reason?: string): Promise<void>;
    kick(reason?: string): Promise<void>;
    removeRole(roleID: string, reason?: string): Promise<void>;
    unban(reason?: string): Promise<void>;
  }

  export class Message<T extends PossiblyUncachedTextableChannel = TextableChannel> extends Base {
    activity?: MessageActivity;
    application?: MessageApplication;
    applicationID?: string;
    attachments: Attachment[];
    author: User;
    call?: MessageCall;
    channel: T;
    channelMentions: string[];
    /** @deprecated */
    cleanContent: string;
    command?: Command;
    components?: ActionRow[];
    content: string;
    createdAt: number;
    editedTimestamp?: number;
    embeds: Embed[] | [PollEmbed];
    flags: number;
    guildID: T extends GuildTextableWithThreads ? string : undefined;
    id: string;
    interaction: MessageInteraction | null;
    jumpLink: string;
    member: T extends GuildTextableWithThreads ? Member : null;
    mentionEveryone: boolean;
    mentions: User[];
    messageReference: MessageReference | null;
    messageSnapshots?: MessageSnapshot[];
    pinned: boolean;
    poll?: Poll;
    prefix?: string;
    reactions: Record<string, Reaction>;
    referencedMessage?: Message | null;
    roleMentions: string[];
    roleSubscriptionData?: RoleSubscriptionData;
    stickerItems?: StickerItems[];
    /** @deprecated */
    stickers?: Sticker[];
    timestamp: number;
    tts: boolean;
    type: number;
    webhookID: T extends GuildTextableWithThreads ? string | undefined : undefined;
    constructor(data: BaseData, client: Client);
    addReaction(reaction: string): Promise<void>;
    createThreadWithMessage(options: CreateThreadOptions): Promise<NewsThreadChannel | PublicThreadChannel>;
    crosspost(): Promise<T extends NewsChannel ? Message<NewsChannel> : never>;
    delete(reason?: string): Promise<void>;
    deleteWebhook(token: string): Promise<void>;
    edit(content: MessageContentEdit): Promise<Message<T>>;
    editWebhook(token: string, options: WebhookPayloadEdit): Promise<Message<T>>;
    getReaction(reaction: string, options?: GetMessageReactionOptions): Promise<User[]>;
    /** @deprecated */
    getReaction(reaction: string, limit?: number, before?: string, after?: string): Promise<User[]>;
    pin(): Promise<void>;
    removeReaction(reaction: string, userID?: string): Promise<void>;
    removeReactionEmoji(reaction: string): Promise<void>;
    removeReactions(): Promise<void>;
    unpin(): Promise<void>;
  }

  export class ModalSubmitInteraction<T extends PossiblyUncachedTextableChannel = TextableChannel> extends Interaction {
    channel: T;
    data: ModalSubmitInteractionData;
    guildID: T extends AnyGuildChannel ? string : undefined;
    member: T extends AnyGuildChannel ? Member : undefined;
    type: Constants["InteractionTypes"]["MODAL_SUBMIT"];
    user: T extends AnyGuildChannel ? undefined : User;
    acknowledge(): Promise<void>;
    createFollowup(content: string | InteractionContent, file?: FileContent | FileContent[]): Promise<Message>;
    createMessage(content: string | InteractionContent, file?: FileContent | FileContent[]): Promise<void>;
    defer(flags?: number): Promise<void>;
    deferUpdate(): Promise<void>;
    deleteMessage(messageID: string): Promise<void>;
    deleteOriginalMessage(): Promise<void>;
    editMessage(messageID: string, content: string | InteractionContentEdit, file?: FileContent | FileContent[]): Promise<Message>;
    editOriginalMessage(content: string | InteractionContentEdit, file?: FileContent | FileContent[]): Promise<Message>;
    editParent(content: Omit<InteractionContentEdit, "poll">, file?: FileContent | FileContent[]): Promise<void>;
    getOriginalMessage(): Promise<Message>;
  }

  // News channel rate limit is always 0
  export class NewsChannel extends TextChannel {
    rateLimitPerUser: 0;
    type: Constants["ChannelTypes"]["GUILD_NEWS"];
    crosspostMessage(messageID: string): Promise<Message<this>>;
    edit(options: EditNewsChannelOptions, reason?: string): Promise<this>;
    follow(webhookChannelID: string, reason?: string): Promise<ChannelFollow>;
  }

  export class NewsThreadChannel extends ThreadChannel {
    type: Constants["ChannelTypes"]["GUILD_NEWS_THREAD"];
  }

  export class Permission extends Base {
    allow: bigint;
    deny: bigint;
    json: Record<keyof Constants["Permissions"], boolean>;
    constructor(allow: number | string | bigint, deny?: number | string | bigint);
    has(permission: keyof Constants["Permissions"] | bigint): boolean;
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

  export class PrivateThreadChannel extends ThreadChannel {
    threadMetadata: PrivateThreadMetadata;
    type: Constants["ChannelTypes"]["GUILD_PRIVATE_THREAD"];
  }

  /** Generic T is true if the PublicThreadChannel's parent channel is a Forum Channel */
  export class PublicThreadChannel<T = false> extends ThreadChannel {
    appliedTags: T extends true ? string[] : never;
    type: GuildPublicThreadChannelTypes;
  }

  export class RequestHandler implements SimpleJSON {
    globalBlock: boolean;
    latencyRef: LatencyRef;
    options: RequestHandlerOptions;
    ratelimits: Record<string, SequentialBucket>;
    readyQueue: (() => void)[];
    userAgent: string;
    constructor(client: Client, options?: RequestHandlerOptions);
    /** @deprecated */
    constructor(client: Client, forceQueueing?: boolean);
    globalUnblock(): void;
    request(method: RequestMethod, url: string, auth?: boolean, body?: Record<string, unknown>, file?: FileContent, _route?: string, short?: boolean): Promise<unknown>;
    routefy(url: string, method: RequestMethod): string;
    toString(): string;
    toJSON(props?: string[]): JSONCache;
  }

  export class Role extends Base {
    color: number;
    createdAt: number;
    flags: number;
    guild: Guild;
    hoist: boolean;
    icon: string | null;
    iconURL: string | null;
    id: string;
    json: Partial<Record<Exclude<keyof Constants["Permissions"], "all" | "allGuild" | "allText" | "allVoice">, boolean>>;
    managed: boolean;
    mention: string;
    mentionable: boolean;
    name: string;
    permissions: Permission;
    position: number;
    tags?: RoleTags;
    unicodeEmoji: string | null;
    constructor(data: BaseData, guild: Guild);
    delete(reason?: string): Promise<void>;
    edit(options: RoleOptions, reason?: string): Promise<Role>;
    editPosition(position: number): Promise<void>;
  }

  export class SequentialBucket {
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
    getAllUsersCount: Record<string, boolean>;
    getAllUsersLength: number;
    getAllUsersQueue: string;
    globalBucket: Bucket;
    guildCreateTimeout: NodeJS.Timeout | null;
    heartbeatInterval: NodeJS.Timeout | null;
    id: number;
    lastHeartbeatAck: boolean;
    lastHeartbeatReceived: number | null;
    lastHeartbeatSent: number | null;
    latency: number;
    preReady: boolean;
    presence: ClientPresence;
    presenceUpdateBucket: Bucket;
    ready: boolean;
    reconnectInterval: number;
    requestMembersPromise: Record<string, RequestMembersPromise>;
    requestSoundboardSoundsPromise: Record<string, RequestSoundboardSoundsPromise>;
    resumeURL: string | null;
    seq: number;
    sessionID: string | null;
    status: "connecting" | "disconnected" | "handshaking" | "identifying" | "ready" | "resuming";
    ws: WebSocket | BrowserWebSocket | null;
    constructor(id: number, client: Client);
    checkReady(): void;
    connect(): void;
    createGuild(_guild: Guild): Guild;
    disconnect(options?: { reconnect?: boolean | "auto" }, error?: Error): void;
    editAFK(afk: boolean): void;
    editStatus(status: SelfStatus, activities?: ActivityPartial<ActivityType>[] | ActivityPartial<ActivityType>): void;
    editStatus(activities?: ActivityPartial<ActivityType>[] | ActivityPartial<ActivityType>): void;
    // @ts-ignore: Method override
    emit(event: string, ...args: any[]): void;
    emit<K extends keyof ShardEvents>(event: K, ...args: ShardEvents[K]): boolean;
    emit(event: string, ...args: any[]): boolean;
    getGuildMembers(guildID: string, timeout: number): void;
    hardReset(): void;
    heartbeat(normal?: boolean): void;
    identify(): void;
    initializeWS(): void;
    off<K extends keyof ShardEvents>(event: K, listener: (...args: ShardEvents[K]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
    once<K extends keyof ShardEvents>(event: K, listener: (...args: ShardEvents[K]) => void): this;
    once(event: string, listener: (...args: any[]) => void): this;
    onPacket(packet: RawPacket): void;
    requestGuildMembers(guildID: string, options?: RequestGuildMembersOptions): Promise<Member[]>;
    requestGuildSoundboardSounds(options: RequestGuildSoundboardSoundsOptions): Promise<Record<string, SoundboardSound[]>>;
    reset(): void;
    restartGuildCreateTimeout(): void;
    resume(): void;
    sendStatusUpdate(): void;
    sendWS(op: number, _data: Record<string, unknown>, priority?: boolean): void;
    wsEvent(packet: Required<RawPacket>): void;
    on<K extends keyof ShardEvents>(event: K, listener: (...args: ShardEvents[K]) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
    toJSON(props?: string[]): JSONCache;
  }

  export class ShardManager extends Collection<Shard> implements SimpleJSON {
    buckets: Map<number, number>;
    connectQueue: Shard[];
    connectTimeout: NodeJS.Timer | null;
    constructor(client: Client, options: ShardManagerOptions);
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
    emit<K extends keyof StreamEvents>(event: K, ...args: StreamEvents[K]): boolean;
    emit(event: string, ...args: any[]): boolean;
    off<K extends keyof StreamEvents>(event: K, listener: (...args: StreamEvents[K]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
    once<K extends keyof StreamEvents>(event: K, listener: (...args: StreamEvents[K]) => void): this;
    once(event: string, listener: (...args: any[]) => void): this;
    play(resource: ReadableStream | string, options?: VoiceResourceOptions): void;
    remove(connection: VoiceConnection): void;
    setSpeaking(value: boolean): void;
    setVolume(volume: number): void;
    stopPlaying(): void;
    on<K extends keyof StreamEvents>(event: K, listener: (...args: StreamEvents[K]) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
  }

  export class SoundboardSound<G = true> extends Base {
    available: G extends false ? true : boolean;
    emojiID: G extends false ? null : string | null;
    emojiName: G extends false ? string : string | null;
    guild: G extends false ? never : PossiblyUncachedGuild;
    name: string;
    user: G extends false ? never : User | undefined;
    volume: number;
    constructor(data: BaseData, client: Client);
    delete(reason?: string): Promise<void>;
    edit(options: GuildSoundboardSoundEdit): Promise<SoundboardSound>;
    send(channelID: string): Promise<void>;
  }

  export class StageChannel extends VoiceChannel {
    type: Constants["ChannelTypes"]["GUILD_STAGE_VOICE"];
    createInstance(options: StageInstanceOptions): Promise<StageInstance>;
    deleteInstance(): Promise<void>;
    editInstance(options: StageInstanceOptions): Promise<StageInstance>;
    getInstance(): Promise<StageInstance>;
  }

  export class StageInstance extends Base {
    channel: StageChannel | Uncached;
    client: Client;
    discoverableDisabled: boolean;
    guild: Guild | Uncached;
    privacyLevel: StageInstancePrivacyLevel;
    topic: string;
    constructor(data: BaseData, client: Client);
    update(data: BaseData): void;
    delete(): Promise<void>;
    edit(options: StageInstanceOptions): Promise<StageInstance>;
  }

  export class TextChannel extends GuildTextableChannel implements Invitable, Permissionable, Pinnable {
    defaultAutoArchiveDuration: AutoArchiveDuration;
    lastPinTimestamp: number | null;
    nsfw: boolean;
    permissionOverwrites: Collection<PermissionOverwrite>;
    position: number;
    topic: string | null;
    type: GuildTextChannelTypes;
    createInvite(options?: CreateChannelInviteOptions, reason?: string): Promise<Invite<"withMetadata", this>>;
    createThread(options: CreateThreadWithoutMessageOptions): Promise<AnyThreadChannel>;
    createThreadWithMessage(messageID: string, options: CreateThreadOptions): Promise<NewsThreadChannel | PublicThreadChannel>;
    /** @deprecated */
    createThreadWithoutMessage(options: CreateThreadWithoutMessageOptions): Promise<AnyThreadChannel>;
    createWebhook(options: WebhookCreateOptions, reason?: string | undefined): Promise<Webhook>;
    deletePermission(overwriteID: string, reason?: string): Promise<void>;
    edit(options: EditTextChannelOptions, reason?: string): Promise<this>;
    editPermission(overwriteID: string, allow: PermissionValueTypes, deny: PermissionValueTypes, type: PermissionType, reason?: string): Promise<PermissionOverwrite>;
    getArchivedThreads(type: "private", options?: GetArchivedThreadsOptions): Promise<ListedChannelThreads<PrivateThreadChannel>>;
    getArchivedThreads(type: "public", options?: GetArchivedThreadsOptions): Promise<ListedChannelThreads<PublicThreadChannel>>;
    getInvites(): Promise<Invite<"withMetadata", this>[]>;
    getJoinedPrivateArchivedThreads(options: GetArchivedThreadsOptions): Promise<ListedChannelThreads<PrivateThreadChannel>>;
    getPins(): Promise<Message<this>[]>;
    getWebhooks(): Promise<Webhook[]>;
    pinMessage(messageID: string): Promise<void>;
    unpinMessage(messageID: string): Promise<void>;
  }

  export class ThreadChannel extends GuildTextableChannel implements Pinnable {
    lastPinTimestamp: number | null;
    member?: ThreadMember;
    memberCount: number;
    members: Collection<ThreadMember>;
    messageCount: number;
    ownerID: string;
    threadMetadata: ThreadMetadata;
    totalMessageSent: number;
    type: GuildThreadChannelTypes;
    constructor(data: BaseData, client: Client);
    edit(options: EditThreadChannelOptions, reason?: string): Promise<this>;
    getMember(userID: string, withMember?: boolean): Promise<ThreadMember>;
    getMembers(options?: GetThreadMembersOptions): Promise<ThreadMember[]>;
    getPins(): Promise<Message<this>[]>;
    join(userID?: string): Promise<void>;
    leave(userID?: string): Promise<void>;
    pinMessage(messageID: string): Promise<void>;
    unpinMessage(messageID: string): Promise<void>;
  }

  export class ThreadMember extends Base {
    flags: number;
    guildMember?: Member;
    joinTimestamp: number;
    threadID: string;
    constructor(data: BaseData, client: Client);
    update(data: BaseData): void;
    leave(): Promise<void>;
  }

  export class UnavailableGuild extends Base {
    createdAt: number;
    id: string;
    shard: Shard;
    unavailable: boolean;
    constructor(data: BaseData, client: Client);
  }

  export class User extends Base {
    accentColor?: number | null;
    avatar: string | null;
    avatarDecorationData?: AvatarDecorationData | null;
    avatarDecorationURL: string | null;
    avatarURL: string;
    banner?: string | null;
    bannerURL: string | null;
    bot: boolean;
    createdAt: number;
    defaultAvatar: string;
    defaultAvatarURL: string;
    discriminator: string;
    globalName: string | null;
    id: string;
    mention: string;
    publicFlags?: number;
    staticAvatarURL: string;
    system: boolean;
    username: string;
    constructor(data: BaseData, client: Client);
    dynamicAvatarURL(format?: ImageFormat, size?: number): string;
    dynamicBannerURL(format?: ImageFormat, size?: number): string | null;
    getDMChannel(): Promise<DMChannel>;
  }

  export class VoiceChannel extends GuildTextableChannel implements Invitable, Permissionable {
    bitrate: number;
    nsfw: boolean;
    permissionOverwrites: Collection<PermissionOverwrite>;
    position: number;
    rtcRegion: string | null;
    status?: string;
    type: GuildVoiceChannelTypes;
    userLimit: number;
    videoQualityMode: VideoQualityMode;
    voiceMembers: Collection<Member>;
    createInvite(options?: CreateInviteOptions, reason?: string): Promise<Invite<"withMetadata", this>>;
    createWebhook(options: WebhookCreateOptions, reason?: string | undefined): Promise<Webhook>;
    deletePermission(overwriteID: string, reason?: string): Promise<void>;
    editPermission(overwriteID: string, allow: PermissionValueTypes, deny: PermissionValueTypes, type: PermissionType, reason?: string): Promise<PermissionOverwrite>;
    getInvites(): Promise<Invite<"withMetadata", this>[]>;
    getWebhooks(): Promise<Webhook[]>;
    join(options?: JoinVoiceChannelOptions): Promise<VoiceConnection>;
    leave(): void;
    sendSoundboardSound(options: GuildSoundboardSoundSend): Promise<void>;
    setStatus(status: string, reason?: string): Promise<void>;
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
    opus: Record<string, unknown>;
    opusOnly: boolean;
    paused: boolean;
    pcmSize: number;
    piper: Piper;
    playing: boolean;
    ready: boolean;
    receiveStreamOpus?: VoiceDataStream | null;
    receiveStreamPCM?: VoiceDataStream | null;
    reconnecting: boolean;
    resuming: boolean;
    samplingRate: number;
    secret: Buffer;
    sendBuffer: Buffer;
    sendNonce: Buffer;
    sequence: number;
    shard: Shard | Record<string, never>;
    shared: boolean;
    speaking: boolean;
    ssrc?: number;
    ssrcUserMap: Record<number, string>;
    timestamp: number;
    udpIP?: string;
    udpPort?: number;
    udpSocket: DgramSocket | null;
    volume: number;
    ws: BrowserWebSocket | WebSocket | null;
    constructor(id: string, options?: { shard?: Shard; shared?: boolean; opusOnly?: boolean });
    connect(data: VoiceConnectData): NodeJS.Timer | void;
    disconnect(error?: Error, reconnecting?: boolean): void;
    emit<K extends keyof VoiceEvents>(event: K, ...args: VoiceEvents[K]): boolean;
    emit(event: string, ...args: any[]): boolean;
    heartbeat(): void;
    off<K extends keyof VoiceEvents>(event: K, listener: (...args: VoiceEvents[K]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
    once<K extends keyof VoiceEvents>(event: K, listener: (...args: VoiceEvents[K]) => void): this;
    once(event: string, listener: (...args: any[]) => void): this;
    pause(): void;
    play(resource: ReadableStream | string, options?: VoiceResourceOptions): void;
    receive(type: "opus" | "pcm"): VoiceDataStream;
    registerReceiveEventHandler(): void;
    resume(): void;
    sendAudioFrame(frame: Buffer): void;
    sendUDPPacket(packet: Buffer): void;
    sendWS(op: number, data: Record<string, unknown>): void;
    setSpeaking(value: boolean): void;
    setVolume(volume: number): void;
    stopPlaying(): void;
    switchChannel(channelID: string): void;
    updateVoiceState(selfMute: boolean, selfDeaf: boolean): void;
    on<K extends keyof VoiceEvents>(event: K, listener: (...args: VoiceEvents[K]) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
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
