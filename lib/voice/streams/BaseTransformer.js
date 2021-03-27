"use strict";

const util = require("util");
const Base = require("../../structures/Base");
const TransformStream = require("stream").Transform;

class BaseTransformer extends TransformStream {
    constructor(options = {}) {
        if(options.allowHalfOpen === undefined) {
            options.allowHalfOpen = true;
        }
        if(options.highWaterMark === undefined) {
            options.highWaterMark = 0;
        }
        super(options);
        this.manualCB = false;
    }

    setTransformCB(cb) {
        if(this.manualCB) {
            this.transformCB();
            this._transformCB = cb;
        } else {
            cb();
        }
    }

    transformCB() {
        if(this._transformCB) {
            this._transformCB();
            this._transformCB = null;
        }
    }

    [util.inspect.custom]() {
        return Base.prototype[util.inspect.custom].call(this);
    }
}

module.exports = BaseTransformer;
