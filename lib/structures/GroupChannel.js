"use strict";

const Channel = require("./Channel");
const Collection = require("../util/Collection");
const Endpoints = require("../rest/Endpoints");
const User = require("./User");

/**
 * Represents a group channel. Bots cannot get data for user-created Group channels. See Channel for additional properties
 * @extends Channel
 * @prop {String} applicationID The application ID of the bot that created the group DM
 * @prop {String?} icon The hash of the group channel icon
 * @prop {String?} iconURL The URL of the group channel icon
 * @prop {String?} lastMessageID The ID of the last message in this channel
 * @prop {Number?} lastPinTimestamp The timestamp of the last pinned message
 * @prop {Boolean} managed Whether the group channel is managed by an application (should always be `true`)
 * @prop {String} name The name of the group channel
 * @prop {String} ownerID The ID of the user that is the group owner
 * @prop {Collection<User>} recipients The recipients in the group channel
 */
class GroupChannel extends Channel {
  constructor(data, client) {
    super(data, client);
    this.applicationID = data.applicationID;
    this.lastMessageID = data.last_message_id;
    this.lastPinTimestamp = data.last_pin_timestamp ? Date.parse(data.last_pin_timestamp) : null;
    this.managed = data.managed;
    this.name = data.name;
    this.ownerID = data.owner_id;
    this.icon = data.icon;
    this.recipients = new Collection(User);
    data.recipients.forEach((recipient) => {
      this.recipients.add(client.users.add(recipient, client));
    });
  }

  get iconURL() {
    return this.icon ? this._client._formatImage(Endpoints.CHANNEL_ICON(this.id, this.icon)) : null;
  }

  /**
   * Add a user to the group
   * @arg {String} userID The ID of the user to add
   * @arg {Object} options The options for adding the user
   * @arg {String} options.accessToken The access token of the user to add. Requires having been authorized with the `gdm.join` scope
   * @arg {String} [options.nick] The nickname to give the user
   * @returns {Promise}
   */
  addRecipient(userID, options) {
    return this._client.addGroupRecipient.call(this._client, this.id, userID, options);
  }

  /**
   * Delete the Group Channel
   * @returns {Promise<GroupChannel>}
   */
  delete() {
    return this._client.deleteChannel.call(this._client, this.id);
  }

  /**
   * Get the group's icon with the given format and size
   * @arg {String} [format] The filetype of the icon ("jpg", "jpeg", "png", "gif", or "webp")
   * @arg {Number} [size] The size of the icon (any power of two between 16 and 4096)
   * @returns {String?}
   */
  dynamicIconURL(format, size) {
    return this.icon ? this._client._formatImage(Endpoints.CHANNEL_ICON(this.id, this.icon), format, size) : null;
  }

  /**
   * Edit the channel's properties
   * @arg {Object} options The properties to edit
   * @arg {String?} [options.icon] The icon of the channel as a base64 data URI (group channels only). Note: base64 strings alone are not base64 data URI strings
   * @arg {String} [options.name] The name of the channel
   * @returns {Promise<GroupChannel>}
   */
  edit(options) {
    return this._client.editChannel.call(this._client, this.id, options);
  }

  /**
   * Remove a user from the group
   * @arg {String} userID The ID of the target user
   * @returns {Promise}
   */
  removeRecipient(userID) {
    return this._client.removeGroupRecipient.call(this._client, this.id, userID);
  }

  toJSON(props = []) {
    return super.toJSON([
      "applicationID",
      "icon",
      "lastMessageID",
      "lastPinTimestamp",
      "managed",
      "name",
      "ownerID",
      "recipients",
      ...props,
    ]);
  }
}

module.exports = GroupChannel;
