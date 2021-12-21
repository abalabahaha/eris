class EventCursor {
  constructor(eventName = 'eventUnknown', data = {}, options = {}, client, shardController) {
    this.eventName = eventName ?? 'eventUnknown';
    this.disabled = false;
    this.data = data;
    this.client = client;
    this.options = options ?? {};
    this.shardController = shardController;
  }

  // eslint-disable-next-line no-unused-vars
  onEvent(_packet) { }
}

module.exports = EventCursor;
