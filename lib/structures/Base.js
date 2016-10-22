"use strict";

class Base {
    constructor(id) {
        if(id) {
            this.id = id;
        }
    }

    createdAt() {
        return (this.id / 4194304) + 1420070400000;
    }

    toJSON() {
        var copy = {};
        for(var key in this) {
            if(this.hasOwnProperty(key) && !key.startsWith("_")) {
                if(this[key] && typeof this[key].toJSON === "function") {
                    copy[key] = this[key].toJSON();
                } else {
                    copy[key] = this[key];
                }
            }
        }
        return copy;
    }

    inspect() {
        var copy = new (new Function(`return function ${this.constructor.name}(){}`)());
        for(var key in this) {
            if(this.hasOwnProperty(key) && !key.startsWith("_")) {
                copy[key] = this[key];
            }
        }
        return copy;
    }
}

module.exports = Base;
