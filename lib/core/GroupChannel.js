"use strict";

const Collection = require("../util/Collection");
const Message = require("./Message");
const User = require("./User");

/**
* Represents a private channel
* @prop {String} id The channel id
* @prop {Number} createdAt Timestamp of private channel creation
* @prop {String} lastMessageID The ID of the last message in this channel
* @prop {User} recipient The recipient in this private channel
* @prop {Collection} messages Collection of Messages in this channel
*/
class GroupChannel { // (╯°□°）╯︵ ┻━┻
    constructor(data, client) {
        this.id = data.id;
        this.createdAt = (+this.id / 4194304) + 1420070400000;
        this.lastMessageID = data.last_message_id;
        this.type = data.type;
        this.recipients = new Collection(User);
        data.recipients.forEach((recipient) => {
            this.recipients.add(client.users.add(recipient));
        });
        this.messages = new Collection(Message);
    }

    update(data) {
        this.name = data.name !== undefined ? data.name : this.name;
        this.ownerID = data.owner_id !== undefined ? data.owner_id : this.ownerID;
        this.icon = data.icon !== undefined ? data.icon : this.icon;
    }
}

module.exports = GroupChannel;