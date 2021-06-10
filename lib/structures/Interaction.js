"use strict";

const Base = require("./Base");
const Message = require("./Message");
const Member = require("./Member");
const Constants = require("../Constants");

/**
* Represents an interaction
* @prop {String} applicationId The id of the interaction's application
* @prop {String?} channelId The interaction token
* @prop {Object?} data The data attached to the interaction
* @prop {Number?} data.componentType The type of Message Component (Message Component only)
* @prop {String?} data.id The ID of the Slash Command (Slash Command)
* @prop {String?} data.custom_id The ID of the Button (Message Component)
* @prop {String?} data.name The command name (Slash Command only)
* @prop {Array<Object>?} data.options The run Slash Command options (Slash Command only)
* @prop {String?} data.options.name The name of the Slash Command option (Slash Command only)
* @prop {String?} data.options.value The value of the run Slash Command (Slash Command only)
* @prop {String?} guildId The id of the guild in which the interaction was created
* @prop {String} id The interaction id
* @prop {Member?} member the member who triggered the interaction
* @prop {Message?} message The message the interaction came from (Message Component only)
* @prop {String} token The interaction token (Interaction tokens are valid for 15 minutes and can be used to send followup messages but you must send an initial response within 3 seconds of receiving the event. If the 3 second deadline is exceeded, the token will be invalidated.)
* @prop {Number} type 1 is a Ping, 2 is a Slash Command, 3 is a Message Component
* @prop {Number} version The interaction version
*/
class Interaction extends Base {
    constructor(data, client) {
        super(data.id);
        this._client = client;

        this.applicationId = data.application_id;

        if(data.channel_id !== undefined) {
            this.channelId = data.channel_id;
        }

        if(data.data !== undefined) {
            this.data = data.data;
        }

        if(data.guild_id !== undefined) {
            this.guildId = data.guild_id;
        }

        if(data.member !== undefined) {
            this.member = new Member(data.member, client.guilds.get(data.guild_id), this._client);
        }

        if(data.message !== undefined) {
            this.message = new Message(data.message, this._client);
        }

        if(data.token !== undefined) {
            this.token = data.token;
        }

        this.type = data.type;
        this.version = data.version;
    }

    /**
    * Note: You can **not** use more then 1 initial interaction response per interaction.
    * Acknowledges the interaction without replying. (Message Component only)
    * @returns {Promise}
    */
    async acknowledge() {
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: Constants.InteractionResponseType.DEFERRED_UPDATE_MESSAGE
        });
    }

    /**
    * Respond to the interaction
    * @arg {String | Object} content A string or object. If an object is passed:
    * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {String} content.content A content string
    * @arg {Object} [content.embed] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Boolean} [content.flags] 64 for Ephemeral
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
            } else if(content.content === undefined && !content.embed && content.flags === undefined) {
                return Promise.reject(new Error("No content, embed or flags"));
            }
            if(content.content !== undefined || content.embed || content.allowedMentions) {
                content.allowed_mentions = this._client._formatAllowedMentions(content.allowedMentions);
            }
        }
        return this._client.executeWebhook.call(this._client, this.applicationId, this.token, content);
    }

    /**
    * Respond to the interaction with a message
    * Note: You can **not** use more then 1 initial interaction response per interaction, use createFollowup if you have already responded with a different interaction response.
    * @arg {String | Object} content A string or object. If an object is passed:
    * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {String} content.content A content string
    * @arg {Object} [content.embed] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Boolean} [content.flags] 64 for Ephemeral
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
            } else if(content.content === undefined && !content.embed && content.flags === undefined) {
                return Promise.reject(new Error("No content, embed or flags"));
            }
            if(content.content !== undefined || content.embed || content.allowedMentions) {
                content.allowed_mentions = this._client._formatAllowedMentions(content.allowedMentions);
            }
        }
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: Constants.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: content
        });
    }

    /**
    * Defer response to the interaction
    * Note: You can **not** use more then 1 initial interaction response per interaction.
    * @arg {Boolean} [flags] 64 for Ephemeral
    * @returns {Promise}
    */
    async defer(flags) {
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: Constants.InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                flags: flags || 0
            }
        });
    }

    /**
    * Defer message update (Message Component only)
    * Note: You can **not** use more then 1 initial interaction response per interaction.
    * @returns {Promise}
    */
    async deferUpdate() {
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: Constants.InteractionResponseType.DEFERRED_UPDATE_MESSAGE
        });
    }

    /**
    * Delete a message
    * @arg {String} messageId the id of the message to edit, or "@original" for the original response, "@original" will will error with ephemeral messages
    * @returns {Promise}
    */
    async delete(messageId) {
        return this._client.deleteWebhookMessage.call(this._client, this.applicationId, this.token, messageId);
    }

    /**
    * Edit a message
    * @arg {String} messageId the id of the message to edit, or "@original" for the original response, "@original" will will error with ephemeral messages
    * @arg {Object} options Interaction message edit options
    * @arg {Object} [options.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [options.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [options.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [options.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {Boolean} [options.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to.
    * @arg {String} [options.content=""] A content string
    * @arg {Array<Object>} [options.embeds] An array of Discord embeds
    * @arg {Object | Array<Object>} [options.file] A file object (or an Array of them)
    * @arg {Buffer} options.file.file A buffer containing file data
    * @arg {String} options.file.name What to name the file
    * @returns {Promise<Message>}
    */
    async edit(messageId, content) {
        if(content !== undefined) {
            if(typeof content !== "object" || content === null) {
                content = {
                    content: "" + content
                };
            } else if(content.content !== undefined && typeof content.content !== "string") {
                content.content = "" + content.content;
            } else if(content.content === undefined && !content.embed && content.flags === undefined) {
                return Promise.reject(new Error("No content, embed or flags"));
            }
            if(content.content !== undefined || content.embed || content.allowedMentions) {
                content.allowed_mentions = this._client._formatAllowedMentions(content.allowedMentions);
            }
        }
        return this._client.editWebhookMessage.call(this._client, this.applicationId, this.token, messageId, content, true);
    }

    /**
    * Edit the interaction Message
    * Note: You can **not** use more then 1 initial interaction response per interaction, use edit if you have already responded with a different interaction response.
    * @arg {String | Object} content What to edit the message with
    * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {Boolean} [content.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to.
    * @arg {String} [content.content=""] A content string
    * @arg {Array<Object>} [content.embeds] An array of Discord embeds
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
            } else if(content.content === undefined && !content.embed && content.flags === undefined) {
                return Promise.reject(new Error("No content, embed or flags"));
            }
            if(content.content !== undefined || content.embed || content.allowedMentions) {
                content.allowed_mentions = this._client._formatAllowedMentions(content.allowedMentions);
            }
        }
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: Constants.InteractionResponseType.UPDATE_MESSAGE,
            data: content
        });
    }

}

module.exports = Interaction;
