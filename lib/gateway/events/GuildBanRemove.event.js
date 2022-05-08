const EventCursor = require('../../util/EventCursor');
class GuildBanRemove extends EventCursor {
  constructor(data, client, shardController) {
    super('GUILD_BAN_REMOVE', data, data, client, shardController);
  }

  onEvent(packet) {
    /**
        * Fired when a user is unbanned from a guild
        * @event Client#guildBanRemove
        * @prop {Guild} guild The guild
        * @prop {User} user The banned user
        */
    this.shardController.emit('guildBanRemove', this.client.guilds.get(packet.d.guild_id), this.client.users.update(packet.d.user, this.client));
    return;
  }
}

module.exports = GuildBanRemove;
