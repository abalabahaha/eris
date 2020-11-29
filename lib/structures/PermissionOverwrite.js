"use strict";

const Permission = require("./Permission");

/**
* Represents a permission overwrite
* @extends Permission
* @prop {String} id The ID of the overwrite
* @prop {String} type The type of the overwrite, either "member" or "role"
*/
class PermissionOverwrite extends Permission {
    constructor(data) {
        super(data.allow_new || data.allow, data.deny_new || data.deny);
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
