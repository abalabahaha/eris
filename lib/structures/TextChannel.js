"use strict";

const Collection = require("../util/Collection");
const GuildChannel = require("./GuildChannel");
const Message = require("./Message");

/**
* Represents a guild text channel
* @extends GuildChannel
* @prop {String} id The ID of the channel
* @prop {String} mention A string that mentions the channel
* @prop {Number} type The type of the channel
* @prop {Guild} guild The guild that owns the channel
* @prop {String?} parentID The ID of the category this channel belongs to
* @prop {String} name The name of the channel
* @prop {Number} position The position of the channel
* @prop {Boolean} nsfw Whether the channel is an NSFW channel or not
* @prop {Collection<PermissionOverwrite>} permissionOverwrites Collection of PermissionOverwrites in this channel
* @prop {Collection<Message>} messages Collection of Messages in this channel
* @prop {String} lastMessageID The ID of the last message in this channel
* @prop {Number} lastPinTimestamp The timestamp of the last pinned message
* @prop {String?} topic The topic of the channel
*/
class TextChannel extends GuildChannel {
    constructor(data, guild, messageLimit) {
        super(data, guild);
        if(messageLimit == null && guild) {
            messageLimit = guild.shard.client.options.messageLimit;
        }
        this.messages = new Collection(Message, messageLimit);
        this.lastMessageID = data.last_message_id || null;
        this.lastPinTimestamp = data.last_pin_timestamp ? Date.parse(data.last_pin_timestamp) : null;
        this.update(data);
    }

    update(data) {
        super.update(data);

        this.topic = data.topic !== undefined ? data.topic : this.topic;
    }

    /**
    * Get all invites in the channel
    * @returns {Promise<Invite[]>}
    */
    getInvites() {
        return this.guild.shard.client.getChannelInvites.call(this.guild.shard.client, this.id);
    }

    /**
    * Create an invite for the channel
    * @arg {Object} [options] Invite generation options
    * @arg {Number} [options.maxAge] How long the invite should last in seconds
    * @arg {Number} [options.maxUses] How many uses the invite should last for
    * @arg {Boolean} [options.temporary] Whether the invite is temporary or not
    * @arg {Boolean} [options.unique] Whether the invite is unique or not
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Invite>}
    */
    createInvite(options, reason) {
        return this.guild.shard.client.createChannelInvite.call(this.guild.shard.client, this.id, options, reason);
    }

    /**
    * Get all the webhooks in the channel
    * @returns {Promise<Object[]>} Resolves with an array of webhook objects
    */
    getWebhooks() {
        return this.guild.shard.client.getChannelWebhooks.call(this.guild.shard.client, this.id);
    }

    /**
    * Create a channel webhook
    * @arg {Object} options Webhook options
    * @arg {String} options.name The default name
    * @arg {String} options.avatar The default avatar as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise<Object>} Resolves with a webhook object
    */
    createWebhook(options, reason) {
        return this.guild.shard.client.createChannelWebhook.call(this.guild.shard.client, this.id, options, reason);
    }

    /**
    * Bulk delete messages (bot accounts only)
    * @arg {String[]} messageIDs Array of message IDs to delete
    * @returns {Promise}
    */
    deleteMessages(messageIDs) {
        return this.guild.shard.client.deleteMessages.call(this.guild.shard.client, this.id, messageIDs);
    }

    /**
    * Purge previous messages in the channel with an optional filter (bot accounts only)
    * @arg {Number} limit The max number of messages to search through, -1 for no limit
    * @arg {function} [filter] Optional filter function that returns a boolean when passed a Message object
    * @arg {String} [before] Get messages before this message ID
    * @arg {String} [after] Get messages after this message ID
    * @returns {Promise<Number>} Resolves with the number of messages deleted
    */
    purge(limit, filter, before, after) {
        return this.guild.shard.client.purgeChannel.call(this.guild.shard.client, this.id, limit, filter, before, after);
    }

    /**
    * Send typing status in the channel
    * @returns {Promise}
    */
    sendTyping() {
        return (this._client || this.guild.shard.client).sendChannelTyping.call((this._client || this.guild.shard.client), this.id);
    }

    /**
    * Get a previous message in the channel
    * @arg {String} messageID The ID of the message
    * @returns {Promise<Message>}
    */
    getMessage(messageID) {
        return (this._client || this.guild.shard.client).getMessage.call((this._client || this.guild.shard.client), this.id, messageID);
    }

    /**
    * Get previous messages in the channel
    * @arg {Number} [limit=50] The max number of messages to get
    * @arg {String} [before] Get messages before this message ID
    * @arg {String} [after] Get messages after this message ID
    * @arg {String} [around] Get messages around this message ID (does not work with limit > 100)
    * @returns {Promise<Message[]>}
    */
    getMessages(limit, before, after, around) {
        return (this._client || this.guild.shard.client).getMessages.call((this._client || this.guild.shard.client), this.id, limit, before, after, around);
    }

