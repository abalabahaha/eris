"use strict";

const CDN_URL = require("../rest/Endpoints").CDN_URL;
const DefaultAvatarHashes = require("../Constants").DefaultAvatarHashes;

/**
* Represents a user
* @prop {String} id The ID of the user
* @prop {String} mention A string that mentions the user
* @prop {String} defaultAvatar The hash for the default avatar of a user if there is no avatar set
* @prop {Number} createdAt Timestamp of user creation
* @prop {Boolean} bot Whether the user is an OAuth bot or not
* @prop {String} username The username of the user
* @prop {String?} discriminator The discriminator of the user
* @prop {String?} avatar The hash of the user's avatar, or null if no avatar
* @prop {String} defaultAvatarURL The URL of the user's default avatar
* @prop {String} avatarURL The URL of the user's avatar
*/
class User {
    constructor(data, client) {
        this.id = data.id;
        this._client = client;
        this.createdAt = (this.id / 4194304) + 1420070400000;
        this.bot = !!data.bot;
        this.update(data);
    }

    update(data) {
        this.avatar = data.avatar !== undefined ? data.avatar : this.avatar;
        this.username = data.username !== undefined ? data.username : this.username;
        this.discriminator = data.discriminator !== undefined ? data.discriminator : this.discriminator;
    }

    get mention() {
        return `<@${this.id}>`;
    }

    get defaultAvatar() {
        return DefaultAvatarHashes[this.discriminator % DefaultAvatarHashes.length];
    }

    get defaultAvatarURL() {
        return `https://discordapp.com/assets/${this.defaultAvatar}.png`;
    }

    get avatarURL() {
        return this.avatar ? `${CDN_URL}/avatars/${this.id}/${this.avatar}.jpg` : this.defaultAvatarURL;
    }

    /**
    * Get a DM channel with the user, or create one if it does not exist
    * @returns {Promise<PrivateChannel>}
    */
    getDMChannel() {
        return this._client.getDMChannel.call(this._client, this.id);
    }

    /**
    * Create a relationship with the user
    * @arg {Boolean} [block=false] If true, block the user. Otherwise, add the user as a friend
    * @returns {Promise}
    */
    addRelationship(block) {
        return this._client.addRelationship.call(this._client, this.id, block);
    }

    /**
    * Remove a relationship with the user
    * @returns {Promise}
    */
    removeRelationship() {
        return this._client.removeRelationship.call(this._client, this.id);
    }
}

module.exports = User;
