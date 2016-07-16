"use strict";

const Call = require("./Call");
const Endpoints = require("../Constants").Endpoints;
const OPCodes = require("../Constants").GatewayOPCodes;
const PrivateChannel = require("./PrivateChannel");

/**
* Represents a group channel. See PrivateChannel docs for additional properties.
* @extends PrivateChannel
* @prop {Call?} call The current group call, if any
* @prop {Call?} lastCall The previous group call, if any
* @prop {String} name The group channel name
* @prop {String?} icon The group channel icon hash
* @prop {String} ownerID The user ID of the group owner
*/
class GroupChannel extends PrivateChannel { // (╯°□°）╯︵ ┻━┻
    constructor(data, client) {
        super(data, client);
        this.client = client;
        this.call = this.lastCall = null;
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