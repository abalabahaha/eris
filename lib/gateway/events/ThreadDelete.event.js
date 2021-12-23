const { ChannelTypes } = require('../../Constants');
const EventCursor = require('../../util/EventCursor');

class ThreadDelete extends EventCursor {
  constructor(data, client, shardController) {
    super('THREAD_DELETE', data, data, client, shardController);
  }
  onEvent(packet) {
    if (packet.d.type === ChannelTypes.GUILD_NEWS_THREAD || packet.d.type === ChannelTypes.GUILD_PRIVATE_THREAD || packet.d.type === ChannelTypes.GUILD_PUBLIC_THREAD || packet.d.type === undefined) {
      if (this.id === 0) {
        const channel = this.client.privateChannels.remove(packet.d);
        if (channel) {
          delete this.client.privateChannelMap[channel.recipient.id];
          /**
           * Fired when a channel is deleted
           * @event Client#channelDelete
           * @prop {PrivateChannel | TextChannel | NewsChannel | VoiceChannel | CategoryChannel} channel The channel
           */
          this.shardController.emit('threadDelete', channel);
        }
      }
    } else if (packet.d.guild_id) {
      delete this.client.channelGuildMap[packet.d.id];
      const guild = this.client.guilds.get(packet.d.guild_id);
      if (!guild) {
        this.shardController.emit('debug', `Missing guild ${packet.d.guild_id} in THREAD_DELETE`);
        return;
      }
      const channel = guild.channels.remove(packet.d);
      if (!channel) {
        return;
      }
      if (channel.type === ChannelTypes.GUILD_VOICE || channel.type === ChannelTypes.GUILD_STAGE) {
        channel.voiceMembers.forEach((member) => {
          channel.voiceMembers.remove(member);
          this.shardController.emit('voiceChannelLeave', member, channel);
        });
      }
      this.shardController.emit('threadDelete', channel);
    } else if (packet.d.type === ChannelTypes.GROUP_DM) {
      if (this.id === 0) {
        this.shardController.emit('threadDelete', this.client.groupChannels.remove(packet.d));
      }
    } else {
      this.shardController.emit('warn', new Error('Unhandled THREAD_DELETE type: ' + JSON.stringify(packet, null, 2)));
    }
    return;
  }
}

module.exports = ThreadDelete;
