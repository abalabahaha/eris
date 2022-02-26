const EventCursor = require('../../util/EventCursor');
class MessageReactionRemove extends EventCursor {
  constructor(data, client, shardController) {
    super('MESSAGE_REACTION_REMOVE', data, data, client, shardController);
  }

  onEvent(packet) {
    const channel = this.client.getChannel(packet.d.channel_id);
    let message;
    if (channel) {
      message = channel.messages.get(packet.d.message_id);
    }
    if (message) {
      const reaction = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
      const reactionObj = message.reactions[reaction];
      if (reactionObj) {
        --reactionObj.count;
        if (reactionObj.count === 0) {
          delete message.reactions[reaction];
        } else if (packet.d.user_id === this.client.user.id) {
          reactionObj.me = false;
        }
      }
    } else {
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
     * Fired when someone removes a reaction from a message
     * @event Client#messageReactionRemove
     * @prop {Message | Object} message The message object. If the message is not cached, this will be an object with `id`, `channel`, and if inside a guild, `guildID` keys. If the channel is not cached, channel key will be an object with only an id. `guildID` will be present if the message was sent in a guild channel. No other property is guaranteed
     * @prop {Object} emoji The reaction emoji object
     * @prop {Boolean?} emoji.animated Whether the emoji is animated or not
     * @prop {String?} emoji.id The ID of the emoji (null for non-custom emojis)
     * @prop {String} emoji.name The emoji name
     * @prop {String} userID The ID of the user that removed the reaction
     */
    this.shardController.emit('messageReactionRemove', message, packet.d.emoji, packet.d.user_id);
    return;
  }

}

module.exports = MessageReactionRemove;
