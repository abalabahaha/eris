class DeferInteraction  {
  constructor(client, interaction) {
    this.client = client;
    this.interaction = interaction;
    this.ephemeral = 0;
  }
  deferEditMessage(content, file) {
    if (typeof content === 'string') {
      // eslint-disable-next-line object-shorthand
      const data = {
        content: content
      };
      if (!(this.ephemeral === 0)) {
        data.ephemeral = this.ephemeral;
      }
      if (typeof file !== 'undefined') {
        return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.token, data, file, this.interaction);
      }
      return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.token, data, file, this.interaction);
    }
    if (typeof content === 'object') {
      if (!(this.ephemeral === 0)) {
        content.ephemeral = this.ephemeral;
      }
    }
    if (file !== undefined) {
      return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.token,  content, file, this.interaction);
    }
    return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.token,  content, undefined, this.interaction);
  }
  deferEdit(content, file, type) {
    if (typeof content === 'string') {
      // eslint-disable-next-line object-shorthand
      const data = {
        content: content
      };
      if (!(this.ephemeral === 0)) {
        data.ephemeral = this.ephemeral;
      }
      if (typeof file !== 'undefined') {
        return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.token, data, file, this.interaction);
      }
      return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.token, data, file, this.interaction);
    }
    if (typeof content === 'object') {
      if (!(this.ephemeral === 0)) {
        content.ephemeral = this.ephemeral;
      }
    }
    if (file !== undefined) {
      return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.token,  content, file, this.interaction);
    }
    return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.token,  content, undefined, this.interaction);
  }
  deferDeleteMessage() {
    this.client.deleteFollowUpMessage(this.interaction.applicationID, this.interaction.token, this.interaction);
    return this.interaction.message;
  }
  sendPingInteraction() {
    let ephemeral = false;
    if (this.ephemeral === 0) {
      ephemeral = false;
    } else {
      ephemeral = true;
    }
    try {
      return this.client.sendPingInteraction(this.interaction.id, this.interaction.token, ephemeral);
    } catch (error) {
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

module.exports = DeferInteraction;
