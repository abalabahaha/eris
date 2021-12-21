const EventCursor = require('../../util/EventCursor');
class ChannelPinsUpdate extends EventCursor {
  constructor(data, client, shardController) {
    super('GUILD_EMOJIS_UPDATE', data, data, client, shardController);
  }

  onEvent(packet) {
    const channel = this.client.getChannel(packet.d.channel_id);
    if (!channel) {
      this.shardController.emit('debug', `CHANNEL_PINS_UPDATE target channel ${packet.d.channel_id} not found`);
      return;
    }
    const oldTimestamp = channel.lastPinTimestamp;
    channel.lastPinTimestamp = Date.parse(packet.d.last_pin_timestamp);
    /**
     * Fired when a channel pin timestamp is updated
     * @event Client#channelPinUpdate
     * @prop {PrivateChannel | TextChannel | NewsChannel} channel The channel
     * @prop {Number} timestamp The new timestamp
     * @prop {Number} oldTimestamp The old timestamp
     */
    this.shardController.emit('channelPinUpdate', channel, channel.lastPinTimestamp, oldTimestamp);
    return;
  }

}

module.exports = ChannelPinsUpdate;
