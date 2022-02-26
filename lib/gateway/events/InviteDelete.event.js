const EventCursor = require('../../util/EventCursor');
const Invite = require('../../structures/Invite');
class InviteDelete extends EventCursor {
  constructor(data, client, shardController) {
    super('INVITE_CREATE', data, data, client, shardController);
  }

  onEvent(packet) {
    const guild = this.client.guilds.get(packet.d.guild_id);
    if (!guild) {
      this.shardController.emit('debug', `Missing guild ${packet.d.guild_id} in INVITE_DELETE`);
      return;
    }
    const channel = this.client.getChannel(packet.d.channel_id);
    if (!channel) {
      this.shardController.emit('debug', `Missing channel ${packet.d.channel_id} in INVITE_DELETE`);
      return;
    }
    /**
     * Fired when a guild invite is deleted
     * @event Client#inviteDelete
     * @prop {Guild} guild The guild this invite was created in.
     * @prop {Invite} invite The invite that was deleted
     */
    this.shardController.emit('inviteDelete', guild, new Invite({
      ...packet.d,
      guild,
      channel
    }, this.client));
    return;
  }

}

module.exports = InviteDelete;
