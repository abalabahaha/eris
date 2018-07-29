"use strict";

class DiscordRESTError extends Error {
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
            value: +response.code || -1,
            writable: false
        });

        let message = this.name + ": " + (response.message || "Unknown error");
        if(response.errors) {
            message += "\n  " + this.flattenErrors(response.errors).join("\n  ");
        } else {
            const errors = this.flattenErrors(response);
            if(errors.length > 0) {
                message += "\n  " + errors.join("\n  ");
            }
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
            Error.captureStackTrace(this, DiscordRESTError);
        }
    }

    get name() {
        return `${this.constructor.name} [${this.code}]`;
    }

    flattenErrors(errors, keyPrefix = "") {
        let messages = [];
        for(const fieldName in errors) {
            if(!errors.hasOwnProperty(fieldName) || fieldName === "message" || fieldName === "code") {
                continue;
            }
            if(errors[fieldName]._errors) {
                messages = messages.concat(errors[fieldName]._errors.map((obj) => `${keyPrefix + fieldName}: ${obj.message}`));
            } else if(Array.isArray(errors[fieldName])) {
                messages = messages.concat(errors[fieldName].map((str) => `${keyPrefix + fieldName}: ${str}`));
            } else if(typeof errors[fieldName] === "object") {
                messages = messages.concat(this.flattenErrors(errors[fieldName], keyPrefix + fieldName + "."));
            }
        }
        return messages;
    }
}

module.exports = DiscordRESTError;
