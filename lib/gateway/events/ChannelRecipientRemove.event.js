const EventCursor = require('../../util/EventCursor');

class ChannelRecipientRemove extends EventCursor {
  constructor(data, client, shardController) {
    super('CHANNEL_RECIPIENT_REMOVE', data, data, client, shardController);
  }

  onEvent(packet) {
    const channel = this.client.groupChannels.get(packet.d.channel_id);
    /**
     * Fired when a user leaves a group channel
     * @event Client#channelRecipientRemove
     * @prop {GroupChannel} channel The channel
     * @prop {User} user The user
     */
    this.shardController.emit('channelRecipientRemove', channel, channel.recipients.remove(packet.d.user));
    return;
  }

}

module.exports = ChannelRecipientRemove;
