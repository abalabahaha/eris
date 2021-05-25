"use strict";

const ThreadChannel = require("./ThreadChannel");

/**
* Represents a private thread channel. See ThreadChannel for extra properties.
* @extends ThreadChannel
*/
class PrivateThreadChannel extends ThreadChannel {
    constructor(data, guild, messageLimit) {
        super(data, guild, messageLimit);
        this.update(data);
    }
}

module.exports = PrivateThreadChannel;
