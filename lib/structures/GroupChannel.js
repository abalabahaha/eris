"use strict";

const Collection = require("../util/Collection");
const Endpoints = require("../rest/Endpoints");
const PrivateChannel = require("./PrivateChannel");
const User = require("./User");

/**
* [USER ACCOUNT] Represents a group channel. See PrivateChannel docs for additional properties.
* @extends PrivateChannel
* @prop {Call?} call The current group call, if any
* @prop {String?} icon The hash of the group channel icon
* @prop {String?} iconURL The URL of the group channel icon
* @prop {Call?} lastCall The previous group call, if any
* @prop {String} mention A string that mentions the channel
* @prop {String} name The name of the group channel
* @prop {String} ownerID The ID of the user that is the group owner
* @prop {Collection<User>} recipients The recipients in this private channel
*/
class GroupChannel extends PrivateChannel { // (╯°□°）╯︵ ┻━┻
    constructor(data, client) {
        super(data, client);
        this.recipients = new Collection(User);
        data.recipients.forEach((recipient) => {
            this.recipients.add(client.options.restMode ? new User(recipient, client) : client.users.add(recipient, client));
        });
        this.update(data);
    }

    update(data) {
        if(data.name !== undefined) {
            this.name = data.name;
        }
        if(data.owner_id !== undefined) {
            this.ownerID = data.owner_id;
        }
        if(data.icon !== undefined) {
            this.icon = data.icon;
        }
    }

    get iconURL() {
        return this.icon ? this.client._formatImage(Endpoints.CHANNEL_ICON(this.id, this.icon)) : null;
    }

    /**
    * [USER ACCOUNT] Add a user to the group
    * @arg {String} userID The ID of the target user
    * @returns {Promise}
    */
    addRecipient(userID) {
        return this.client.addGroupRecipient.call(this.client, this.id, userID);
    }

    /**
    * Get the group's icon with the given format and size
    * @arg {String} [format] The filetype of the icon ("jpg", "jpeg", "png", "gif", or "webp")
    * @arg {Number} [size] The size of the icon (any power of two between 16 and 4096)
    */
    dynamicIconURL(format, size) {
        return this.icon ? this.client._formatImage(Endpoints.CHANNEL_ICON(this.id, this.icon), format, size) : null;
    }

    /**
    * [USER ACCOUNT] Edit the channel's properties
    * @arg {Object} options The properties to edit
    * @arg {String} [options.name] The name of the channel
    * @arg {String} [options.icon] The icon of the channel as a base64 data URI (group channels only). Note: base64 strings alone are not base64 data URI strings
    * @arg {String} [options.ownerID] The ID of the channel owner (group channels only)
    * @returns {Promise<GroupChannel>}
    */
    edit(options) {
        return this.client.editChannel.call(this.client, this.id, options);
    }

    /**
    * [USER ACCOUNT] Remove a user from the group
    * @arg {String} userID The ID of the target user
    * @returns {Promise}
    */
    removeRecipient(userID) {
        return this.client.removeGroupRecipient.call(this.client, this.id, userID);
    }

    toJSON(props = []) {
        return super.toJSON([
            "icon",
            "name",
            "ownerID",
            "recipients",
            ...props
        ]);
    }
}

module.exports = GroupChannel;
