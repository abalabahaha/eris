"use strict";

const Base = require("./Base");
//const InteractionData = require("./InteractionData");
const Message = require("./Message");
const Member = require("./Member");
const Constants = require("../Constants");
const Endpoints = require("../rest/Endpoints");

/**
* Represents a member's voice state in a call/guild
* @prop {String} applicationId The id of the interaction's application
* @prop {String?} channelId The interaction token
* @prop {InteractionData} data The data attached to the interaction
* @prop {String?} guildId The id of the guild in which the interaction was created
* @prop {String} id The interaction id
* @prop {Member?} member the member who triggered the interaction
* @prop {Message?} message The message the interaction came from (Message Component only)
* @prop {String} token The interaction token
* @prop {Number} type 1 is a Ping, 2 is a Slash Command, 3 is a Message Component
* @prop {Number} version The interaction version
* 
*/
class Interaction extends Base {
    constructor(data, client) {
        super(data.id);
        this._client = client;

        this.applicationId = data.application_id;
        this.type = data.type
        this.version = data.version

        if(data.channel_id) {
            this.channelId = data.channel_id;
        } else {
            this.channelId = null;
        }

        if(data.data) {
            this.data = data.data; //new InteractionData(data.data);
        } else {
            this.data = null;
        }        

        if(data.guild_id) {
            this.guildId = data.guild_id;
        } else {
            this.guildId = null;
        }

        if(data.member) {
            this.member = new Member(data.member);
        } else {
            this.member = null;
        }

        if(data.message) {
            this.message = new Message(data.message, this._client);
        } else {
            this.message = null;
        }

        if(data.token) {
            this.token = data.token;
        } else {
            this.token = null;
        }
    }

    /**
    * Acknowledges the interaction without replying.
    * @returns {Promise<Boolean | Error>}
    */
    async acknowledge() {
        this._client.requestHandler.request("POST", Endpoints.INTERACTION_RESPONSE(this.id, this.token), true, {
            type: Constants.InteractionResponseType.PONG
        }).then(() => {return true}).catch(err => {return err});
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
    * @arg {Boolean} [content.tts] Set the message TTS flag
    * @arg {Boolean} [content.flags] 64 for Ephemeral
    * @returns {Promise}
    */

    async createMessage(content) {
        return await this._client.requestHandler.request("POST", Endpoints.INTERACTION_RESPONSE(this.id, this.token), true, {
            type: 4,
            content: content.content || "Gamer",
            embeds: content.embeds || [],
            allowed_mentions: content.allowed_mentions || null,
            flags: content.flags || 0,
        })
    }

}


module.exports = Interaction;
