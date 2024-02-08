"use strict";

const TextChannel = require("./TextChannel");

/**
 * Represents a guild news channel. See TextChannel for more properties and methods
 * @extends TextChannel
 */
class NewsChannel extends TextChannel {
    update(data) {
        super.update(data);
    }

    /**
     * Crosspost (publish) a message to subscribed channels
     * @arg {String} messageID The ID of the message
     * @returns {Promise<Message>}
     */
    crosspostMessage(messageID) {
        return this._client.crosspostMessage.call(this._client, this.id, messageID);
    }

    /**
     * Follow this channel in another channel. This creates a webhook in the target channel
     * @arg {String} webhookChannelID The ID of the target channel
     * @returns {Object} An object containing this channel's ID and the new webhook's ID
     */
    follow(webhookChannelID) {
        return this._client.followChannel.call(this._client, this.id, webhookChannelID);
    }
}

module.exports = NewsChannel;
