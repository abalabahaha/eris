"use strict";

const PrivateChannel = require("./PrivateChannel");
const User = require("./User");
const Collection = require("../util/Collection");

/**
* Represents a group channel. See PrivateChannel docs for additional properties.
* @extends PrivateChannel
* @prop {Call?} call The current group call, if any
* @prop {Call?} lastCall The previous group call, if any
* @prop {Collection<User>} recipients The recipients in this private channel
* @prop {String} name The name of the group channel
* @prop {String?} icon The hash of the group channel icon
* @prop {String} ownerID The ID of the user that is the group owner
*/
class GroupChannel extends PrivateChannel { // (╯°□°）╯︵ ┻━┻
    constructor(data, client) {
        super(data, client);
        this.recipients = new Collection(User);
        data.recipients.forEach((recipient) => {
            this.recipients.add(client.users.add(recipient, client));
        });
        this.update(data);
    }

    update(data) {
        this.name = data.name !== undefined ? data.name : this.name;
        this.ownerID = data.owner_id !== undefined ? data.owner_id : this.ownerID;
        this.icon = data.icon !== undefined ? data.icon : this.icon;
    }

    /**
    * Edit the channel's properties
    * @arg {Object} options The properties to edit
    * @arg {String} [options.name] The name of the channel
    * @arg {String} [options.icon] The icon of the channel as a base64 data URI (group channels only). Note: base64 strings alone are not base64 data URI strings
    * @arg {String} [options.ownerID] The ID of the channel owner (group channels only)
    * @returns {Promise<GroupChannel>}
    */
    edit() {
        return this.client.editChannel.apply(this.client, [this.id].concat(arguments));
    }

    /**
    * Add a user to the group
    * @arg {String} userID The ID of the target user
    * @returns {Promise}
    */
    addRecipient() {
        return this.client.addGroupRecipient.apply(this.client, [this.id].concat(arguments));
    }

    /**
    * Remove a user from the group
    * @arg {String} userID The ID of the target user
    * @returns {Promise}
    */
    removeRecipient() {
        return this.client.removeGroupRecipient.apply(this.client, [this.id].concat(arguments));
    }
}

module.exports = GroupChannel;
