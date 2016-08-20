"use strict";

const Permission = require("./Permission");

/**
* Represents a role
* @prop {String} id The ID of the role
* @prop {String} mention A string that mentions the role
* @prop {Number} createdAt Timestamp of role creation
* @prop {String} name The name of the role
* @prop {Boolean} mentionable Whether the role is mentionable or not
* @prop {Boolean} managed Whether a guild integration manages this role or not
* @prop {Boolean} hoist Whether users with this role are hoisted in the user list or not
* @prop {Number} color The hex color of the role in base 10
* @prop {Number} position The position of the role
* @prop {Permission} permissions The permissions representation of the role
*/
class Role {
    constructor(data) {
        this.id = data.id;
        this.createdAt = (this.id / 4194304) + 1420070400000;
        this.update(data);
    }

    update(data) {
        this.name = data.name !== undefined ? data.name : this.name;
        this.mentionable = data.mentionable !== undefined ? data.mentionable : this.mentionable;
        this.managed = data.managed !== undefined ? data.managed : this.managed;
        this.hoist = data.hoist !== undefined ? data.hoist : this.hoist;
        this.color = data.color !== undefined ? data.color : this.color;
        this.position = data.position !== undefined ? data.position : this.position;
        this.permissions = new Permission(data.permissions);
    }

    /**
    * Generates a JSON representation of the role permissions
    * @returns {Object}
    */
    asJSON() {
        return this.permissions.asJSON();
    }

    get mention() {
        return `<@&${this.id}>`;
    }
}

module.exports = Role;
