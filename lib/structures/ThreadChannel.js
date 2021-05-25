"use strict";

const Collection = require("../util/Collection");
const GuildChannel = require("./GuildChannel");
const Message = require("./Message");

/**
* Represents a thread channel. You also probably want to look at NewsThreadChannel, PublicThreadChannel, and PrivateThreadChannel. See GuildChannel for extra properties.
* @extends GuildChannel
* @prop {String} lastMessageID The ID of the last message in this channel
* @prop {Number} memberCount An approximate number of users in the thread (stops at 50)
* @prop {Number} messageCount An approximate number of messages in the thread (stops at 50)
* @prop {Collection<Message>} messages Collection of Messages in this channel
* @prop {String} ownerID The ID of the user that created the thread
* @prop {Number} rateLimitPerUser The ratelimit of the channel, in seconds. 0 means no ratelimit is enabled
* @prop {Object} threadMetadata Metadata for the thread
* @prop {Number} threadMetadata.archiveTimestamp Timestamp when the thread's archive status was last changed, used for calculating recent activity
* @prop {Boolean} threadMetadata.archived Whether the thread is archived
* @prop {String?} threadMetadata.archiverID The ID of the user that last (un)archived the thread
* @prop {Number} threadMetadata.autoArchiveDuration Duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080
* @prop {Boolean?} threadMetadata.locked Whether the thread is locked
* @prop {Object?} member Thread member for the current user, if they have joined the thread
* @prop {Number} member.flags The user's thread settings
* @prop {String} member.id The ID of the thread
* @prop {Number} member.joinTimestamp The time the user last joined the thread
* @prop {String} member.userID The ID of the userx
*/
class ThreadChannel extends GuildChannel {
    constructor(data, client, messageLimit) {
        super(data, client);
        this.messages = new Collection(Message, messageLimit == null ? client.options.messageLimit : messageLimit);
        this.lastMessageID = data.last_message_id || null;
        this.ownerID = data.ownerID;
        this.update(data);
    }

    update(data) {
        super.update(data);
        if(data.member_count !== undefined) {
            this.memberCount = data.member_count;
        }
        if(data.message_count !== undefined) {
            this.messageCount = data.message_count;
        }
        if(data.rate_limit_per_user !== undefined) {
            this.rateLimitPerUser = data.rate_limit_per_user;
        }
        if(data.thread_metadata !== undefined) {
            this.threadMetadata = {
                archiveTimestamp: Date.parse(data.thread_metadata.archive_timestamp),
                archived: data.thread_metadata.archived,
                archiverID: data.thread_metadata.archiver_id,
                autoArchiveDuration: data.thread_metadata.auto_archive_duration,
                locked: data.thread_metadata.locked
            };
        }
        if(data.member !== undefined) {
            this.member = data.member; // TODO Class ThreadMember
        }
    }


    /**
    * Get a list of members that are part of this thread channel
    * @returns {Promise<Array<Object>>} // TODO Class ThreadMember
    */
    getMembers() {
        return this.client.getThreadMembers.call(this.client, this.id);
    }

    /**
    * Join a thread
    * @arg {String} [userID="@me"] The user ID of the user joining
    * @returns {Promise}
    */
    join(userID) {
        return this.client.joinThread.call(this.client, this.id, userID);
    }

    /**
    * Leave a thread
    * @arg {String} [userID="@me"] The user ID of the user leaving
    * @returns {Promise}
    */
    leave(userID) {
        return this.client.leaveThread.call(this.client, this.id, userID);
    }

    toJSON(props = []) {
        return super.toJSON([
            "lastMessageID",
            "memberCount",
            "messageCount",
            "messages",
            "ownerID",
            "rateLimitPerUser",
            "threadMetadata",
            "member",
            ...props
        ]);
    }
}

module.exports = ThreadChannel;
