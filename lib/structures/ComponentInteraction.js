"use strict";

const Interaction = require("./Interaction");
const Message = require("./Message");
const Member = require("./Member");
const {InteractionResponseTypes} = require("../Constants");

/**
* Represents a message component interaction. See Interaction for more properties.
* @extends Interaction
* @prop {Object} data The data attached to the interaction
* @prop {Number} data.component_type The type of Message Component
* @prop {String} data.custom_id The ID of the Message Component
* @prop {Array<String>?} data.values The value of the run selected options (Select Menus Only)
* @prop {Message?} message The message the interaction came from.
*/
class ComponentInteraction extends Interaction {
    constructor(data, client) {
        super(data, client);

        if(data.member !== undefined) {
            if(this.channel.guild) {
                data.member.id = data.member.user.id;
                this.member = this.channel.guild.members.update(data.member, this.channel.guild);
            } else {
                const guild = this._client.guilds.get(data.guild_id);
                this.member = new Member(data.member, guild, this._client);
            }
        }

        if(data.message !== undefined) {
            this.message = new Message(data.message, this._client);
        }
    }

    /**
    * Acknowledges the interaction with a defer message update response
    * @returns {Promise}
    */
    acknowledge() {
        return this.deferUpdate();
    }

    /**
    * Respond to the interaction with a followup message
    * @arg {String | Object} content A string or object. If an object is passed:
    * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {Array<Object>} [content.components] An array of components. See [Discord's Documentation](https://discord.com/developers/docs/interactions/message-components#what-is-a-component) for object structure
    * @arg {String} [content.content] A content string
    * @arg {Object} [content.embed] An embed object. See [Discord's Documentation](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Array<Object>} [options.embeds] An array of embed objects. See [Discord's Documentation](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Number} [content.flags] A number representing the flags to apply. See [Discord's Documentation](https://discord.com/developers/docs/resources/channel#message-object-message-flags) for a list
    * @arg {Boolean} [content.tts] Set the message TTS flag
    * @arg {Object | Array<Object>} [file] A file object (or an Array of them)
    * @arg {Buffer} file.file A buffer containing file data
    * @arg {String} file.name What to name the file
    * @returns {Promise<Message?>}
    */
    createFollowup(content, file) {
        if(this.acknowledged === false) {
            throw new Error("createFollowup cannot be used to acknowledge an interaction, please use acknowledge, createMessage, defer, deferUpdate, or editParent first.");
        }
        if(content !== undefined) {
            if(typeof content !== "object" || content === null) {
                content = {
                    content: "" + content
                };
            } else if(content.content !== undefined && typeof content.content !== "string") {
                content.content = "" + content.content;
            }
        }
        if(file) {
            content.file = file;
        }
        return this._client.executeWebhook.call(this._client, this.applicationID, this.token, Object.assign({wait: true}, content));
    }

