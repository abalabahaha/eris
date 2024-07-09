"use strict";

const Collection = require("../util/Collection");
const GuildChannel = require("./GuildChannel");
const Message = require("./Message");

/**
 * Represents a textable guild channel. You also probably want to look at NewsChannel, StageChannel, TextChannel, ThreadChannel, and VoiceChannel. See GuildChannel for more properties
 * @prop {String?} lastMessageID The ID of the last message in the channel. This can be null if there has never been a message in the channel
 * @prop {Collection<Message>} messages Collection of Messages in this channel
 * @prop {Number} rateLimitPerUser The time in seconds a user has to wait before sending another message (0-21600) (does not affect bots or users with manageMessages/manageChannel permissions)
 */
class GuildTextableChannel extends GuildChannel {
    constructor(data, client, messageLimit) {
        super(data, client);
        this.messages = new Collection(Message, messageLimit == null ? client.options.messageLimit : messageLimit);
        this.lastMessageID = data.last_message_id || null;
        this.update(data);
    }

    update(data) {
        super.update(data);
        if(data.rate_limit_per_user !== undefined) {
            this.rateLimitPerUser = data.rate_limit_per_user;
        }
    }

    /**
     * Add a reaction to a message
     * @arg {String} messageID The ID of the message
     * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
     * @arg {String} [userID="@me"] The ID of the user to react as. Passing this parameter is deprecated and will not be supported in future versions.
     * @returns {Promise}
     */
    addMessageReaction(messageID, reaction, userID) {
        return this._client.addMessageReaction.call(this._client, this.id, messageID, reaction, userID);
    }

    /**
     * Create a message in the channel
     * @arg {String | Object} content A string or object. If an object is passed:
     * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
     * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here
     * @arg {Boolean} [content.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to
     * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow
     * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow
     * @arg {Array<Object>} [content.attachments] An array of attachment objects with the filename and description
     * @arg {String} [content.attachments[].description] The description of the file
     * @arg {String} [content.attachments[].filename] The name of the file
     * @arg {Number} content.attachments[].id The index of the file
     * @arg {Array<Object>} [content.components] An array of [component objects](https://discord.dev/interactions/message-components#component-object)
     * @arg {String} [content.content] A content string
     * @arg {Object} [content.embed] [DEPRECATED] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
     * @arg {Array<Object>} [content.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
     * @arg {Number} [content.flags] A number representing the [flags](https://discord.dev/resources/channel#message-object-message-flags) to apply to the message (only SUPPRESS_EMBEDS and SUPPRESS_NOTIFICATIONS)
     * @arg {Object} [content.messageReference] The message reference, used when replying to messages
     * @arg {String} [content.messageReference.channelID] The channel ID of the referenced message
     * @arg {Boolean} [content.messageReference.failIfNotExists=true] Whether to throw an error if the message reference doesn't exist. If false, and the referenced message doesn't exist, the message is created without a referenced message
     * @arg {String} [content.messageReference.guildID] The guild ID of the referenced message
     * @arg {String} content.messageReference.messageID The message ID of the referenced message. This cannot reference a system message
     * @arg {String} [content.messageReferenceID] [DEPRECATED] The ID of the message should be replied to. Use `messageReference` instead
     * @arg {String | Number} [content.nonce] A nonce value which will also appear in the messageCreate event
     * @arg {Array<String>} [content.stickerIDs] An array of IDs corresponding to stickers to send
     * @arg {Boolean} [content.tts] Set the message TTS flag
     * @arg {Object | Array<Object>} [file] A file object (or an Array of them)
     * @arg {Buffer} file.file A buffer containing file data
     * @arg {String} file.name What to name the file
     * @returns {Promise<Message>}
     */
    createMessage(content, file) {
        return this._client.createMessage.call(this._client, this.id, content, file);
    }

    /**
     * Delete a message
     * @arg {String} messageID The ID of the message
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise}
     */
    deleteMessage(messageID, reason) {
        return this._client.deleteMessage.call(this._client, this.id, messageID, reason);
    }

    /**
     * Bulk delete messages (bot accounts only)
     * @arg {Array<String>} messageIDs Array of message IDs to delete
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise}
     */
    deleteMessages(messageIDs, reason) {
        return this._client.deleteMessages.call(this._client, this.id, messageIDs, reason);
    }

    /**
     * Edit a message
     * @arg {String} messageID The ID of the message
     * @arg {String | Array | Object} content A string, array of strings, or object. If an object is passed:
     * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
     * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here
     * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow
     * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow
     * @arg {Array<Object>} [content.attachments] An array of attachment objects that will be appended to the message, including new files. Only the provided files will be appended
     * @arg {String} [content.attachments[].description] The description of the file
     * @arg {String} [content.attachments[].filename] The name of the file. This is not required if you are attaching a new file
     * @arg {Number | String} content.attachments[].id The ID of the file. If you are attaching a new file, this would be the index of the file
     * @arg {Array<Object>} [content.components] An array of [component objects](https://discord.dev/interactions/message-components#component-object)
     * @arg {String} [content.content] A content string
     * @arg {Object} [content.embed] [DEPRECATED] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
     * @arg {Array<Object>} [content.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
     * @arg {Object | Array<Object>} [content.file] A file object (or an Array of them)
     * @arg {Buffer} content.file[].file A buffer containing file data
     * @arg {String} content.file[].name What to name the file
     * @arg {Number} [content.flags] A number representing the flags to apply to the message. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#message-object-message-flags) for flags reference
     * @returns {Promise<Message>}
     */
    editMessage(messageID, content) {
        return this._client.editMessage.call(this._client, this.id, messageID, content);
    }

