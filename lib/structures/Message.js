"use strict";

const Base = require("./Base");
const Endpoints = require("../rest/Endpoints");
const { MessageFlags } = require("../Constants");
const User = require("./User");

/**
 * Represents a message
 * @prop {Object?} activity The activity specified in the message
 * @prop {Object?} application The application of the activity in the message
 * @prop {String?} applicationID The ID of the interaction's application
 * @prop {Array<Object>} attachments Array of attachments
 * @prop {User} author The message author
 * @prop {Object} call The call associated with the message
 * @prop {Number?} call.endedTimestamp The time when the call ended
 * @prop {Array<String>} call.participants An array of user IDs that participated in the call
 * @prop {DMChannel | TextChannel | NewsChannel} channel The channel the message is in. Can be partial with only the id if the channel is not cached.
 * @prop {Array<String>} channelMentions Array of mentions channels' ids
 * @prop {String?} cleanContent Message content with mentions replaced by names. Mentions are currently escaped, but this behavior is [DEPRECATED] and will be removed soon. Use allowed mentions, the official way of avoiding unintended mentions, when creating messages.
 * @prop {Command?} command The Command used in the Message, if any (CommandClient only)
 * @prop {Array<Object>} components An array of component objects
 * @prop {String} content Message content
 * @prop {Number} createdAt Timestamp of message creation
 * @prop {Number?} editedTimestamp Timestamp of latest message edit
 * @prop {Array<Object>} embeds Array of embeds
 * @prop {Number} flags Message flags (see constants)
 * @prop {String?} guildID The ID of the guild this message is in (undefined if in DMs)
 * @prop {String} id The ID of the message
 * @prop {Object?} interaction An object containing info about the interaction the message is responding to, if applicable
 * @prop {String} interaction.id The ID of the interaction
 * @prop {Member?} interaction.member The member who invoked the interaction
 * @prop {String} interaction.name The name of the command
 * @prop {Number} interaction.type The type of interaction
 * @prop {User} interaction.user The user who invoked the interaction
 * @prop {String} jumpLink The url used by Discord clients to jump to this message
 * @prop {Member?} member The message author with server-specific data
 * @prop {Boolean} mentionEveryone Whether the message mentions everyone/here or not
 * @prop {Array<User>} mentions Array of mentioned users
 * @prop {Object?} messageReference An object containing the reference to the original message if it is a crossposted message, reply or forwarded message
 * @prop {String} messageReference.channelID The ID of the channel this message was crossposted from
 * @prop {String?} messageReference.guildID The ID of the guild this message was crossposted from
 * @prop {String?} messageReference.messageID The ID of the original message this message was crossposted from
 * @prop {Number} messageReference.type The type of reference. Either `0` (REPLY) or `1` (FORWARDED)
 * @prop {Array<Object>?} messageSnapshots The message associated with the messageReference
 * @prop {String?} messageSnapshots.guildID The ID of the guild this message originated from
 * @prop {Message} messageSnapshots.message Subset of message fields. The list of message fields subset consists of: `attachments`, `content`, `edited_timestamp`, `embeds`, `flags`, `id`, `mentions`, `roleMentions`, `timestamp` and `type`
 * @prop {Boolean} pinned Whether the message is pinned or not
 * @prop {Object?} poll A poll object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/poll#poll-object) for object structure. Note: `poll.expiry` is an int, not ISO8601 as mentioned in Discord docs
 * @prop {String?} prefix The prefix used in the Message, if any (CommandClient only)
 * @prop {Object} reactions An object containing the reactions on the message. Each key is a reaction emoji and each value is an object with properties `burst_colors` (Array<String>), `count` (Number), `count_details` (an object with `burst` and `normal` keys corresponding to the amount of reactions), `me` (Boolean) and `me_burst` for that specific reaction emoji.
 * @prop {Message?} referencedMessage The message that was replied to. If undefined, message data was not received. If null, the message was deleted.
 * @prop {Array<String>} roleMentions Array of mentioned roles' ids
 * @prop {Object?} roleSubscriptionData An object containing the data of the role subscription purchase or renewal that prompted this `ROLE_SUBSCRIPTION_PURCHASE` message. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#role-subscription-data-object) for object structure
 * @prop {Array<Object>?} stickers [DEPRECATED] The stickers sent with the message
 * @prop {Array<Object>?} stickerItems The stickers sent with the message
 * @prop {Number} timestamp Timestamp of message creation
 * @prop {Boolean} tts Whether to play the message using TTS or not
 * @prop {Number} type The type of the message
 * @prop {String?} webhookID ID of the webhook that sent the message
 */
