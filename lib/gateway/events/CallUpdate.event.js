const EventCursor = require('../../util/EventCursor');

class CallUpdate extends EventCursor {
  constructor(data, client, shardController) {
    super('CALL_UPDATE', data, data, client, shardController);
  }

  onEvent(packet) {
    const channel = this.client.getChannel(packet.d.channel_id);
    if (!channel.call) {
      throw new Error('CALL_UPDATE but channel has no call');
    }
    const oldCall = {
      endedTimestamp: channel.call.endedTimestamp,
      participants: channel.call.participants,
      region: channel.call.region,
      ringing: channel.call.ringing,
      unavailable: channel.call.unavailable
    };
    /**
     * Fired when a call is updated
     * @event Client#callUpdate
     * @prop {Call} call The updated call
     * @prop {Object} oldCall The old call data
     * @prop {Number?} oldCall.endedTimestamp The timestamp of the call end
     * @prop {Array<String>} oldCall.participants The IDs of the call participants
     * @prop {String?} oldCall.region The region of the call server
     * @prop {Array<String>?} oldCall.ringing The IDs of people that were being rung
     * @prop {Boolean} oldCall.unavailable Whether the call was unavailable or not
     */
    this.shardController.emit('callUpdate', channel.call.update(packet.d), oldCall);
    return;
  }
}

module.exports = CallUpdate;
