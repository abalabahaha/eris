"use strict";

const GuildChannel = require("./GuildChannel");

/**
 * Represents a guild forum channel. See GuildChannel for more properties and methods.
 * @extends GuildChannel
 * @prop {Array<Object>} availableTags The available tags that can be applied to threads within the forum channel
 * @prop {Number} defaultAutoArchiveDuration The default duration of newly created threads in minutes to automatically archive the thread after inactivity (60, 1440, 4320, 10080)
 * @prop {Number} defaultForumLayout The default forum layout type used to display posts in the forum channel
 * @prop {Object} defaultReactionEmoji The emoji to show in the add reaction button on a thread in the forum channel
 * @prop {Number} defaultSortOrder The default sort order type used to order posts in the forum channel
 * @prop {Number} defaultThreadRateLimitPerUser The initial rateLimitPerUser to set on newly created threads in the forum channel
 * @prop {String} lastMessageID The ID of the most recently created thread in the forum channel
 * @prop {Number} rateLimitPerUser The time in seconds a user has to wait before sending another message (does not affect bots or users with manageMessages/manageChannel permissions)
 * @prop {String?} topic The topic of the channel
 */
class ForumChannel extends GuildChannel {
    constructor(data, client) {
        super(data, client);
        this.lastMessageID = data.last_message_id || null;
        this.rateLimitPerUser = data.rate_limit_per_user == null ? null : data.rate_limit_per_user;
        this.update(data);
    }

    update(data) {
        super.update(data);
        if(data.topic !== undefined) {
            this.topic = data.topic;
        }
        if(data.available_tags !== undefined) {
            this.availableTags = data.available_tags;
        }
        if(data.default_auto_archive_duration !== undefined) {
            this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
        }
        if(data.default_forum_layout !== undefined) {
            this.defaultForumLayout = data.default_forum_layout;
        }
        if(data.default_reaction_emoji !== undefined) {
            this.defaultReactionEmoji = data.default_reaction_emoji;
        }
        if(data.default_sort_order !== undefined) {
            this.defaultSortOrder = data.default_sort_order;
        }
        if(data.default_thread_rate_limit_per_user !== undefined) {
            this.defaultThreadRateLimitPerUser = data.default_thread_rate_limit_per_user;
        }
        if(data.rate_limit_per_user !== undefined) {
            this.rateLimitPerUser = data.rate_limit_per_user;
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
        return this.client.createChannelInvite.call(this.client, this.id, options, reason);
    }

    /**
     * Create a thread inside of a forum channel
     * @arg {Object} options The thread options
     * @arg {Array<String>} options.appliedTags The IDs of the set of tags that have been applied to a thread in a forum channel (limited to 5)
     * @arg {Number} options.autoArchiveDuration Duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080
     * @arg {}
     * @arg {String} options.name The thread channel name
     * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (does not affect bots or users with manageMessages/manageChannel permissions) (text channels only)
     * @returns {Promise<PublicThreadChannel>}
     */
    createThread(options) {
        return this.client.createThreadInForumChannel.call(this.client, this.id, options);
    }

    /**
     * Create a channel webhook
     * @arg {Object} options Webhook options
     * @arg {String} [options.avatar] The default avatar as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
     * @arg {String} options.name The default name
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<Object>} Resolves with a webhook object
     */
    createWebhook(options, reason) {
        return this.client.createChannelWebhook.call(this.client, this.id, options, reason);
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
        return this.client.getArchivedThreads.call(this.client, this.id, type, options);
    }

    /**
     * Get all invites in the channel
     * @returns {Promise<Array<Invite>>}
     */
    getInvites() {
        return this.client.getChannelInvites.call(this.client, this.id);
    }

    /**
     * Get joined private archived threads in this channel
     * @arg {Object} [options] Additional options when requesting archived threads
     * @arg {Date} [options.before] List of threads to return before the timestamp
     * @arg {Number} [options.limit] Maximum number of threads to return
     * @returns {Promise<Object>} An object containing an array of `threads`, an array of `members` and whether the response `hasMore` threads that could be returned in a subsequent call
     */
    getJoinedPrivateArchivedThreads(options) {
        return this.client.getJoinedPrivateArchivedThreads.call(this.client, this.id, options);
    }

    /**
     * Get all the webhooks in the channel
     * @returns {Promise<Array<Object>>} Resolves with an array of webhook objects
     */
    getWebhooks() {
        return this.client.getChannelWebhooks.call(this.client, this.id);
    }

    toJSON(props = []) {
        return super.toJSON([
            "lastMessageID",
            "lastPinTimestamp",
            "messages",
            "rateLimitPerUser",
            "topic",
            ...props
        ]);
    }
}

module.exports = ForumChannel;
