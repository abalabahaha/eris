const EventCursor = require('../../util/EventCursor');

class FriendSuggestionDelete extends EventCursor {
  constructor(data, client, shardController) {
    super('FRIEND_SUGGESTION_DELETE', data, data, client, shardController);
  }

  onEvent(packet) {
    /**
         * Fired when a client's friend suggestion is removed for any reason
         * @event Client#friendSuggestionDelete
         * @prop {User} user The suggested user
         */
    this.shardController.emit('friendSuggestionDelete', this.client.users.get(packet.d.suggested_user_id));
    return;
  }
}

module.exports = FriendSuggestionDelete;
