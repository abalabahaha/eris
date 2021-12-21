const EventCursor = require('../../util/EventCursor');
const User = require('../../structures/User');
class GuildMemberRemove extends EventCursor {
  constructor(data, client, shardController) {
    super('GUILD_MEMBER_REMOVE', data, data, client, shardController);
  }

  onEvent(packet) {
    if (packet.d.user.id === this.client.user.id) { // The bot is probably leaving
      return;
    }
    const guild = this.client.guilds.get(packet.d.guild_id);
    if (!guild) {
      return;
    }
    --guild.memberCount;
    packet.d.id = packet.d.user.id;
    /**
     * Fired when a member leaves a server
     * @event Client#guildMemberRemove
     * @prop {Guild} guild The guild
     * @prop {Member | Object} member The member. If the member is not cached, this will be an object with `id` and `user` key
     */
    this.shardController.emit('guildMemberRemove', guild, guild.members.remove(packet.d) || {
      id: packet.d.id,
      user: new User(packet.d.user, this.client)
    });
    return;
  }

}

module.exports = GuildMemberRemove;
