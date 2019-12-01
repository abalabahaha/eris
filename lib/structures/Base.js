"use strict";

const util = require("util");

class Base {
    constructor(id) {
        if(id) {
            this.id = id;
        }
    }

    get createdAt() {
        return Math.floor(this.id / 4194304) + 1420070400000;
    }

    toString() {
        return `[${this.constructor.name} ${this.id}]`;
    }

    toJSON(props = []) {
        const json = {};
        if(this.id) {
            json.id = this.id;
        }
        for(const prop of props) {
            const value = this[prop];
            if(value === undefined) {
                continue;
            } else if(typeof value !== "object" || value === null) {
                json[prop] = value;
            } else if(value.toJSON !== undefined) {
                json[prop] = value.toJSON();
            } else if(value.values !== undefined) {
                json[prop] = Array.from(value.values());
            } else if(typeof value !== "function") {
                json[prop] = value;
            }
        }
        return json;
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
}

module.exports = Base;
