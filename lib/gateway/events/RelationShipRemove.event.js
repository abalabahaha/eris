const EventCursor = require('../../util/EventCursor');
class RelationShipRemove extends EventCursor {
  constructor(data, client, shardController) {
    super('RELATION_SHIP_REMOVE', data, data, client, shardController);
  }

  onEvent(packet) {
    if (this.client.bot) {
      return;
    }
    /**
     * Fired when a relationship is removed
     * @event Client#relationshipRemove
     * @prop {Relationship} relationship The relationship
     */
    this.shardController.emit('relationshipRemove', this.client.relationships.remove(packet.d));
    return;
  }

}

module.exports = RelationShipRemove;
