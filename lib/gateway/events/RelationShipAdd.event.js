const EventCursor = require('../../util/EventCursor');
class RelationShipAdd extends EventCursor {
  constructor(data, client, shardController) {
    super('RELATION_SHIP_ADD', data, data, client, shardController);
  }

  onEvent(packet) {
    if (this.client.bot) {
      return;
    }
    const relationship = this.client.relationships.get(packet.d.id);
    if (relationship) {
      const oldRelationship = {
        type: relationship.type
      };
      /**
       * Fired when a relationship is updated
       * @event Client#relationshipUpdate
       * @prop {Relationship} relationship The relationship
       * @prop {Object} oldRelationship The old relationship data
       * @prop {Number} oldRelationship.type The old type of the relationship
       */
      this.shardController.emit('relationshipUpdate', this.client.relationships.update(packet.d), oldRelationship);
    } else {
      /**
       * Fired when a relationship is added
       * @event Client#relationshipAdd
       * @prop {Relationship} relationship The relationship
       */
      this.shardController.emit('relationshipAdd', this.client.relationships.add(packet.d, this.client));
    }
    return;
  }
}

module.exports = RelationShipAdd;
