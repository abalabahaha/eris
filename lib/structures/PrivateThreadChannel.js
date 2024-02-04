"use strict";

const ThreadChannel = require("./ThreadChannel");

class PrivateThreadChannel extends ThreadChannel {
    update(data) {
        super.update(data);
        if(data.thread_metadata !== undefined) {
            this.threadMetadata.invitable = data.thread_metadata.invitable;
        }
    }
}

module.exports = PrivateThreadChannel;
