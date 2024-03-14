"use strict";

const ThreadChannel = require("./ThreadChannel");

/**
 * Represents a public thread channel. See ThreadChannel for extra properties.
 * @extends ThreadChannel
 * @prop {Array<String>?} appliedTags The IDs of the set of tags that have been applied to a thread in a forum channel (threads created in forum channels only, max 5)
 */
class PublicThreadChannel extends ThreadChannel {
    constructor(data, client, messageLimit) {
        super(data, client, messageLimit);
        this.update(data);
    }

    update(data) {
        super.update(data);
        if(data.applied_tags !== undefined) {
            this.appliedTags = data.applied_tags;
        }
    }

    toJSON(props = []) {
        return super.toJSON([
            "appliedTags",
            ...props
        ]);
    }
}

module.exports = PublicThreadChannel;
