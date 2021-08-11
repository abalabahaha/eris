"use strict";

const Base = require("./Base");

class ThreadMember extends Base {
    constructor(data, client) {
        super(data.user_id);
        this.client = client;
        this.threadID = data.thread_id || data.id; // Thanks Discord
        this.joinTimestamp = Date.parse(data.join_timestamp);
        // this.guildMember FIXME We need to somehow get the guild for this to be possible. Ping me in the Eris server if you have suggestions or if we should just leave this out
        this.update(data);
    }

    update(data) {
        if(data.flags !== undefined) {
            this.flags = data.flags;
        }
    }

    leave() {
        return this.client.leaveThread.call(this.client, this.threadID, this.id);
    }

    toJSON(props = []) {
        return super.toJSON([
            "threadID",
            "joinTimestamp",
            ...props
        ]);
    }
}

module.exports = ThreadMember;
