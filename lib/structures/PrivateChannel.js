"use strict";

const Channel = require("./Channel");
const Collection = require("../util/Collection");
const Endpoints = require("../rest/Endpoints");
const Message = require("./Message");
const {GatewayOPCodes, ChannelTypes} = require("../Constants");
const User = require("./User");

/**
* Represents a private channel. See Channel for more properties and methods.
* @extends Channel
* @prop {String} lastMessageID The ID of the last message in this channel
* @prop {Collection<Message>} messages Collection of Messages in this channel
* @prop {User} recipient The recipient in this private channel (private channels only)
*/
class PrivateChannel extends Channel {
    constructor(data, client) {
        super(data, client);
        this.lastMessageID = data.last_message_id;
        this.rateLimitPerUser = data.rate_limit_per_user;
        this.call = this.lastCall = null;
        if(this.type === ChannelTypes.DM || this.type === undefined) {
            this.recipient = new User(data.recipients[0], client);
        }
        this.messages = new Collection(Message, client.options.messageLimit);
    }

    /**
    * Add a reaction to a message
    * @arg {String} messageID The ID of the message
    * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
    * @arg {String} [userID="@me"] The ID of the user to react as. Passing this parameter is deprecated and will not be supported in future versions.
    * @returns {Promise}
    */
    addMessageReaction(messageID, reaction, userID) {
        return this.client.addMessageReaction.call(this.client, this.id, messageID, reaction, userID);
    }

    /**
    * Create a message in a text channel
    * Note: If you want to DM someone, the user ID is **not** the DM channel ID. use Client.getDMChannel() to get the DM channel ID for a user
    * @arg {String | Object} content A string or object. If an object is passed:
    * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {Boolean} [options.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to
    * @arg {String} content.content A content string
    * @arg {Object} [content.embed] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {String} [content.messageReferenceID] The ID of the message should be replied to. The reference message cannot be a system message.
    * @arg {Boolean} [content.tts] Set the message TTS flag
    * @arg {Object} [file] A file object
    * @arg {Buffer} file.file A buffer containing file data
    * @arg {String} file.name What to name the file
    * @returns {Promise<Message>}
    */
    createMessage(content, file) {
        return this.client.createMessage.call(this.client, this.id, content, file);
    }

    /**
    * Delete a message
    * @arg {String} messageID The ID of the message
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    deleteMessage(messageID, reason) {
        return this.client.deleteMessage.call(this.client, this.id, messageID, reason);
    }

    /**
    * Edit a message
    * @arg {String} messageID The ID of the message
    * @arg {String | Array | Object} content A string, array of strings, or object. If an object is passed:
    * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {String} content.content A content string
    * @arg {Boolean} [content.disableEveryone] Whether to filter @everyone/@here or not (overrides default)
    * @arg {Object} [content.embed] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Number} [content.flags] A number representing the flags to apply to the message. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#message-object-message-flags) for flags reference
    * @returns {Promise<Message>}
    */
    editMessage(messageID, content) {
        return this.client.editMessage.call(this.client, this.id, messageID, content);
    }

    /**
    * Get a previous message in a text channel
    * @arg {String} messageID The ID of the message
    * @returns {Promise<Message>}
    */
    getMessage(messageID) {
        return this.client.getMessage.call(this.client, this.id, messageID);
    }

    /**
    * Get a list of users who reacted with a specific reaction
    * @arg {String} messageID The ID of the message
    * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
    * @arg {Number} [limit=100] The maximum number of users to get
    * @arg {String} [before] Get users before this user ID
    * @arg {String} [after] Get users after this user ID
    * @returns {Promise<Array<User>>}
    */
    getMessageReaction(messageID, reaction, limit, before, after) {
        return this.client.getMessageReaction.call(this.client, this.id, messageID, reaction, limit, before, after);
    }

    /**
    * Get a previous message in a text channel
    * @arg {Number} [limit=50] The max number of messages to get
    * @arg {String} [before] Get messages before this message ID
    * @arg {String} [after] Get messages after this message ID
    * @arg {String} [around] Get messages around this message ID (does not work with limit > 100)
    * @returns {Promise<Array<Message>>}
    */
    getMessages(limit, before, after, around) {
        return this.client.getMessages.call(this.client, this.id, limit, before, after, around);
    }

    /**
    * Get all the pins in a text channel
    * @returns {Promise<Array<Message>>}
    */
    getPins() {
        return this.client.getPins.call(this.client, this.id);
    }

    /**
    * Leave the channel
    * @returns {Promise}
    */
    leave() {
        return this.client.deleteChannel.call(this.client, this.id);
    }

    /**
    * Pin a message
    * @arg {String} messageID The ID of the message
    * @returns {Promise}
    */
    pinMessage(messageID) {
        return this.client.pinMessage.call(this.client, this.id, messageID);
    }

    /**
    * Remove a reaction from a message
    * @arg {String} messageID The ID of the message
    * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
    * @arg {String} [userID="@me"] The ID of the user to remove the reaction for. Passing this parameter is deprecated and will not be supported in future versions.
    * @returns {Promise}
    */
    removeMessageReaction(messageID, reaction, userID) {
        if(userID !== undefined) {
            this.emit("warn", "[DEPRECATED] removeMessageReaction() was called on a PrivateChannel with a `userID` argument");
        }
        return this.client.removeMessageReaction.call(this.client, this.id, messageID, reaction, userID);
    }


    /**
    * [USER ACCOUNT] Ring fellow group channel recipient(s)
    * @arg {Array<String>} recipients The IDs of the recipients to ring
    */
    ring(recipients) {
        this.client.requestHandler.request("POST", Endpoints.CHANNEL_CALL_RING(this.id), true, {
            recipients
        });
    }

    /**
    * Send typing status in a text channel
    * @returns {Promise}
    */
    sendTyping() {
        return this.client.sendChannelTyping.call(this.client, this.id);
    }

    /**
    * Check if the channel has an existing call
    */
    syncCall() {
        this.client.shards.values().next().value.sendWS(GatewayOPCodes.SYNC_CALL, {
            channel_id: this.id
        });
    }

    /**
    * Unpin a message
    * @arg {String} messageID The ID of the message
    * @returns {Promise}
    */
    unpinMessage(messageID) {
        return this.client.unpinMessage.call(this.client, this.id, messageID);
    }

    /**
    * Un-send a message. You're welcome Programmix
    * @arg {String} messageID The ID of the message
    * @returns {Promise}
    */
    unsendMessage(messageID) {
        return this.client.deleteMessage.call(this.client, this.id, messageID);
    }

    toJSON(props = []) {
        return super.toJSON([
            "call",
            "lastCall",
            "lastMessageID",
            "messages",
            "recipient",
            ...props
        ]);
    }
}

module.exports = PrivateChannel;
