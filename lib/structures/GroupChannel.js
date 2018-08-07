"use strict";

const Collection = require("../util/Collection");
const Constants = require("../Constants");
const Endpoints = require("../rest/Endpoints");
const PrivateChannel = require("./PrivateChannel");
const User = require("./User");

/**
* Represents a group channel. See PrivateChannel docs for additional properties.
* @extends PrivateChannel
* @prop {String} id The ID of the channel
* @prop {String} mention A string that mentions the channel
* @prop {Call?} call The current group call, if any
* @prop {Call?} lastCall The previous group call, if any
* @prop {Collection<User>} recipients The recipients in this private channel
* @prop {String} name The name of the group channel
* @prop {String?} icon The hash of the group channel icon
* @prop {String?} iconURL The URL of the group channel icon
* @prop {String} ownerID The ID of the user that is the group owner
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
    edit(options) {
        return this._client.editChannel.call(this._client, this.id, options);
    }

    /**
    * Add a user to the group
    * @arg {String} userID The ID of the target user
    * @returns {Promise}
    */
    addRecipient(userID) {
        return this._client.addGroupRecipient.call(this._client, this.id, userID);
    }

    /**
    * Remove a user from the group
    * @arg {String} userID The ID of the target user
    * @returns {Promise}
    */
    removeRecipient(userID) {
        return this._client.removeGroupRecipient.call(this._client, this.id, userID);
    }

    get iconURL() {
        return this.icon ? `${Endpoints.CDN_URL}/channel-icons/${this.id}/${this.icon}.${this._client.options.defaultImageFormat}?size=${this._client.options.defaultImageSize}` : null;
    }

    /**
    * Get the group's icon with the given format and size
    * @arg {String} [format] The filetype of the icon ("jpg", "png", "gif", or "webp")
    * @arg {Number} [size] The size of the icon (128, 256, 512, 1024, 2048)
    */
    dynamicIconURL(format, size) {
        if(!format || !Constants.ImageFormats.includes(format.toLowerCase())) {
            format = this._client.options.defaultImageFormat;
        }
        if(size < 16 || size > 1024 || (size & (size - 1))) {
             size = this._client.options.defaultImageSize;
        }
        return this.icon ? `${Endpoints.CDN_URL}/channel-icons/${this.id}/${this.icon}.${format}?size=${size}` : null;
     }

    toJSON() {
        const base = super.toJSON(true);
        for(const prop of ["icon", "name", "ownerID", "recipients"]) {
            if(this[prop] !== undefined) {
                base[prop] = this[prop] && this[prop].toJSON ? this[prop].toJSON() : this[prop];
            }
        }
        return base;
    }
}

module.exports = GroupChannel;
