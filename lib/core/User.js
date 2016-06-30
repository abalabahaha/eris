"use strict";

/**
* Represents a user
* @prop {String} id The user id
* @prop {String} mention A string that mentions the user
* @prop {Number} createdAt Timestamp of user creation
* @prop {Boolean} bot Whether the user is an OAuth bot or not
* @prop {String} username The user's username
* @prop {String} discriminator The user's discriminator
* @prop {?String} avatar The user's avatar hash, or null if no avatar
*/
class User {
    constructor(data) {
        this.id = data.id;
        this.createdAt = (+this.id / 4194304) + 1420070400000;
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
}

module.exports = User;
