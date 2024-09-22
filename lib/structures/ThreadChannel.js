"use strict";

const Collection = require("../util/Collection");
const GuildTextableChannel = require("./GuildTextableChannel");
const ThreadMember = require("./ThreadMember");

/**
 * Represents a thread channel. You also probably want to look at NewsThreadChannel, PublicThreadChannel, and PrivateThreadChannel. See GuildTextableChannel for more properties and methods
 * @extends GuildTextableChannel
 * @prop {Number?} lastPinTimestamp The timestamp of the last pinned message
 * @prop {ThreadMember} member Thread member for the current user, if they have joined the thread
 * @prop {Number} memberCount The approximate number of users in the thread (stops counting at 50)
 * @prop {Collection<ThreadMember>} members Collection of thread members in the channel
 * @prop {Number} messageCount The number of messages (excluding starter and deleted messages) in the thread
 * @prop {String} ownerID The ID of the user that created the thread
 * @prop {Object} threadMetadata Metadata for the thread
 * @prop {Boolean} threadMetadata.archived Whether the thread is archived or not
 * @prop {Number} threadMetadata.archiveTimestamp Timestamp of when the thread's archive status was last changed, used for calculating recent activity
 * @prop {Number} threadMetadata.autoArchiveDuration Duration in minutes to automatically hide the thread after recent activity, either 60, 1440, 4320, or 10080
 * @prop {Number?} threadMetadata.createTimestamp Timestamp when the thread was created (only available for threads created after 09 January 2022)
 * @prop {Boolean} threadMetadata.locked Whether the thread is locked or not
 * @prop {Number} totalMessageSent Total number of messages ever sent in the thread (will not decrement)
 */
class ThreadChannel extends GuildTextableChannel {
  constructor(data, client) {
    super(data, client);
    this.members = new Collection(ThreadMember);
    this.ownerID = data.owner_id;
    this.update(data);
  }

  update(data) {
    super.update(data);
    if (data.message_count !== undefined) {
      this.messageCount = data.message_count;
    }
    if (data.member_count !== undefined) {
      this.memberCount = data.member_count;
    }
    if (data.thread_metadata !== undefined) {
      this.threadMetadata = {
        archived: data.thread_metadata.archived,
        archiveTimestamp: Date.parse(data.thread_metadata.archive_timestamp),
        autoArchiveDuration: data.thread_metadata.auto_archive_duration,
        locked: data.thread_metadata.locked,
      };
      if (data.thread_metadata.create_timestamp !== undefined) {
        this.threadMetadata.createTimestamp = Date.parse(data.thread_metadata.create_timestamp) || null;
      }
    }
    if (data.total_message_sent !== undefined) {
      this.totalMessageSent = data.total_message_sent;
    }
    if (data.member !== undefined) {
      this.member = new ThreadMember(data.member, this._client);
    }
    this.lastPinTimestamp = data.last_pin_timestamp ? Date.parse(data.last_pin_timestamp) : null;
  }

  /**
   * Get a member that is part of the thread channel
   * @arg {String} userID The ID of the user
   * @arg {Boolean} [withMember] Whether to include the guild member object within the response
   * @returns {Promise<ThreadMember>}
   */
  getMember(userID, withMember) {
    return this._client.getThreadMember.call(this._client, this.id, userID, withMember);
  }

  /**
   * Get a list of members that are part of this thread channel
   * @arg {Object} [options] Options for the request
   * @arg {String} [options.after] Get members after this user ID
   * @arg {Number} [options.limit=100] The maximum number of thread members to fetch (1-100)
   * @arg {Boolean} [options.withMember] Whether to include the guild member object for each member of the thread
   * @returns {Promise<Array<ThreadMember>>}
   */
  getMembers(options) {
    return this._client.getThreadMembers.call(this._client, this.id, options);
  }

  /**
   * Get all the pins in the channel
   * @returns {Promise<Array<Message>>}
   */
  getPins() {
    return this._client.getPins.call(this._client, this.id);
  }

  /**
   * Join a thread
   * @arg {String} [userID="@me"] The user ID of the user joining
   * @returns {Promise}
   */
  join(userID) {
    return this._client.joinThread.call(this._client, this.id, userID);
  }

  /**
   * Leave a thread
   * @arg {String} [userID="@me"] The user ID of the user leaving
   * @returns {Promise}
   */
  leave(userID) {
    return this._client.leaveThread.call(this._client, this.id, userID);
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
      "member",
      "memberCount",
      "members",
      "messageCount",
      "ownerID",
      "threadMetadata",
      "totalMessageSent",
      ...props,
    ]);
  }
}

module.exports = ThreadChannel;
