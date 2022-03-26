const EventCursor = require('../../util/EventCursor');
class MessageUpdate extends EventCursor {
  constructor(data, client, shardController) {
    super('MESSAGE_UPDATE', data, data, client, shardController);
  }

  onEvent(packet) {
    const channel = this.client.getChannel(packet.d.channel_id);
    if (!channel) {
      packet.d.channel = {
        id: packet.d.channel_id
      };
      this.shardController.emit('messageUpdate', packet.d, null);
      return;
    }
    const message = channel.messages?.get(packet.d.id);
    let oldMessage = null;
    if (message) {
      oldMessage = {
        attachments: message.attachments,
        channelMentions: message.channelMentions,
        content: message.content,
        editedTimestamp: message.editedTimestamp,
        embeds: message.embeds,
        flags: message.flags,
        mentionedBy: message.mentionedBy,
        mentions: message.mentions,
        pinned: message.pinned,
        roleMentions: message.roleMentions,
        tts: message.tts
      };
    } else if (!packet.d.timestamp) {
      packet.d.channel = channel;
      this.shardController.emit('messageUpdate', packet.d, null);
      return;
    }
    /**
     * Fired when a message is updated
     * @event Client#messageUpdate
     * @prop {Message} message The updated message. If oldMessage is null, it is recommended to discard this event, since the message data will be very incomplete (only `id` and `channel` are guaranteed). If the channel isn't cached, `channel` will be an object with an `id` key.
     * @prop {Object?} oldMessage The old message data. If the message was cached, this will return the full old message. Otherwise, it will be null
     * @prop {Array<Object>} oldMessage.attachments Array of attachments
     * @prop {Array<String>} oldMessage.channelMentions Array of mentions channels' ids.
     * @prop {String} oldMessage.content Message content
     * @prop {Number} oldMessage.editedTimestamp Timestamp of latest message edit
     * @prop {Array<Object>} oldMessage.embeds Array of embeds
     * @prop {Number} oldMessage.flags Old message flags (see constants)
     * @prop {Object} oldMessage.mentionedBy Object of if different things mention the bot user
     * @prop {Array<String>} oldMessage.mentions Array of mentioned users' ids
     * @prop {Boolean} oldMessage.pinned Whether the message was pinned or not
     * @prop {Array<String>} oldMessage.roleMentions Array of mentioned roles' ids.
     * @prop {Boolean} oldMessage.tts Whether to play the message using TTS or not
     */
    if (!(packet.d.flags == 64)) {
      // Temporarily this will stay!
      this.shardController.emit('messageUpdate', channel.messages.update(packet.d, this.client), oldMessage);
    }

    return;
  }

}

module.exports = MessageUpdate;