    /**
    * Get all the pins in the channel
    * @returns {Promise<Message[]>}
    */
    getPins() {
        return (this._client || this.guild.shard.client).getPins.call((this._client || this.guild.shard.client), this.id);
    }

    /**
    * Create a message in the channel
    * Note: If you want to DM someone, the user ID is **not** the DM channel ID. use Client.getDMChannel() to get the DM channel ID for a user
    * @arg {String | Object} content A string or object. If an object is passed:
    * @arg {String} content.content A content string
    * @arg {Boolean} [content.tts] Set the message TTS flag
    * @arg {Boolean} [content.disableEveryone] Whether to filter @everyone/@here or not (overrides default)
    * @arg {Object} [content.embed] An embed object. See [the official Discord API documentation entry](https://discordapp.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Object} [file] A file object
    * @arg {String} file.file A buffer containing file data
    * @arg {String} file.name What to name the file
    * @returns {Promise<Message>}
    */
    createMessage(content, file) {
        return (this._client || this.guild.shard.client).createMessage.call((this._client || this.guild.shard.client), this.id, content, file);
    }

    /**
    * Edit a message
    * @arg {String} messageID The ID of the message
    * @arg {String | Array | Object} content A string, array of strings, or object. If an object is passed:
    * @arg {String} content.content A content string
    * @arg {Boolean} [content.disableEveryone] Whether to filter @everyone/@here or not (overrides default)
    * @arg {Object} [content.embed] An embed object. See [the official Discord API documentation entry](https://discordapp.com/developers/docs/resources/channel#embed-object) for object structure
    * @returns {Promise<Message>}
    */
    editMessage(messageID, content) {
        return (this._client || this.guild.shard.client).editMessage.call((this._client || this.guild.shard.client), this.id, messageID, content);
    }

    /**
    * Pin a message
    * @arg {String} messageID The ID of the message
    * @returns {Promise}
    */
    pinMessage(messageID) {
        return (this._client || this.guild.shard.client).pinMessage.call((this._client || this.guild.shard.client), this.id, messageID);
    }

    /**
    * Unpin a message
    * @arg {String} messageID The ID of the message
    * @returns {Promise}
    */
    unpinMessage(messageID) {
        return (this._client || this.guild.shard.client).unpinMessage.call((this._client || this.guild.shard.client), this.id, messageID);
    }

    /**
    * Get a list of users who reacted with a specific reaction
    * @arg {String} messageID The ID of the message
    * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
    * @arg {Number} [limit=100] The maximum number of users to get
    * @arg {String} [before] Get users before this user ID
    * @arg {String} [after] Get users after this user ID
    * @returns {Promise<User[]>}
    */
    getMessageReaction(messageID, reaction, limit, before, after) {
        return (this._client || this.guild.shard.client).getMessageReaction.call((this._client || this.guild.shard.client), this.id, messageID, reaction, limit, before, after);
    }

    /**
    * Add a reaction to a message
    * @arg {String} messageID The ID of the message
    * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
    * @arg {String} [userID="@me"] The ID of the user to react as
    * @returns {Promise}
    */
    addMessageReaction(messageID, reaction, userID) {
        return (this._client || this.guild.shard.client).addMessageReaction.call((this._client || this.guild.shard.client), this.id, messageID, reaction, userID);
    }

    /**
    * Remove a reaction from a message
    * @arg {String} messageID The ID of the message
    * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
    * @arg {String} [userID="@me"] The ID of the user to remove the reaction for
    * @returns {Promise}
    */
    removeMessageReaction(messageID, reaction, userID) {
        return (this._client || this.guild.shard.client).removeMessageReaction.call((this._client || this.guild.shard.client), this.id, messageID, reaction, userID);
    }

    /**
    * Remove all reactions from a message
    * @arg {String} messageID The ID of the message
    * @returns {Promise}
    */
    removeMessageReactions(messageID) {
        return (this._client || this.guild.shard.client).removeMessageReactions.call((this._client || this.guild.shard.client), this.id, messageID);
    }

    /**
    * Delete a message
    * @arg {String} messageID The ID of the message
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    deleteMessage(messageID, reason) {
        return (this._client || this.guild.shard.client).deleteMessage.call((this._client || this.guild.shard.client), this.id, messageID, reason);
    }

    /**
    * Un-send a message. You're welcome Programmix
    * @arg {String} messageID The ID of the message
    * @returns {Promise}
    */
    unsendMessage(messageID) {
        return (this._client || this.guild.shard.client).deleteMessage.call((this._client || this.guild.shard.client), this.id, messageID);
    }

    toJSON() {
        const base = super.toJSON(true);
        for(const prop of ["lastMessageID", "lastPinTimestamp", "messages", "topic"]) {
            if(this[prop] !== undefined) {
                base[prop] = this[prop] && this[prop].toJSON ? this[prop].toJSON() : this[prop];
            }
        }
        return base;
    }
}

module.exports = TextChannel;
