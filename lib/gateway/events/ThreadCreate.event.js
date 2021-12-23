const Channel = require('../../structures/Channel');
const PrivateChannel = require('../../structures/PrivateChannel');
const ThreadChannel = require('../../structures/ThreadChannel');
const EventCursor = require('../../util/EventCursor');

class ThreadCreate extends EventCursor {
  constructor(data, client, shardController) {
    super('THREAD_CREATE', data, data, client, shardController);
  }
  onEvent(packet) {
    const channel = Channel.from(packet.d, this.client);
    if (packet.d.guild_id) {
      if (!channel.guild) {
        channel.guild = this.client.guilds.get(packet.d.guild_id);
        if (!channel.guild) {
          this.shardController.emit('debug', `Received THREAD_CREATE for channel in missing guild ${packet.d.guild_id}`);
          return;
        }
      }
      channel.guild.channels.add(channel, this.client);
      this.client.channelGuildMap[packet.d.id] = packet.d.guild_id;
      /**
       * Fired when a channel is created
       * @event Client#channelCreate
       * @prop {TextChannel | VoiceChannel | CategoryChannel | StoreChannel | NewsChannel | GuildChannel | PrivateChannel | ThreadChannel } channel The channel
       */
      this.shardController.emit('threadlCreate', channel);
    } else if (channel instanceof PrivateChannel) {
      if (channel instanceof ThreadChannel) {
        this.client.groupChannels.add(channel, this.client);
      } else {
        this.client.privateChannels.add(channel, this.client);
        this.client.privateChannelMap[packet.d.recipients[0].id] = packet.d.id;
      }
      if (this.id === 0) {
        this.shardController.emit('threadCreate', channel);
      }
    } else {
      this.shardController.emit('warn', new Error('Unhandled THREAD_CREATE type: ' + JSON.stringify(packet, null, 2)));
      return;
    }
    return;
  }
}

module.exports = ThreadCreate;
