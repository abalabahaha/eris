"use strict";

/**
* Hold a bunch of something
* @extends Map
* @prop {Class} baseObject The base class for all items
* @prop {Number?} limit Max number of items to hold
*/
class Collection extends Map {
    /**
    * Construct a Collection
    * @arg {Class} baseObject The base class for all items
    * @arg {Number} [limit] Max number of items to hold
    */
    constructor(baseObject, limit) {
        super();
        this.baseObject = baseObject;
        this.limit = limit;
    }

    /**
    * Update an object
    * @arg {Object} obj The updated object data
    * @arg {String} obj.id The ID of the object
    * @arg {Class} [extra] An extra parameter the constructor may need
    * @arg {Boolean} [replace] Whether to replace an existing object with the same ID
    * @returns {Class} The updated object
    */
    update(obj, extra, replace) {
        if(!obj.id && obj.id !== 0) {
            throw new Error("Missing object id");
        }
        const item = this.get(obj.id);
        if(!item) {
            return this.add(obj, extra, replace);
        }
        item.update(obj, extra);
        return item;
    }

    /**
    * Add an object
    * @arg {Object} obj The object data
    * @arg {String} obj.id The ID of the object
    * @arg {Class} [extra] An extra parameter the constructor may need
    * @arg {Boolean} [replace] Whether to replace an existing object with the same ID
    * @returns {Class} The existing or newly created object
    */
    add(obj, extra, replace) {
        if(this.limit === 0) {
            return (obj instanceof this.baseObject || obj.constructor.name === this.baseObject.name) ? obj : new this.baseObject(obj, extra);
        }
        if(obj.id == null) {
            throw new Error("Missing object id");
        }
        const existing = this.get(obj.id);
        if(existing && !replace) {
            return existing;
        }
        if(!(obj instanceof this.baseObject || obj.constructor.name === this.baseObject.name)) {
            obj = new this.baseObject(obj, extra);
        }

        this.set(obj.id, obj);

        if(this.limit && this.size > this.limit) {
            const iter = this.keys();
            while(this.size > this.limit) {
                this.delete(iter.next().value);
            }
        }
        return obj;
    }

    /**
     * Returns true if all elements satisfy the condition
     * @arg {Function} func A function that takes an object and returns true or false
     * @returns {Boolean} Whether or not all elements satisfied the condition
     */
    every(func) {
        for(const item of this.values()) {
            if(!func(item)) {
                return false;
            }
        }
        return true;
    }

    /**
    * Return all the objects that make the function evaluate true
    * @arg {Function} func A function that takes an object and returns true if it matches
    * @returns {Array<Class>} An array containing all the objects that matched
    */
    filter(func) {
        const arr = [];
        for(const item of this.values()) {
            if(func(item)) {
                arr.push(item);
            }
        }
        return arr;
    }

    /**
    * Return the first object to make the function evaluate true
    * @arg {Function} func A function that takes an object and returns true if it matches
    * @returns {Class?} The first matching object, or undefined if no match
    */
    find(func) {
        for(const item of this.values()) {
            if(func(item)) {
                return item;
            }
        }
        return undefined;
    }

    /**
    * Return an array with the results of applying the given function to each element
    * @arg {Function} func A function that takes an object and returns something
    * @returns {Array} An array containing the results
    */
    map(func) {
        const arr = [];
        for(const item of this.values()) {
            arr.push(func(item));
        }
        return arr;
    }

    /**
    * Get a random object from the Collection
    * @returns {Class?} The random object, or undefined if there is no match
    */
    random() {
        const index = Math.floor(Math.random() * this.size);
        const iter = this.values();
        for(let i = 0; i < index; ++i) {
            iter.next();
        }
        return iter.next().value;
    }

    /**
     * Returns a value resulting from applying a function to every element of the collection
     * @arg {Function} func A function that takes the previous value and the next item and returns a new value
     * @arg {any} [initialValue] The initial value passed to the function
     * @returns {any} The final result
     */
    reduce(func, initialValue) {
        const iter = this.values();
        let val;
        let result = initialValue === undefined ? iter.next().value : initialValue;
        while((val = iter.next().value) !== undefined) {
            result = func(result, val);
        }
        return result;
    }

    /**
    * Remove an object
    * @arg {Object} obj The object
    * @arg {String} obj.id The ID of the object
    * @returns {Class?} The removed object, or null if nothing was removed
    */
    remove(obj) {
        const item = this.get(obj.id);
        if(!item) {
            return null;
        }
        this.delete(obj.id);
        return item;
    }

    /**
     * Returns true if at least one element satisfies the condition
     * @arg {Function} func A function that takes an object and returns true or false
     * @returns {Boolean} Whether or not at least one element satisfied the condition
     */
    some(func) {
        for(const item of this.values()) {
            if(func(item)) {
                return true;
            }
        }
        return false;
    }

    toString() {
        return `[Collection<${this.baseObject.name}>]`;
    }

    toJSON() {
        const json = {};
        for(const item of this.values()) {
            json[item.id] = item;
        }
        return json;
    }
}

module.exports = Collection;
