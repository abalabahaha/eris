const EventCursor = require('../../util/EventCursor');
const Channel = require('../../structures/Channel');
const PrivateChannel = require('../../structures/PrivateChannel');
const GroupChannel = require('../../structures/GroupChannel');

class ChannelCreate extends EventCursor {
  constructor(data, client, shardController) {
    super('CHANNEL_CREATE', data, data, client, shardController);
  }

  onEvent(packet) {
    const channel = Channel.from(packet.d, this.client);
    if (packet.d.guild_id) {
      if (!channel.guild) {
        channel.guild = this.client.guilds.get(packet.d.guild_id);
        if (!channel.guild) {
          this.shardController.emit('debug', `Received CHANNEL_CREATE for channel in missing guild ${packet.d.guild_id}`);
          return;
        }
      }
      channel.guild.channels.add(channel, this.client);
      this.client.channelGuildMap[packet.d.id] = packet.d.guild_id;
      /**
       * Fired when a channel is created
       * @event Client#channelCreate
       * @prop {TextChannel | VoiceChannel | CategoryChannel | StoreChannel | NewsChannel | GuildChannel | PrivateChannel} channel The channel
       */
      this.shardController.emit('channelCreate', channel);
    } else if (channel instanceof PrivateChannel) {
      if (channel instanceof GroupChannel) {
        this.client.groupChannels.add(channel, this.client);
      } else {
        this.client.privateChannels.add(channel, this.client);
        this.client.privateChannelMap[packet.d.recipients[0].id] = packet.d.id;
      }
      if (this.id === 0) {
        this.shardController.emit('channelCreate', channel);
      }
    } else {
      this.shardController.emit('warn', new Error('Unhandled CHANNEL_CREATE type: ' + JSON.stringify(packet, null, 2)));
      return;
    }
    return;
  }
}

module.exports = ChannelCreate;
