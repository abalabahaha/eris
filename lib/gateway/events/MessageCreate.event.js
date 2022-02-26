const EventCursor = require('../../util/EventCursor');
const Message = require('../../structures/Message');
class MessageCreate extends EventCursor {
  constructor(data, client, shardController) {
    super('MESSAGE_CREATE', data, data, client, shardController);
  }

  onEvent(packet) {
    const channel = this.client.getChannel(packet.d.channel_id);
    if (channel) { // MESSAGE_CREATE just when deleting o.o
      channel.lastMessageID = packet.d.id;
      /**
       * Fired when a message is created
       * @event Client#messageCreate
       * @prop {Message} message The message.
       */
      this.shardController.emit('messageCreate', channel.messages.add(packet.d, this.client));
    } else {
      this.shardController.emit('messageCreate', new Message(packet.d, this.client));
    }
    return;
  }

}

module.exports = MessageCreate;
