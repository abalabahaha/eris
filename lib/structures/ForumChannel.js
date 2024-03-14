"use strict";

const GuildChannel = require("./GuildChannel");

/**
 * Represents a guild forum channel. See GuildChannel for more properties and methods.
 * @extends GuildChannel
 * @prop {Array<Object>} availableTags The available tags that can be applied to threads in the forum channel. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#forum-tag-object) for object structure (max 20)
 * @prop {Number} defaultAutoArchiveDuration The default duration of newly created threads in minutes to automatically archive the thread after inactivity (60, 1440, 4320, 10080)
 * @prop {Number} defaultForumLayout The default forum layout type used to display posts in the forum channel
 * @prop {Object} defaultReactionEmoji The emoji to show in the add reaction button on a thread in the forum channel
 * @prop {Number} defaultSortOrder The default sort order type used to order posts in the forum channel
 * @prop {Number} defaultThreadRateLimitPerUser The initial rateLimitPerUser to set on newly created threads in the forum channel
 * @prop {String} lastMessageID The ID of the most recently created thread in the forum channel
 * @prop {Number} rateLimitPerUser The time in seconds a user has to wait before sending another message (0-21600) (does not affect bots or users with manageMessages/manageChannel permissions)
 * @prop {Array<PublicThreadChannel>} threads An array of threads in the forum channel
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

    get threads() {
        return this.guild.threads.filter((thread) => thread.parentID === this.id);
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
     * Create a thread inside the forum channel
     * @arg {Object} options The thread options
     * @arg {Array<String>} [options.appliedTags] The IDs of the set of tags that have been applied to a thread in a forum channel (threads created in forum channels only, max 5)
     * @arg {Number} [options.autoArchiveDuration] The duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080 (thread channels only)
     * @arg {Object} [options.message] The message to create with the thread. Note: When creating a forum channel thread, you must provide at least one of `content`, `embeds`, `stickerIDs`, `components`, or `files`
     * @arg {Object} [options.message.allowedMentions] A list of mentions to allow (overrides default)
     * @arg {Boolean} [options.message.allowedMentions.everyone] Whether or not to allow @everyone/@here
     * @arg {Boolean} [options.message.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to
     * @arg {Boolean | Array<String>} [options.message.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow
     * @arg {Boolean | Array<String>} [options.message.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow
     * @arg {Array<Object>} [options.message.attachments] An array of attachment objects with the filename and description
     * @arg {String} [options.message.attachments[].description] The description of the file
     * @arg {String} [options.message.attachments[].filename] The name of the file
     * @arg {Number} options.message.attachments[].id The index of the file
     * @arg {Array<Object>} [options.message.components] An array of component objects
     * @arg {String} [options.message.components[].custom_id] The ID of the component (type 2 style 0-4 and type 3 only)
     * @arg {Boolean} [options.message.components[].disabled] Whether the component is disabled (type 2 and 3 only)
     * @arg {Object} [options.message.components[].emoji] The emoji to be displayed in the component (type 2)
     * @arg {String} [options.message.components[].label] The label to be displayed in the component (type 2)
     * @arg {Number} [options.message.components[].max_values] The maximum number of items that can be chosen (1-25, default 1)
     * @arg {Number} [options.message.components[].min_values] The minimum number of items that must be chosen (0-25, default 1)
     * @arg {Array<Object>} [options.message.components[].options] The options for this component (type 3 only)
     * @arg {Boolean} [options.message.components[].options[].default] Whether this option should be the default value selected
     * @arg {String} [options.message.components[].options[].description] The description for this option
     * @arg {Object} [options.message.components[].options[].emoji] The emoji to be displayed in this option
     * @arg {String} options.message.components[].options[].label The label for this option
     * @arg {Number | String} options.message.components[].options[].value The value for this option
     * @arg {String} [options.message.components[].placeholder] The placeholder text for the component when no option is selected (type 3 only)
     * @arg {Number} [options.message.components[].style] The style of the component (type 2 only) - If 0-4, `custom_id` is required; if 5, `url` is required
     * @arg {Number} options.message.components[].type The type of component - If 1, it is a collection and a `components` array (nested) is required; if 2, it is a button; if 3, it is a select menu
     * @arg {String} [options.message.components[].url] The URL that the component should open for users (type 2 style 5 only)
     * @arg {String} [options.message.content] A string containing the message content
     * @arg {Array<Object>} [options.message.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
     * @arg {Array<String>} [options.message.stickerIDs] An array of IDs corresponding to stickers to send
     * @arg {String} options.name The thread channel name
     * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (0-21600) (does not affect bots or users with manageMessages/manageChannel permissions)
     * @arg {String} [options.reason] The reason to be displayed in audit logs
     * @arg {Object | Array<Object>} [file] A file object (or an Array of them)
     * @arg {Buffer} file.file A buffer containing file data
     * @arg {String} file.name What to name the file
     * @returns {Promise<ThreadChannel>}
     */
    createThread(options, file) {
        return this.client.createThread.call(this.client, this.id, options, file);
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
     * @arg {Object} [options] Additional options when requesting archived threads
     * @arg {Date} [options.before] List of threads to return before the timestamp
     * @arg {Number} [options.limit] Maximum number of threads to return
     * @returns {Promise<Object>} An object containing an array of `threads`, an array of `members` and whether the response `hasMore` threads that could be returned in a subsequent call
     */
    getArchivedThreads(options) {
        return this.client.getArchivedThreads.call(this.client, this.id, "public", options);
    }

    /**
     * Get all invites in the channel
     * @returns {Promise<Array<Invite>>}
     */
    getInvites() {
        return this.client.getChannelInvites.call(this.client, this.id);
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
            "availableTags",
            "defaultAutoArchiveDuration",
            "defaultForumLayout",
            "defaultReactionEmoji",
            "defaultSortOrder",
            "defaultThreadRateLimitPerUser",
            "nsfw",
            "position",
            "rateLimitPerUser",
            "topic",
            ...props
        ]);
    }
}

module.exports = ForumChannel;
