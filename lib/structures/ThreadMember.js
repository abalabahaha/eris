"use strict";

const Base = require("./Base");

class ThreadMember extends Base {
    constructor(data, client) {
        super(data.user_id);
        this.client = client;
        this.threadID = data.thread_id || data.id; // Thanks Discord
        this.joinTimestamp = Date.parse(data.join_timestamp);

        if(data.guild_member !== undefined) {
            const guild = this.client.guilds.get(this.client.threadGuildMap[this.threadID]);
            this.guildMember = guild.members.update(data.guild_member, guild);
            if(data.presence !== undefined) {
                this.guildMember.update(data.presence);
            }
        }

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
