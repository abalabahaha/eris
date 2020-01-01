import Eris from "./index.js";

export default function(token, options) {
  return new Eris.Client(token, options);
}

export const {
  Base,
  Bucket,
  Call,
  CategoryChannel,
  Channel,
  Client,
  Collection,
  Command,
  CommandClient,
  Constants,
  ExtendedUser,
  GroupChannel,
  Guild,
  GuildChannel,
  GuildIntegration,
  Invite,
  Member,
  Message,
  NewsChannel,
  Permission,
  PermissionOverwrite,
  PrivateChannel,
  Relationship,
  Role,
  Shard,
  SharedStream,
  TextChannel,
  User,
  VERSION,
  VoiceChannel,
  VoiceConnection,
  VoiceConnectionManager,
  VoiceState
} = Eris;
