const EventCursor = require('../../util/EventCursor');
class MessageDeleteBulk extends EventCursor {
  constructor(data, client, shardController) {
    super('MESSAGE_DELETE_BULK', data, data, client, shardController);
  }

  onEvent(packet) {
    const channel = this.client.getChannel(packet.d.channel_id);

    /**
     * Fired when a bulk delete occurs
     * @event Client#messageDeleteBulk
     * @prop {Array<Message> | Array<Object>} messages An array of (potentially partial) message objects. If a message is not cached, it will be an object with `id` and `channel` keys If the uncached messages are from a guild, the messages will also contain a `guildID` key, and the channel will contain a `guild` with an `id` key. No other property is guaranteed
     */
    this.shardController.emit('messageDeleteBulk', packet.d.ids.map((id) => (channel && channel.messages.remove({
      id
    }) || {
      id: id,
      channel: { id: packet.d.channel_id, guild: packet.d.guild_id ? { id: packet.d.guild_id } : undefined },
      guildID: packet.d.guild_id
    })));
    return;
  }
}

module.exports = MessageDeleteBulk;
