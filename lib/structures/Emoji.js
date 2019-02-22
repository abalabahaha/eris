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

    update(data) {
        this.animated = data.animated !== undefined? undefined: this.animated;
        this.name = data.name !== undefined? undefined: this.name;
        
        if (data.roles) {
            for (const id of data.roles) if (!this.roles.has(id)) this.roles.add(id, this);
        }
    }

    /**
     * Gets the guild
     * @returns {import('./Guild')} The guild
     */
    getGuild() {
        return this.guild;
    }

    /**
     * If the emoji is animated
     * @returns {boolean} if it is or not
     */
    isAnimated() {
        return this.animated;
    }

    /**
     * Gets the name of the emoji
     * @returns {string} The emoji name
     */
    getName() {
        return this.name;
    }

    /**
     * Stringifys the emoji
     * @returns {string} The emote converted
     * @example
     * 
     * const emoji = msg.guild.emojis.get('tututu');
     * console.log(emoji); // => `<a:tututu:{id}>` (the `a` is present if the emoji is animated)
     */
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