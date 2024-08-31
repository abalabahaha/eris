"use strict";

const VoiceChannel = require("./VoiceChannel");

/**
 * Represents a guild stage channel. See VoiceChannel for more properties and methods.
 * @extends VoiceChannel
 */
class StageChannel extends VoiceChannel {
  update(data) {
    super.update(data);
  }

  /**
   * Create a stage instance
   * @arg {Object} options The stage instance options
   * @arg {Number} [options.privacyLevel] The privacy level of the stage instance. 1 is public, 2 is guild only
   * @arg {String} options.topic The stage instance topic
   * @returns {Promise<StageInstance>}
   */
  createInstance(options) {
    return this._client.createStageInstance.call(this._client, this.id, options);
  }

  /**
   * Delete the stage instance for this channel
   * @returns {Promise}
   */
  deleteInstance() {
    return this._client.deleteStageInstance.call(this._client, this.id);
  }

  /**
   * Update the stage instance for this channel
   * @arg {Object} options The properties to edit
   * @arg {Number} [options.privacyLevel] The privacy level of the stage instance. 1 is public, 2 is guild only
   * @arg {String} [options.topic] The stage instance topic
   * @returns {Promise<StageInstance>}
   */
  editInstance(options) {
    return this._client.editStageInstance.call(this._client, this.id, options);
  }

  /**
   * Get the stage instance for this channel
   * @returns {Promise<StageInstance>}
   */
  getInstance() {
    return this._client.getStageInstance.call(this._client, this.id);
  }

  toJSON(props = []) {
    return super.toJSON([
      ...props,
    ]);
  }
}

module.exports = StageChannel;
