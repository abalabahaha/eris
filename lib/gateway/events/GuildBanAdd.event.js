const EventCursor = require('../../util/EventCursor');
class GuildBanAdd extends EventCursor {
  constructor(data, client, shardController) {
    super('GUILD_BAN_ADD', data, data, client, shardController);
  }

  onEvent(packet) {
    /**
         * Fired when a user is banned from a guild
         * @event Client#guildBanAdd
         * @prop {Guild} guild The guild
         * @prop {User} user The banned user
         */
    this.shardController.emit('guildBanAdd', this.client.guilds.get(packet.d.guild_id), this.client.users.update(packet.d.user, this.client));
    return;
  }

}

module.exports = GuildBanAdd;
