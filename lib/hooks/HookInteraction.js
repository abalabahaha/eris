class HookInteraction {
  constructor(client, interaction) {
    this.interaction = interaction;
    this.components = [];
    this.client = client;
    this.sendPing = false;
    this.ephemeral = 0;
  }

  /**
   *
   * @param content
   * @param file
   * @returns {Promise<MessageInteraction>}
   */
  async createMessage(content, file) {
    if (!this.interaction.isHttp) {
      await this.sendPingInteraction().then((data) => {
        const components = [];
        this.components.forEach(({ value }) => {
          components.push(value.toData());
        });
        if (typeof content === 'string') {
          // eslint-disable-next-line object-shorthand
          const data = {
            content: content,
            components: components
          };
          if (typeof file !== 'undefined') {
            data.file = file;
            return this.client.createFollowUpMessage(this.interaction.applicationID, this.interaction.token, data, file, this.interaction);
          }
          return this.client.createFollowUpMessage(this.interaction.applicationID, this.interaction.token, data, undefined, this.interaction);
        }
        if (content.file !== undefined) {
          return this.client.createFollowUpMessage(this.interaction.applicationID,  this.interaction.token, content, content.file, this.interaction);
        }
        if (file !== undefined) {
          content.file = file;
          return this.client.createFollowUpMessage(this.interaction.applicationID,  this.interaction.token, content, content.file, this.interaction);
        }
        return this.client.createFollowUpMessage(this.interaction.applicationID, this.interaction.token, content, undefined, this.interaction);
      })
        .catch((error) => {
          throw error;
        });
    } else {
      const components = [];
      this.components.forEach(({ value }) => {
        components.push(value.toData());
      });
      if (typeof content === 'string') {
        // eslint-disable-next-line object-shorthand
        const data = {
          content: content,
          components: components
        };
        if (typeof file !== 'undefined') {
          data.file = file;
          return this.client.createFollowUpMessage(this.interaction.applicationID, this.interaction.token, data, file, this.interaction);
        }
        return this.client.createFollowUpMessage(this.interaction.applicationID, this.interaction.token, data, undefined, this.interaction);
      }
      if (content.file !== undefined) {
        return this.client.createFollowUpMessage(this.interaction.applicationID,  this.interaction.token, content, content.file, this.interaction);
      }
      if (file !== undefined) {
        content.file = file;
        return this.client.createFollowUpMessage(this.interaction.applicationID,  this.interaction.token, content, content.file, this.interaction);
      }
      return this.client.createFollowUpMessage(this.interaction.applicationID, this.interaction.token, content, undefined, this.interaction);
    }
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

  /**
   *
   * @param is
   * @returns {HookInteraction}
   */
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
