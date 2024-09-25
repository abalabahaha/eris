"use strict";

const Base = require("./Base");

class SoundboardSound extends Base {
  constructor(data, client) {
    super();
    this._client = client;
    this.soundID = data.sound_id;
    if (data.guild_id !== undefined) {
      this.guild = client.guilds.get(data.guild_id) || { id: data.guild_id };
    }
  }

  update(data) {
    if (data.name !== undefined) {
      this.name = data.name;
    }
    if (data.volume !== undefined) {
      this.volume = data.volume;
    }
    if (data.emoji_id !== undefined) {
      this.emojiID = data.emoji_id;
    }
    if (data.emoji_name !== undefined) {
      this.emojiName = data.emoji_name;
    }
    if (data.available !== undefined) {
      this.available = data.available;
    }
    if (data.user !== undefined) {
      this.user = this._client.users.update(data.user, this._client);
    }
  }

  delete(reason) {
    return this._client.deleteGuildSoundboardSound.call(this._client, this.guild.id, this.soundID, reason);
  }

  edit(options) {
    return this._client.editGuildSoundboardSound.call(this._client, this.guild.id, this.soundID, options);
  }

  send(channelID) {
    return this._client.sendSoundboardSound.call(this._client, channelID, { soundID: this.soundID, sourceGuildID: this.guild.id });
  }
}

module.exports = SoundboardSound;
