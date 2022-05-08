const EventCursor = require('../../util/EventCursor');
class GuildEmojisUpdate extends EventCursor {
  constructor(data, client, shardController) {
    super('GUILD_EMOJIS_UPDATE', data, data, client, shardController);
  }

  onEvent(packet) {
    const guild = this.client.guilds.get(packet.d.guild_id);
    let oldEmojis = null;
    let emojis = packet.d.emojis;
    if (guild) {
      oldEmojis = guild.emojis;
      guild.update(packet.d);
      emojis = guild.emojis;
    }
    /**
     * Fired when a guild's emojis are updated
     * @event Client#guildEmojisUpdate
     * @prop {Guild} guild The guild. If the guild is uncached, this is an object with an ID key. No other property is guaranteed
     * @prop {Array} emojis The updated emojis of the guild
     * @prop {Array?} oldEmojis The old emojis of the guild. If the guild is uncached, this will be null
     */
    this.shardController.emit('guildEmojisUpdate', guild || { id: packet.d.guild_id }, emojis, oldEmojis);
    return;
  }
}

module.exports = GuildEmojisUpdate;
