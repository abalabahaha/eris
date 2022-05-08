const EventCursor = require('../../util/EventCursor');
class UserNoteUpdate extends EventCursor {
  constructor(data, client, shardController) {
    super('USER_NOTE_UPDATE', data, data, client, shardController);
  }

  onEvent(packet) {
    if (packet.d.note) {
      this.client.notes[packet.d.id] = packet.d.note;
    } else {
      delete this.client.notes[packet.d.id];
    }
    return;
  }
}

module.exports = UserNoteUpdate;
