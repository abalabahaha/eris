const EventCursor = require('../../util/EventCursor');
class UserGuildSettingsUpdate extends EventCursor {
  constructor(data, client) {
    super('USER_NOTE_UPDATE', data, data, client);
  }

  onEvent(packet) {
    this.client.userGuildSettings[packet.d.guild_id] = packet.d;
    return;
  }

}

module.exports = UserGuildSettingsUpdate;
