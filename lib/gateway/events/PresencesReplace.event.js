const EventCursor = require('../../util/EventCursor');
class PresencesReplace extends EventCursor {
  constructor(data, client, shardController) {
    super('PRESENCES_REPLACE', data, data, client, shardController);
  }

  onEvent(packet) {
    for (const presence of packet.d) {
      const guild = this.client.guilds.get(presence.guild_id);
      if (!guild) {
        this.shardController.emit('debug', 'Rogue presences replace: ' + JSON.stringify(presence), this.shardController.id);
        continue;
      }
      const member = guild.members.get(presence.user.id);
      if (!member && presence.user.username) {
        presence.id = presence.user.id;
        member.update(presence);
      }
    }
    return;
  }
}

module.exports = PresencesReplace;
