"use strict";

const VoiceChannel = require("./VoiceChannel");

/**
* Represents a guild stage channel. See VoiceChannel for more properties and methods.
* @extends VoiceChannel
* @prop {String?} topic The topic of the channel
*/
class StageChannel extends VoiceChannel {
    update(data) {
        super.update(data);
        if(data.topic !== undefined) {
            this.topic = data.topic;
        }
    }

    /**
    * Create a stage instance
    * @arg {Object} options The stage instance options
    * @arg {Number} [options.privacyLevel] The privacy level of the stage instance. 1 is public, 2 is guild only
    * @arg {String} options.topic The stage instance topic
    * @returns {Promise<StageInstance>}
    */
    createInstance(options) {
        return this.client.createStageInstance.call(this.client, this.id, options);
    }

    /**
    * Delete the stage instance for this channel
    * @returns {Promise}
    */
    deleteInstance() {
        return this.client.deleteStageInstance.call(this.client, this.id);
    }

    /**
    * Update the stage instance for this channel
    * @arg {Object} options The properties to edit
    * @arg {Number} [options.privacyLevel] The privacy level of the stage instance. 1 is public, 2 is guild only
    * @arg {String} [options.topic] The stage instance topic
    * @returns {Promise<StageInstance>}
    */
    editInstance(options) {
        return this.client.editStageInstance.call(this.client, this.id, options);
    }

    /**
    * Get the stage instance for this channel
    * @returns {Promise<StageInstance>}
    */
    getInstance() {
        return this.client.getStageInstance.call(this.client, this.id);
    }

    toJSON(props = []) {
        return super.toJSON([
            "topic",
            ...props
        ]);
    }
}

module.exports = StageChannel;
