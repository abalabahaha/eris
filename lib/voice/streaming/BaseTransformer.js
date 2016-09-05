"use strict";

const TransformStream = require("stream").Transform;

class BaseTransformer extends TransformStream {
    constructor(connection) {
        super();

        this._connection = connection;
    }

    onFinish() {
        if(this._remainder) {
            this._remainder = null;
        }
    }

    attach(stream) {
        if(this.source) {
            this.unattach();
        }

        this.source = stream;
        this.source.once("error", () => this.unattach());

        var pipe = this.source.pipe(this, {
            end: false
        });

        pipe.once("unpipe", () => this.unattach());
        pipe.once("end", () => this.unattach());

        this.once("finish", this.onFinish);
    }

    unattach() {
        if(this.source) {
            if(this.source.unattach) {
                this.source.unattach();
            } else {
                this.source.unpipe(this);
                if(this.source && this.source.destroy) {
                    this.source.destroy();
                }
            }
        }
        this.source = null;

        this.removeListener("finish", this.onFinish);
    }
}

module.exports = BaseTransformer;
