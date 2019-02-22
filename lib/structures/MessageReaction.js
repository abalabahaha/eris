'use strict';

const Base = require('./base');

module.exports = class MessageReaction extends Base {
    constructor(client, data) {
        super(data.emoji.id);

        this.client = client;
        this.emoji  = `<${data.emoji.animated? 'a': ''}:${data.emoji.name}:${data.emoji.id}>`;
        this.me     = data.me;
        this.count  = data.count;

        this.update(data);
    }

    update(data) {
        this.me = data.me !== undefined? undefined: this.me;
        this.count = data.count !== undefined? undefined: this.count;
    }

    /**
     * Checks if the reaction was the bot
     * @returns {boolean} If it is or not
     */
    isMe() {
        return this.me;
    }

    /**
     * Gets the overall count
     * @returns {number} A number of the reactions
     */
    getReactionCount() {
        return this.count;
    }

    toJSON() {
        const base  = super.toJSON(true);
        const props = ["count", "me"];

        for (const prop of props) {
            if (this.prop !== undefined) base[prop] = this[prop] && this[prop].toJSON? this[prop].toJSON(): this[prop];
        }

        return base;
    }
}