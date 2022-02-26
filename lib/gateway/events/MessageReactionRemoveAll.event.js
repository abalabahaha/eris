const EventCursor = require('../../util/EventCursor');
class MessageReactionRemoveAll extends EventCursor {
  constructor(data, client, shardController) {
    super('MESSAGE_REACTION_REMOVE_ALL', data, data, client, shardController);
  }

  onEvent(packet) {
    const channel = this.client.getChannel(packet.d.channel_id);
    let message;
    if (channel) {
      message = channel.messages.get(packet.d.message_id);
      if (message) {
        message.reactions = {};
      }
    }
    if (!message) {
      message = {
        id: packet.d.message_id,
        channel: channel || { id: packet.d.channel_id }
      };
      if (packet.d.guild_id) {
        message.guildID = packet.d.guild_id;
        if (!message.channel.guild) {
          message.channel.guild = { id: packet.d.guild_id };
        }
      }
    }
    /**
     * Fired when all reactions are removed from a message
     * @event Client#messageReactionRemoveAll
     * @prop {Message | Object} message The message object. If the message is not cached, this will be an object with `id`, `channel`, and if inside a guild, `guildID` keys. If the channel is not cached, channel key will be an object with only an id. No other property is guaranteed
     */
    this.shardController.emit('messageReactionRemoveAll', message);
    return;
  }

}

module.exports = MessageReactionRemoveAll;