    /**
    * Acknowledges the interaction with a message. If already acknowledged runs createFollowup
    * Note: You can **not** use more than 1 initial interaction response per interaction, use createFollowup if you have already responded with a different interaction response.
    * @arg {String | Object} content A string or object. If an object is passed:
    * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {Array<Object>} [content.components] An array of components. See [Discord's Documentation](https://discord.com/developers/docs/interactions/message-components#what-is-a-component) for object structure
    * @arg {String} [content.content] A content string
    * @arg {Object} [content.embed] An embed object. See [Discord's Documentation](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Array<Object>} [content.embeds] An array of embed objects. See [Discord's Documentation](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Number} [content.flags] A number representing the flags to apply. See [Discord's Documentation](https://discord.com/developers/docs/resources/channel#message-object-message-flags) for a list
    * @arg {Boolean} [content.tts] Set the message TTS flag
    * @arg {Object | Array<Object>} [file] A file object (or an Array of them)
    * @arg {Buffer} file.file A buffer containing file data
    * @arg {String} file.name What to name the file
    * @returns {Promise}
    */
    createMessage(content, file) {
        if(this.acknowledged === true) {
            return this.createFollowup(content, file);
        }
        if(content !== undefined) {
            if(typeof content !== "object" || content === null) {
                content = {
                    content: "" + content
                };
            } else if(content.content !== undefined && typeof content.content !== "string") {
                content.content = "" + content.content;
            }
            if(content.content !== undefined || content.embeds || content.allowedMentions) {
                content.allowed_mentions = this._client._formatAllowedMentions(content.allowedMentions);
            }
        }
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: InteractionResponseTypes.CHANNEL_MESSAGE_WITH_SOURCE,
            data: content
        }, file).then(() => this.update());
    }

    /**
    * Acknowledges the interaction with a defer response
    * Note: You can **not** use more than 1 initial interaction response per interaction.
    * @arg {Number} [flags] A number representing the flags to apply. See [Discord's Documentation](https://discord.com/developers/docs/resources/channel#message-object-message-flags) for a list
    * @returns {Promise}
    */
    defer(flags) {
        if(this.acknowledged === true) {
            throw new Error("You have already acknowledged this interaction.");
        }
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: InteractionResponseTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                flags: flags || 0
            }
        }).then(() => this.update());
    }

    /**
    * Acknowledges the interaction with a defer message update response
    * Note: You can **not** use more than 1 initial interaction response per interaction.
    * @returns {Promise}
    */
    deferUpdate() {
        if(this.acknowledged === true) {
            throw new Error("You have already acknowledged this interaction.");
        }
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: InteractionResponseTypes.DEFERRED_UPDATE_MESSAGE
        }).then(() => this.update());
    }

    /**
    * Delete a message
    * @arg {String} messageID the id of the message to delete, or "@original" for the original response.
    * @returns {Promise}
    */
    deleteMessage(messageID) {
        if(this.acknowledged === false) {
            throw new Error("deleteMessage cannot be used to acknowledge an interaction, please use acknowledge, createMessage, defer, deferUpdate, or editParent first.");
        }
        return this._client.deleteWebhookMessage.call(this._client, this.applicationID, this.token, messageID);
    }

    /**
    * Delete the parent message
    * Warning: Will error with ephemeral messages.
    * @returns {Promise}
    */
    deleteOriginalMessage() {
        if(this.acknowledged === false) {
            throw new Error("deleteOriginalMessage cannot be used to acknowledge an interaction, please use acknowledge, createMessage, defer, deferUpdate, or editParent first.");
        }
        return this._client.deleteWebhookMessage.call(this._client, this.applicationID, this.token, "@original");
    }

    /**
    * Edit a message
    * @arg {String} messageID the id of the message to edit, or "@original" for the original response.
    * @arg {Object} content Interaction message edit options
    * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean} [content.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to.
    * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {Array<Object>} [content.components] An array of components. See [Discord's Documentation](https://discord.com/developers/docs/interactions/message-components#what-is-a-component) for object structure
    * @arg {String} [content.content] A content string
    * @arg {Object} [content.embed] An embed object. See [Discord's Documentation](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Array<Object>} [content.embeds] An array of embed objects. See [Discord's Documentation](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Object | Array<Object>} [file] A file object (or an Array of them)
    * @arg {Buffer} file.file A buffer containing file data
    * @arg {String} file.name What to name the file
    * @returns {Promise<Message>}
    */
    editMessage(messageID, content, file) {
        if(this.acknowledged === false) {
            throw new Error("editMessage cannot be used to acknowledge an interaction, please use acknowledge, createMessage, defer, deferUpdate, or editParent first.");
        }
        if(content !== undefined) {
            if(typeof content !== "object" || content === null) {
                content = {
                    content: "" + content
                };
            } else if(content.content !== undefined && typeof content.content !== "string") {
                content.content = "" + content.content;
            }
        }
        if(file) {
            content.file = file;
        }
        return this._client.editWebhookMessage.call(this._client, this.applicationID, this.token, messageID, content);
    }

    /**
    * Edit the parent message
    * @arg {Object} content Interaction message edit options
    * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean} [content.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to.
    * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {Array<Object>} [content.components] An array of components. See [Discord's Documentation](https://discord.com/developers/docs/interactions/message-components#what-is-a-component) for object structure
    * @arg {String} [content.content] A content string
    * @arg {Object} [content.embed] An embed object. See [Discord's Documentation](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Array<Object>} [content.embeds] An array of embed objects. See [Discord's Documentation](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Object | Array<Object>} [file] A file object (or an Array of them)
    * @arg {Buffer} file.file A buffer containing file data
    * @arg {String} file.name What to name the file
    * @returns {Promise<Message>}
    */
    editOriginalMessage(content, file) {
        if(this.acknowledged === false) {
            throw new Error("editOriginalMessage cannot be used to acknowledge an interaction, please use acknowledge, createMessage, defer, deferUpdate, or editParent first.");
        }
        if(content !== undefined) {
            if(typeof content !== "object" || content === null) {
                content = {
                    content: "" + content
                };
            } else if(content.content !== undefined && typeof content.content !== "string") {
                content.content = "" + content.content;
            }
        }
        if(file) {
            content.file = file;
        }
        return this._client.editWebhookMessage.call(this._client, this.applicationID, this.token, "@original", content);
    }

    /**
    * Acknowledges the interaction by editing the parent message. If already acknowledged runs editOriginalMessage
    * Note: You can **not** use more than 1 initial interaction response per interaction, use edit if you have already responded with a different interaction response.
    * Warning: Will error with ephemeral messages.
    * @arg {String | Object} content What to edit the message with
    * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
    * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here.
    * @arg {Boolean} [content.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to.
    * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
    * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
    * @arg {Array<Object>} [content.components] An array of components. See [Discord's Documentation](https://discord.com/developers/docs/interactions/message-components#what-is-a-component) for object structure
    * @arg {String} [content.content] A content string
    * @arg {Object} [content.embed] An embed object. See [Discord's Documentation](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Array<Object>} [content.embeds] An array of embed objects. See [Discord's Documentation](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
    * @arg {Number} [content.flags] A number representing the flags to apply. See [Discord's Documentation](https://discord.com/developers/docs/resources/channel#message-object-message-flags) for a list
    * @arg {Boolean} [content.tts] Set the message TTS flag
    * @arg {Object | Array<Object>} [file] A file object (or an Array of them)
    * @arg {Buffer} file.file A buffer containing file data
    * @arg {String} file.name What to name the file
    * @returns {Promise}
    */
    editParent(content, file) {
        if(this.acknowledged === true) {
            return this.editOriginalMessage(content);
        }
        if(content !== undefined) {
            if(typeof content !== "object" || content === null) {
                content = {
                    content: "" + content
                };
            } else if(content.content !== undefined && typeof content.content !== "string") {
                content.content = "" + content.content;
            }
            if(content.content !== undefined || content.embeds || content.allowedMentions) {
                content.allowed_mentions = this._client._formatAllowedMentions(content.allowedMentions);
            }
        }
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: InteractionResponseTypes.UPDATE_MESSAGE,
            data: content
        }, file).then(() => this.update());
    }

    /**
    * Get the parent message
    * Warning: Will error with ephemeral messages.
    * @returns {Promise<Message>}
    */
    getOriginalMessage() {
        if(this.acknowledged === false) {
            throw new Error("getOriginalMessage cannot be used to acknowledge an interaction, please use acknowledge, createMessage, defer, deferUpdate, or editParent first.");
        }
        return this._client.getWebhookMessage.call(this._client, this.applicationID, this.token, "@original");
    }

}

module.exports = ComponentInteraction;
