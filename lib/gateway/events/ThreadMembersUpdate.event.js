const { ChannelTypes } = require('../../Constants');
const ThreadChannel = require('../../structures/ThreadChannel');
const EventCursor = require('../../util/EventCursor');

class ThreadMembersUpdate extends EventCursor {
  constructor(data, client, shardController) {
    super('THREAD_MEMBERS_UPDATE', data, data, client, shardController);
  }
  onEvent(packet) {
    const channel = ThreadChannel.from(packet.d, this.client);
    if (channel.type === ChannelTypes.GUILD_NEWS_THREAD || channel.type === ChannelTypes.GUILD_PRIVATE_THREAD || channel.type === ChannelTypes.GUILD_PUBLIC_THREAD) {
      channel.update(packet.d);
    }
  }
}

module.exports = ThreadMembersUpdate;
