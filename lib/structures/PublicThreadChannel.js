"use strict";

const ThreadChannel = require("./ThreadChannel");

/**
* Represents a public thread channel. See ThreadChannel for extra properties.
* @extends ThreadChannel
*/
class PublicThreadChannel extends ThreadChannel {
    constructor(data, client, messageLimit) {
        super(data, client, messageLimit);
    }
}

module.exports = PublicThreadChannel;
