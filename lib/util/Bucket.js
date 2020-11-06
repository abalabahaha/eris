"use strict";

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

    check() {
        if(this.timeout || this._queue.length === 0) {
            return;
        }
        if(this.lastReset + this.interval + this.tokenLimit * this.latencyRef.latency < Date.now()) {
            this.lastReset = Date.now();
            this.tokens = Math.max(0, this.tokens - this.tokenLimit);
        }

        let val;
        let tokensAvailable = this.tokens < this.tokenLimit;
        let unreservedTokensAvailable = this.tokens < (this.tokenLimit - this.reservedTokens);
        while(this._queue.length > 0 && (unreservedTokensAvailable || (tokensAvailable && this._queue[0].priority))) {
            this.tokens++;
            tokensAvailable = this.tokens < this.tokenLimit;
            unreservedTokensAvailable = this.tokens < (this.tokenLimit - this.reservedTokens);
            const item = this._queue.shift();
            val = this.latencyRef.latency - Date.now() + this.lastSend;
            if(this.latencyRef.latency === 0 || val <= 0) {
                item.func();
                this.lastSend = Date.now();
            } else {
                setTimeout(() => {
                    item.func();
                }, val);
                this.lastSend = Date.now() + val;
            }
        }

        if(this._queue.length > 0 && !this.timeout) {
            this.timeout = setTimeout(() => {
                this.timeout = null;
                this.check();
            }, this.tokens < this.tokenLimit ? this.latencyRef.latency : Math.max(0, this.lastReset + this.interval + this.tokenLimit * this.latencyRef.latency - Date.now()));
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
}

module.exports = Bucket;
