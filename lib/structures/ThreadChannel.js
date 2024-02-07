"use strict";

const Collection = require("../util/Collection");
const GuildTextableChannel = require("./GuildTextableChannel");
const ThreadMember = require("./ThreadMember");

class ThreadChannel extends GuildTextableChannel {
    constructor(data, client) {
        super(data, client);
        this.members = new Collection(ThreadMember);
        this.ownerID = data.owner_id;
        this.update(data);
    }

    update(data) {
        super.update(data);
        if(data.message_count !== undefined) {
            this.messageCount = data.message_count;
        }
        if(data.member_count !== undefined) {
            this.memberCount = data.member_count;
        }
        if(data.thread_metadata !== undefined) {
            this.threadMetadata = {
                archived: data.thread_metadata.archived,
                archiveTimestamp: Date.parse(data.thread_metadata.archive_timestamp),
                autoArchiveDuration: data.thread_metadata.auto_archive_duration,
                locked: data.thread_metadata.locked
            };
            if(data.thread_metadata.create_timestamp !== undefined) {
                this.threadMetadata.createTimestamp = Date.parse(data.thread_metadata.create_timestamp) || null;
            }
        }
        if(data.total_message_sent !== undefined) {
            this.totalMessageSent = data.total_message_sent;
        }
        if(data.member !== undefined) {
            this.member = new ThreadMember(data.member, this._client);
        }
        if(data.total_message_sent !== undefined) {
            this.totalMessageSent = data.total_message_sent;
        }
    }

    /**
     * Get a member that is part of the thread channel
     * @arg {String} userID The ID of the user
     * @arg {Boolean} withMember Whether to include the guild member object within the response
     * @returns {Promise<ThreadMember>}
     */
    getMember(userID, withMember) {
        return this._client.getThreadMember.call(this._client, this.id, userID, withMember);
    }

    /**
     * Get a list of members that are part of this thread channel
     * @returns {Promise<Array<ThreadMember>>}
     */
    getMembers() {
        return this._client.getThreadMembers.call(this._client, this.id);
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
}

module.exports = ThreadChannel;
