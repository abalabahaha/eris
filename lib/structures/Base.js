"use strict";

const util = require('util');

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

    toJSON(simple) {
        if(simple) {
            return {
                id: this.id
            };
        }
        const base = {};
        for(const key in this) {
            if(!base.hasOwnProperty(key) && this.hasOwnProperty(key) && !key.startsWith("_")) {
                if(!this[key]) {
                    base[key] = this[key];
                } else if(this[key] instanceof Set) {
                    base[key] = Array.from(this[key]);
                } else if(this[key] instanceof Map) {
                    base[key] = Array.from(this[key].values());
                } else if(typeof this[key].toJSON === "function") {
                    base[key] = this[key].toJSON();
                } else {
                    base[key] = this[key];
                }
            }
        }
        return base;
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
