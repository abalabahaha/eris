"use strict";

const Call = require("./Call");
const Endpoints = require("./Constants").Endpoints;
const OPCodes = require("../Constants").GatewayOPCodes;
const PrivateChannel = require("./PrivateChannel");

/**
* Represents a private channel
* @prop {String} id The channel id
* @prop {Number} createdAt Timestamp of private channel creation
* @prop {String} lastMessageID The ID of the last message in this channel
* @prop {User[]} recipients The recipients in this group channel
* @prop {Call?} call The current group call, if any
* @prop {Call?} lastCall The previous group call, if any
* @prop {Collection} messages Collection of Messages in this channel
*/
class GroupChannel extends PrivateChannel { // (╯°□°）╯︵ ┻━┻
    constructor(data, client) {
        super(data, client);
        this.client = client;
        this.call = this.lastCall = null;
        if(data.call) {
            this.call = new Call(data.call);
        }
        this.update(data);
    }

    update(data) {
        this.name = data.name !== undefined ? data.name : this.name;
        this.ownerID = data.owner_id !== undefined ? data.owner_id : this.ownerID;
        this.icon = data.icon !== undefined ? data.icon : this.icon;
    }

    /**
    * Ring fellow group channel recipient(s)
    * @arg {String[]} recipients The IDs of the recipients to ring
    */
    ring(recipients) {
        this.client.callAPI("POST", Endpoints.CHANNEL_CALL_RING(this.id), true, {
            recipients
        });
    }

    /**
    * Check if the group channel has an existing call
    */
    syncCall() {
        this.client.shards.get(0).sendWS(OPCodes.SYNC_CALL, {
            channel_id: this.id
        });
    }
}

module.exports = GroupChannel;