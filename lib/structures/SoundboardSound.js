"use strict";

const Base = require("./Base");

class SoundboardSound extends Base {
  constructor(data, client) {
    super();
    this._client = client;
    this.soundID = data.sound_id;
    this.name = data.name;
    this.volume = data.volume;
    this.emojiID = data.emoji_id;
    this.emojiName = data.emoji_name;
    this.available = data.available;
    if (data.user !== undefined) {
      this.user = client.users.update(data.user, client);
    }
    if (data.guild_id !== undefined) {
      this.guild = client.guilds.get(data.guild_id) || { id: data.guild_id };
    }
  }
}

module.exports = SoundboardSound;