    /**
     * Get a previous message in the channel
     * @arg {String} messageID The ID of the message
     * @returns {Promise<Message>}
     */
    getMessage(messageID) {
        return this._client.getMessage.call(this._client, this.id, messageID);
    }

    /**
     * Get a list of users who reacted with a specific reaction
     * @arg {String} messageID The ID of the message
     * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
     * @arg {Object} [options] Options for the request. If this is a number, it is treated as `options.limit` ([DEPRECATED] behavior)
     * @arg {String} [options.after] Get users after this user ID
     * @arg {Number} [options.limit=100] The maximum number of users to get
     * @arg {String} [before] [DEPRECATED] Get users before this user ID. Discord no longer supports this parameter
     * @arg {String} [after] [DEPRECATED] Get users after this user ID
     * @returns {Promise<Array<User>>}
     */
    getMessageReaction(messageID, reaction, options, before, after) {
        return this._client.getMessageReaction.call(this._client, this.id, messageID, reaction, options, before, after);
    }

    /**
     * Get previous messages in the channel
     * @arg {Object} [options] Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
     * @arg {String} [options.after] Get messages after this message ID
     * @arg {String} [options.around] Get messages around this message ID (does not work with limit > 100)
     * @arg {String} [options.before] Get messages before this message ID
     * @arg {Number} [options.limit=50] The max number of messages to get
     * @arg {String} [before] [DEPRECATED] Get messages before this message ID
     * @arg {String} [after] [DEPRECATED] Get messages after this message ID
     * @arg {String} [around] [DEPRECATED] Get messages around this message ID (does not work with limit > 100)
     * @returns {Promise<Array<Message>>}
     */
    getMessages(options, before, after, around) {
        return this._client.getMessages.call(this._client, this.id, options, before, after, around);
    }

    /**
     * Purge previous messages in the channel with an optional filter
     * @arg {Object} options Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
     * @arg {String} [options.after] Get messages after this message ID
     * @arg {String} [options.before] Get messages before this message ID
     * @arg {Function} [options.filter] Optional filter function that returns a boolean when passed a Message object
     * @arg {Number} options.limit The max number of messages to search through, -1 for no limit
     * @arg {String} [options.reason] The reason to be displayed in audit logs
     * @arg {Function} [filter] [DEPRECATED] Optional filter function that returns a boolean when passed a Message object
     * @arg {String} [before] [DEPRECATED] Get messages before this message ID
     * @arg {String} [after] [DEPRECATED] Get messages after this message ID
     * @arg {String} [reason] [DEPRECATED] The reason to be displayed in audit logs
     * @returns {Promise<Number>} Resolves with the number of messages deleted
     */
    purge(limit, filter, before, after, reason) {
        return this._client.purgeChannel.call(this._client, this.id, limit, filter, before, after, reason);
    }

    /**
     * Remove a reaction from a message
     * @arg {String} messageID The ID of the message
     * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
     * @arg {String} [userID="@me"] The ID of the user to remove the reaction for
     * @returns {Promise}
     */
    removeMessageReaction(messageID, reaction, userID) {
        return this._client.removeMessageReaction.call(this._client, this.id, messageID, reaction, userID);
    }

    /**
     * Remove all reactions from a message for a single emoji
     * @arg {String} messageID The ID of the message
     * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
     * @returns {Promise}
     */
    removeMessageReactionEmoji(messageID, reaction) {
        return this._client.removeMessageReactionEmoji.call(this._client, this.id, messageID, reaction);
    }

    /**
     * Remove all reactions from a message
     * @arg {String} messageID The ID of the message
     * @returns {Promise}
     */
    removeMessageReactions(messageID) {
        return this._client.removeMessageReactions.call(this._client, this.id, messageID);
    }

    /**
     * Send typing status in the channel
     * @returns {Promise}
     */
    sendTyping() {
        return this._client.sendChannelTyping.call(this._client, this.id);
    }

    /**
     * Un-send a message. You're welcome Programmix
     * @arg {String} messageID The ID of the message
     * @returns {Promise}
     */
    unsendMessage(messageID) {
        return this._client.deleteMessage.call(this.client, this.id, messageID);
    }

    toJSON(props = []) {
        return super.toJSON([
            "lastMessageID",
            "lastPinTimestamp",
            "rateLimitPerUser",
            ...props
        ]);
    }
}

module.exports = GuildTextableChannel;
