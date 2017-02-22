"use strict";

class MultipartData {
    constructor() {
        this.boundary = "----------------Eris";
        this.buf = new Buffer(0);
    }

    attachFile(data, name) {
        if(data === undefined) {
            return;
        }
        var header = this.createContentHeader("file", name, "application/octet-stream");
        data = this.bufferizeData(data);
        this.buf = Buffer.concat([
            this.buf,
            new Buffer(header + "\r\n\r\n"),
            data
        ]);
    }

    attachJson(json) {
        if (json === undefined) {
            return;
        }
        var header = this.createContentHeader("payload_json", null, "application/json");
        this.buf = Buffer.concat([
            this.buf,
            new Buffer(header + "\r\n\r\n" + JSON.stringify(json))
        ]);
    }

    attachContent(field, data) {
        if(data === undefined) {
            return;
        }
        var header = this.createContentHeader(field, null, null);
        data = this.bufferizeData(data);
        this.buf = Buffer.concat([
            this.buf,
            new Buffer(header + "\r\n\r\n"),
            data
        ]);
    }

    bufferizeData(data) {
        if(!(data instanceof Buffer)) {
            return new Buffer(typeof data === "object" ? JSON.stringify(data) : "" + data);
        } else {
            return data;
        }
    }

    createContentHeader(field, fileName, contentType) {
        var str = "\r\n--" + this.boundary + "\r\nContent-Disposition: form-data; name=\"" + field + "\"";
        if(fileName) {
            str += "; filename=\"" + fileName;
        }
        if (contentType) {
        str += "\"\r\nContent-Type: " + contentType;
        }

        return str;
    }

    finish() {
        return this.buf = Buffer.concat([
            this.buf,
            new Buffer("\r\n--" + this.boundary + "--")
        ]);
    }
}

module.exports = MultipartData;
