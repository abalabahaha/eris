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
        let contentType;
        if(filename) {
            str += "; filename=\"" + filename + "\"";
            const extension = filename.match(/\.(png|apng|gif|jpg|jpeg|webp|svg|json)$/i);
            if(extension) {
                let ext = extension[1].toLowerCase();
                switch(ext) {
                    case "png":
                    case "apng":
                    case "gif":
                    case "jpg":
                    case "jpeg":
                    case "webp":
                    case "svg": {
                        if(ext === "svg") {
                            ext = "svg+xml";
                        }
                        contentType = "image/";
                        break;
                    }
                    case "json": {
                        contentType = "application/";
                        break;
                    }
                }
                contentType += ext;
            }
        }

        if(contentType) {
            str += `\r\nContent-Type: ${contentType}`;
        } else if(ArrayBuffer.isView(data)) {
            str +="\r\nContent-Type: application/octet-stream";
            if(!(data instanceof Uint8Array)) {
                data = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
            }
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
