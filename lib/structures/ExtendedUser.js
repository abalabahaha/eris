"use strict";

const User = require("./User");

/**
* Represents an extended user
* @extends User
* @prop {String} email The email of the user
* @prop {Boolean} verified Whether the account email has been verified
* @prop {Boolean} mfaEnabled Whether the user has enabled two-factor authentication
*/
class ExtendedUser extends User {
    constructor(data, client) {
        super(data, client);
        this.update(data);
    }

    update(data) {
        super.update(data);
        if(data.email !== undefined) this.email = data.email;
        if(data.verified !== undefined) this.verified = data.verified;
        if(data.mfa_enabled !== undefined) this.mfaEnabled = data.mfa_enabled;
        if(data.premium !== undefined) this.premium = data.premium;
    }

    toJSON() {
        const base = super.toJSON(true);
        for(const prop of ["email", "mfaEnabled", "premium", "verified"]) {
            if(this[prop] !== undefined) {
                base[prop] = this[prop] && this[prop].toJSON ? this[prop].toJSON() : this[prop];
            }
        }
        return base;
    }
}

module.exports = ExtendedUser;
