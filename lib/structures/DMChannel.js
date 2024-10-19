"use strict";

const Collection = require("../util/Collection");
const Channel = require("./Channel");
const Message = require("./Message");
const User = require("./User");

const emitDeprecation = require("../util/emitDeprecation");

/**
 * Represents a DM channel. See Channel for more properties
 * @extends Channel
 * @prop {String?} lastMessageID The ID of the last message in the channel. This can be null if there has never been a message in the channel
 * @prop {Number?} lastPinTimestamp The timestamp of the last pinned message
 * @prop {Collection<Message>} messages Collection of Messages in this channel
 * @prop {Collection<User>} recipients The recipient in this private channel (this should always contain one entry)
 */
class DMChannel extends Channel {
  constructor(data, client) {
    super(data, client);

    this.lastMessageID = data.last_message_id;
    this.recipients = new Collection(User);
    data.recipients.forEach((recipient) => {
      this.recipients.add(client.users.add(recipient, client));
    });
    this.messages = new Collection(Message, client.options.messageLimit);

    this.update(data);
  }

  update(data) {
    this.lastPinTimestamp = data.last_pin_timestamp ? Date.parse(data.last_pin_timestamp) : null;
  }

  /**
   * Add a reaction to a message
   * @arg {String} messageID The ID of the message
   * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
   * @returns {Promise}
   */
  addMessageReaction(messageID, reaction) {
    return this._client.addMessageReaction.call(this._client, this.id, messageID, reaction);
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
   * @arg {Array<Object>} [content.components] An array of component objects
   * @arg {String} [content.components[].custom_id] The ID of the component (type 2 style 0-4 and type 3,5,6,7,8 only)
   * @arg {Boolean} [content.components[].disabled] Whether the component is disabled (type 2 and 3,5,6,7,8 only)
   * @arg {Object} [content.components[].emoji] The emoji to be displayed in the component (type 2)
   * @arg {String} [content.components[].label] The label to be displayed in the component (type 2)
   * @arg {Array<Object>} [content.components[].default_values] default values for the component (type 5,6,7,8 only)
   * @arg {String} [content.components[].default_values[].id] id of a user, role, or channel
   * @arg {String} [content.components[].default_values[].type] type of value that id represents (user, role, or channel)
   * @arg {Number} [content.components[].max_values] The maximum number of items that can be chosen (1-25, default 1)
   * @arg {Number} [content.components[].min_values] The minimum number of items that must be chosen (0-25, default 1)
   * @arg {Array<Object>} [content.components[].options] The options for this component (type 3 only)
   * @arg {Boolean} [content.components[].options[].default] Whether this option should be the default value selected
   * @arg {String} [content.components[].options[].description] The description for this option
   * @arg {Object} [content.components[].options[].emoji] The emoji to be displayed in this option
   * @arg {String} content.components[].options[].label The label for this option
   * @arg {Number | String} content.components[].options[].value The value for this option
   * @arg {String} [content.components[].placeholder] The placeholder text for the component when no option is selected (type 3,5,6,7,8 only)
   * @arg {Number} [content.components[].style] The style of the component (type 2 only) - If 0-4, `custom_id` is required; if 5, `url` is required
   * @arg {Number} content.components[].type The type of component - If 1, it is a collection and a `components` array (nested) is required; if 2, it is a button; if 3, it is a string select; if 5, it is a user select; if 6, it is a role select; if 7, it is a mentionable select; if 8, it is a channel select
   * @arg {String} [content.components[].url] The URL that the component should open for users (type 2 style 5 only)
   * @arg {String} [content.content] A content string
   * @arg {Object} [content.embed] [DEPRECATED] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @arg {Array<Object>} [content.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @arg {Boolean} [content.enforceNonce] If true and `content.nonce` is present, if multiple messages are sent with the same nonce within a few minutes of each other, that message will be returned and no new message created
   * @arg {Object} [content.messageReference] The message reference, used when replying to or forwarding messages
   * @arg {String} [content.messageReference.channelID] The channel ID of the referenced message. Required when forwarding messages
   * @arg {Boolean} [content.messageReference.failIfNotExists=true] Whether to throw an error if the message reference doesn't exist. If false, and the referenced message doesn't exist, the message is created without a referenced message
   * @arg {String} [content.messageReference.guildID] The guild ID of the referenced message
   * @arg {String} content.messageReference.messageID The message ID of the referenced message. This cannot reference a system message
   * @arg {String} [content.messageReference.type=0] The type of reference. Either `0` (REPLY) or `1` (FORWARDED). Will become required in the future
   * @arg {String} [content.messageReferenceID] [DEPRECATED] The ID of the message should be replied to. Use `messageReference` instead
   * @arg {Object} [content.poll] A poll object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/poll#poll-object) for object structure
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
   * Close the DM Channel. This doesn't really concern bots with DMs.
   * @returns {Promise<DMChannel>}
   */
  delete() {
    return this._client.deleteChannel.call(this._client, this.id);
  }

  /**
   * Delete a message
   * @arg {String} messageID The ID of the message
   * @returns {Promise}
   */
  deleteMessage(messageID) {
    return this._client.deleteMessage.call(this._client, this.id, messageID);
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
   * @arg {Array<Object>} [content.components] An array of component objects
   * @arg {String} [content.components[].custom_id] The ID of the component (type 2 style 0-4 and type 3,5,6,7,8 only)
   * @arg {Boolean} [content.components[].disabled] Whether the component is disabled (type 2 and 3,5,6,7,8 only)
   * @arg {Object} [content.components[].emoji] The emoji to be displayed in the component (type 2)
   * @arg {String} [content.components[].label] The label to be displayed in the component (type 2)
   * @arg {Array<Object>} [content.components[].default_values] default values for the component (type 5,6,7,8 only)
   * @arg {String} [content.components[].default_values[].id] id of a user, role, or channel
   * @arg {String} [content.components[].default_values[].type] type of value that id represents (user, role, or channel)
   * @arg {Number} [content.components[].max_values] The maximum number of items that can be chosen (1-25, default 1)
   * @arg {Number} [content.components[].min_values] The minimum number of items that must be chosen (0-25, default 1)
   * @arg {Array<Object>} [content.components[].options] The options for this component (type 3 only)
   * @arg {Boolean} [content.components[].options[].default] Whether this option should be the default value selected
   * @arg {String} [content.components[].options[].description] The description for this option
   * @arg {Object} [content.components[].options[].emoji] The emoji to be displayed in this option
   * @arg {String} content.components[].options[].label The label for this option
   * @arg {Number | String} content.components[].options[].value The value for this option
   * @arg {String} [content.components[].placeholder] The placeholder text for the component when no option is selected (type 3,5,6,7,8 only)
   * @arg {Number} [content.components[].style] The style of the component (type 2 only) - If 0-4, `custom_id` is required; if 5, `url` is required
   * @arg {Number} content.components[].type The type of component - If 1, it is a collection and a `components` array (nested) is required; if 2, it is a button; if 3, it is a string select; if 5, it is a user select; if 6, it is a role select; if 7, it is a mentionable select; if 8, it is a channel select
   * @arg {String} [content.components[].url] The URL that the component should open for users (type 2 style 5 only)
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
   * @arg {Number} [options.type=0] The type of reaction (`0` for normal, `1` for burst)
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
   * Get all the pins in the channel
   * @returns {Promise<Array<Message>>}
   */
  getPins() {
    return this._client.getPins.call(this._client, this.id);
  }

  /**
   * Pin a message
   * @arg {String} messageID The ID of the message
   * @returns {Promise}
   */
  pinMessage(messageID) {
    return this._client.pinMessage.call(this._client, this.id, messageID);
  }

  /**
   * Remove a reaction from a message
   * @arg {String} messageID The ID of the message
   * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
   * @arg {String} [userID="@me"] The ID of the user to remove the reaction for. Passing this parameter is deprecated and will not be supported in future versions.
   * @returns {Promise}
   */
  removeMessageReaction(messageID, reaction, userID) {
    if (userID !== undefined) {
      emitDeprecation("DM_REACTION_BEFORE");
      this.emit("warn", "[DEPRECATED] removeMessageReaction() was called on a DMChannel with a `userID` argument");
    }
    return this._client.removeMessageReaction.call(this._client, this.id, messageID, reaction, userID);
  }

  /**
   * Send typing status in the channel
   * @returns {Promise}
   */
  sendTyping() {
    return this._client.sendChannelTyping.call(this._client, this.id);
  }

  /**
   * Unpin a message
   * @arg {String} messageID The ID of the message
   * @returns {Promise}
   */
  unpinMessage(messageID) {
    return this._client.unpinMessage.call(this._client, this.id, messageID);
  }

  /**
   * Un-send a message. You're welcome Programmix
   * @arg {String} messageID The ID of the message
   * @returns {Promise}
   */
  unsendMessage(messageID) {
    return this._client.deleteMessage.call(this._client, this.id, messageID);
  }

  toJSON(props = []) {
    return super.toJSON([
      "lastMessageID",
      "lastPinTimestamp",
      "messages",
      "recipients",
      ...props,
    ]);
  }
}

module.exports = DMChannel;
