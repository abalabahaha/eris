const EventCursor = require('../../util/EventCursor');
class GuildCreate extends EventCursor {
  constructor(data, client, shardController) {
    super('GUILD_MEMBER_REMOVE', data, data, client, shardController);
  }

  onEvent(packet) {
    if (!packet.d.unavailable) {
      const guild = this.shardController.createGuild(packet.d);
      if (this.shardController.ready) {
        if (this.client.unavailableGuilds.remove(packet.d)) {
          /**
           * Fired when a guild becomes available
           * @event Client#guildAvailable
           * @prop {Guild} guild The guild
           */
          this.shardController.emit('guildAvailable', guild);
        } else {
          /**
           * Fired when a guild is created. This happens when:
           * - the client creates a guild
           * - the client joins a guild
           * @event Client#guildCreate
           * @prop {Guild} guild The guild
           */
          this.shardController.emit('guildCreate', guild);
        }
      } else {
        this.client.unavailableGuilds.remove(packet.d);
        this.shardController.restartGuildCreateTimeout();
      }
    } else {
      this.client.guilds.remove(packet.d);
      /**
       * Fired when an unavailable guild is created
       * @event Client#unavailableGuildCreate
       * @prop {UnavailableGuild} guild The unavailable guild
       */
      this.shardController.emit('unavailableGuildCreate', this.client.unavailableGuilds.add(packet.d, this.client));
    }
    return;
  }
}

module.exports = GuildCreate;
