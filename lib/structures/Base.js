"use strict";

const util = require("util");

/**
 * Provides utilities for working with many Discord structures
 * @prop {string} id A Discord snowflake identifying the object
 * @prop {Number} createdAt Timestamp of structure creation
 */
class Base {
    constructor(id) {
        if(id) {
            this.id = id;
        }
    }

    get createdAt() {
        return Base.getCreatedAt(this.id);
    }

    /**
     * Calculates the timestamp in milliseconds associated with a Discord ID/snowflake
     * @param {String} id The ID of a structure
     * @returns {Number}
     */
    static getCreatedAt(id) {
        return Base.getDiscordEpoch(id) + 1420070400000;
    }

    /**
     * Gets the number of milliseconds since epoch represented by an ID/snowflake
     * @param {string} id The ID of a structure
     * @returns {number}
     */
    static getDiscordEpoch(id) {
        return Math.floor(id / 4194304);
    }

    [util.inspect.custom]() {
        // http://stackoverflow.com/questions/5905492/dynamic-function-name-in-javascript
        const copy = new {[this.constructor.name]: class {}}[this.constructor.name]();
        for(const key in this) {
            if(this.hasOwnProperty(key) && !key.startsWith("_") && this[key] !== undefined) {
                copy[key] = this[key];
            }
        }
        return copy;
    }

    toString() {
        return `[${this.constructor.name} ${this.id}]`;
    }

    toJSON(props = []) {
        const json = {};
        if(this.id) {
            json.id = this.id;
            json.createdAt = this.createdAt;
        }
        for(const prop of props) {
            const value = this[prop];
            const type = typeof value;
            if(value === undefined) {
                continue;
            } else if(type !== "object" && type !== "function" && type !== "bigint" || value === null) {
                json[prop] = value;
            } else if(value.toJSON !== undefined) {
                json[prop] = value.toJSON();
            } else if(value.values !== undefined) {
                json[prop] = [...value.values()];
            } else if(type === "bigint") {
                json[prop] = value.toString();
            } else if(type === "object") {
                json[prop] = value;
            }
        }
        return json;
    }
}

module.exports = Base;
