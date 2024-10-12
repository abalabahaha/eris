"use strict";

const Collection = require("../util/Collection");
const GuildTextableChannel = require("./GuildTextableChannel");
const Member = require("./Member");
const PermissionOverwrite = require("./PermissionOverwrite");

/**
 * Represents a guild voice channel. See GuildTextableChannel for more properties and methods
 * @extends GuildTextableChannel
 * @prop {Number?} bitrate The bitrate of the channel
 * @prop {Boolean} nsfw Whether the channel is an NSFW channel or not
 * @prop {Collection<PermissionOverwrite>} permissionOverwrites Collection of PermissionOverwrites in the channel
 * @prop {Number} position The position of the channel
 * @prop {String?} rtcRegion The RTC region ID of the channel (automatic when `null`)
 * @prop {String?} status The voice channel status
 * @prop {Number?} userLimit The max number of users that can join the channel
 * @prop {Number?} videoQualityMode The camera video quality mode of the voice channel. `1` is auto, `2` is 720p
 * @prop {Collection<Member>} voiceMembers Collection of Members in this channel
 */
class VoiceChannel extends GuildTextableChannel {
  constructor(data, client) {
    super(data, client);
    this.voiceMembers = new Collection(Member);
    this.update(data);
  }

  update(data) {
    super.update(data);
    if (data.position !== undefined) {
      this.position = data.position;
    }
    if (data.permission_overwrites !== undefined) {
      this.permissionOverwrites = new Collection(PermissionOverwrite);
      data.permission_overwrites.forEach((overwrite) => {
        this.permissionOverwrites.add(overwrite);
      });
    }
    if (data.nsfw !== undefined) {
      this.nsfw = data.nsfw;
    }
    if (data.bitrate !== undefined) {
      this.bitrate = data.bitrate;
    }
    if (data.user_limit !== undefined) {
      this.userLimit = data.user_limit;
    }
    if (data.rtc_region !== undefined) {
      this.rtcRegion = data.rtc_region;
    }
    if (data.video_quality_mode !== undefined) {
      this.videoQualityMode = data.video_quality_mode;
    }
    if (data.status !== undefined) {
      this.status = data.status;
    }
  }

  /**
   * Create an invite for the channel
   * @arg {Object} [options] Invite generation options
   * @arg {Number} [options.maxAge] How long the invite should last in seconds
   * @arg {Number} [options.maxUses] How many uses the invite should last for
   * @arg {Boolean} [options.temporary] Whether the invite grants temporary membership or not
   * @arg {Boolean} [options.unique] Whether the invite is unique or not
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Invite>}
   */
  createInvite(options, reason) {
    return this._client.createChannelInvite.call(this._client, this.id, options, reason);
  }

  /**
   * Delete a channel permission overwrite
   * @arg {String} overwriteID The ID of the overwritten user or role
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  deletePermission(overwriteID, reason) {
    return this._client.deleteChannelPermission.call(this._client, this.id, overwriteID, reason);
  }

  /**
   * Create a channel permission overwrite
   * @arg {String} overwriteID The ID of the overwritten user or role
   * @arg {BigInt | Number | String} allow The permissions number for allowed permissions
   * @arg {BigInt | Number | String} deny The permissions number for denied permissions
   * @arg {Number} type The object type of the overwrite, either 1 for "member" or 0 for "role"
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<PermissionOverwrite>}
   */
  editPermission(overwriteID, allow, deny, type, reason) {
    return this._client.editChannelPermission.call(this._client, this.id, overwriteID, allow, deny, type, reason);
  }

  /**
   * Get all invites in the channel
   * @returns {Promise<Array<Invite>>}
   */
  getInvites() {
    return this._client.getChannelInvites.call(this._client, this.id);
  }

  /**
   * Joins the channel
   * @arg {Object} [options] VoiceConnection constructor options
   * @arg {Object} [options.opusOnly] Skip opus encoder initialization. You should not enable this unless you know what you are doing
   * @arg {Boolean} [options.selfDeaf] Whether the bot joins the channel deafened or not
   * @arg {Boolean} [options.selfMute] Whether the bot joins the channel muted or not
   * @arg {Object} [options.shared] Whether the VoiceConnection will be part of a SharedStream or not
   * @returns {Promise<VoiceConnection>} Resolves with a VoiceConnection
   */
  join(options) {
    return this._client.joinVoiceChannel.call(this._client, this.id, options);
  }

  /**
   * Leaves the channel
   */
  leave() {
    return this._client.leaveVoiceChannel.call(this._client, this.id);
  }

  /**
   * Send a soundboard sound to the voice channel
   * @arg {Object} options The soundboard sound options
   * @arg {String} options.soundID The ID of the soundboard sound
   * @arg {String} [options.sourceGuildID] The ID of the guild where the soundboard sound was created, if not in the same guild
   * @returns {Promise}
   */
  sendSoundboardSound(options) {
    return this._client.sendSoundboardSound.call(this._client, this.id, options);
  }

  /**
   * Set the status of the voice channel. Note: This will not work in stage channels
   * @arg {String} status The new voice channel status
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  setStatus(status, reason) {
    return this._client.setVoiceChannelStatus.call(this._client, this.id, status, reason);
  }

  toJSON(props = []) {
    return super.toJSON([
      "bitrate",
      "nsfw",
      "permissionOverwrites",
      "position",
      "rtcRegion",
      "status",
      "userLimit",
      "videoQualityMode",
      "voiceMembers",
      ...props,
    ]);
  }
}

module.exports = VoiceChannel;
