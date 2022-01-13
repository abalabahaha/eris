"use strict";

const Base = require("./Base");
const {InteractionTypes} = require("../Constants");

/**
* Represents an interaction. You also probably want to look at CommandInteraction, ComponentInteraction, and AutocompleteInteraction.
* @prop {Boolean} acknowledged Whether or not the interaction has been acknowledged
* @prop {String} applicationID The ID of the interaction's application
* @prop {String} id The ID of the interaction
* @prop {String} token The interaction token (Interaction tokens are valid for 15 minutes after initial response and can be used to send followup messages but you must send an initial response within 3 seconds of receiving the event. If the 3 second deadline is exceeded, the token will be invalidated.)
* @prop {Number} type 1 is a Ping, 2 is an Application Command, 3 is a Message Component
* @prop {Number} version The interaction version
* @prop {String?} locale The selected language of the invoking user (e.g. "en-US") - not present in PingInteraction
* @prop {String?} guild_locale The selected language of the guild the command was invoked from (e.g. "en-US")
*/
class Interaction extends Base {
    constructor(data, client) {
        super(data.id);
        this._client = client;

        this.applicationID = data.application_id;
        this.token = data.token;
        this.type = data.type;
        this.version = data.version;
        this.acknowledged = false;
        if(data.locale !== undefined) {
            this.locale = data.locale;
        }
        if(data.guild_locale !== undefined) {
            this.guildLocale = data.guild_locale;
        }
    }

    update() {
        this.acknowledged = true;
    }

    static from(data, client) {
        switch(data.type) {
            case InteractionTypes.PING: {
                return new PingInteraction(data, client);
            }
            case InteractionTypes.APPLICATION_COMMAND: {
                return new CommandInteraction(data, client);
            }
            case InteractionTypes.MESSAGE_COMPONENT: {
                return new ComponentInteraction(data, client);
            }
            case InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE: {
                return new AutocompleteInteraction(data, client);
            }
        }

        client.emit("warn", new Error(`Unknown interaction type: ${data.type}\n${JSON.stringify(data, null, 2)}`));
    }
}

module.exports = Interaction;

// Circular import
const PingInteraction         = require("./PingInteraction");
const CommandInteraction      = require("./CommandInteraction");
const ComponentInteraction    = require("./ComponentInteraction");
const AutocompleteInteraction = require("./AutocompleteInteraction");
