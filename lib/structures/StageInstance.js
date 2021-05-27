"use strict";

const Base = require("./Base");

/**
* Represents a stage instance
* @prop {StageChannel} channel The associated stage channel
* @prop {Guild} guild The guild of the associated stage channel
* @prop {String} id The ID of the stage instance
* @prop {String} topic The stage instance topic
*/
class StageInstance extends Base {
    constructor(data, client) {
        super(data.id);
        this.client = client;
        this.channel = client.getChannel(data.channel_id) || {id: data.channel_id};
        this.guild = client.guilds.get(data.guild_id) || {id: data.guild_id};
        this.topic = data.topic;
    }

    /**
    * Delete this stage instance
    * @returns {Promise}
    */
    delete() {
        return this.client.deleteStageInstance.call(this.client, this.channel.id);
    }

    /**
    * Update this stage instance
    * @arg {Object} options The properties to edit
    * @arg {String} options.topic The stage instance topic
    * @returns {Promise<StageInstance>}
    */
    edit(options) {
        return this.client.editStageInstance.call(this.client, options);
    }
}

module.exports = StageInstance;
