"use strict";

const Interaction = require("./Interaction");
const Message = require("./Message");
const Member = require("./Member");
const User = require("./User");
const {InteractionResponseTypes} = require("../Constants");

/**
* Represents an unknown interaction. See Interaction for more properties.
* @extends Interaction
* @prop {String?} channelID The ID of the channel in which the interaction was created
* @prop {Object?} data The data attached to the interaction
* @prop {String?} guildID The ID of the guild in which the interaction was created
* @prop {Member?} member The member who triggered the interaction (This is only sent when the interaction is invoked within a guild)
* @prop {Message?} message The message the interaction came from (Message Component only)
* @prop {User?} user The user who triggered the interaction (This is only sent when the interaction is invoked within a dm)
*/
class UnknownInteraction extends Interaction {
    constructor(data, client) {
        super(data, client);

        if(data.channel_id !== undefined) {
            this.channelID = data.channel_id;
        }

        if(data.data !== undefined) {
            this.data = data.data;
        }

        if(data.guild_id !== undefined) {
            this.guildID = data.guild_id;
        }

        if(data.member !== undefined) {
            this.member = new Member(data.member, client.guilds.get(data.guild_id), this._client);
        }

        if(data.message !== undefined) {
            this.message = new Message(data.message, this._client);
        }

        if(data.user !== undefined) {
            this.user = new User(data.user, this._client);
        }

    }

    /**
    * Respond to the interaction with a followup message
    * @arg {String | Object} content A string or object. If an object is passed:
    * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {String} content.content A content string
    * @arg {Object} [content.embeds] An array of up to 10 embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Number} [content.flags] 64 for Ephemeral
    * @arg {Object | Array<Object>} [content.file] A file object (or an Array of them)
    * @arg {Buffer} content.file.file A buffer containing file data
    * @arg {String} content.file.name What to name the file
    * @arg {Boolean} [content.tts] Set the message TTS flag
    * @returns {Promise<Message?>}
    */
    async createFollowup(content) {
        if(content !== undefined) {
            if(typeof content !== "object" || content === null) {
                content = {
                    content: "" + content
                };
            } else if(content.content !== undefined && typeof content.content !== "string") {
                content.content = "" + content.content;
            }
        }
        return this._client.executeWebhook.call(this._client, this.applicationID, this.token, content);
    }

