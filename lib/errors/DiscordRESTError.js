"use strict";

let a = {
    "code": 50035,
    "errors": {
        "embed": {
            "color": {
                "_errors": [
                    {
                        "code": "NUMBER_TYPE_COERCE",
                        "message": "Value \"#1234\" is not int."
                    }
                ]
            }
        }
    },
    "message": "Invalid Form Body"
}
let b = {
    "code": 50035,
    "errors": {
        "name": {
            "_errors": [
                {
                    "code": "BASE_TYPE_BAD_LENGTH",
                    "message": "Must be between 2 and 100 in length."
                },
                {
                    "code": "CHANNEL_NAME_INVALID",
                    "message": "Text channel names must be alphanumeric with dashes or underscores."
                }
            ]
        }
    },
    "message": "Invalid Form Body"
}

class DiscordAPIError extends Error {
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

        var message = this.name + ": " + (response.message || "Unknown error");
        if(response.errors) {
            message += "\n  " + this.flattenErrors(response.errors).join("\n  ");
        } else {
            var errors = this.flattenErrors(response);
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
            Error.captureStackTrace(this, DiscordAPIError);
        }
    }

    get name() {
        return `${this.constructor.name} [${this.code}]`;
    }

    flattenErrors(errors, keyPrefix) {
        keyPrefix = keyPrefix || "";

        var messages = [];
        for(var fieldName in errors) {
            if(fieldName === "message" || fieldName === "code") {
                continue;
            }
            if(errors[fieldName]._errors) {
                messages = messages.concat(errors[fieldName]._errors.map((obj) => `${keyPrefix + fieldName}: ${obj.message}`));
            } else if(Array.isArray(errors[fieldName])) {
                messages = messages.concat(errors[fieldName].map((str) => `${keyPrefix + fieldName}: ${str}`));
            } else if(typeof errors[fieldName] === "object") {
                messages = messages.concat(this.flattenErrors(errors, keyPrefix + fieldName + "."));
            }
        }
        return messages;
    }
}

module.exports = DiscordAPIError;
