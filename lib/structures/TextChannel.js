"use strict";

const Collection = require("../util/Collection");
const GuildTextableChannel = require("./GuildTextableChannel");
const PermissionOverwrite = require("./PermissionOverwrite");

/**
 * Represents a guild text channel. See GuildTextableChannel for more properties and methods
 * @extends GuildTextableChannel
 * @prop {Number} defaultAutoArchiveDuration The default duration of newly created threads in minutes to automatically archive the thread after inactivity (60, 1440, 4320, 10080)
 * @prop {Number?} lastPinTimestamp The timestamp of the last pinned message
 * @prop {Boolean} nsfw Whether the channel is an NSFW channel or not
 * @prop {Collection<PermissionOverwrite>} permissionOverwrites Collection of PermissionOverwrites in the channel
 * @prop {Number} position The position of the channel
 * @prop {String?} topic The topic of the channel
 */
class TextChannel extends GuildTextableChannel {
  constructor(data, client) {
    super(data, client);
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
    if (data.topic !== undefined) {
      this.topic = data.topic;
    }
    if (data.default_auto_archive_duration !== undefined) {
      this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
    }
    this.lastPinTimestamp = data.last_pin_timestamp ? Date.parse(data.last_pin_timestamp) : null;
  }

  /**
   * Create an invite for the channel
   * @arg {Object} [options] Invite generation options
   * @arg {Number} [options.maxAge] How long the invite should last in seconds
   * @arg {Number} [options.maxUses] How many uses the invite should last for
   * @arg {String} [options.targetApplicationID] The target application id
   * @arg {Number} [options.targetType] The type of the target application
   * @arg {String} [options.targetUserID] The ID of the user whose stream should be displayed for the invite (`options.targetType` must be `1`)
   * @arg {Boolean} [options.temporary] Whether the invite grants temporary membership or not
   * @arg {Boolean} [options.unique] Whether the invite is unique or not
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Invite>}
   */
  createInvite(options, reason) {
    return this._client.createChannelInvite.call(this._client, this.id, options, reason);
  }

  /**
   * Create a thread without an existing message
   * @arg {Object} options The thread options
   * @arg {Number} [options.autoArchiveDuration] The duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080 (thread channels only)
   * @arg {Boolean} [options.invitable] Whether non-moderators can add other non-moderators to the thread (private threads only)
   * @arg {String} options.name The thread channel name
   * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (0-21600) (does not affect bots or users with manageMessages/manageChannel permissions)
   * @arg {String} [options.reason] The reason to be displayed in audit logs
   * @arg {Number} [options.type] The channel type of the thread to create. Either `10` (announcement thread, announcement channels only), `11` (public thread) or `12` (private thread)
   * @returns {Promise<NewsThreadChannel | PublicThreadChannel | PrivateThreadChannel>}
   */
  createThread(options) {
    return this._client.createThread.call(this.client, this.id, options);
  }

  /**
   * Create a thread with an existing message
   * @arg {String} messageID The ID of the message to create the thread from
   * @arg {Object} options The thread options
   * @arg {Number} [options.autoArchiveDuration] Duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080
   * @arg {String} options.name The thread channel name
   * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (0-21600) (does not affect bots or users with manageMessages/manageChannel permissions)
   * @arg {String} [options.reason] The reason to be displayed in audit logs
   * @returns {Promise<NewsThreadChannel | PublicThreadChannel>}
   */
  createThreadWithMessage(messageID, options) {
    return this._client.createThreadWithMessage.call(this._client, this.id, messageID, options);
  }

  /**
   * [DEPRECATED] Create a thread without an existing message. Use `createThread` instead
   * @arg {Object} options The thread options
   * @arg {Number} [options.autoArchiveDuration] Duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080
   * @arg {Boolean} [options.invitable] Whether non-moderators can add other non-moderators to the thread (private threads only)
   * @arg {String} options.name The thread channel name
   * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (0-21600) (does not affect bots or users with manageMessages/manageChannel permissions)
   * @arg {String} [options.reason] The reason to be displayed in audit logs
   * @arg {Number} [options.type] The channel type of the thread to create. Either `10` (announcement thread, announcement channels only), `11` (public thread) or `12` (private thread)
   * @returns {Promise<NewsThreadChannel | PublicThreadChannel | PrivateThreadChannel>}
   */
  createThreadWithoutMessage(options) {
    return this._client.createThreadWithoutMessage.call(this._client, this.id, options);
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
   * Get all archived threads in this channel
   * @arg {String} type The type of thread channel, either "public" or "private"
   * @arg {Object} [options] Additional options when requesting archived threads
   * @arg {Date} [options.before] List of threads to return before the timestamp
   * @arg {Number} [options.limit] Maximum number of threads to return
   * @returns {Promise<Object>} An object containing an array of `threads`, an array of `members` and whether the response `hasMore` threads that could be returned in a subsequent call
   */
  getArchivedThreads(type, options) {
    return this._client.getArchivedThreads.call(this._client, this.id, type, options);
  }

  /**
   * Get all invites in the channel
   * @returns {Promise<Array<Invite>>}
   */
  getInvites() {
    return this._client.getChannelInvites.call(this._client, this.id);
  }

  /**
   * Get joined private archived threads in this channel
   * @arg {Object} [options] Additional options when requesting archived threads
   * @arg {Date} [options.before] List of threads to return before the timestamp
   * @arg {Number} [options.limit] Maximum number of threads to return
   * @returns {Promise<Object>} An object containing an array of `threads`, an array of `members` and whether the response `hasMore` threads that could be returned in a subsequent call
   */
  getJoinedPrivateArchivedThreads(options) {
    return this._client.getJoinedPrivateArchivedThreads.call(this._client, this.id, options);
  }

  /**
   * Get all the pins in the channel
   * @returns {Promise<Array<Message>>}
   */
  getPins() {
    return this._client.getPins.call(this._client, this.id);
  }

  /**
   * Pin a message
   * @arg {String} messageID The ID of the message
   * @returns {Promise}
   */
  pinMessage(messageID) {
    return this._client.pinMessage.call(this._client, this.id, messageID);
  }

  /**
   * Unpin a message
   * @arg {String} messageID The ID of the message
   * @returns {Promise}
   */
  unpinMessage(messageID) {
    return this._client.unpinMessage.call(this._client, this.id, messageID);
  }

  toJSON(props = []) {
    return super.toJSON([
      "defaultAutoArchiveDuration",
      "nsfw",
      "permissionOverwrites",
      "position",
      "topic",
      ...props,
    ]);
  }
}

module.exports = TextChannel;
