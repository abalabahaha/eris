"use strict";

const Interaction = require("./Interaction");
const {InteractionResponseTypes} = require("../Constants");

/**
* Represents a ping interaction. See Interaction for more properties.
* @extends Interaction
*/
class PingInteraction extends Interaction {
    constructor(data, client) {
        super(data, client);
    }

    /**
    * Acknowledges the ping interaction with a pong response.
    * Note: You can **not** use more than 1 initial interaction response per interaction.
    * @returns {Promise}
    */
    async acknowledge() {
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: InteractionResponseTypes.PONG
        });
    }

    /**
    * Acknowledges the ping interaction with a pong response.
    * Note: You can **not** use more than 1 initial interaction response per interaction.
    * @returns {Promise}
    */
    async pong() {
        return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
            type: InteractionResponseTypes.PONG
        });
    }

}

module.exports = PingInteraction;
