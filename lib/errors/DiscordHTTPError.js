"use strict";

class DiscordHTTPError extends Error {
    constructor(req, res, response, stack) {
        super();

        Object.defineProperty(this, "req", {
            enumerable: false,
            value: req,
            writable: false
        });
        Object.defineProperty(this, "res", {
            enumerable: false,
            value: res,
            writable: false
        });
        Object.defineProperty(this, "response", {
            enumerable: false,
            value: response,
            writable: false
        });

        Object.defineProperty(this, "code", {
            value: res.statusCode,
            writable: false
        });
        let message = `${this.name}: ${res.statusCode} ${res.statusMessage} on ${req.method} ${req.path}`;
        const errors = this.flattenErrors(response);
        if(errors.length > 0) {
            message += "\n  " + errors.join("\n  ");
        }
        Object.defineProperty(this, "message", {
            value: message,
            writable: false
        });

        if(stack) {
            Object.defineProperty(this, "stack", {
                value: this.message + "\n" + stack,
                writable: false
            });
        } else {
            Error.captureStackTrace(this, DiscordHTTPError);
        }
    }

    get name() {
        return this.constructor.name;
    }

    flattenErrors(errors, keyPrefix = "") {
        let messages = [];
        for(const fieldName in errors) {
            if(!errors.hasOwnProperty(fieldName) || fieldName === "message" || fieldName === "code") {
                continue;
            }
            if(Array.isArray(errors[fieldName])) {
                messages = messages.concat(errors[fieldName].map((str) => `${keyPrefix + fieldName}: ${str}`));
            }
        }
        return messages;
    }
}

module.exports = DiscordHTTPError;
