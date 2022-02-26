const EventEmitter = require('events');

class DeferInteraction extends EventEmitter  {
  constructor(client, interaction) {
    super();
    this.client = client;
    this.interaction = interaction;
    this.ephemeral = 0;
  }

  /**
   *
   * @param type
   * @returns {boolean|*}
   */
  async callbackDeferInteraction(data) {
    try {
      const time_a = Date.now();
      const returns = await this.client.callbackInteraction(this.interaction.id, this.interaction.token, data);
      const time_b = Date.now();
      const time = time_a - time_b;
      this.emit('typeInteraction', { returns, data, time });
      this.interaction.emit('typeInteraction', { returns, data, time });
      return returns;
    } catch (error) {
      throw Error(error);
    }
  }
  deferDeleteMessage() {
    this.client.deleteFollowUpMessage(this.interaction.applicationID, this.interaction.token, this.interaction);
    this.emit('deleteInteraction', true);
    this.interaction.emit('deleteInteraction', true);
    return this.interaction.message;
  }
  /**
   *
   * @param content
   * @param file
   * @param type
   * @returns {Promise<MessageInteraction>}
   */
  async deferEdit(content, file) {
    if (typeof content === 'string') {
      // eslint-disable-next-line object-shorthand
      const data = {
        content: content
      };
      if (typeof file !== 'undefined') {
        data.file = file;
        this.emit('deferEditInteraction', { data, file });
        this.interaction.emit('deferEditInteraction', { data, file });
        return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.token, data, file, this.interaction);
      }
      return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.token, data, undefined, this.interaction);
    }
    if (content.file !== undefined) {
      this.emit('deferEditInteraction', { content });
      this.interaction.emit('deferEditInteraction', { content });
      return this.client.editFollowUpMessage(this.interaction.applicationID,  this.interaction.token, content, content.file, this.interaction);
    }
    if (file !== undefined) {
      content.file = file;
      this.emit('deferEditInteraction', { content, file });
      this.interaction.emit('deferEditInteraction', { content, file });
      return this.client.editFollowUpMessage(this.interaction.applicationID,  this.interaction.token, content, content.file, this.interaction);
    }
    this.emit('deferEditInteraction', { content });
    this.interaction.emit('deferEditInteraction', { content });
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
        this.emit('deferEditMessageInteraction', { content, file });
        this.interaction.emit('deferEditMessageInteraction', { content, file });
        return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.token, data, file, this.interaction);
      }
      this.emit('deferEditMessageInteraction', { content });
      this.interaction.emit('deferEditMessageInteraction', { content });
      return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.token, data, undefined, this.interaction);
    }
    if (content.file !== undefined) {
      this.emit('deferEditMessageInteraction', { content });
      this.interaction.emit('deferEditMessageInteraction', { content });
      return this.client.editFollowUpMessage(this.interaction.applicationID,  this.interaction.token, content, content.file, this.interaction);
    }
    if (file !== undefined) {
      content.file = file;
      this.emit('deferEditMessageInteraction', { content });
      this.interaction.emit('deferEditMessageInteraction', { content });
      return this.client.editFollowUpMessage(this.interaction.applicationID,  this.interaction.token, content, content.file, this.interaction);
    }
    this.emit('deferEditMessageInteraction', { content });
    this.interaction.emit('deferEditMessageInteraction', { content });
    return this.client.editFollowUpMessage(this.interaction.applicationID, this.interaction.token, content, undefined, this.interaction);
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
