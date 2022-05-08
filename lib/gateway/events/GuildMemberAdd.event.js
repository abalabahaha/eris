const EventCursor = require('../../util/EventCursor');
class GuildMemberAdd extends EventCursor {
  constructor(data, client, shardController) {
    super('GUILD_MEMBER_ADD', data, data, client, shardController);
  }

  onEvent(packet) {
    const guild = this.client.guilds.get(packet.d.guild_id);
    if (!guild) { // Eventual Consistency™ (╯°□°）╯︵ ┻━┻
      this.shardController.emit('debug', `Missing guild ${packet.d.guild_id} in GUILD_MEMBER_ADD`);
      return;
    }
    packet.d.id = packet.d.user.id;
    ++guild.memberCount;
    /**
     * Fired when a member joins a server
     * @event Client#guildMemberAdd
     * @prop {Guild} guild The guild
     * @prop {Member} member The member
     */
    this.shardController.emit('guildMemberAdd', guild, guild.members.add(packet.d, guild));
    return;
  }
}

module.exports = GuildMemberAdd;