class Message extends Base {
  constructor(data, client) {
    super(data.id);
    this._client = client;
    this.type = data.type || 0;
    this.timestamp = Date.parse(data.timestamp);
    this.channel = this._client.getChannel(data.channel_id) || {
      id: data.channel_id,
    };
    this.content = "";
    this.reactions = {};
    this.guildID = data.guild_id;
    this.webhookID = data.webhook_id;

    if (data.message_reference) {
      this.messageReference = {
        type: data.message_reference.type,
        messageID: data.message_reference.message_id,
        channelID: data.message_reference.channel_id,
        guildID: data.message_reference.guild_id,
      };
    } else {
      this.messageReference = null;
    }

    if (data.message_snapshots && this.messageReference) {
      this.messageSnapshots = data.message_snapshots.map((snapshot) => {
        const channel = this._client.getChannel(this.messageReference.channelID);
        let message;

        snapshot.message.id = this.messageReference.messageID;

        if (channel) {
          message = channel.messages.update(snapshot.message, this._client);
        } else {
          message = new Message(snapshot.message, this._client);
        }

        return {
          guildID: this.messageReference.guildID,
          message: message,
        };
      });
    }

    this.flags = data.flags || 0;

    if (data.author) {
      if (data.author.discriminator !== "0000") {
        this.author = this._client.users.update(data.author, client);
      } else {
        this.author = new User(data.author, client);
      }
    } else {
      this._client.emit("error", new Error("MESSAGE_CREATE but no message author:\n" + JSON.stringify(data, null, 2)));
    }

    if (data.referenced_message) {
      const channel = this._client.getChannel(data.referenced_message.channel_id);
      if (channel) {
        this.referencedMessage = channel.messages.update(data.referenced_message, this._client);
      } else {
        this.referencedMessage = new Message(data.referenced_message, this._client);
      }
    } else {
      this.referencedMessage = data.referenced_message;
    }

    if (data.interaction) {
      this.interaction = data.interaction;
      let interactionMember;
      const interactionUser = this._client.users.update(data.interaction.user, client);
      if (data.interaction.member) {
        data.interaction.member.id = data.interaction.user.id;
        if (this.channel.guild) {
          interactionMember = this.channel.guild.members.update(data.interaction.member, this.channel.guild);
        } else {
          interactionMember = data.interaction.member;
        }
      } else if (this.channel.guild && this.channel.guild.members.has(data.interaction.user.id)) {
        interactionMember = this.channel.guild.members.get(data.interaction.user.id);
      } else {
        interactionMember = null;
      }
      this.interaction.user = interactionUser;
      this.interaction.member = interactionMember;
    } else {
      this.interaction = null;
    }

    if (this.channel.guild) {
      if (data.member) {
        data.member.id = this.author.id;
        if (data.author) {
          data.member.user = data.author;
        }
        this.member = this.channel.guild.members.update(data.member, this.channel.guild);
      } else if (this.channel.guild.members.has(this.author.id)) {
        this.member = this.channel.guild.members.get(this.author.id);
      } else {
        this.member = null;
      }

      if (!this.guildID) {
        this.guildID = this.channel.guild.id;
      }
    } else {
      this.member = null;
    }

    this.update(data, client);
  }

