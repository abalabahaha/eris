"use strict";

const ThreadChannel = require("./ThreadChannel");

/**
 * Represents a private thread channel. See ThreadChannel for more properties and methods
 * @extends ThreadChannel
 * @prop {Object} threadMetadata Metadata for the thread
 * @prop {Boolean} threadMetadata.archived Whether the thread is archived or not
 * @prop {Number} threadMetadata.archiveTimestamp Timestamp of when the thread's archive status was last changed, used for calculating recent activity
 * @prop {Number} threadMetadata.autoArchiveDuration Duration in minutes to automatically hide the thread after recent activity, either 60, 1440, 4320, or 10080
 * @prop {Number?} threadMetadata.createTimestamp Timestamp when the thread was created (only available for threads created after 09 January 2022)
 * @prop {Boolean} threadMetadata.invitable Whether non-moderators can add other non-moderators to the thread
 * @prop {Boolean} threadMetadata.locked Whether the thread is locked or not
 */
class PrivateThreadChannel extends ThreadChannel {
    update(data) {
        super.update(data);
        if(data.thread_metadata !== undefined) {
            this.threadMetadata.invitable = data.thread_metadata.invitable;
        }
    }
}

module.exports = PrivateThreadChannel;
