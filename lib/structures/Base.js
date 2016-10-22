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
        console.log(Object.getPrototypeOf(this)._gettersByProperty);
        for(var key in this) {
            if(this.hasOwnProperty(key) && !key.startsWith("_")) {
                copy[key] = this[key];
            }
        }
        return copy;
    }

    inspect() {
        // http://stackoverflow.com/questions/5905492/dynamic-function-name-in-javascript
        var copy = new (new Function(`return function ${this.constructor.name}(){}`)());
        for(var key in this) {
            if(this.hasOwnProperty(key) && !key.startsWith("_") && this[key]) {
                copy[key] = this[key];
            }
        }
        return copy;
    }
}

module.exports = Base;
