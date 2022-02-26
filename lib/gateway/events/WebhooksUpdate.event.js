const EventCursor = require('../../util/EventCursor');
class WebhooksUpdate extends EventCursor {
  constructor(data, client, shardController) {
    super('WEBHOOKS_UPDATE', data, data, client, shardController);
  }

  onEvent(packet) {
    /**
          * Fired when a channel's webhooks are updated
          * @event Client#webhooksUpdate
          * @prop {Object} data The update data
          * @prop {String} data.channelID The ID of the channel that webhooks were updated in
          * @prop {String} data.guildID The ID of the guild that webhooks were updated in
          */
    this.shardController.emit('webhooksUpdate', {
      channelID: packet.d.channel_id,
      guildID: packet.d.guild_id
    });
    return;
  }

}

module.exports = WebhooksUpdate;
