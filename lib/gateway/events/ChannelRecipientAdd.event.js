const EventCursor = require('../../util/EventCursor');

class ChannelRecipientAdd extends EventCursor {
  constructor(data, client, shardController) {
    super('CHANNEL_RECIPIENT_ADD', data, data, client, shardController);
  }

  onEvent(packet) {
    const channel = this.client.groupChannels.get(packet.d.channel_id);
    /**
     * Fired when a user joins a group channel
     * @event Client#channelRecipientAdd
     * @prop {GroupChannel} channel The channel
     * @prop {User} user The user
     */
    this.shardController.emit('channelRecipientAdd', channel, channel.recipients.add(this.client.users.update(packet.d.user, this.client)));
    return;
  }
}

module.exports = ChannelRecipientAdd;