  update(data, client) {
    if (data.content !== undefined) {
      this.content = data.content || "";
      this.mentionEveryone = !!data.mention_everyone;

      this.mentions = data.mentions.map((mention) => {
        const user = this._client.users.add(mention, client);
        if (mention.member && this.channel.guild) {
          mention.member.id = mention.id;
          this.channel.guild.members.update(mention.member, this.channel.guild);
        }
        return user;
      });

      this.roleMentions = data.mention_roles;
    }
    if (data.poll !== undefined) {
      this.poll = data.poll;
      if (data.poll.expiry !== null) {
        this.poll.expiry = Date.parse(data.poll.expiry);
      }
    }
    if (data.pinned !== undefined) {
      this.pinned = !!data.pinned;
    }
    if (data.edited_timestamp != undefined) {
      this.editedTimestamp = Date.parse(data.edited_timestamp);
    }
    if (data.tts !== undefined) {
      this.tts = data.tts;
    }
    if (data.attachments !== undefined) {
      this.attachments = data.attachments;
    }
    if (data.embeds !== undefined) {
      this.embeds = data.embeds;
    }
    if (data.flags !== undefined) {
      this.flags = data.flags;
    }
    if (data.activity !== undefined) {
      this.activity = data.activity;
    }
    if (data.application !== undefined) {
      this.application = data.application;
    }
    if (data.application_id !== undefined) {
      this.applicationID = data.application_id;
    }
    if (data.reactions) {
      data.reactions.forEach((reaction) => {
        this.reactions[reaction.emoji.id ? `${reaction.emoji.name}:${reaction.emoji.id}` : reaction.emoji.name] = {
          burst_colors: reaction.burst_colors,
          count: reaction.count,
          count_details: reaction.count_details,
          me: reaction.me,
          me_burst: reaction.me_burst,
        };
      });
    }
    if (data.stickers !== undefined) {
      this.stickers = data.stickers;
    }
    if (data.sticker_items !== undefined) {
      this.stickerItems = data.sticker_items.map((sticker) => {
        if (sticker.user) {
          sticker.user = this._client.users.update(sticker.user, client);
        }
        return sticker;
      });
    }
    if (data.components !== undefined) {
      this.components = data.components;
    }
    if (data.call !== undefined) {
      this.call = {
        endedTimestamp: Date.parse(data.call.ended_timestamp) || null,
        participants: data.call.participants,
      };
    }
  }

