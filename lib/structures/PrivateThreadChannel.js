"use strict";

const ThreadChannel = require("./ThreadChannel");

/**
* Represents a private thread channel. See ThreadChannel for extra properties.
* @extends ThreadChannel
*/
class PrivateThreadChannel extends ThreadChannel {
    constructor(data, client, messageLimit) {
        super(data, client, messageLimit);
    }
}

module.exports = PrivateThreadChannel;
