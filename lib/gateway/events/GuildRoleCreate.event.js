const EventCursor = require('../../util/EventCursor');
class GuildRoleCreate extends EventCursor {
  constructor(data, client, shardController) {
    super('GUILD_ROLE_CREATE', data, data, client, shardController);
  }

  onEvent(packet) {
    /**
        * Fired when a guild role is created
        * @event Client#guildRoleCreate
        * @prop {Guild} guild The guild
        * @prop {Role} role The role
        */
    const guild = this.client.guilds.get(packet.d.guild_id);
    if (!guild) {
      this.shardController.emit('debug', `Missing guild ${packet.d.guild_id} in GUILD_ROLE_CREATE`);
      return;
    }
    this.shardController.emit('guildRoleCreate', guild, guild.roles.add(packet.d.role, guild));
    return;
  }
}

module.exports = GuildRoleCreate;
