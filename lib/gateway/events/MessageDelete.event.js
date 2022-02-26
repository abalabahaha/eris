const EventCursor = require('../../util/EventCursor');
class MessageDelete extends EventCursor {
  constructor(data, client, shardController) {
    super('MESSAGE_DELETE', data, data, client, shardController);
  }

  onEvent(packet) {
    const channel = this.client.getChannel(packet.d.channel_id);

    /**
     * Fired when a cached message is deleted
     * @event Client#messageDelete
     * @prop {Message | Object} message The message object. If the message is not cached, this will be an object with `id` and `channel` keys. If the channel is not cached, channel will be an object with an `id` key. If the uncached message is from a guild, the message will also contain a `guildID` key, and the channel will contain a `guild` with an `id` key. No other property is guaranteed.
     */
    this.shardController.emit('messageDelete', (channel && channel.messages.remove(packet.d)) || {
      id: packet.d.id,
      channel: channel || {
        id: packet.d.channel_id,
        guild: packet.d.guild_id ? { id: packet.d.guild_id } : undefined
      },
      guildID: packet.d.guild_id
    });
    return;
  }

}

module.exports = MessageDelete;
