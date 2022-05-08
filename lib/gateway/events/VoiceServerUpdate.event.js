const EventCursor = require('../../util/EventCursor');
class VoiceServerUpdate extends EventCursor {
  constructor(data, client, shardController) {
    super('VOICE_SERVER_UPDATE', data, data, client, shardController);
  }

  onEvent(packet) {
    packet.d.session_id = this.shardController.sessionID;
    packet.d.user_id = this.client.user.id;
    packet.d.shard = this.shardController;
    this.client.voiceConnections.voiceServerUpdate(packet.d);
    return;
  }
}

module.exports = VoiceServerUpdate;
