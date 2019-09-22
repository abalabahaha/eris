"use strict";

class DiscordHTTPError extends Error {
    constructor(req, res, response, stack) {
        super();

        Object.defineProperty(this, "req", {
            enumerable: false,
            value: req
        });
        Object.defineProperty(this, "res", {
            enumerable: false,
            value: res
        });
        Object.defineProperty(this, "response", {
            enumerable: false,
            value: response
        });

        Object.defineProperty(this, "code", {
            value: res.statusCode
        });
        let message = `${this.name}: ${res.statusCode} ${res.statusMessage} on ${req.method} ${req.path}`;
        const errors = this.flattenErrors(response);
        if(errors.length > 0) {
            message += "\n  " + errors.join("\n  ");
        }
        Object.defineProperty(this, "message", {
            value: message
        });

        if(stack) {
            Object.defineProperty(this, "stack", {
                value: this.message + "\n" + stack
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
