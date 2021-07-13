"use strict";

const Base = require("./Base");

/**
* Represents a stage instance
* @prop {StageChannel} channel The associated stage channel
* @prop {Boolean} discoverableDisabled Whether or not stage discovery is disabled
* @prop {Guild} guild The guild of the associated stage channel
* @prop {String} id The ID of the stage instance
* @prop {Number} privacyLevel The privacy level of the stage instance. 1 is public, 2 is guild only
* @prop {String} topic The stage instance topic
*/
class StageInstance extends Base {
    constructor(data, client) {
        super(data.id);
        this._client = client;
        this.channel = client.getChannel(data.channel_id) || {id: data.channel_id};
        this.guild = client.guilds.get(data.guild_id) || {id: data.guild_id};
        this.update(data);
    }

    update(data) {
        if(data.discoverable_disabled !== undefined) {
            this.discoverableDisabled = data.discoverable_disabled;
        }
        if(data.privacy_level !== undefined) {
            this.privacyLevel = data.privacy_level;
        }
        if(data.topic !== undefined) {
            this.topic = data.topic;
        }
    }

    /**
    * Delete this stage instance
    * @returns {Promise}
    */
    delete() {
        return this._client.deleteStageInstance.call(this._client, this.channel.id);
    }

    /**
    * Update this stage instance
    * @arg {Object} options The properties to edit
    * @arg {Number} [options.privacyLevel] The privacy level of the stage instance. 1 is public, 2 is guild only
    * @arg {String} [options.topic] The stage instance topic
    * @returns {Promise<StageInstance>}
    */
    edit(options) {
        return this._client.editStageInstance.call(this._client, this.channel.id, options);
    }
}

module.exports = StageInstance;
