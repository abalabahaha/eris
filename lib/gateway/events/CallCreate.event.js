const EventCursor = require('../../util/EventCursor');
const Call = require('../../structures/Call');

class CallCreate extends EventCursor {
  constructor(data, client, shardController) {
    super('CALL_CREATE', data, data, client, shardController);
  }

  onEvent(packet) {
    packet.d.id = packet.d.message_id;
    const channel = this.client.getChannel(packet.d.channel_id);
    if (channel.call) {
      channel.call.update(packet.d);
    } else {
      channel.call = new Call(packet.d, channel);
      let incrementedID = '';
      let overflow = true;
      const chunks = packet.d.id.match(/\d{1,9}/g).map((chunk) => parseInt(chunk));
      for (let i = chunks.length - 1; i >= 0; --i) {
        if (overflow) {
          ++chunks[i];
          overflow = false;
        }
        if (chunks[i] > 999999999) {
          overflow = true;
          incrementedID = '000000000' + incrementedID;
        } else {
          incrementedID = chunks[i] + incrementedID;
        }
      }
      if (overflow) {
        incrementedID = overflow + incrementedID;
      }
      this.client.getMessages(channel.id, {
        limit: 1,
        before: incrementedID
      }).catch((err) => this.shardController.emit('error', err));
    }
    /**
     * Fired when a call is created
     * @event Client#callCreate
     * @prop {Call} call The call
     */
    this.shardController.emit('callCreate', channel.call);
    return;
  }
}

module.exports = CallCreate;
