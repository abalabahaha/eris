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
class SequentialBucket {
    /**
    * Construct a SequentialBucket
    * @returns {SequentialBucket} A SequentialBucket object
    */
    constructor(limit) {
        this.limit = this.remaining = limit;
        this.resetInterval = 0;
        this.reset = 0;
        this.processing = false;
        this._queue = [];
    }

    /**
    * Queue something in the SequentialBucket
    */
    queue(func) {
        this._queue.push(func);
        this.check();
    }

    check() { // Overcomplicated unoptimized math things
        if(this.processing || this._queue.length === 0) {
            return;
        }
        this.processing = true;
        if(this.reset && this.reset < Date.now()) {
            this.reset = this.resetInterval ? Date.now() + this.resetInterval : 0;
            this.remaining = this.limit;
        }
        if(this.last >= Date.now() - 3) {
            throw new Error("loop")
        }
        this.last = Date.now();
        if(this.remaining <= 0) {
            return setTimeout(() => {
                this.processing = false;
                this.check();
            }, this.reset ? Math.max(200, this.reset - Date.now()) : 200);
        }
        --this.remaining;
        this._queue.shift()(() => {
            this.processing = false;
            if(this._queue.length > 0) {
                this.check();
            }
        });
    }
}

module.exports = SequentialBucket;
