"use strict";

const Collection = require("../util/Collection");
const Endpoints = require("../rest/Endpoints");
const User = require("./User");
const Channel = require("./Channel");
const Message = require("./Message");

/**
* Represents a group channel. See Channel for additional properties.
* @extends Channel
* @prop {Call?} call The current group call, if any
* @prop {String?} icon The hash of the group channel icon
* @prop {String?} iconURL The URL of the group channel icon
* @prop {Call?} lastCall The previous group call, if any
* @prop {String} lastMessageID The ID of the last message in this channel
* @prop {String} mention A string that mentions the channel
* @prop {Collection<Message>} messages Collection of Messages in this channel
* @prop {String} name The name of the group channel
* @prop {String} ownerID The ID of the user that is the group owner
* @prop {Collection<User>} recipients The recipients in this private channel
*/
class GroupChannel extends Channel {
    constructor(data, client) {
        super(data, client);
        this.lastMessageID = data.last_message_id;
        this.messages = new Collection(Message, client.options.messageLimit);
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
    * Add a user to the group
    * @arg {Object} options The options for adding the user
    * @arg {String} options.accessToken The access token of the user to add. Requires having been authorized with the `gdm.join` scope
    * @arg {String} [options.nick] The nickname to give the user
    * @returns {Promise}
    */
    addRecipient(options) {
        return this.client.addGroupRecipient.call(this.client, this.id, options);
    }

    /**
    * Get the group's icon with the given format and size
    * @arg {String} [format] The filetype of the icon ("jpg", "jpeg", "png", "gif", or "webp")
    * @arg {Number} [size] The size of the icon (any power of two between 16 and 4096)
    * @returns {String?}
    */
    dynamicIconURL(format, size) {
        return this.icon ? this.client._formatImage(Endpoints.CHANNEL_ICON(this.id, this.icon), format, size) : null;
    }

    /**
    * Edit the channel's properties
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
    * Remove a user from the group
    * @arg {String} userID The ID of the target user
    * @returns {Promise}
    */
    removeRecipient(userID) {
        return this.client.removeGroupRecipient.call(this.client, this.id, userID);
    }

    toJSON(props = []) {
        return super.toJSON([
            "call",
            "icon",
            "lastCall",
            "lastMessageID",
            "messages",
            "name",
            "ownerID",
            "recipients",
            ...props
        ]);
    }
}

module.exports = GroupChannel;
