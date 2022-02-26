const EventCursor = require('../../util/EventCursor');
const Interaction = require('../../structures/Interaction');
class InteractionUpdate extends EventCursor {
  constructor(data, client, shardController) {
    super('INTERACTION_UPDATE', data, data, client, shardController);
  }

  onEvent(packet) {
    this.shardController.emit('interactionUpdate', new Interaction(packet.d, this.client, this.shardController.guilds.get(packet.d.guild_id),
      this.shardController.guilds.get(packet.d.guild_id).members.get(packet.d.member.user.id),
      this.shardController.guilds.get(packet.d.guild_id).channels.get(packet.d.channel_id)));
    return;
  }

}

module.exports = InteractionUpdate;
