const EventCursor = require('../../util/EventCursor');
class GuildRoleUpdate extends EventCursor {
  constructor(data, client, shardController) {
    super('GUILD_ROLE_UPDATE', data, data, client, shardController);
  }

  onEvent(packet) {
    const guild = this.client.guilds.get(packet.d.guild_id);
    if (!guild) {
      this.shardController.emit('debug', `Guild ${packet.d.guild_id} undefined in GUILD_ROLE_UPDATE`);
      return;
    }
    const role = guild.roles.add(packet.d.role, guild);
    if (!role) {
      this.shardController.emit('debug', `Role ${packet.d.role} in guild ${packet.d.guild_id} undefined in GUILD_ROLE_UPDATE`);
      return;
    }
    const oldRole = {
      color: role.color,
      hoist: role.hoist,
      managed: role.managed,
      mentionable: role.mentionable,
      name: role.name,
      permissions: role.permissions,
      position: role.position,
      tags: role.tags
    };
    /**
     * Fired when a guild role is updated
     * @event Client#guildRoleUpdate
     * @prop {Guild} guild The guild
     * @prop {Role} role The updated role
     * @prop {Object} oldRole The old role data
     * @prop {Number} oldRole.color The hex color of the role in base 10
     * @prop {Boolean} oldRole.hoist Whether users with this role are hoisted in the user list or not
     * @prop {Boolean} oldRole.managed Whether a guild integration manages this role or not
     * @prop {Boolean} oldRole.mentionable Whether the role is mentionable or not
     * @prop {String} oldRole.name The name of the role
     * @prop {Permission} oldRole.permissions The permissions number of the role
     * @prop {Number} oldRole.position The position of the role
     * @prop {Object?} oldRole.tags The tags of the role
     */
    this.shardController.emit('guildRoleUpdate', guild, guild.roles.update(packet.d.role, guild), oldRole);
    return;
  }
}

module.exports = GuildRoleUpdate;
