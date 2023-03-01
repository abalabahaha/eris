"use strict";

const util = require("util");
const Base = require("../structures/Base");

/**
* Handle ratelimiting something
* @prop {Number} interval How long (in ms) to wait between clearing used tokens
* @prop {Number} lastReset Timestamp of last token clearing
* @prop {Number} lastSend Timestamp of last token consumption
* @prop {Number} tokenLimit The max number tokens the bucket can consume per interval
* @prop {Number} tokens How many tokens the bucket has consumed in this interval
*/
class Bucket {
    /**
    * Construct a Bucket
    * @arg {Number} tokenLimit The max number of tokens the bucket can consume per interval
    * @arg {Number} interval How long (in ms) to wait between clearing used tokens
    * @arg {Object} [options] Optional parameters
    * @arg {Object} options.latencyRef A latency reference object
    * @arg {Number} options.latencyRef.latency Interval between consuming tokens
    * @arg {Number} options.reservedTokens How many tokens to reserve for priority operations
    */
    constructor(tokenLimit, interval, options = {}) {
        this.tokenLimit = tokenLimit;
        this.interval = interval;
        this.latencyRef = options.latencyRef || {latency: 0};
        this.lastReset = this.tokens = this.lastSend = 0;
        this.reservedTokens = options.reservedTokens || 0;
        this._queue = [];
    }
    
    /**
    * Limits operations by token rate.
    * Restricts the speed of an operation as allowed within a period of time.
    */
    check() {
        if(this.timeout || this._queue.length === 0) return;
        const now = Date.now();
        if(this.lastReset + this.interval + this.tokenLimit * this.latencyRef.latency < now) {
            this.lastReset = now;
            this.tokens = Math.max(0, this.tokens - this.tokenLimit);
        }
        let delay;
        while(this._queue.length > 0 && (this.tokens < (this.tokenLimit - this.reservedTokens) || (this.tokens < this.tokenLimit && this._queue[0].priority))) {
            this.tokens++;
            const item = this._queue.shift();
            delay = this.latencyRef.latency - (now - this.lastSend);
            if(this.latencyRef.latency === 0 || delay <= 0) {
                item.func();
                this.lastSend = now;
            } else {
                setTimeout(item.func, delay);
                this.lastSend = now + delay;
            }
        }
        if(this._queue.length > 0 && !this.timeout) {
            this.timeout = setTimeout(() => {
                this.timeout = null;
                this.check();
            }, this.tokens < this.tokenLimit ? this.latencyRef.latency : Math.max(0, this.lastReset + this.interval + this.tokenLimit * this.latencyRef.latency - now));
        }
    }


    /**
    * Queue something in the Bucket
    * @arg {Function} func A callback to call when a token can be consumed
    * @arg {Boolean} [priority=false] Whether or not the callback should use reserved tokens
    */
    queue(func, priority=false) {
        if(priority) {
            this._queue.unshift({func, priority});
        } else {
            this._queue.push({func, priority});
        }
        this.check();
    }

    [util.inspect.custom]() {
        return Base.prototype[util.inspect.custom].call(this);
    }
}

module.exports = Bucket;
