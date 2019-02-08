'use strict';

const Base = require('./Base');

module.exports = class Emoji extends Base {
    constructor(data, guild) {
        super(data.id);

        /**
         * The guild that the emoji is from
         * @type {import('./Guild')}
         */
        this.guild = guild;

        /**
         * If the emoji is animated
         * @type {boolean}
         */
        this.animated = data.animated;

        /**
         * The emoji name
         * @type {string}
         */
        this.name = data.name;

        /**
         * The roles that the emoji is associated with
         * @type {string[]}
         */
        this.roles = data.roles;
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