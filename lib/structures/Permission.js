"use strict";

const Base = require("./Base");
const {Permissions} = require("../Constants");

/**
* Represents a calculated permissions number
* @prop {BigInt} allow The allowed permissions number
* @prop {BigInt} deny The denied permissions number
* @prop {Object} json A JSON representation of the permissions number.
* If a permission key isn't there, it is not set by this permission.
* If a permission key is false, it is denied by the permission.
* If a permission key is true, it is allowed by the permission.
* i.e.:
* {
*   "readMessages": true,
*   "sendMessages": true,
*   "manageMessages": false
* }
* In the above example, readMessages and sendMessages are allowed permissions, and manageMessages is denied. Everything else is not explicitly set.
* [A full list of permission nodes can be found on the docs reference page](/Eris/docs/reference)
*/
class Permission extends Base {
    constructor(allow, deny = 0) {
        super();
        this.allow = BigInt(allow);
        this.deny = BigInt(deny);
    }

    get json() {
        if(!this._json) {
            this._json = {};
            for(const perm of Object.keys(Permissions)) {
                if(!perm.startsWith("all")) {
                    if(this.allow & Permissions[perm]) {
                        this._json[perm] = true;
                    } else if(this.deny & Permissions[perm]) {
                        this._json[perm] = false;
                    }
                }
            }
        }
        return this._json;
    }

    /**
    * Check if this permission allows a specific permission
    * @arg {String | BigInt} permission The name of the permission, or bit of permissions. [A full list of permission nodes can be found on the docs reference page](/Eris/docs/reference). Pass a BigInt if you want to check multiple permissions.
    * @returns {Boolean} Whether the permission allows the specified permission
    */
    has(permission) {
        if(typeof permission === "bigint") {
            return (this.allow & permission) === permission;
        }
        return !!(this.allow & Permissions[permission]);
    }

    toString() {
        return `[${this.constructor.name} +${this.allow} -${this.deny}]`;
    }

    toJSON(props = []) {
        return super.toJSON([
            "allow",
            "deny",
            ...props
        ]);
    }
}

module.exports = Permission;
