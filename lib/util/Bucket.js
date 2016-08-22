"use strict";

/**
* Handle ratelimiting something
* @prop {Number} tokens How many tokens the bucket has consumed in this interval
* @prop {Number} lastReset Timestamp of last token clearing
* @prop {Number} lastSend Timestamp of last token consumption
* @prop {Number} tokens How many tokens the bucket has consumed in this interval
* @prop {Number} tokenLimit The max number tokens the bucket can consume per interval
* @prop {Number} interval How long (in ms) to wait between clearing used tokens
* @prop {Number} sequencerWait How long (in ms) to wait between consuming tokens
*/
class Bucket {
    /**
    * Construct a Bucket
    * @arg {Number} tokenLimit The max number of tokens the bucket can consume per interval
    * @arg {Number} interval How long (in ms) to wait between clearing used tokens
    * @arg {Number} [sequencerWait=0] How long (in ms) to wait between consuming tokens
    * @returns {Bucket} A Bucket object
    */
    constructor(tokenLimit, interval, sequencerWait) {
        this.tokenLimit = tokenLimit;
        this.interval = interval;
        this.sequencerWait = sequencerWait || 0;
        this.lastReset = this.tokens = this.lastSend = 0;
        this._queue = [];
    }

    /**
    * Queue something in the Bucket
    * @arg {Function} func A callback to call when a token can be consumed
    */
    queue(func) {
        this._queue.push(func);
        this.check();
    }

    check() {
        if(this.timeout || this._queue.length === 0) {
            return;
        }
        if(this.lastReset + this.interval + this.tokenLimit * this.sequencerWait < Date.now()) {
            this.lastReset = Date.now();
            this.tokens = Math.max(0, this.tokens - this.tokenLimit);
        }

        var val;
        while(this._queue.length > 0 && this.tokens < this.tokenLimit) {
            this.tokens++;
            let item = this._queue.shift();
            val = this.sequencerWait - Date.now() + this.lastSend;
            if(this.sequencerWait === 0 || val <= 0) {
                item();
                this.lastSend = Date.now();
            } else {
                setTimeout(() => {
                    item();
                }, val);
                this.lastSend = Date.now() + val;
            }
        }

        if(this._queue.length > 0 && !this.timeout) {
            this.timeout = setTimeout(() => {
                this.timeout = null;
                this.check();
            }, this.tokens < this.tokenLimit ? this.sequencerWait : Math.max(0, this.lastReset + this.interval + this.tokenLimit * this.sequencerWait - Date.now()));
        }
    }
}

module.exports = Bucket;
