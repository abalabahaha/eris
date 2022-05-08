const EventCursor = require('../../util/EventCursor');
const Invite = require('../../structures/Invite');
class InviteCreate extends EventCursor {
  constructor(data, client, shardController) {
    super('INVITE_CREATE', data, data, client, shardController);
  }

  onEvent(packet) {
    const guild = this.client.guilds.get(packet.d.guild_id);
    if (!guild) {
      this.shardController.emit('debug', `Missing guild ${packet.d.guild_id} in INVITE_CREATE`);
      return;
    }
    const channel = this.client.getChannel(packet.d.channel_id);
    if (!channel) {
      this.shardController.emit('debug', `Missing channel ${packet.d.channel_id} in INVITE_CREATE`);
      return;
    }
    /**
     * Fired when a guild invite is created
     * @event Client#inviteCreate
     * @prop {Guild} guild The guild this invite was created in.
     * @prop {Invite} invite The invite that was created
     */
    this.shardController.emit('inviteCreate', guild, new Invite({
      ...packet.d,
      guild,
      channel
    }, this.client));
    return;
  }
}

module.exports = InviteCreate;
