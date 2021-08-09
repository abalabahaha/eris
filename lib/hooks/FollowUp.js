

class FollowUp {
  constructor(client, interaction) {
    this.client = client;
    this.interaction = interaction;
  }

  createMessage(content, file) {
    if (typeof content === 'string') {
      // eslint-disable-next-line object-shorthand
      const data = {
        content: content
      };
      if (!(this.ephemeral === 0)) {
        data.ephemeral = this.ephemeral;
      }
      if (typeof file !== 'undefined') {
        return this.client.responseToAnInteractionWithFile(this.interaction.id, this.interaction.token, data, file);
      }
      return this.client.responseToAnInteraction(this.interaction.id, this.interaction.token, this.interaction.applicationID, data);
    }
    if (typeof content === 'object') {
      if (!(this.ephemeral === 0)) {
        content.ephemeral = this.ephemeral;
      }
    }
    if (file !== undefined) {
      return this.client.responseToAnInteractionWithFile(this.interaction.id, this.interaction.token, content, file);
    }
    return this.client.responseToAnInteraction(this.interaction.id, this.interaction.token, this.interaction.applicationID, content);
  }
  deleteMessage() {
    return this.client.responseToAnInteraction_Delete(this.interaction.id, this.interaction.token);
  }
  editMessage(content, file) {
    if (typeof content === 'string') {
      // eslint-disable-next-line object-shorthand
      const data = {
        content: content
      };
      if (!(this.ephemeral === 0)) {
        data.ephemeral = this.ephemeral;
      }
      if (typeof file !== 'undefined') {
        return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.id, this.interaction.token, this.interaction.message.id, this.interaction.applicationID, file);
      }
      return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.id, this.interaction.token, this.interaction.message.id, this.interaction.applicationID, data);
    }
    if (typeof content === 'object') {
      if (!(this.ephemeral === 0)) {
        content.ephemeral = this.ephemeral;
      }
    }
    if (file !== undefined) {
      return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.id, this.interaction.token, this.interaction.message.id, this.interaction.applicationID, content, file);
    }
    return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.id, this.interaction.token, this.interaction.message.id, this.interaction.applicationID, content);
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

module.exports = FollowUp;
