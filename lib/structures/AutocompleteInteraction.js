"use strict";

const Interaction = require("./Interaction");
const {InteractionResponseTypes} = require("../Constants");

/**
* Represents an application command autocomplete interaction. See Interaction for more properties.
* @extends Interaction
* @prop {Object} data The data attached to the interaction
* @prop {String} data.id The ID of the Application Command
* @prop {String} data.name The command name
* @prop {Number} data.type The [command type](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types)
* @prop {String?} data.target_id The id the of user or message targetted by a context menu command
* @prop {Array<Object>?} data.options The run Application Command options
* @prop {String} data.options[].name The name of the Application Command option
* @prop {Number} data.options[].type The [option type](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type)
* @prop {(String | Number | Boolean)?} data.options[].value The option value (Mutually exclusive with options)
* @prop {Boolean?} data.options[].focused If the option is focused
* @prop {Array<Object>?} data.options[].options Sub-options (Mutually exclusive with value, subcommand/subcommandgroup)
*/
class AutocompleteInteraction extends Interaction {

    /**
    * Acknowledges the autocomplete interaction with a result of choices.
    * Note: You can **not** use more than 1 initial interaction response per interaction.
    * @arg {Array<Object>} choices The autocomplete choices to return to the user
    * @arg {String | Number} choices[].name The choice display name
    * @arg {String} choices[].value The choice value to return to the bot
    * @returns {Promise}
    */
    acknowledge(choices) {
        return this.result(choices);
    }

    /**
    * Acknowledges the autocomplete interaction with a result of choices.
    * Note: You can **not** use more than 1 initial interaction response per interaction.
    * @arg {Array<Object>} choices The autocomplete choices to return to the user
    * @arg {String | Number} choices[].name The choice display name
    * @arg {String} choices[].value The choice value to return to the bot
    * @returns {Promise}
    */
    result(choices) {
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
