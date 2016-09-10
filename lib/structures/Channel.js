"use strict";

/**
* Represents a channel
* @prop {String} id The ID of the channel
* @prop {Number} createdAt Timestamp of channel creation
*/
class Channel {
    constructor(data) {
        this.id = data.id;
        this.createdAt = (this.id / 4194304) + 1420070400000;
        this.type = data.type;
    }

    /**
    * Send typing status in a text channel
    * @returns {Promise}
    */
    sendTyping() {
        return (this.client || this.guild.shard.client).sendChannelTyping.apply((this.client || this.guild.shard.client), [this.id].concat(arguments));
    }

    /**
    * Get a previous message in a text channel
    * @arg {String} messageID The ID of the message
    * @returns {Promise<Message>}
    */
    getMessage() {
        return (this.client || this.guild.shard.client).getMessage.apply((this.client || this.guild.shard.client), [this.id].concat(arguments));
    }

    /**
    * Get a previous message in a text channel
    * @arg {Number} [limit=50] The max number of messages to get (maximum 100)
    * @arg {String} [before] Get messages before this message ID
    * @arg {String} [after] Get messages after this message ID
    * @arg {String} [around] Get messages around this message ID (does not work with limit > 100)
    * @returns {Promise<Message[]>}
    */
    getMessages() {
        return (this.client || this.guild.shard.client).getMessages.apply((this.client || this.guild.shard.client), [this.id].concat(arguments));
    }

    /**
    * Get all the pins in a text channel
    * @returns {Promise<Message[]>}
    */
    getPins() {
        return (this.client || this.guild.shard.client).getPins.apply((this.client || this.guild.shard.client), [this.id].concat(arguments));
    }

    /**
    * Create a message in a text channel
    * Note: If you want to DM someone, the user ID is <b>not</b> the DM channel ID. use Client.getDMChanne() to get the DM channel ID for a user
    * @arg {String | Object} content A string or object. If an object is passed:
    * @arg {String} content.content A content string
    * @arg {Boolean} [content.tts] Set the message TTS flag
    * @arg {Boolean} [content.disableEveryone] Whether to filter @everyone/@here or not (overrides default)
    * @arg {Object} [file] A file object
    * @arg {String} file.file A readable stream or buffer
    * @arg {String} file.name What to name the file
    * @returns {Promise<Message>}
    */
    createMessage() {
        return (this.client || this.guild.shard.client).createMessage.apply((this.client || this.guild.shard.client), [this.id].concat(arguments));
    }

    /**
    * Edit a message
    * @arg {String} messageID The ID of the message
    * @arg {String} content The updated message content
    * @arg {Boolean} [disableEveryone] Whether to filter @everyone/@here or not (overrides default)
    * @returns {Promise<Message>}
    */
    editMessage() {
        return (this.client || this.guild.shard.client).editMessage.apply((this.client || this.guild.shard.client), [this.id].concat(arguments));
    }

    /**
    * Pin a message
    * @arg {String} messageID The ID of the message
    * @returns {Promise}
    */
    pinMessage() {
        return (this.client || this.guild.shard.client).pinMessage.apply((this.client || this.guild.shard.client), [this.id].concat(arguments));
    }

    /**
    * Unpin a message
    * @arg {String} messageID The ID of the message
    * @returns {Promise}
    */
    unpinMessage() {
        return (this.client || this.guild.shard.client).unpinMessage.apply((this.client || this.guild.shard.client), [this.id].concat(arguments));
    }

    /**
    * Delete a message
    * @arg {String} messageID The ID of the message
    * @returns {Promise}
    */
    deleteMessage() {
        return (this.client || this.guild.shard.client).deleteMessage.apply((this.client || this.guild.shard.client), [this.id].concat(arguments));
    }

    /**
    * Bulk delete messages (bot accounts only)
    * @arg {String[]} messageIDs Array of message IDs to delete
    * @returns {Promise}
    */
    deleteMessages() {
        return (this.client || this.guild.shard.client).deleteMessages.apply((this.client || this.guild.shard.client), [this.id].concat(arguments));
    }

    /**
    * Purge previous messages in the channel with an optional filter (bot accounts only)
    * @arg {Number} limit The max number of messages to search through, -1 for no limit
    * @arg {function} [filter] Optional filter function that returns a boolean when passed a Message object
    * @arg {String} [before] Get messages before this message ID
    * @arg {String} [after] Get messages after this message ID
    * @returns {Promise<Number>} Resolves with the number of messages deleted
    */
    purge() {
        return (this.client || this.guild.shard.client).purgeChannel.apply((this.client || this.guild.shard.client), [this.id].concat(arguments));
    }
}

module.exports = Channel;