    /**
    * Acknowledges the interaction with a message
    * Note: You can **not** use more than 1 initial interaction response per interaction, use createFollowup if you have already responded with a different interaction response.
    * @arg {String | Object} content A string or object. If an object is passed:
    * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {String} content.content A content string
    * @arg {Object} [content.embeds] An array of up to 10 embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Number} [content.flags] 64 for Ephemeral
    * @arg {Boolean} [content.tts] Set the message TTS flag
    * @returns {Promise}
    */
    async createMessage(content) {
        if(content !== undefined) {
            if(typeof content !== "object" || content === null) {
                content = {
                    content: "" + content
                };
            } else if(content.content !== undefined && typeof content.content !== "string") {
                content.content = "" + content.content;
            } else if(content.content === undefined && !content.embeds) {
                return Promise.reject(new Error("No content or embeds"));
            }
            if(content.content !== undefined || content.embeds || content.allowedMentions) {
                content.allowed_mentions = this._client._formatAllowedMentions(content.allowedMentions);
            }
        }
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: InteractionResponseTypes.CHANNEL_MESSAGE_WITH_SOURCE,
            data: content
        });
    }

    /**
    * Acknowledges the interaction with a defer response
    * Note: You can **not** use more than 1 initial interaction response per interaction.
    * @arg {Number} [flags] 64 for Ephemeral
    * @returns {Promise}
    */
    async defer(flags) {
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: InteractionResponseTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                flags: flags || 0
            }
        });
    }

    /**
    * Acknowledges the interaction with a defer message update response (Message Component only)
    * Note: You can **not** use more than 1 initial interaction response per interaction.
    * @returns {Promise}
    */
    async deferUpdate() {
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: InteractionResponseTypes.DEFERRED_UPDATE_MESSAGE
        });
    }

    /**
    * Delete a message
    * @arg {String} messageID the id of the message to delete, or "@original" for the original response.
    * @returns {Promise}
    */
    async deleteMessage(messageID) {
        return this._client.deleteWebhookMessage.call(this._client, this.applicationID, this.token, messageID);
    }

    /**
    * Delete the Original message (or the parent message for components)
    * Warning: Will error with ephemeral messages.
    * @returns {Promise}
    */
    async deleteOriginalMessage() {
        return this._client.deleteWebhookMessage.call(this._client, this.applicationID, this.token, "@original");
    }

    /**
    * Edit a message
    * @arg {String} messageID the id of the message to edit, or "@original" for the original response.
    * @arg {Object} options Interaction message edit options
    * @arg {Object} [options.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [options.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [options.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [options.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {Boolean} [options.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to.
    * @arg {String} [options.content=""] A content string
    * @arg {Object} [content.embeds] An array of up to 10 embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Object | Array<Object>} [options.file] A file object (or an Array of them)
    * @arg {Buffer} options.file.file A buffer containing file data
    * @arg {String} options.file.name What to name the file
    * @returns {Promise<Message>}
    */
    async editMessage(messageID, content) {
        if(content !== undefined) {
            if(typeof content !== "object" || content === null) {
                content = {
                    content: "" + content
                };
            } else if(content.content !== undefined && typeof content.content !== "string") {
                content.content = "" + content.content;
            }
        }
        return this._client.editWebhookMessage.call(this._client, this.applicationID, this.token, messageID, content);
    }

    /**
    * Edit the Original response message (or the parent message for components)
    * Warning: Will error with ephemeral messages.
    * @arg {Object} options Interaction message edit options
    * @arg {Object} [options.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [options.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [options.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [options.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {Boolean} [options.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to.
    * @arg {String} [options.content=""] A content string
    * @arg {Object} [content.embeds] An array of up to 10 embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Object | Array<Object>} [options.file] A file object (or an Array of them)
    * @arg {Buffer} options.file.file A buffer containing file data
    * @arg {String} options.file.name What to name the file
    * @returns {Promise<Message>}
    */
    async editOriginalMessage(content) {
        if(content !== undefined) {
            if(typeof content !== "object" || content === null) {
                content = {
                    content: "" + content
                };
            } else if(content.content !== undefined && typeof content.content !== "string") {
                content.content = "" + content.content;
            }
        }
        return this._client.editWebhookMessage.call(this._client, this.applicationID, this.token, "@original", content);
    }

    /**
    * Acknowledges the interaction by editing the parent message (Message Component only)
    * Note: You can **not** use more than 1 initial interaction response per interaction, use edit if you have already responded with a different interaction response.
    * Warning: Will error with ephemeral messages.
    * @arg {String | Object} content What to edit the message with
    * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {Boolean} [content.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to.
    * @arg {String} [content.content=""] A content string
    * @arg {Object} [content.embeds] An array of up to 10 embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Object | Array<Object>} [content.file] A file object (or an Array of them)
    * @arg {Buffer} content.file.file A buffer containing file data
    * @arg {String} content.file.name What to name the file
    * @returns {Promise}
    */
    async editParent(content) {
        if(content !== undefined) {
            if(typeof content !== "object" || content === null) {
                content = {
                    content: "" + content
                };
            } else if(content.content !== undefined && typeof content.content !== "string") {
                content.content = "" + content.content;
            } else if(content.content === undefined && content.embeds === undefined && content.components === undefined) {
                return Promise.reject(new Error("No content, embeds, or components"));
            }
            if(content.content !== undefined || content.embeds || content.allowedMentions) {
                content.allowed_mentions = this._client._formatAllowedMentions(content.allowedMentions);
            }
        }
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: InteractionResponseTypes.UPDATE_MESSAGE,
            data: content
        });
    }

    /**
    * Get the Original response message (or the parent message for components)
    * Warning: Will error with ephemeral messages.
    * @returns {Promise<Message>}
    */
    async getOriginalMessage() {
        return this._client.getWebhookMessage.call(this._client, this.applicationID, this.token, "@original");
    }

    /**
    * Acknowledges the ping interaction with a pong response (Ping Only)
    * Note: You can **not** use more than 1 initial interaction response per interaction.
    * @returns {Promise}
    */
    async pong() {
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: InteractionResponseTypes.PONG
        });
    }

}

module.exports = UnknownInteraction;
