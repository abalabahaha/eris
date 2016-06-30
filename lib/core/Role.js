"use strict";

const Permission = require("./Permission");

/**
* Represents a role
* @prop {String} id The role id
* @prop {Number} createdAt Timestamp of role creation
* @prop {String} name The role name
* @prop {Boolean} managed Whether a guild integration manages this role or not
* @prop {Boolean} hoist Whether users with this role are hoisted in the user list or not
* @prop {Number} color The role color, in number form (ex: 0x3da5b3 or 4040115)
* @prop {Number} position The role position
* @prop {Permission} permissions The role permissions representation
*/
class Role {
    constructor(data) {
        this.id = data.id;
        this.createdAt = (+this.id / 4194304) + 1420070400000;
        this.update(data);
    }

    update(data) {
        this.name = data.name !== undefined ? data.name : this.name;
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
}

module.exports = Role;
