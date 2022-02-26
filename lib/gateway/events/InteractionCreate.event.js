const EventCursor = require('../../util/EventCursor');
const Interaction = require('../../structures/Interaction');
class InteractionCreate extends EventCursor {
  constructor(data, client, shardController) {
    super('INTERACTION_CREATE', data, data, client, shardController);
  }

  onEvent(packet) {
    if (packet.d.type === 2) {
      this.shardController.emit('slashCommand', new Interaction(packet.d, this.client, this.client.guilds.get(packet.d.guild_id) ?? undefined,
        this.client.guilds.get(packet.d.guild_id).members.get(packet.d.member.user.id ?? packet.d.member_id),
        this.client.guilds.get(packet.d.guild_id).channels.get(packet.d.channel_id).message));
    }
    this.shardController.emit('interactionCreate', new Interaction(packet.d, this.client, this.client.guilds.get(packet.d.guild_id) ?? undefined,
      this.client.guilds.get(packet.d.guild_id).members.get(packet.d.member.user.id ?? packet.d.member_id),
      this.client.guilds.get(packet.d.guild_id).channels.get(packet.d.channel_id)));
    return;
  }

}

module.exports = InteractionCreate;
