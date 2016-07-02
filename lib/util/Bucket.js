"use strict";

class Bucket {
    constructor(tokenLimit, interval, sequencerWait) {
        this.tokenLimit = tokenLimit;
        this.interval = interval;
        this.sequencerWait = sequencerWait;
        this.lastReset = this.tokens = this.lastSend = 0;
        this._queue = [];
    }

    queue(func) {
        this._queue.push(func);
        this.check();
    }

    check() { // Overcomplicated inefficient math things I'm not even going to bother documenting
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
