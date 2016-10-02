"use strict";

const Channel = require("./Channel");
const Collection = require("../util/Collection");
const Endpoints = require("../rest/Endpoints");
const Message = require("./Message");
const OPCodes = require("../Constants").GatewayOPCodes;

/**
* Represents a private channel
* @prop {String} id The ID of the channel
* @prop {Number} createdAt Timestamp of private channel creation
* @prop {String} lastMessageID The ID of the last message in this channel
* @prop {User} recipient The recipient in this private channel (private channels only)
* @prop {Collection<Message>} messages Collection of Messages in this channel
*/
class PrivateChannel extends Channel {
    constructor(data, client) {
        super(data);
        this._client = client;
        this.lastMessageID = data.last_message_id;
        this.call = this.lastCall = null;
        if(this.type === 1 || this.type === undefined) {
            client.privateChannelMap[(this.recipient = client.users.add(data.recipients[0], client)).id] = this.id;
        }
        this.messages = new Collection(Message);
    }

    /**
    * Ring fellow group channel recipient(s)
    * @arg {String[]} recipients The IDs of the recipients to ring
    */
    ring(recipients) {
        this._client.requestHandler.request("POST", Endpoints.CHANNEL_CALL_RING(this.id), true, {
            recipients
        });
    }

    /**
    * Check if the channel has an existing call
    */
    syncCall() {
        this._client.shards.values().next().value.sendWS(OPCodes.SYNC_CALL, {
            channel_id: this.id
        });
    }

    /**
    * Leave the channel
    * @returns {Promise}
    */
    leave() {
        return this._client.deleteChannel.call(this._client, this.id);
    }
}

module.exports = PrivateChannel;