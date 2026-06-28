"use strict";

const Client = require("./Client");

function Eris(token, options) {
  return new Client(token, options);
}

Eris.AutoModerationRule = require("./structures/AutoModerationRule");
Eris.ApplicationCommand = require("./structures/ApplicationCommand");
Eris.AutocompleteInteraction = require("./structures/AutocompleteInteraction");
Eris.Base = require("./structures/Base");
Eris.Bucket = require("./util/Bucket");
Eris.CategoryChannel = require("./structures/CategoryChannel");
Eris.Channel = require("./structures/Channel");
Eris.Client = Client;
Eris.Collection = require("./util/Collection");
Eris.Command = require("./command/Command");
Eris.CommandClient = require("./command/CommandClient");
Eris.CommandInteraction = require("./structures/CommandInteraction");
Eris.ComponentInteraction = require("./structures/ComponentInteraction");
Eris.Constants = require("./Constants");
Eris.DiscordHTTPError = require("./errors/DiscordHTTPError");
Eris.DiscordRESTError = require("./errors/DiscordRESTError");
Eris.DMChannel = require("./structures/DMChannel");
Eris.ExtendedUser = require("./structures/ExtendedUser");
Eris.ForumChannel = require("./structures/ForumChannel");
Eris.GroupChannel = require("./structures/GroupChannel");
Eris.Guild = require("./structures/Guild");
Eris.GuildChannel = require("./structures/GuildChannel");
Eris.GuildIntegration = require("./structures/GuildIntegration");
Eris.GuildPreview = require("./structures/GuildPreview");
Eris.GuildScheduledEvent = require("./structures/GuildScheduledEvent");
Eris.GuildTemplate = require("./structures/GuildTemplate");
Eris.Interaction = require("./structures/Interaction");
Eris.Invite = require("./structures/Invite");
Eris.MediaChannel = require("./structures/MediaChannel");
Eris.Member = require("./structures/Member");
Eris.Message = require("./structures/Message");
Eris.ModalSubmitInteraction = require("./structures/ModalSubmitInteraction");
Eris.NewsChannel = require("./structures/NewsChannel");
Eris.NewsThreadChannel = require("./structures/NewsThreadChannel");
Eris.Permission = require("./structures/Permission");
Eris.PermissionOverwrite = require("./structures/PermissionOverwrite");
Eris.PingInteraction = require("./structures/PingInteraction");
/** @deprecated */
Eris.PrivateChannel = require("./structures/DMChannel");
Eris.PrivateThreadChannel = require("./structures/PrivateThreadChannel");
Eris.PublicThreadChannel = require("./structures/PublicThreadChannel");
Eris.RequestHandler = require("./rest/RequestHandler");
Eris.Role = require("./structures/Role");
Eris.SequentialBucket = require("./util/SequentialBucket");
Eris.Shard = require("./gateway/Shard");
Eris.SharedStream = require("./voice/SharedStream");
Eris.SoundboardSound = require("./structures/SoundboardSound");
Eris.StageChannel = require("./structures/StageChannel");
Eris.StageInstance = require("./structures/StageInstance");
Eris.TextChannel = require("./structures/TextChannel");
Eris.ThreadChannel = require("./structures/ThreadChannel");
Eris.ThreadMember = require("./structures/ThreadMember");
Eris.UnavailableGuild = require("./structures/UnavailableGuild");
Eris.UnknownInteraction = require("./structures/UnknownInteraction");
Eris.User = require("./structures/User");
Eris.VERSION = require("../package.json").version;
Eris.VoiceChannel = require("./structures/VoiceChannel");
Eris.VoiceConnection = require("./voice/VoiceConnection");
Eris.VoiceConnectionManager = require("./voice/VoiceConnectionManager");
Eris.VoiceState = require("./structures/VoiceState");

module.exports = Eris;
