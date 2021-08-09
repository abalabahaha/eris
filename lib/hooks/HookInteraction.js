class HookInteraction {
  constructor(client, interaction) {
    this.interaction = interaction;
    this.client = client;
    this.sendPing = false;
    this.ephemeral = 0;
  }
  createMessage(content, file ) {
    if (this.sendPing === false) {
      this.sendPingInteraction();
    }
    if (typeof content === 'string') {
      // eslint-disable-next-line object-shorthand
      const data = {
        content: content
      };
      if (typeof file !== 'undefined') {
        return this.client.createFollowUpMessage(this.interaction.applicationID, this.interaction.token, data, file, this.interaction);
      }
      return this.client.createFollowUpMessage(this.interaction.applicationID, this.interaction.token, data, undefined, this.interaction);
    }
    if (file !== undefined) {
      return this.client.createFollowUpMessage(this.interaction.applicationID,  this.interaction.token, content, file, this.interaction);
    }
    return this.client.createFollowUpMessage(this.interaction.applicationID, this.interaction.token, content, undefined, this.interaction);
  }
  deleteMessage() {
    return this.client.deleteFollowUpMessage(this.interaction.id, this.interaction.token);
  }
  sendPingInteraction() {
    let ephemeral = false;
    if (this.ephemeral === 0) {
      ephemeral = false;
    } else {
      ephemeral = true;
    }
    try {
      this.sendPing = true;
      return this.client.sendPingInteraction(this.interaction.id, this.interaction.token, ephemeral);
    } catch (error) {
      this.sendPing = false;
      return false;
    }
  }
  sendTypeInteraction(type) {
    let ephemeral = false;
    if (this.ephemeral === 0) {
      ephemeral = false;
    } else {
      ephemeral = true;
    }
    try {
      return this.client.sendTypeInteraction(this.interaction.id, this.interaction.token, type, ephemeral);
    } catch (error) {
      return false;
    }
  }
  setEphemeral(is) {
    if (is === true) {
      this.ephemeral = 1 << 6;
    } else {
      this.ephemeral = 0;
    }
    return this;
  }
}

module.exports = HookInteraction;
