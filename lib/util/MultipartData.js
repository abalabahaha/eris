"use strict";

class MultipartData {
    constructor() {
        this.boundary = "----------------Eris";
        this.buf = new Buffer(0);
    }

    attach(field, data, name) {
        var str = "\r\n--" + this.boundary + "\r\nContent-Disposition: form-data; name=\"" + field + "\"";
        if(name) {
            str += "; filename=\"" + name + "\"\r\nContent-Type: application/octet-stream";
        }
        if(!(data instanceof Buffer)) {
            data = new Buffer(data);
        }
        this.buf = Buffer.concat([
            this.buf,
            new Buffer(str + "\r\n\r\n"),
            data
        ]);
    }

    finish() {
        return this.buf = Buffer.concat([
            this.buf,
            new Buffer("\r\n--" + this.boundary + "--")
        ]);
    }
}

module.exports = MultipartData;
