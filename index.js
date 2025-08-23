"use strict";

const Client = require("./lib/Client");

function Eris(token, options) {
  return new Client(token, options);
}

Eris.AutoModerationRule = require("./lib/structures/AutoModerationRule");
Eris.ApplicationCommand = require("./lib/structures/ApplicationCommand");
Eris.AutocompleteInteraction = require("./lib/structures/AutocompleteInteraction");
Eris.Base = require("./lib/structures/Base");
Eris.Bucket = require("./lib/util/Bucket");
Eris.CategoryChannel = require("./lib/structures/CategoryChannel");
Eris.Channel = require("./lib/structures/Channel");
Eris.Client = Client;
Eris.Collection = require("./lib/util/Collection");
Eris.Command = require("./lib/command/Command");
Eris.CommandClient = require("./lib/command/CommandClient");
Eris.CommandInteraction = require("./lib/structures/CommandInteraction");
Eris.ComponentInteraction = require("./lib/structures/ComponentInteraction");
Eris.Constants = require("./lib/Constants");
Eris.DiscordHTTPError = require("./lib/errors/DiscordHTTPError");
Eris.DiscordRESTError = require("./lib/errors/DiscordRESTError");
Eris.DMChannel = require("./lib/structures/DMChannel");
Eris.ExtendedUser = require("./lib/structures/ExtendedUser");
Eris.ForumChannel = require("./lib/structures/ForumChannel");
Eris.GroupChannel = require("./lib/structures/GroupChannel");
Eris.Guild = require("./lib/structures/Guild");
Eris.GuildChannel = require("./lib/structures/GuildChannel");
Eris.GuildIntegration = require("./lib/structures/GuildIntegration");
Eris.GuildPreview = require("./lib/structures/GuildPreview");
Eris.GuildScheduledEvent = require("./lib/structures/GuildScheduledEvent");
Eris.GuildTemplate = require("./lib/structures/GuildTemplate");
Eris.Interaction = require("./lib/structures/Interaction");
Eris.Invite = require("./lib/structures/Invite");
Eris.MediaChannel = require("./lib/structures/MediaChannel");
Eris.Member = require("./lib/structures/Member");
Eris.Message = require("./lib/structures/Message");
Eris.ModalSubmitInteraction = require("./lib/structures/ModalSubmitInteraction");
Eris.NewsChannel = require("./lib/structures/NewsChannel");
Eris.NewsThreadChannel = require("./lib/structures/NewsThreadChannel");
Eris.Permission = require("./lib/structures/Permission");
Eris.PermissionOverwrite = require("./lib/structures/PermissionOverwrite");
Eris.PingInteraction = require("./lib/structures/PingInteraction");
/** @deprecated */
Eris.PrivateChannel = require("./lib/structures/DMChannel");
Eris.PrivateThreadChannel = require("./lib/structures/PrivateThreadChannel");
Eris.PublicThreadChannel = require("./lib/structures/PublicThreadChannel");
Eris.RequestHandler = require("./lib/rest/RequestHandler");
Eris.Role = require("./lib/structures/Role");
Eris.SequentialBucket = require("./lib/util/SequentialBucket");
Eris.Shard = require("./lib/gateway/Shard");
Eris.SharedStream = require("./lib/voice/SharedStream");
Eris.SoundboardSound = require("./lib/structures/SoundboardSound");
Eris.StageChannel = require("./lib/structures/StageChannel");
Eris.StageInstance = require("./lib/structures/StageInstance");
Eris.TextChannel = require("./lib/structures/TextChannel");
Eris.ThreadChannel = require("./lib/structures/ThreadChannel");
Eris.ThreadMember = require("./lib/structures/ThreadMember");
Eris.UnavailableGuild = require("./lib/structures/UnavailableGuild");
Eris.UnknownInteraction = require("./lib/structures/UnknownInteraction");
Eris.User = require("./lib/structures/User");
Eris.VERSION = require("./package.json").version;
Eris.VoiceChannel = require("./lib/structures/VoiceChannel");
Eris.VoiceConnection = require("./lib/voice/VoiceConnection");
Eris.VoiceConnectionManager = require("./lib/voice/VoiceConnectionManager");
Eris.VoiceState = require("./lib/structures/VoiceState");

module.exports = Eris;
