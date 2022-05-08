const EventCursor = require('../../util/EventCursor');

class CallDelete extends EventCursor {
  constructor(data, client, shardController) {
    super('CALL_DELETE', data, data, client, shardController);
  }

  onEvent(packet) {
    const channel = this.client.getChannel(packet.d.channel_id);
    if (!channel.call) {
      throw new Error('CALL_DELETE but channel has no call');
    }
    channel.lastCall = channel.call;
    channel.call = null;
    /**
     * Fired when a call is deleted
     * @event Client#callDelete
     * @prop {Call} call The call
     */
    this.shardController.emit('callDelete', channel.lastCall);
    return;
  }
}

module.exports = CallDelete;
