"use strict";

const ThreadChannel = require("./ThreadChannel");

/**
* Represents a news thread channel. See ThreadChannel for extra properties.
* @extends ThreadChannel
*/
class NewsThreadChannel extends ThreadChannel {
    constructor(data, guild, messageLimit) {
        super(data, guild, messageLimit);
    }
}

module.exports = NewsThreadChannel;
