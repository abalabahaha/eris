const EventCursor = require('../../util/EventCursor');
class GuildRoleDelete extends EventCursor {
  constructor(data, client, shardController) {
    super('GUILD_ROLE_DELETE', data, data, client, shardController);
  }

  onEvent(packet) {
    /**
        * Fired when a guild role is deleted
        * @event Client#guildRoleDelete
        * @prop {Guild} guild The guild
        * @prop {Role} role The role
        */
    const guild = this.client.guilds.get(packet.d.guild_id);
    if (!guild) {
      this.shardController.emit('debug', `Missing guild ${packet.d.guild_id} in GUILD_ROLE_DELETE`);
      return;
    }
    if (!guild.roles.has(packet.d.role_id)) {
      this.shardController.emit('debug', `Missing role ${packet.d.role_id} in GUILD_ROLE_DELETE`);
      return;
    }
    this.shardController.emit('guildRoleDelete', guild, guild.roles.remove({ id: packet.d.role_id }));
    return;
  }
}

module.exports = GuildRoleDelete;
