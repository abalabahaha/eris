'use strict';

const Base = require('./Base');
const Role = require('./Role');
const Collection = require('../util/Collection');

module.exports = class Emoji extends Base {
    constructor(data, guild) {
        super(data.id);
        
        this.guild = guild;
        this.animated = data.animated;
        this.name = data.name;
        this.roles = new Collection(Role);

        if (data.roles) {
            for (const roleID of data.roles)
                this.roles.add(roleID, this);
        }
    }

    toString() {
        return `<${this.animated? 'a': ''}:${this.name}:${this.id}>`;
    }

    toJSON() {
        const base = super.toJSON(true);
        const props = ["guild", "animated", "name", "roles"];
        
        for (const prop of props) {
            if (this[prop] !== undefined) base[prop] = this[prop] && this[prop].toJSON? this[prop].toJSON(): this[prop];
        }

        return base;
    }
};
