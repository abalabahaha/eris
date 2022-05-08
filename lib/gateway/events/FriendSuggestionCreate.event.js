const EventCursor = require('../../util/EventCursor');
const User = require('../../structures/User');
class FriendSuggestionCreate extends EventCursor {
  constructor(data, client, shardController) {
    super('FRIEND_SUGGESTION_CREATE', data, data, client, shardController);
  }

  onEvent(packet) {
    /**
        * Fired when a client receives a friend suggestion
        * @event Client#friendSuggestionCreate
        * @prop {User} user The suggested user
        * @prop {Array<String>} reasons Array of reasons why this suggestion was made
        * @prop {String} reasons.name Username of suggested user on that platform
        * @prop {String} reasons.platform_type Platform you share with the user
        * @prop {Number} reasons.type Type of reason?
        */
    this.shardController.emit('friendSuggestionCreate', new User(packet.d.suggested_user, this.client), packet.d.reasons);
    return;
  }
}

module.exports = FriendSuggestionCreate;
