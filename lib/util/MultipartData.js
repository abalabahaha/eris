"use strict";

class MultipartData {
    constructor() {
        this.boundary = "----------------Eris";
        this.bufs = [];
    }

    attach(fieldName, data, filename) {
        if(data === undefined) {
            return;
        }
        let str = "\r\n--" + this.boundary + "\r\nContent-Disposition: form-data; name=\"" + fieldName + "\"";
        if(filename) {
            str += "; filename=\"" + filename + "\"";
        }
        if(data instanceof Buffer) {
            str +="\r\nContent-Type: application/octet-stream";
        } else if(typeof data === "object") {
            str +="\r\nContent-Type: application/json";
            data = Buffer.from(JSON.stringify(data));
        } else {
            data = Buffer.from("" + data);
        }
        this.bufs.push(Buffer.from(str + "\r\n\r\n"));
        this.bufs.push(data);
    }

    finish() {
        this.bufs.push(Buffer.from("\r\n--" + this.boundary + "--"));
        return this.bufs;
    }
}

module.exports = MultipartData;
