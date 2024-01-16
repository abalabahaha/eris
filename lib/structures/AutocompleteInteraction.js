"use strict";

const Interaction = require("./Interaction");
const Permission = require("./Permission");
const {InteractionResponseTypes} = require("../Constants");

/**
 * Represents an application command autocomplete interaction. See Interaction for more properties.
 * @extends Interaction
 * @prop {Permission?} appPermissions The permissions the app or bot has within the channel the interaction was sent from
 * @prop {PrivateChannel | TextChannel | NewsChannel} channel The channel the interaction was created in. Can be partial with only the id if the channel is not cached
 * @prop {Object} data The data attached to the interaction
 * @prop {String} data.id The ID of the Application Command
 * @prop {String} data.name The command name
 * @prop {Array<Object>?} data.options The run Application Command options
 * @prop {Boolean?} data.options[].focused Whether or not the option is focused
 * @prop {String} data.options[].name The name of the Application Command option
 * @prop {Array<Object>?} data.options[].options The run Application Command options (Mutually exclusive with value)
 * @prop {Number} data.options[].type Command option type, 1-10
 * @prop {(String | Number | Boolean)?} data.options[].value The value of the run Application Command (Mutually exclusive with options)
 * @prop {String?} data.target_id The ID the of user or message targetted by a context menu command
 * @prop {Number} data.type The [command type](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types)
 * @prop {String?} guildID The ID of the guild in which the interaction was created
 * @prop {Member?} member The member who triggered the interaction (This is only sent when the interaction is invoked within a guild)
 * @prop {User?} user The user who triggered the interaction (This is only sent when the interaction is invoked within a dm)
 */
class AutocompleteInteraction extends Interaction {
    constructor(data, client) {
        super(data, client);

        this.channel = this._client.getChannel(data.channel_id) || {
            id: data.channel_id
        };

        this.data = data.data;

        if(data.guild_id !== undefined) {
            this.guildID = data.guild_id;
        }

        if(data.member !== undefined) {
            if(this.channel.guild) {
                data.member.id = data.member.user.id;
                this.member = this.channel.guild.members.update(data.member, this.channel.guild);
            } else {
                const guild = this._client.guilds.get(data.guild_id);
                this.member = guild.members.update(data.member, guild);
            }
        }

        if(data.user !== undefined) {
            this.user = this._client.users.update(data.user, client);
        }

        if(data.app_permissions !== undefined) {
            this.appPermissions = new Permission(data.app_permissions);
        }
    }

    /**
     * Acknowledges the autocomplete interaction with a result of choices
     * Note: You can **not** use more than 1 initial interaction response per interaction
     * @arg {Array<Object>} choices The autocomplete choices to return to the user
     * @arg {String | Number} choices[].name The choice display name
     * @arg {String} choices[].value The choice value to return to the bot
     * @returns {Promise}
     */
    async acknowledge(choices) {
        return this.result(choices);
    }

    /**
     * Acknowledges the autocomplete interaction with a result of choices
     * Note: You can **not** use more than 1 initial interaction response per interaction.
     * @arg {Array<Object>} choices The autocomplete choices to return to the user
     * @arg {String | Number} choices[].name The choice display name
     * @arg {String} choices[].value The choice value to return to the bot
     * @returns {Promise}
     */
    async result(choices) {
        if(this.acknowledged === true) {
            throw new Error("You have already acknowledged this interaction.");
        }
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: InteractionResponseTypes.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
            data: {choices}
        }).then(() => this.update());
    }

}

module.exports = AutocompleteInteraction;
