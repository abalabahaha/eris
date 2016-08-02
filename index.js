"use strict";

const Client = require("./lib/Client");

function Eris(token, options) {
    return new Client(token, options);
}

Eris.Bucket = require("./lib/util/Bucket");
Eris.Call = require("./lib/core/Call");
Eris.Channel = require("./lib/core/Channel");
Eris.Client = Client;
Eris.Collection = require("./lib/util/Collection");
Eris.Command = require("./lib/command/Command");
Eris.CommandClient = require("./lib/command/CommandClient");
Eris.Constants = require("./lib/Constants");
Eris.ExtendedUser = require("./lib/core/ExtendedUser");
Eris.GroupChannel = require("./lib/core/GroupChannel");
Eris.Guild = require("./lib/core/Guild");
Eris.GuildIntegration = require("./lib/core/GuildIntegration");
Eris.Invite = require("./lib/core/Invite");
Eris.Member = require("./lib/core/Member");
Eris.Message = require("./lib/core/Message");
Eris.Permission = require("./lib/core/Permission");
Eris.PermissionOverwrite = require("./lib/core/PermissionOverwrite");
Eris.PrivateChannel = require("./lib/core/PrivateChannel");
Eris.Relationship = require("./lib/core/Relationship");
Eris.Role = require("./lib/core/Role");
Eris.Shard = require("./lib/core/Shard");
Eris.User = require("./lib/core/User");
Eris.VoiceConnection = require("./lib/core/VoiceConnection");
Eris.VoiceState = require("./lib/core/VoiceState");
Eris.MultipartData = require("./lib/util/MultipartData");
Eris.VolumeTransformer = require("./lib/util/VolumeTransformer");

module.exports = Eris;