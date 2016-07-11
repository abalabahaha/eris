"use strict";

/**
* Hold a bunch of something
* @extends Map
* @prop {Class} baseObject The base class for all items
* @prop {?Number} limit Max number of items to hold
*/
class Collection extends Map {
    /**
    * Construct a Collection
    * @arg {Class} baseObject The base class for all items
    * @arg {Number} [limit] Max number of items to hold
    * @returns {Collection} A Collection object
    */
    constructor(baseObject, limit) {
        super();
        this.baseObject = baseObject;
        this.limit = limit;
        if(limit) {
            this.ids = [];
        }
    }

    /**
    * Add an object
    * @arg {Object} obj The object data
    * @arg {String} obj.id The object ID
    * @arg {?something} extra An extra parameter the constructor may need
    * @returns {something} The existing or newly created object
    */
    add(obj, extra) {
        if(this.limit === 0) {
            return;
        }
        if(!obj.id && obj.id !== 0) {
            throw new Error("Missing object id");
        }
        var existing = this.get(obj.id);
        if(existing) {
            return existing;
        }
        if(!(obj instanceof this.baseObject)) {
            obj = new this.baseObject(obj, extra);
        }

        this.set(obj.id, obj);

        if(this.limit) {
            this.ids.push(obj.id);
            if(this.ids.length > this.limit) {
                for(var key of this.ids.splice(0, this.ids.length - this.limit)) {
                    this.delete(key);
                }
            }
        }
        return obj;
    }

    /**
    * Return the first object to make the function evaluate true
    * @arg {function} func A function that takes an object and returns true if it matches
    * @returns {?something} The first matching object, or null if no match
    */
    find(func) {
        for(var item of this) {
            if(func(item[1])) {
                return item[1];
            }
        }
        return null;
    }

    /**
    * Return all the objects that make the function evaluate true
    * @arg {function} func A function that takes an object and returns true if it matches
    * @returns {Array<something>} An array containing all the objects that matched
    */
    filter(func) {
        var arr = [];
        for(var item of this) {
            if(func(item[1])) {
                arr.push(item[1]);
            }
        }
        return arr;
    }

    /**
    * Return an array with the results of applying the given function to each element
    * @arg {function} func A function that takes an object and returns something
    * @returns {Array} An array containing the results
    */
    map(func) {
        var arr = [];
        for(var item of this) {
            arr.push(func(item[1]));
        }
        return arr;
    }

    /**
    * Update an object
    * @arg {Object} obj The updated object data
    * @arg {String} obj.id The object ID
    * @arg {?something} extra An extra parameter the constructor may need
    * @returns {something} The updated object
    */
    update(obj, extra) {
        if(!obj.id && obj.id !== 0) {
            throw new Error("Missing object id");
        }
        var item = this.get(obj.id);
        if(!item) {
            return this.add(obj, extra);
        }
        item.update(obj, extra);
        return item;
    }

    /**
    * Remove an object
    * @arg {Object} obj The object
    * @arg {String} obj.id The object ID
    * @returns {?something} The removed object, or null if nothing was removed
    */
    remove(obj) {
        var item = this.get(obj.id);
        if(!item) {
            return null;
        }
        this.delete(obj.id);
        return item;
    }

    toString() {
        return `[Collection<${this.baseObject.name}>]`;
    }
}

module.exports = Collection;
