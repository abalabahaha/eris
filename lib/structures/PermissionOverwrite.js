"use strict";

const Permission = require("./Permission");

/**
* Represents a permission overwrite
* @extends Permission
* @prop {String} id The ID of the overwrite
* @prop {Number} type The type of the overwrite, either 1 for "member" or 0 for "role"
*/
class PermissionOverwrite extends Permission {
    constructor(data) {
        super(data.allow, data.deny);
        this.id = data.id;
        this.type = data.type;
    }

    toJSON(props = []) {
        return super.toJSON([
            "type",
            ...props
        ]);
    }
}

module.exports = PermissionOverwrite;
