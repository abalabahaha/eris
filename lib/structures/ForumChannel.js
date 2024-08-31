"use strict";

const MediaChannel = require("./MediaChannel");

/**
 * Represents a guild forum channel. See MediaChannel for more properties and methods
 * @extends MediaChannel
 * @prop {Number} defaultForumLayout The default forum layout type used to display posts in the channel
 */
class ForumChannel extends MediaChannel {
  constructor(data, client) {
    super(data, client);
    this.defaultForumLayout = data.default_forum_layout;
  }

  toJSON(props = []) {
    return super.toJSON([
      "defaultForumLayout",
      ...props,
    ]);
  }
}

module.exports = ForumChannel;
