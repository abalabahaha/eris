"use strict";

const ForumChannel = require("./ForumChannel");

/**
 * Represents a guild media channel. See ForumChannel for more properties and methods.
 * @extends ForumChannel
 */
class MediaChannel extends ForumChannel {
    constructor(data, client) {
        super(data, client);
    }
}

module.exports = MediaChannel;