  get channelMentions() {
    if (this._channelMentions) {
      return this._channelMentions;
    }

    return (this._channelMentions = ((this.content && this.content.match(/<#[0-9]+>/g)) || []).map((mention) => mention.substring(2, mention.length - 1)));
  }

  get cleanContent() {
    let cleanContent = (this.content && this.content.replace(/<a?(:\w+:)[0-9]+>/g, "$1")) || "";

    let authorName = this.author.username;
    if (this.channel.guild) {
      const member = this.channel.guild.members.get(this.author.id);
      if (member && member.nick) {
        authorName = member.nick;
      }
    }
    cleanContent = cleanContent.replace(new RegExp(`<@!?${this.author.id}>`, "g"), "@\u200b" + authorName);

    if (this.mentions) {
      this.mentions.forEach((mention) => {
        if (this.channel.guild) {
          const member = this.channel.guild.members.get(mention.id);
          if (member && member.nick) {
            cleanContent = cleanContent.replace(new RegExp(`<@!?${mention.id}>`, "g"), "@\u200b" + member.nick);
          }
        }
        cleanContent = cleanContent.replace(new RegExp(`<@!?${mention.id}>`, "g"), "@\u200b" + mention.username);
      });
    }

    if (this.channel.guild && this.roleMentions) {
      for (const roleID of this.roleMentions) {
        const role = this.channel.guild.roles.get(roleID);
        const roleName = role ? role.name : "deleted-role";
        cleanContent = cleanContent.replace(new RegExp(`<@&${roleID}>`, "g"), "@\u200b" + roleName);
      }
    }

    this.channelMentions.forEach((id) => {
      const channel = this._client.getChannel(id);
      if (channel && channel.name && channel.mention) {
        cleanContent = cleanContent.replace(channel.mention, "#" + channel.name);
      }
    });

    return cleanContent.replace(/@everyone/g, "@\u200beveryone").replace(/@here/g, "@\u200bhere");
  }

  get jumpLink() {
    return `${Endpoints.CLIENT_URL}${Endpoints.MESSAGE_LINK(this.guildID || "@me", this.channel.id, this.id)}`; // Messages outside of guilds (DMs) will never have a guildID property assigned
  }

  /**
   * Add a reaction to a message
   * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
   * @returns {Promise}
   */
  addReaction(reaction) {
    if (this.flags & MessageFlags.EPHEMERAL) {
      throw new Error("Ephemeral messages cannot have reactions");
    }
    return this._client.addMessageReaction.call(this._client, this.channel.id, this.id, reaction);
  }

  /**
   * Create a thread with this message
   * @arg {Object} options The thread options
   * @arg {Number} [options.autoArchiveDuration] Duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080
   * @arg {String} options.name The thread channel name
   * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (0-21600) (does not affect bots or users with manageMessages/manageChannel permissions)
   * @arg {String} [options.reason] The reason to be displayed in audit logs
   * @returns {Promise<NewsThreadChannel | PublicThreadChannel>}
   */
  createThreadWithMessage(options) {
    return this._client.createThreadWithMessage.call(this._client, this.channel.id, this.id, options);
  }

  /**
   * Crosspost (publish) a message to subscribed channels (NewsChannel only)
   * @returns {Promise<Message>}
   */
  crosspost() {
    if (this.flags & MessageFlags.EPHEMERAL) {
      throw new Error("Ephemeral messages cannot be crossposted");
    }
    return this._client.crosspostMessage.call(this._client, this.channel.id, this.id);
  }

  /**
   * Delete the message
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  delete(reason) {
    if (this.flags & MessageFlags.EPHEMERAL) {
      throw new Error("Ephemeral messages cannot be deleted");
    }
    return this._client.deleteMessage.call(this._client, this.channel.id, this.id, reason);
  }

  /**
   * Delete the message as a webhook
   * @arg {String} token The token of the webhook
   * @returns {Promise}
   */
  deleteWebhook(token) {
    if (!this.webhookID) {
      throw new Error("Message is not a webhook");
    }
    if (this.flags & MessageFlags.EPHEMERAL) {
      throw new Error("Ephemeral messages cannot be deleted");
    }
    return this._client.deleteWebhookMessage.call(this._client, this.webhookID, token, this.id);
  }

  /**
   * Edit the message
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
  edit(content) {
    if (this.flags & MessageFlags.EPHEMERAL) {
      throw new Error("Ephemeral messages cannot be edited via this method");
    }
    return this._client.editMessage.call(this._client, this.channel.id, this.id, content);
  }

  /**
   * Edit the message as a webhook
   * @arg {String} token The token of the webhook
   * @arg {Object} options Webhook message edit options
   * @arg {Object} [options.allowedMentions] A list of mentions to allow (overrides default)
   * @arg {Boolean} [options.allowedMentions.everyone] Whether or not to allow @everyone/@here
   * @arg {Boolean} [options.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to
   * @arg {Boolean | Array<String>} [options.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow
   * @arg {Boolean | Array<String>} [options.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow
   * @arg {Array<Object>} [options.attachments] An array of attachment objects that will be appended to the message, including new files. Only the provided files will be appended
   * @arg {String} [options.attachments[].description] The description of the file
   * @arg {String} [options.attachments[].filename] The name of the file. This is not required if you are attaching a new file
   * @arg {Number | String} options.attachments[].id The ID of the file. If you are attaching a new file, this would be the index of the file
   * @arg {Array<Object>} [options.components] An array of component objects
   * @arg {String} [options.components[].custom_id] The ID of the component (type 2 style 0-4 and type 3,5,6,7,8 only)
   * @arg {Boolean} [options.components[].disabled] Whether the component is disabled (type 2 and type 3,5,6,7,8 only)
   * @arg {Object} [options.components[].emoji] The emoji to be displayed in the component (type 2)
   * @arg {String} [options.components[].label] The label to be displayed in the component (type 2)
   * @arg {Array<Object>} [options.components[].default_values] default values for the component (type 5,6,7,8 only)
   * @arg {String} [options.components[].default_values[].id] id of a user, role, or channel
   * @arg {String} [options.components[].default_values[].type] type of value that id represents (user, role, or channel)
   * @arg {Number} [options.components[].max_values] The maximum number of items that can be chosen (1-25, default 1)
   * @arg {Number} [options.components[].min_values] The minimum number of items that must be chosen (0-25, default 1)
   * @arg {Array<Object>} [options.components[].options] The options for this component (type 3 only)
   * @arg {Boolean} [options.components[].options[].default] Whether this option should be the default value selected
   * @arg {String} [options.components[].options[].description] The description for this option
   * @arg {Object} [options.components[].options[].emoji] The emoji to be displayed in this option
   * @arg {String} options.components[].options[].label The label for this option
   * @arg {Number | String} options.components[].options[].value The value for this option
   * @arg {String} [options.components[].placeholder] The placeholder text for the component when no option is selected (type 3,5,6,7,8 only)
   * @arg {Number} [options.components[].style] The style of the component (type 2 only) - If 0-4, `custom_id` is required; if 5, `url` is required
   * @arg {Number} options.components[].type The type of component - If 1, it is a collection and a `components` array (nested) is required; if 2, it is a button; if 3, it is a string select; if 5, it is a user select; if 6, it is a role select; if 7, it is a mentionable select; if 8, it is a channel select
   * @arg {String} [options.components[].url] The URL that the component should open for users (type 2 style 5 only)
   * @arg {String} [options.content] A content string
   * @arg {Object} [options.embed] [DEPRECATED] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @arg {Array<Object>} [options.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @arg {Object | Array<Object>} [options.file] A file object (or an Array of them)
   * @arg {Buffer} options.file.file A buffer containing file data
   * @arg {String} options.file.name What to name the file
   * @returns {Promise<Message>}
   */
  editWebhook(token, options) {
    if (!this.webhookID) {
      throw new Error("Message is not a webhook");
    }
    return this._client.editWebhookMessage.call(this._client, this.webhookID, token, this.id, options);
  }

  /**
   * Get a list of users who reacted with a specific reaction
   * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
   * @arg {Object} [options] Options for the request. If this is a number, it is treated as `options.limit` ([DEPRECATED] behavior)
   * @arg {String} [options.after] Get users after this user ID
   * @arg {Number} [options.limit=100] The maximum number of users to get
   * @arg {Number} [options.type=0] The type of reaction (`0` for normal, `1` for burst)
   * @arg {String} [before] [DEPRECATED] Get users before this user ID. Discord no longer supports this parameter
   * @arg {String} [after] [DEPRECATED] Get users after this user ID
   * @returns {Promise<Array<User>>}
   */
  getReaction(reaction, options, before, after) {
    if (this.flags & MessageFlags.EPHEMERAL) {
      throw new Error("Ephemeral messages cannot have reactions");
    }
    return this._client.getMessageReaction.call(this._client, this.channel.id, this.id, reaction, options, before, after);
  }

  /**
   * Pin the message
   * @returns {Promise}
   */
  pin() {
    if (this.flags & MessageFlags.EPHEMERAL) {
      throw new Error("Ephemeral messages cannot be pinned");
    }
    return this._client.pinMessage.call(this._client, this.channel.id, this.id);
  }

  /**
   * Remove a reaction from a message
   * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
   * @arg {String} [userID="@me"] The ID of the user to remove the reaction for
   * @returns {Promise}
   */
  removeReaction(reaction, userID) {
    if (this.flags & MessageFlags.EPHEMERAL) {
      throw new Error("Ephemeral messages cannot have reactions");
    }
    return this._client.removeMessageReaction.call(this._client, this.channel.id, this.id, reaction, userID);
  }

  /**
   * Remove all reactions from a message for a single emoji
   * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
   * @returns {Promise}
   */
  removeReactionEmoji(reaction) {
    if (this.flags & MessageFlags.EPHEMERAL) {
      throw new Error("Ephemeral messages cannot have reactions");
    }
    return this._client.removeMessageReactionEmoji.call(this._client, this.channel.id, this.id, reaction);
  }

  /**
   * Remove all reactions from a message
   * @returns {Promise}
   */
  removeReactions() {
    if (this.flags & MessageFlags.EPHEMERAL) {
      throw new Error("Ephemeral messages cannot have reactions");
    }
    return this._client.removeMessageReactions.call(this._client, this.channel.id, this.id);
  }

  /**
   * Unpin the message
   * @returns {Promise}
   */
  unpin() {
    if (this.flags & MessageFlags.EPHEMERAL) {
      throw new Error("Ephemeral messages cannot be pinned");
    }
    return this._client.unpinMessage.call(this._client, this.channel.id, this.id);
  }

  toJSON(props = []) {
    return super.toJSON([
      "activity",
      "application",
      "attachments",
      "author",
      "call",
      "content",
      "editedTimestamp",
      "embeds",
      "flags",
      "guildID",
      "member",
      "mentionEveryone",
      "mentions",
      "messageReference",
      "pinned",
      "reactions",
      "referencedMesssage",
      "roleMentions",
      "stickers",
      "stickerItems",
      "timestamp",
      "tts",
      "type",
      "webhookID",
      ...props,
    ]);
  }
}

module.exports = Message;
