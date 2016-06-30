"use strict";

const Collection = require("../util/Collection");
const Message = require("./Message");

/**
* Represents a private channel
* @prop {String} id The channel id
* @prop {Number} createdAt Timestamp of private channel creation
* @prop {String} lastMessageID The ID of the last message in this channel
* @prop {User} recipient The recipient in this private channel
* @prop {Collection} messages Collection of Messages in this channel
*/
class PrivateChannel {
    constructor(data, client) {
        this.id = data.id;
        this.createdAt = (+this.id / 4194304) + 1420070400000;
        this.lastMessageID = data.last_message_id;
        this.recipient = client.users.add(data.recipient);
        client.privateChannelMap[this.recipient.id] = this.id;
        this.messages = new Collection(Message);
    }
}

module.exports = PrivateChannel;