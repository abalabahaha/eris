"use strict";

const Base = require("./Base");

/**
 * Represents a Soundboard Sound
 * @prop {Boolean} available Whether the soundboard sound is available or not (will always be true for default soundboard sounds)
 * @prop {String?} emojiID The ID of the relating custom emoji (will always be null for default soundboard sounds)
 * @prop {String?} emojiName The name mof the relating default emoji
 * @prop {Guild?} guild The guild where the soundboard sound was created in (not present for default soundboard sounds). If the guild is uncached, this will be an object with an `id` key. No other keys are guaranteed
 * @prop {String} id The ID of the soundboard sound
 * @prop {String} name The name of the soundboard sound
 * @prop {User?} user The user that created the soundboard sound (not present for default soundboard sounds, or if the bot doesn't have either create/editGuildExpressions permissions)
 * @prop {Number} volume The volume of the soundboard sound, between 0 and 1
 */
class SoundboardSound extends Base {
  constructor(data, client) {
    super(data.id);
    this._client = client;
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

  /**
   * Delete the soundboard sound (not available for default soundboard sounds)
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  delete(reason) {
    return this._client.deleteGuildSoundboardSound.call(this._client, this.guild.id, this.id, reason);
  }

  /**
   * Edit the soundboard sound (not available for default soundboard sounds)
   * @arg {Object} options The properties to edit
   * @arg {String?} [options.emojiID] The ID of the relating custom emoji (mutually exclusive with options.emojiName)
   * @arg {String?} [options.emojiName] The name of the relating default emoji (mutually exclusive with options.emojiID)
   * @arg {String} [options.name] The name of the soundboard sound (2-32 characters)
   * @arg {Number?} [options.volume] The volume of the soundboard sound, between 0 and 1
   * @arg {String} [options.reason] The reason to be displayed in audit logs
   * @returns {Promise<SoundboardSound>}
   */
  edit(options) {
    return this._client.editGuildSoundboardSound.call(this._client, this.guild.id, this.id, options);
  }

  /**
   * Send the soundboard sound to a connected voice channel
   * @arg {String} channelID The ID of the connected voice channel
   * @returns {Promise}
   */
  send(channelID) {
    return this._client.sendSoundboardSound.call(this._client, channelID, { soundID: this.id, sourceGuildID: this.guild.id });
  }
}

module.exports = SoundboardSound;
