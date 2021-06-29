"use strict";

const ThreadChannel = require("./ThreadChannel");

/**
* Represents a news thread channel. See ThreadChannel for extra properties.
* @extends ThreadChannel
*/
class NewsThreadChannel extends ThreadChannel {
    constructor(data, client, messageLimit) {
        super(data, client, messageLimit);
    }
}

module.exports = NewsThreadChannel;
