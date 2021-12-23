const { ChannelTypes } = require('../../Constants');
const EventCursor = require('../../util/EventCursor');

class ThreadDelete extends EventCursor {
  constructor(data, client, shardController) {
    super('THREAD_DELETE', data, data, client, shardController);
  }
  onEvent(packet) {
    if (packet.d.type === ChannelTypes.GUILD_NEWS_THREAD || packet.d.type === ChannelTypes.GUILD_PRIVATE_THREAD || packet.d.type === ChannelTypes.GUILD_PUBLIC_THREAD || packet.d.type === undefined) {
      if (packet.d.guild_id !== undefined) {
        const guild_id = packet.d.guild_id;
        if (this.client.guilds.get(guild_id) !== undefined) {
          const guild = this.client.guilds.get(guild_id);
          if (packet.d.id !== undefined) {
            guild.channels.remove(packet.d.id);
          }
        }
      }
    }
  }
}

module.exports = ThreadDelete;
