const EventCursor = require('../../util/EventCursor');
class UserUpdate extends EventCursor {
  constructor(data, client, shardController) {
    super('VOICE_SERVER_UPDATE', data, data, client, shardController);
  }

  onEvent(packet) {
    const user = this.client.users.get(packet.d.id);
    const oldUser = {
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar
    };
    this.shardController.emit('userUpdate', user.update(packet.d), oldUser);
    return;
  }
}

module.exports = UserUpdate;
