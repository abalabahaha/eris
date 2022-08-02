const Message = require('./Message');
const DeferInteraction = require('../hooks/DeferInteraction');

class MessageInteraction extends Message {
  constructor(data, client, interaction) {
    super(data, client);

    if (interaction !== undefined) {
      this.deferInteraction = new DeferInteraction(client, interaction);
    }
    if (data?.token !== undefined) {
      this.token = data.token;
    }
    if (data?.activity !== undefined) {
      this.activity = data?.activity;
    }
    if (data?.webhook_id !== undefined) {
      this.webhookID = data?.webhook_id;
    }
    if (data?.ephemeral !== undefined) {
      this.ephemeral = data?.ephemeral;
    } else {
      this.ephemeral = false;
    }
    if (data?.components !== undefined) {
      this.components = data.components;
    }
  }
}

module.exports = MessageInteraction;
