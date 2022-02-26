const GuildChannel = require('./GuildChannel');
const Collection = require('../util/Collection');
const Message = require('./Message');
const Member = require('./Member');

class ThreadChannel extends GuildChannel {
  constructor(data, client) {
    super(data, client);
    this.type = data.type;
    this.messages = new Collection(Message, 450);
    this.members = new Collection(Member, 450);
    if (data.added_members !== undefined) {
      for (const member of data.added_members) {
        this.members.add(member);
      }
    }
    if (data.members !== undefined) {
      for (const member of data.members) {
        this.members.add(member);
      }
    }
    this.lastMessageID = data.last_message_id;
    this.threadMetadata = {};
    this.guild = null;
    this.ownerMember = null;
    if (data.archived !== undefined) {
      this.threadMetadata.archived = data.threadMetadata.archived;
    }

    if (data.archive_timestamp !== undefined) {
      this.threadMetadata.archivedTimestamp = Date.parse(data.threadMetadata.archive_timestamp);
    }

    if (data.auto_archive_duration !== undefined) {
      this.threadMetadata.autoArchiveDuration = data.threadMetadata.auto_archive_duration;
    }

    if (data.locked !== undefined) {
      this.threadMetadata.locked = data.threadMetadata.locked;
    }

    this.messageCount = data.message_count;
    this.memberCount = data.member_count;


  }

  update(data) {

    super.update(data);
    this.lastMessageID = data.last_message_id;
    this.threadMetadata = {};

    if (data.added_members !== undefined) {
      for (const member of data.added_members) {
        this.members.add(member);
      }
    }
    if (data.members !== undefined) {
      for (const member of data.members) {
        this.members.add(member);
      }
    }
    if (data.archived !== undefined) {
      this.threadMetadata.archived = data.threadMetadata.archived;
    }

    if (data.archive_timestamp !== undefined) {
      this.threadMetadata.archivedTimestamp = Date.parse(data.threadMetadata.archive_timestamp);
    }

    if (data.auto_archive_duration !== undefined) {
      this.threadMetadata.autoArchiveDuration = data.threadMetadata.auto_archive_duration;
    }

    if (data.locked !== undefined) {
      this.threadMetadata.locked = data.threadMetadata.locked;
    }

    this.messageCount = data.message_count;
    this.memberCount = data.member_count;


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
     * Create an invite for the channel
     * @arg {Object} [options] Invite generation options
     * @arg {Number} [options.maxAge] How long the invite should last in seconds
     * @arg {Number} [options.maxUses] How many uses the invite should last for
     * @arg {Boolean} [options.temporary] Whether the invite grants temporary membership or not
     * @arg {Boolean} [options.unique] Whether the invite is unique or not
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<Invite>}
     */
  createInvite(options, reason) {
    return this.client.createChannelInvite.call(this.client, this.id, options, reason);
  }

  /**
     * Create a message in the channel
     * Note: If you want to DM someone, the user ID is **not** the DM channel ID. use Client.getDMChannel() to get the DM channel ID for a user
     * @arg {String | Object} content A string or object. If an object is passed:
     * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
     * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here.
     * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
     * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
     * @arg {Boolean} [options.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to
     * @arg {String} content.content A content string
     * @arg {Object} [content.embed] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
     * @arg {Object} [content.messageReference] The message reference, used when replying to messages
     * @arg {String} [content.messageReference.channelID] The channel ID of the referenced message
     * @arg {Boolean} [content.messageReference.failIfNotExists=true] Whether to throw an error if the message reference doesn't exist. If false, and the referenced message doesn't exist, the message is created without a referenced message
     * @arg {String} [content.messageReference.guildID] The guild ID of the referenced message
     * @arg {String} content.messageReference.messageID The message ID of the referenced message. This cannot reference a system message
     * @arg {String} [content.messageReferenceID] [DEPRECATED] The ID of the message should be replied to. Use `messageReference` instead
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
     * Create a channel webhook
     * @arg {Object} options Webhook options
     * @arg {String} [options.avatar] The default avatar as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
     * @arg {String} options.name The default name
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<Object>} Resolves with a webhook object
     */
  createWebhook(options, reason) {
    return this.client.createChannelWebhook.call(this.client, this.id, options, reason);
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
     * Bulk delete messages (bot accounts only)
     * @arg {Array<String>} messageIDs Array of message IDs to delete
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise}
     */
  deleteMessages(messageIDs, reason) {
    return this.client.deleteMessages.call(this.client, this.id, messageIDs, reason);
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
     * Get all invites in the channel
     * @returns {Promise<Array<Invite>>}
     */
  getInvites() {
    return this.client.getChannelInvites.call(this.client, this.id);
  }
  /**
     * Get a previous message in the channel
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
     * @arg {Object} [options] Options for the request. If this is a number, it is treated as `options.limit` ([DEPRECATED] behavior)
     * @arg {Number} [options.limit=100] The maximum number of users to get
     * @arg {String} [options.after] Get users after this user ID
     * @arg {String} [before] [DEPRECATED] Get users before this user ID. Discord no longer supports this parameter
     * @arg {String} [after] [DEPRECATED] Get users after this user ID
     * @returns {Promise<Array<User>>}
     */
  getMessageReaction(messageID, reaction, options, before, after) {
    return this.client.getMessageReaction.call(this.client, this.id, messageID, reaction, options, before, after);
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
    return this.client.getMessages.call(this.client, this.id, options, before, after, around);
  }
  /**
     * Get all the pins in the channel
     * @returns {Promise<Array<Message>>}
     */
  getPins() {
    return this.client.getPins.call(this.client, this.id);
  }
  getThreadsActive() {
    return this.client.getThreadsActive(this.id);
  }










  getThreadsMe() {
    return this.client.getThreadsMe(this.id);
  }

















  getThreadsPrivate() {
    return this.client.getThreadsPrivate(this.id);
  }










  getThreadsPublic() {
    return this.client.getThreadsPublic(this.id);
  }




















  /**
     * Get all the webhooks in the channel
     * @returns {Promise<Array<Object>>} Resolves with an array of webhook objects
     */
  getWebhooks() {
    return this.client.getChannelWebhooks.call(this.client, this.id);
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
     * Purge previous messages in the channel with an optional filter (bot accounts only)
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
    return this.client.purgeChannel.call(this.client, this.id, limit, filter, before, after, reason);
  }

  /**
     * Remove a reaction from a message
     * @arg {String} messageID The ID of the message
     * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
     * @arg {String} [userID="@me"] The ID of the user to remove the reaction for
     * @returns {Promise}
     */
  removeMessageReaction(messageID, reaction, userID) {
    return this.client.removeMessageReaction.call(this.client, this.id, messageID, reaction, userID);
  }

  /**
     * Remove all reactions from a message for a single emoji
     * @arg {String} messageID The ID of the message
     * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
     * @returns {Promise}
     */
  removeMessageReactionEmoji(messageID, reaction) {
    return this.client.removeMessageReactionEmoji.call(this.client, this.id, messageID, reaction);
  }

  /**
     * Remove all reactions from a message
     * @arg {String} messageID The ID of the message
     * @returns {Promise}
     */
  removeMessageReactions(messageID) {
    return this.client.removeMessageReactions.call(this.client, this.id, messageID);
  }

  /**
     * Send typing status in the channel
     * @returns {Promise}
     */
  sendTyping() {
    return this.client.sendChannelTyping.call(this.client, this.id);
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
      'lastMessageID',
      'lastPinTimestamp',
      'messages',
      'rateLimitPerUser',
      'topic',
      ...props
    ]);
  }
}


module.exports = ThreadChannel;
