"use strict";

const Base = require("./Base");
const {InteractionTypes} = require("../Constants");

/**
* Represents an interaction. You also probably want to look at PingInteraction, CommandInteraction, and ComponentInteraction.
* @prop {Boolean} acknowledged Whether or not the interaction has been acknowledged
* @prop {String} applicationID The ID of the interaction's application
* @prop {Object?} data The data attached to the interaction. Check CommandInteraction and ComponentInteraction for specifics
* @prop {String} id The ID of the interaction
* @prop {String} token The interaction token (Interaction tokens are valid for 15 minutes after initial response and can be used to send followup messages but you must send an initial response within 3 seconds of receiving the event. If the 3 second deadline is exceeded, the token will be invalidated.)
* @prop {Number} type 1 is a Ping, 2 is an Application Command, 3 is a Message Component
* @prop {Number} version The interaction version
*/
class Interaction extends Base {
    constructor(info, client) {
        super(info.id);
        this._client = client;

        this.applicationID = info.application_id;
        this.token = info.token;
        this.type = info.type;
        this.version = info.version;
        this.acknowledged = false;

        if(info.data !== undefined) {
            this.data = info.data;
        }
    }
    update() {
        this.acknowledged = true;
    }

    static from(info, client) {
        switch(info.type) {
            case InteractionTypes.PING: {
                return new PingInteraction(info, client);
            }
            case InteractionTypes.APPLICATION_COMMAND: {
                return new CommandInteraction(info, client);
            }
            case InteractionTypes.MESSAGE_COMPONENT: {
                return new ComponentInteraction(info, client);
            }
        }

        this._client.emit("warn", new Error(`Unknown interaction type: ${info.type}\n${JSON.stringify(info)}`));
        return new Interaction(info, client);
    }
}

module.exports = Interaction;

// Circular import
const PingInteraction = require("./PingInteraction");
const CommandInteraction = require("./CommandInteraction");
const ComponentInteraction = require("./ComponentInteraction");
