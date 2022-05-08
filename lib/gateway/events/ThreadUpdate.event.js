const EventCursor = require('../../util/EventCursor');
const Channel = require('../../structures/Channel');
const PrivateChannel = require('../../structures/PrivateChannel');
const GroupChannel = require('../../structures/GroupChannel');
const ThreadChannel = require('../../structures/ThreadChannel');
class ThreadUpdate extends EventCursor {
  constructor(data, client, shardController) {
    super('CHANNEL_CREATE', data, data, client, shardController);
  }

  onEvent(packet) {
    let channel = this.client.getChannel(packet.d.id);
    if (!channel) {
      return;
    }
    let oldChannel;
    if (channel instanceof GroupChannel) {
      oldChannel = {
        name: channel.name,
        ownerID: channel.ownerID,
        icon: channel.icon
      };
    } else if (channel instanceof ThreadChannel) {
      oldChannel = {
        bitrate: channel.bitrate,
        name: channel.name,
        nsfw: channel.nsfw,
        parentID: channel.parentID,
        permissionOverwrites: channel.permissionOverwrites,
        position: channel.position,
        rateLimitPerUser: channel.rateLimitPerUser,
        rtcRegion: channel.rtcRegion,
        topic: channel.topic,
        type: channel.type,
        userLimit: channel.userLimit,
        videoQualityMode: channel.videoQualityMode
      };
    } else {
      this.shardController.emit('warn', `Unexpected THREAD_UPDATE for channel ${packet.d.id} with type ${oldType}`);
    }
    const oldType = channel.type;
    if (oldType === packet.d.type) {
      channel.update(packet.d);
    } else {
      this.shardController.emit('debug', `Thread ${packet.d.id} changed from type ${oldType} to ${packet.d.type}`);
      const newChannel = Channel.from(packet.d, this.client);
      if (packet.d.guild_id) {
        const guild = this.client.guilds.get(packet.d.guild_id);
        if (!guild) {
          this.shardController.emit('debug', `Received THREAD_UPDATE for channel in missing guild ${packet.d.guild_id}`);
          return;
        }
        guild.channels.remove(channel);
        guild.channels.add(newChannel, this.client);
      } else if (channel instanceof PrivateChannel) {
        if (channel instanceof GroupChannel) {
          this.client.groupChannels.remove(channel);
          this.client.groupChannels.add(newChannel, this.client);
        } else {
          this.client.privateChannels.remove(channel);
          this.client.privateChannels.add(newChannel, this.client);
        }
      } else {
        this.shardController.emit('warn', new Error('Unhandled THREAD_UPDATE type: ' + JSON.stringify(packet, null, 2)));
        return;
      }
      channel = newChannel;
    }
    /**
     * Fired when a channel is updated
     * @event Client#channelUpdate
     * @prop {TextChannel | VoiceChannel | CategoryChannel | StoreChannel | NewsChannel | GuildChannel | PrivateChannel} channel The updated channel
     * @prop {Object} oldChannel The old channel data
     * @prop {Number} oldChannel.bitrate The bitrate of the channel (voice channels only)
     * @prop {String} oldChannel.name The name of the channel
     * @prop {Boolean} oldChannel.nsfw Whether the channel is NSFW or not (text channels only)
     * @prop {String?} oldChannel.parentID The ID of the category this channel belongs to (guild channels only)
     * @prop {Collection} oldChannel.permissionOverwrites Collection of PermissionOverwrites in this channel (guild channels only)
     * @prop {Number} oldChannel.position The position of the channel (guild channels only)
     * @prop {Number?} oldChannel.rateLimitPerUser The ratelimit of the channel, in seconds. 0 means no ratelimit is enabled (text channels only)
     * @prop {String?} oldChannel.rtcRegion The RTC region ID of the channel (automatic when `null`) (voice channels only)
     * @prop {String?} oldChannel.topic The topic of the channel (text channels only)
     * @prop {Number} oldChannel.type The type of the old channel (text/news channels only)
     * @prop {Number?} oldChannel.userLimit The max number of users that can join the channel (voice channels only)
     * @prop {Number?} oldChannel.videoQualityMode The camera video quality mode of the channel (voice channels only)
     */
    this.shardController.emit('threadUpdate', channel, oldChannel);
    return;
  }
}

module.exports = ThreadUpdate;
