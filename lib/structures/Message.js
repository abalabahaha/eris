"use strict";

const Base = require("./Base");
const Endpoints = require("../rest/Endpoints");
const Call = require("./Call");
const {SystemJoinMessages, MessageTypes, MessageFlags} = require("../Constants");
const User = require("./User");

/**
* Represents a message
* @prop {Object?} activity The activity specified in the message
* @prop {Object?} application The application of the activity in the message
* @prop {String?} applicationID The ID of the interaction's application
* @prop {Array<Object>} attachments Array of attachments
* @prop {User} author The message author
* @prop {PrivateChannel | TextChannel | NewsChannel} channel The channel the message is in. Can be partial with only the id if the channel is not cached.
* @prop {Array<String>} channelMentions Array of mentions channels' ids
* @prop {String?} cleanContent Message content with mentions replaced by names. Mentions are currently escaped, but this behavior is [DEPRECATED] and will be removed soon. Use allowed mentions, the official way of avoiding unintended mentions, when creating messages.
* @prop {Command?} command The Command used in the Message, if any (CommandClient only)
* @prop {Array<Object>} components An array of component objects
* @prop {String} content Message content
* @prop {Number} createdAt Timestamp of message creation
* @prop {Number?} editedTimestamp Timestamp of latest message edit
* @prop {Array<Object>} embeds Array of embeds
* @prop {Number} flags Message flags (see constants)
* @prop {String} [guildID] The ID of the guild this message is in (undefined if in DMs)
* @prop {String} id The ID of the message
* @prop {String} jumpLink The url used by Discord clients to jump to this message
* @prop {Member?} member The message author with server-specific data
* @prop {Boolean} mentionEveryone Whether the message mentions everyone/here or not
* @prop {Array<User>} mentions Array of mentioned users
* @prop {Object?} messageReference An object containing the reference to the original message if it is a crossposted message or reply
* @prop {String?} messageReference.messageID The id of the original message this message was crossposted from
* @prop {String} messageReference.channelID The id of the channel this message was crossposted from
* @prop {String?} messageReference.guildID The id of the guild this message was crossposted from
* @prop {Object?} interaction An object containing info about the interaction the message is responding to, if applicable
* @prop {String} interaction.id The id of the interaction
* @prop {Number} interaction.type The type of interaction
* @prop {String} interaction.name The name of the command
* @prop {User} interaction.user The user who invoked the interaction
* @prop {Member?} interaction.member The member who invoked the interaction
* @prop {Boolean} pinned Whether the message is pinned or not
* @prop {String?} prefix The prefix used in the Message, if any (CommandClient only)
* @prop {Object} reactions An object containing the reactions on the message. Each key is a reaction emoji and each value is an object with properties `me` (Boolean) and `count` (Number) for that specific reaction emoji.
* @prop {Message?} referencedMessage The message that was replied to. If undefined, message data was not received. If null, the message was deleted.
* @prop {Array<String>} roleMentions Array of mentioned roles' ids
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
            id: data.channel_id
        };
        this.content = "";
        this.hit = !!data.hit;
        this.reactions = {};
        this.guildID = data.guild_id;
        this.webhookID = data.webhook_id;

        if(data.message_reference) {
            this.messageReference = {
                messageID: data.message_reference.message_id,
                channelID: data.message_reference.channel_id,
                guildID: data.message_reference.guild_id
            };
        } else {
            this.messageReference = null;
        }

        this.flags = data.flags || 0;

        if(data.author) {
            if(data.author.discriminator !== "0000") {
                this.author = this._client.users.update(data.author, client);
            } else {
                this.author = new User(data.author, client);
            }
        } else {
            this._client.emit("error", new Error("MESSAGE_CREATE but no message author:\n" + JSON.stringify(data, null, 2)));
        }
        if(data.referenced_message) {
            const channel = this._client.getChannel(data.referenced_message.channel_id);
            if(channel) {
                this.referencedMessage = channel.messages.update(data.referenced_message, this._client);
            } else {
                this.referencedMessage = new Message(data.referenced_message, this._client);
            }
        } else {
            this.referencedMessage = data.referenced_message;
        }

        if(data.interaction) {
            this.interaction = data.interaction;
            let interactionMember;
            const interactionUser = this._client.users.update(data.interaction.user, client);
            if(data.interaction.member) {
                data.interaction.member.id = data.interaction.user.id;
                if(this.channel.guild) {
                    interactionMember = this.channel.guild.members.update(data.interaction.member, this.channel.guild);
                } else {
                    interactionMember = data.interaction.member;
                }
            } else if(this.channel.guild && this.channel.guild.members.has(data.interaction.user.id)) {
                interactionMember = this.channel.guild.members.get(data.interaction.user.id);
            } else {
                interactionMember = null;
            }
            this.interaction.user = interactionUser;
            this.interaction.member = interactionMember;
        } else {
            this.interaction = null;
        }

        if(this.channel.guild) {
            if(data.member) {
                data.member.id = this.author.id;
                if(data.author) {
                    data.member.user = data.author;
                }
                this.member = this.channel.guild.members.update(data.member, this.channel.guild);
            } else if(this.channel.guild.members.has(this.author.id)) {
                this.member = this.channel.guild.members.get(this.author.id);
            } else {
                this.member = null;
            }

            if(!this.guildID) {
                this.guildID = this.channel.guild.id;
            }
        } else {
            this.member = null;
        }

        switch(this.type) {
            case MessageTypes.DEFAULT: {
                break;
            }
            case MessageTypes.RECIPIENT_ADD: {
                data.content = `${this.author.mention} added <@${data.mentions[0].id}>.`;
                break;
            }
            case MessageTypes.RECIPIENT_REMOVE: {
                if(this.author.id === data.mentions[0].id) {
                    data.content = `@${this.author.username} left the group.`;
                } else {
                    data.content = `${this.author.mention} removed @${data.mentions[0].username}.`;
                }
                break;
            }
            case MessageTypes.CALL: {
                if(data.call.ended_timestamp) {
                    if((!this.channel.lastCall || this.channel.lastCall.endedTimestamp < Date.parse(data.call.ended_timestamp))) {
                        data.call.id = this.id;
                        this.channel.lastCall = new Call(data.call, this.channel);
                    }
                    if(data.call.participants.includes(this._client.user.id)) {
                        data.content = `You missed a call from ${this.author.mention}.`;
                    } else {
                        data.content = `${this.author.mention} started a call.`;
                    }
                } else {
                    if(!this.channel.call) {
                        data.call.id = this.id;
                        this.channel.call = new Call(data.call, this.channel);
                    }
                    data.content = `${this.author.mention} started a call. — Join the call.`;
                }
                break;
            }
            case MessageTypes.CHANNEL_NAME_CHANGE: {
                data.content = `${this.author.mention} changed the channel name: ${data.content}`;
                break;
            }
            case MessageTypes.CHANNEL_ICON_CHANGE: {
                data.content = `${this.author.mention} changed the channel icon.`;
                break;
            }
            case MessageTypes.CHANNEL_PINNED_MESSAGE: {
                data.content = `${this.author.mention} pinned a message to this channel. See all the pins.`;
                break;
            }
            case MessageTypes.GUILD_MEMBER_JOIN: {
                data.content = SystemJoinMessages[~~(this.createdAt % SystemJoinMessages.length)].replace(/%user%/g, this.author.mention);
                break;
            }
            case MessageTypes.USER_PREMIUM_GUILD_SUBSCRIPTION: {
                data.content = `${this.author.mention} just boosted the server!`;
                break;
            }
            case MessageTypes.USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1:
            case MessageTypes.USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2:
            case MessageTypes.USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3: {
                data.content = `${this.author.mention} just boosted the server! ${this.channel.guild ? this.channel.guild.name : data.guild_id} has achieved **Level ${this.type - 8}!**`;
                break;
            }
            case MessageTypes.CHANNEL_FOLLOW_ADD: {
                data.content = `${this.author.mention} has added ${data.content} to this channel`;
                break;
            }
            case MessageTypes.GUILD_DISCOVERY_DISQUALIFIED: {
                data.content = "This server has been removed from Server Discovery because it no longer passes all the requirements. Check `Server Settings` for more details.";
                break;
            }
            case MessageTypes.GUILD_DISCOVERY_REQUALIFIED: {
                data.content = "This server is eligible for Server Discovery again and has been automatically relisted!";
                break;
            }
            case MessageTypes.GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING: {
                data.content = "This server has failed Discovery activity requirements for 1 week. If this server fails for 4 weeks in a row, it will be automatically removed from Discovery.";
                break;
            }
            case MessageTypes.GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING: {
                data.content = "This server has failed Discovery activity requirements for 3 weeks in a row. If this server fails for 1 more week, it will be removed from Discovery.";
                break;
            }
            case MessageTypes.THREAD_CREATED: {
                break;
            }
            case MessageTypes.REPLY: {
                break;
            }
            case MessageTypes.CHAT_INPUT_COMMAND: {
                break;
            }
            case MessageTypes.CONTEXT_MENU_COMMAND: {
                break;
            }
            case MessageTypes.THREAD_STARTER_MESSAGE: {
                break;
            }
            case MessageTypes.GUILD_INVITE_REMINDER: {
                data.content = "Wondering who to invite?\nStart by inviting anyone who can help you build the server!";
                break;
            }
            default: {
                this._client.emit("warn", `Unhandled MESSAGE_CREATE type: ${JSON.stringify(data, null, 2)}`);
                break;
            }
        }

        this.update(data, client);
    }

    update(data, client) {
        if(this.type === 3) { // (╯°□°）╯︵ ┻━┻
            (this.channel.call || this.channel.lastCall).update(data.call);
        }
        if(data.content !== undefined) {
            this.content = data.content || "";
            this.mentionEveryone = !!data.mention_everyone;

            this.mentions = data.mentions.map((mention) => {
                const user = this._client.users.add(mention, client);
                if(mention.member && this.channel.guild) {
                    mention.member.id = mention.id;
                    this.channel.guild.members.update(mention.member, this.channel.guild);
                }
                return user;
            });

            this.roleMentions = data.mention_roles;
        }

        if(data.pinned !== undefined) {
            this.pinned = !!data.pinned;
        }
        if(data.edited_timestamp != undefined) {
            this.editedTimestamp = Date.parse(data.edited_timestamp);
        }
        if(data.tts !== undefined) {
            this.tts = data.tts;
        }
        if(data.attachments !== undefined) {
            this.attachments = data.attachments;
        }
        if(data.embeds !== undefined) {
            this.embeds = data.embeds;
        }
        if(data.flags !== undefined) {
            this.flags = data.flags;
        }
        if(data.activity !== undefined) {
            this.activity = data.activity;
        }
        if(data.application !== undefined) {
            this.application = data.application;
        }
        if(data.application_id !== undefined) {
            this.applicationID = data.application_id;
        }

        if(data.reactions) {
            data.reactions.forEach((reaction) => {
                this.reactions[reaction.emoji.id ? `${reaction.emoji.name}:${reaction.emoji.id}` : reaction.emoji.name] = {
                    count: reaction.count,
                    me: reaction.me
                };
            });
        }

        if(data.stickers !== undefined) {
            this.stickers = data.stickers;
        }

        if(data.sticker_items !== undefined) {
            this.stickerItems = data.sticker_items.map((sticker) => {
                if(sticker.user) {
                    sticker.user = this._client.users.update(sticker.user, client);
                }

                return sticker;
            });
        }

        if(data.components !== undefined) {
            this.components = data.components;
        }
    }

    get channelMentions() {
        if(this._channelMentions) {
            return this._channelMentions;
        }

        return (this._channelMentions = (this.content && this.content.match(/<#[0-9]+>/g) || []).map((mention) => mention.substring(2, mention.length - 1)));
    }

    get cleanContent() {
        let cleanContent = this.content && this.content.replace(/<a?(:\w+:)[0-9]+>/g, "$1") || "";

        let authorName = this.author.username;
        if(this.channel.guild) {
            const member = this.channel.guild.members.get(this.author.id);
            if(member && member.nick) {
                authorName = member.nick;
            }
        }
        cleanContent = cleanContent.replace(new RegExp(`<@!?${this.author.id}>`, "g"), "@\u200b" + authorName);

        if(this.mentions) {
            this.mentions.forEach((mention) => {
                if(this.channel.guild) {
                    const member = this.channel.guild.members.get(mention.id);
                    if(member && member.nick) {
                        cleanContent = cleanContent.replace(new RegExp(`<@!?${mention.id}>`, "g"), "@\u200b" + member.nick);
                    }
                }
                cleanContent = cleanContent.replace(new RegExp(`<@!?${mention.id}>`, "g"), "@\u200b" + mention.username);
            });
        }

        if(this.channel.guild && this.roleMentions) {
            for(const roleID of this.roleMentions) {
                const role = this.channel.guild.roles.get(roleID);
                const roleName = role ? role.name : "deleted-role";
                cleanContent = cleanContent.replace(new RegExp(`<@&${roleID}>`, "g"), "@\u200b" + roleName);
            }
        }

        this.channelMentions.forEach((id) => {
            const channel = this._client.getChannel(id);
            if(channel && channel.name && channel.mention) {
                cleanContent = cleanContent.replace(channel.mention, "#" + channel.name);
            }
        });

        return cleanContent.replace(/@everyone/g, "@\u200beveryone").replace(/@here/g, "@\u200bhere");
    }

    get jumpLink() {
        return `${Endpoints.CLIENT_URL}${Endpoints.MESSAGE_LINK(this.channel.type === 1 ? "@me" : this.channel.guild.id, this.channel.id, this.id)}`;
    }

    /**
    * Add a reaction to a message
    * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
    * @arg {String} [userID="@me"] The ID of the user to react as. Passing this parameter is deprecated and will not be supported in future versions.
    * @returns {Promise}
    */
    addReaction(reaction, userID) {
        if(this.flags & MessageFlags.EPHEMERAL) {
            throw new Error("Ephemeral messages cannot have reactions");
        }
        return this._client.addMessageReaction.call(this._client, this.channel.id, this.id, reaction, userID);
    }

    /**
    * Create a thread with this message
    * @arg {Object} options The thread options
    * @arg {Number} options.autoArchiveDuration Duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080
    * @arg {String} options.name The thread channel name
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
        if(this.flags & MessageFlags.EPHEMERAL) {
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
        if(this.flags & MessageFlags.EPHEMERAL) {
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
        if(!this.webhookID) {
            throw new Error("Message is not a webhook");
        }
        if(this.flags & MessageFlags.EPHEMERAL) {
            throw new Error("Ephemeral messages cannot be deleted");
        }
        return this._client.deleteWebhookMessage.call(this._client, this.webhookID, token, this.id);
    }

    /**
    * Edit the message
    * @arg {String | Array | Object} content A string, array of strings, or object. If an object is passed:
    * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {Array<Object>} [content.components] An array of component objects
    * @arg {String} [content.components[].custom_id] The ID of the component (type 2 style 0-4 and type 3 only)
    * @arg {Boolean} [content.components[].disabled] Whether the component is disabled (type 2 and 3 only)
    * @arg {Object} [content.components[].emoji] The emoji to be displayed in the component (type 2)
    * @arg {String} [content.components[].label] The label to be displayed in the component (type 2)
    * @arg {Number} [content.components[].max_values] The maximum number of items that can be chosen (1-25, default 1)
    * @arg {Number} [content.components[].min_values] The minimum number of items that must be chosen (0-25, default 1)
    * @arg {Array<Object>} [content.components[].options] The options for this component (type 3 only)
    * @arg {Boolean} [content.components[].options[].default] Whether this option should be the default value selected
    * @arg {String} [content.components[].options[].description] The description for this option
    * @arg {Object} [content.components[].options[].emoji] The emoji to be displayed in this option
    * @arg {String} content.components[].options[].label The label for this option
    * @arg {Number | String} content.components[].options[].value The value for this option
    * @arg {String} [content.components[].placeholder] The placeholder text for the component when no option is selected (type 3 only)
    * @arg {Number} [content.components[].style] The style of the component (type 2 only) - If 0-4, `custom_id` is required; if 5, `url` is required
    * @arg {Number} content.components[].type The type of component - If 1, it is a collection and a `components` array (nested) is required; if 2, it is a button; if 3, it is a select menu
    * @arg {String} [content.components[].url] The URL that the component should open for users (type 2 style 5 only)
    * @arg {String} [content.content] A content string
    * @arg {Object} [content.embed] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Array<Object>} [content.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Object | Array<Object>} [content.file] A file object (or an Array of them)
    * @arg {Buffer} content.file[].file A buffer containing file data
    * @arg {String} content.file[].name What to name the file
    * @arg {Number} [content.flags] A number representing the flags to apply to the message. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#message-object-message-flags) for flags reference
    * @returns {Promise<Message>}
    */
    edit(content) {
        if(this.flags & MessageFlags.EPHEMERAL) {
            throw new Error("Ephemeral messages cannot be edited via this method");
        }
        return this._client.editMessage.call(this._client, this.channel.id, this.id, content);
    }

    /**
    * Edit the message as a webhook
    * @arg {String} token The token of the webhook
    * @arg {Object} options Webhook message edit options
    * @arg {Object} [options.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [options.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean} [options.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to.
    * @arg {Boolean | Array<String>} [options.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [options.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {Array<Object>} [options.components] An array of component objects
    * @arg {String} [options.components[].custom_id] The ID of the component (type 2 style 0-4 and type 3 only)
    * @arg {Boolean} [options.components[].disabled] Whether the component is disabled (type 2 only)
    * @arg {Object} [options.components[].emoji] The emoji to be displayed in the component (type 2)
    * @arg {String} [options.components[].label] The label to be displayed in the component (type 2)
    * @arg {Number} [options.components[].max_values] The maximum number of items that can be chosen (1-25, default 1)
    * @arg {Number} [options.components[].min_values] The minimum number of items that must be chosen (0-25, default 1)
    * @arg {Array<Object>} [options.components[].options] The options for this component (type 3 only)
    * @arg {Boolean} [options.components[].options[].default] Whether this option should be the default value selected
    * @arg {String} [options.components[].options[].description] The description for this option
    * @arg {Object} [options.components[].options[].emoji] The emoji to be displayed in this option
    * @arg {String} options.components[].options[].label The label for this option
    * @arg {Number | String} options.components[].options[].value The value for this option
    * @arg {String} [options.components[].placeholder] The placeholder text for the component when no option is selected (type 3 only)
    * @arg {Number} [options.components[].style] The style of the component (type 2 only) - If 0-4, `custom_id` is required; if 5, `url` is required
    * @arg {Number} options.components[].type The type of component - If 1, it is a collection and a `components` array (nested) is required; if 2, it is a button; if 3, it is a select menu
    * @arg {String} [options.components[].url] The URL that the component should open for users (type 2 style 5 only)
    * @arg {String} [options.content] A content string
    * @arg {Object} [options.embed] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Array<Object>} [options.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Object | Array<Object>} [options.file] A file object (or an Array of them)
    * @arg {Buffer} options.file.file A buffer containing file data
    * @arg {String} options.file.name What to name the file
    * @returns {Promise<Message>}
    */
    editWebhook(token, options) {
        if(!this.webhookID) {
            throw new Error("Message is not a webhook");
        }
        return this._client.editWebhookMessage.call(this._client, this.webhookID, token, this.id, options);
    }

    /**
    * Get a list of users who reacted with a specific reaction
    * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
    * @arg {Object} [options] Options for the request. If this is a number, it is treated as `options.limit` ([DEPRECATED] behavior)
    * @arg {Number} [options.limit=100] The maximum number of users to get
    * @arg {String} [options.after] Get users after this user ID
    * @arg {String} [before] [DEPRECATED] Get users before this user ID. Discord no longer supports this parameter
    * @arg {String} [after] [DEPRECATED] Get users after this user ID
    * @returns {Promise<Array<User>>}
    */
    getReaction(reaction, options, before, after) {
        if(this.flags & MessageFlags.EPHEMERAL) {
            throw new Error("Ephemeral messages cannot have reactions");
        }
        return this._client.getMessageReaction.call(this._client, this.channel.id, this.id, reaction, options, before, after);
    }

    /**
    * Pin the message
    * @returns {Promise}
    */
    pin() {
        if(this.flags & MessageFlags.EPHEMERAL) {
            throw new Error("Ephemeral messages cannot be pinned");
        }
        return this._client.pinMessage.call(this._client, this.channel.id, this.id);
    }

    /**
    * Remove a reaction from a message
    * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
    * @arg {String} [userID="@me"] The ID of the user to remove the reaction for.
    * @returns {Promise}
    */
    removeReaction(reaction, userID) {
        if(this.flags & MessageFlags.EPHEMERAL) {
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
        if(this.flags & MessageFlags.EPHEMERAL) {
            throw new Error("Ephemeral messages cannot have reactions");
        }
        return this._client.removeMessageReactionEmoji.call(this._client, this.channel.id, this.id, reaction);
    }

    /**
    * Remove all reactions from a message
    * @returns {Promise}
    */
    removeReactions() {
        if(this.flags & MessageFlags.EPHEMERAL) {
            throw new Error("Ephemeral messages cannot have reactions");
        }
        return this._client.removeMessageReactions.call(this._client, this.channel.id, this.id);
    }

    /**
    * Unpin the message
    * @returns {Promise}
    */
    unpin() {
        if(this.flags & MessageFlags.EPHEMERAL) {
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
            "content",
            "editedTimestamp",
            "embeds",
            "flags",
            "guildID",
            "hit",
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
            ...props
        ]);
    }
}

module.exports = Message;
