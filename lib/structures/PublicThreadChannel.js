"use strict";

const ThreadChannel = require("./ThreadChannel");

/**
* Represents a public thread channel. See ThreadChannel for extra properties.
* @extends ThreadChannel
*/
class PublicThreadChannel extends ThreadChannel {
    constructor(data, guild, messageLimit) {
        super(data, guild, messageLimit);
        this.update(data);
    }
}

module.exports = PublicThreadChannel;
