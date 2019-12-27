import Client from "./lib/Client.js";
// import pkg from "./package.json";

export default function(token, options) {
  return new Client(token, options);
}

export {default as Base} from "./lib/structures/Base.js";
export {default as Bucket} from "./lib/util/Bucket.js";
export {default as Call} from "./lib/structures/Call.js";
export {default as CategoryChannel} from "./lib/structures/CategoryChannel.js";
export {default as Channel} from "./lib/structures/Channel.js";
export {Client};
export {default as Collection} from "./lib/util/Collection.js";
export {default as Command} from "./lib/command/Command.js";
export {default as CommandClient} from "./lib/command/CommandClient.js";
export {default as Constants} from "./lib/Constants.js";
export {default as ExtendedUser} from "./lib/structures/ExtendedUser.js";
export {default as GroupChannel} from "./lib/structures/GroupChannel.js";
export {default as Guild} from "./lib/structures/Guild.js";
export {default as GuildChannel} from "./lib/structures/GuildChannel.js";
export {default as GuildIntegration} from "./lib/structures/GuildIntegration.js";
export {default as Invite} from "./lib/structures/Invite.js";
export {default as Member} from "./lib/structures/Member.js";
export {default as Message} from "./lib/structures/Message.js";
export {default as NewsChannel} from "./lib/structures/NewsChannel.js";
export {default as Permission} from "./lib/structures/Permission.js";
export {default as PermissionOverwrite} from "./lib/structures/PermissionOverwrite.js";
export {default as PrivateChannel} from "./lib/structures/PrivateChannel.js";
export {default as Relationship} from "./lib/structures/Relationship.js";
export {default as Role} from "./lib/structures/Role.js";
export {default as Shard} from "./lib/gateway/Shard.js";
export {default as SharedStream} from "./lib/voice/SharedStream.js";
export {default as TextChannel} from "./lib/structures/TextChannel.js";
export {default as User} from "./lib/structures/User.js";
// export const VERSION = pkg.version;
export {default as VoiceChannel} from "./lib/structures/VoiceChannel.js";
export {default as VoiceConnection} from "./lib/voice/VoiceConnection.js";
export {default as VoiceConnectionManager} from "./lib/voice/VoiceConnectionManager.js";
export {default as VoiceState} from "./lib/structures/VoiceState.js";
