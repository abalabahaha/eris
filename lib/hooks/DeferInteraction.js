class DeferInteraction  {
  constructor(client, interaction) {
    this.client = client;
    this.interaction = interaction;
    this.ephemeral = 0;
  }

  /**
   *
   * @param content
   * @param file
   * @param type
   * @returns {Promise<MessageInteraction>}
   */
  async deferEdit(content, file, type) {
    await this.sendTypeInteraction(type);
    if (typeof content === 'string') {
      // eslint-disable-next-line object-shorthand
      const data = {
        content: content
      };
      if (typeof file !== 'undefined') {
        data.file = file;
        return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.token, data, file, this.interaction);
      }
      return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.token, data, undefined, this.interaction);
    }
    if (content.file !== undefined) {
      return this.client.editFollowUpMessage(this.interaction.applicationID,  this.interaction.token, content, content.file, this.interaction);
    }
    if (file !== undefined) {
      content.file = file;
      return this.client.editFollowUpMessage(this.interaction.applicationID,  this.interaction.token, content, content.file, this.interaction);
    }
    return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.token, content, undefined, this.interaction);
  }
  /**
   *
   * @param content
   * @param file
   * @returns {Promise<MessageInteraction>}
   */
  deferEditMessage(content, file) {
    if (typeof content === 'string') {
      // eslint-disable-next-line object-shorthand
      const data = {
        content: content
      };
      if (typeof file !== 'undefined') {
        data.file = file;
        return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.token, data, file, this.interaction);
      }
      return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.token, data, undefined, this.interaction);
    }
    if (content.file !== undefined) {
      return this.client.editFollowUpMessage(this.interaction.applicationID,  this.interaction.token, content, content.file, this.interaction);
    }
    if (file !== undefined) {
      content.file = file;
      return this.client.editFollowUpMessage(this.interaction.applicationID,  this.interaction.token, content, content.file, this.interaction);
    }
    return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.token, content, undefined, this.interaction);
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

  /**
   *
   * @param type
   * @returns {boolean|*}
   */
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
