"use strict";

const GuildChannel = require("./GuildChannel");

/**
* Represents a guild forum channel. See GuildChannel for more properties and methods.
* @extends GuildChannel
* @prop {String} lastMessageID The ID of the most recently created thread in that channel (or the message that created the thread!)
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
        if(data.default_auto_archive_duration !== undefined) {
            this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
        }
        if(data.flags !== undefined) {
            this.flags = data.flags;
        }
        if(data.available_tags !== undefined) {
            this.availableTags = data.available_tags.map((t) => {
                return {
                    id: t.id,
                    name: t.name,
                    moderated: t.moderated,
                    emojiID: t.emoji_id,
                    emojiName: t.emoji_name
                };
            });
        }
        if(data.applied_tags !== undefined) {
            this.appliedTags = data.applied_tags;
        }
        if(data.default_reaction_emoji !== undefined) {
            this.defaultReactionEmoji = {
                id: data.default_reaction_emoji.emoji_id,
                name: data.default_reaction_emoji.emoji_name
            };
        }
        if(data.rate_limit_per_user !== undefined) {
            this.rateLimitPerUser = data.rate_limit_per_user;
        }
        if(data.default_thread_rate_limit_per_user !== undefined) {
            this.defaultThreadRateLimitPerUser = data.default_thread_rate_limit_per_user;
        }
        if(data.default_sort_order !== undefined) {
            this.defaultSortOrder = data.default_sort_order;
        }
        if(data.default_forum_layout !== undefined) {
            this.defaultForumLayout = data.default_forum_layout;
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
    * Create a thread with an existing message
    * @arg {String} messageID The ID of the message to create the thread from
    * @arg {Object} options The thread options
    * @arg {Number} options.autoArchiveDuration Duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080
    * @arg {String} options.name The thread channel name
    * @returns {Promise<NewsThreadChannel | PublicThreadChannel>}
    */
    createThreadWithMessage(messageID, options) {
        return this.client.createThreadWithMessage.call(this.client, this.id, messageID, options);
    }

    /**
    * Create a thread without an existing message
    * @arg {Object} options The thread options
    * @arg {Number} options.autoArchiveDuration Duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080
    * @arg {boolean} [options.invitable] Whether non-moderators can add other non-moderators to the thread (private threads only)
    * @arg {String} options.name The thread channel name
    * @arg {Number} [options.type] The channel type of the thread to create. It is recommended to explicitly set this property as this will be a required property in API v10
    * @returns {Promise<PrivateThreadChannel>}
    */
    createThreadWithoutMessage(options) {
        return this.client.createThreadWithoutMessage.call(this.client, this.id, options);
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
    * [DEPRECATED] Get all active threads in this channel. Use guild.getActiveThreads instead
    * @returns {Promise<Object>} An object containing an array of `threads`, an array of `members` and whether the response `hasMore` threads that could be returned in a subsequent call
    */
    getActiveThreads() {
        return this.client.getActiveThreads.call(this.client, this.id);
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
