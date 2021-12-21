const EventCursor = require('../../util/EventCursor');
class GuildDelete extends EventCursor {
  constructor(data, client, shardController) {
    super('GUILD_DELETE', data, data, client, shardController);
  }

  onEvent(packet) {
    const voiceConnection = this.client.voiceConnections.get(packet.d.id);
    if (voiceConnection) {
      if (voiceConnection.channelID) {
        this.client.leaveVoiceChannel(voiceConnection.channelID);
      } else {
        this.client.voiceConnections.leave(packet.d.id);
      }
    }

    delete this.client.guildShardMap[packet.d.id];
    const guild = this.client.guilds.remove(packet.d);
    if (guild) { // Discord sends GUILD_DELETE for guilds that were previously unavailable in READY
      guild.channels.forEach((channel) => {
        delete this.client.channelGuildMap[channel.id];
      });
    }
    if (packet.d.unavailable) {
      /**
       * Fired when a guild becomes unavailable
       * @event Client#guildUnavailable
       * @prop {Guild} guild The guild
       */
      this.shardController.emit('guildUnavailable', this.client.unavailableGuilds.add(packet.d, this.client));
    } else {
      /**
       * Fired when a guild is deleted. This happens when:
       * - the client left the guild
       * - the client was kicked/banned from the guild
       * - the guild was literally deleted
       * @event Client#guildDelete
       * @prop {Guild | Object} guild The guild. If the guild was not cached, it will be an object with an `id` key. No other property is guaranteed
       */
      this.shardController.emit('guildDelete', guild || {
        id: packet.d.id
      });
    }
    return;
  }

}

module.exports = GuildDelete;
