"use strict";

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
        this.update(data);
    }

    update(data) {
        this.name = data.name !== undefined ? data.name : this.name;
        this.ownerID = data.owner_id !== undefined ? data.owner_id : this.ownerID;
        this.icon = data.icon !== undefined ? data.icon : this.icon;
    }
}

module.exports = GroupChannel;