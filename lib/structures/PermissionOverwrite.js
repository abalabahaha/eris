"use strict";

const Permission = require("./Permission");

/**
* Represents a permission overwrite
* @extends Permission
* @prop {String} id The ID of the overwrite
* @prop {String} type The type of the overwrite, either "user" or "role"
*/
class PermissionOverwrite extends Permission {
    constructor(data) {
        super(data.allow, data.deny);
        this.id = data.id;
        this.type = data.type;
    }

    toJSON() {
        var base = super.toJSON(true);
        for(var prop of ["type"]) {
            base[prop] = this[prop] && this[prop].toJSON ? this[prop].toJSON() : this[prop];
        }
        return base;
    }
}

module.exports = PermissionOverwrite;