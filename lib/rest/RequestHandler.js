"use strict";

const Base = require("../structures/Base");
const DiscordHTTPError = require("../errors/DiscordHTTPError");
const DiscordRESTError = require("../errors/DiscordRESTError");
const Endpoints = require("./Endpoints");
const HTTPS = require("https");
const MultipartData = require("../util/MultipartData");
const SequentialBucket = require("../util/SequentialBucket");
const Zlib = require("zlib");

/**
* Handles API requests
*/
class RequestHandler {
    constructor(client, forceQueueing) {
        this._client = client;
        this.baseURL = Endpoints.BASE_URL;
        this.userAgent = `DiscordBot (https://github.com/abalabahaha/eris, ${require("../../package.json").version})`;
        this.ratelimits = {};
        this.requestTimeout = client.options.requestTimeout;
        this.agent = client.options.agent;
        this.latencyRef = {
            latency: 500,
            offset: client.options.ratelimiterOffset,
            raw: new Array(10).fill(500),
            timeOffset: 0,
            timeOffsets: new Array(10).fill(0),
            lastTimeOffsetCheck: 0
        };
        this.globalBlock = false;
        this.readyQueue = [];
        if(forceQueueing) {
            this.globalBlock = true;
            this._client.once("shardPreReady", () => this.globalUnblock());
        }
    }

    globalUnblock() {
        this.globalBlock = false;
        while(this.readyQueue.length > 0) {
            this.readyQueue.shift()();
        }
    }

    /**
    * Make an API request
    * @arg {String} method Uppercase HTTP method
    * @arg {String} url URL of the endpoint
    * @arg {Boolean} [auth] Whether to add the Authorization header and token or not
    * @arg {Object} [body] Request payload
    * @arg {Object} [file] File object
    * @arg {Buffer} file.file A buffer containing file data
    * @arg {String} file.name What to name the file
    * @returns {Promise<Object>} Resolves with the returned JSON data
    */
    request(method, url, auth, body, file, _route, short) {
        const route = _route || this.routefy(url, method);

        const _stackHolder = {}; // Preserve async stack
        Error.captureStackTrace(_stackHolder);

        return new Promise((resolve, reject) => {
            let attempts = 0;

            const actualCall = (cb) => {
                const headers = {
                    "User-Agent": this.userAgent,
                    "Accept-Encoding": "gzip,deflate",
                    "X-RateLimit-Precision": "millisecond"
                };
                let data;
                let finalURL = url;

                try {
                    if(auth) {
                        headers.Authorization = this._client.token;
                    }
                    if(body && body.reason) { // Audit log reason sniping
                        headers["X-Audit-Log-Reason"] = body.reason;
                        if(method !== "POST" || !url.includes("/prune")) {
                            delete body.reason;
                        }
                    }
                    if(file) {
                        if(Array.isArray(file)) {
                            data = new MultipartData();
                            headers["Content-Type"] = "multipart/form-data; boundary=" + data.boundary;
                            file.forEach(function(f) {
                                if(!f.file) {
                                    return;
                                }
                                data.attach(f.name, f.file, f.name);
                            });
                            if(body) {
                                data.attach("payload_json", body);
                            }
                            data = data.finish();
                        } else if(file.file) {
                            data = new MultipartData();
                            headers["Content-Type"] = "multipart/form-data; boundary=" + data.boundary;
                            data.attach("file", file.file, file.name);
                            if(body) {
                                data.attach("payload_json", body);
                            }
                            data = data.finish();
                        } else {
                            throw new Error("Invalid file object");
                        }
                    } else if(body) {
                        if(method === "GET" || method === "DELETE") {
                            let qs = "";
                            Object.keys(body).forEach(function(key) {
                                if(body[key] != undefined) {
                                    if(Array.isArray(body[key])) {
                                        body[key].forEach(function(val) {
                                            qs += `&${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
                                        });
                                    } else {
                                        qs += `&${encodeURIComponent(key)}=${encodeURIComponent(body[key])}`;
                                    }
                                }
                            });
                            finalURL += "?" + qs.substring(1);
                        } else {
                            data = JSON.stringify(body);
                            headers["Content-Type"] = "application/json";
                        }
                    }
                } catch(err) {
                    cb();
                    reject(err);
                    return;
                }

                const req = HTTPS.request({
                    method: method,
                    host: "discord.com",
                    path: this.baseURL + finalURL,
                    headers: headers,
                    agent: this.agent
                });

                let reqError;

                req.once("abort", () => {
                    cb();
                    reqError = reqError || new Error(`Request aborted by client on ${method} ${url}`);
                    reqError.req = req;
                    reject(reqError);
                }).once("error", (err) => {
                    reqError = err;
                    req.abort();
                });

                let latency = Date.now();

                req.once("response", (resp) => {
                    if(this._client.listeners("rawREST").length) {
                        /**
                         * Fired when the Client's RequestHandler receives a response
                         * @event Client#rawREST
                         * @prop {Object} [request] The data for the request.
                         * @prop {Boolean} request.auth True if the request required an authorization token
                         * @prop {Object} [request.body] The request payload
                         * @prop {Object} [request.file] The file object sent in the request
                         * @prop {Buffer} request.file.file A buffer containing file data
                         * @prop {String} request.file.name The name of the file
                         * @prop {String} request.method Uppercase HTTP method
                         * @prop {IncomingMessage} request.resp The HTTP response to the request
                         * @prop {String} request.route The calculated ratelimiting route for the request
                         * @prop {Boolean} request.short Whether or not the request was prioritized in its ratelimiting queue
                         * @prop {String} request.url URL of the endpoint
                         */
                        this._client.emit("rawREST", {method, url, auth, body, file, route, short, resp});
                    }
                    latency = Date.now() - latency;
                    this.latencyRef.raw.push(latency);
                    this.latencyRef.latency = this.latencyRef.latency - ~~(this.latencyRef.raw.shift() / 10) + ~~(latency / 10);

                    const headerNow = Date.parse(resp.headers["date"]);
                    if(this.latencyRef.lastTimeOffsetCheck < Date.now() - 5000) {
                        const timeOffset = headerNow + 500 - (this.latencyRef.lastTimeOffsetCheck = Date.now());
                        if(this.latencyRef.timeOffset - this.latencyRef.latency >= this._client.options.latencyThreshold && timeOffset - this.latencyRef.latency >= this._client.options.latencyThreshold) {
                            this._client.emit("warn", new Error(`Your clock is ${this.latencyRef.timeOffset}ms behind Discord's server clock. Please check your connection and system time.`));
                        }
                        this.latencyRef.timeOffset = this.latencyRef.timeOffset - ~~(this.latencyRef.timeOffsets.shift() / 10) + ~~(timeOffset / 10);
                        this.latencyRef.timeOffsets.push(timeOffset);
                    }

                    resp.once("aborted", () => {
                        cb();
                        reqError = reqError || new Error(`Request aborted by server on ${method} ${url}`);
                        reqError.req = req;
                        reject(reqError);
                    });

                    let response = "";

                    let _respStream = resp;
                    if(resp.headers["content-encoding"]) {
                        if(resp.headers["content-encoding"].includes("gzip")) {
                            _respStream = resp.pipe(Zlib.createGunzip());
                        } else if(resp.headers["content-encoding"].includes("deflate")) {
                            _respStream = resp.pipe(Zlib.createInflate());
                        }
                    }

                    _respStream.on("data", (str) => {
                        response += str;
                    }).on("error", (err) => {
                        reqError = err;
                        req.abort();
                    }).once("end", () => {
                        const now = Date.now();

                        if(resp.headers["x-ratelimit-limit"]) {
                            this.ratelimits[route].limit = +resp.headers["x-ratelimit-limit"];
                        }

                        if(method !== "GET" && (resp.headers["x-ratelimit-remaining"] == undefined || resp.headers["x-ratelimit-limit"] == undefined) && this.ratelimits[route].limit !== 1) {
                            this._client.emit("debug", `Missing ratelimit headers for SequentialBucket(${this.ratelimits[route].remaining}/${this.ratelimits[route].limit}) with non-default limit\n`
                                + `${resp.statusCode} ${resp.headers["content-type"]}: ${method} ${route} | ${resp.headers["cf-ray"]}\n`
                                + "content-type = " +  + "\n"
                                + "x-ratelimit-remaining = " + resp.headers["x-ratelimit-remaining"] + "\n"
                                + "x-ratelimit-limit = " + resp.headers["x-ratelimit-limit"] + "\n"
                                + "x-ratelimit-reset = " + resp.headers["x-ratelimit-reset"] + "\n"
                                + "x-ratelimit-global = " + resp.headers["x-ratelimit-global"]);
                        }

                        this.ratelimits[route].remaining = resp.headers["x-ratelimit-remaining"] === undefined ? 1 : +resp.headers["x-ratelimit-remaining"] || 0;

                        let retryAfter = parseInt(resp.headers["retry-after"]);
                        // Discord breaks RFC here, using milliseconds instead of seconds (╯°□°）╯︵ ┻━┻
                        // This is the unofficial Discord dev-recommended way of detecting that
                        if(retryAfter && (typeof resp.headers["via"] !== "string" || !resp.headers["via"].includes("1.1 google"))) {
                            retryAfter *= 1000;
                            if(retryAfter >= 1000 * 1000) {
                                this._client.emit("warn", `Excessive Retry-After interval detected (Retry-After: ${resp.headers["retry-after"]} * 1000, Via: ${resp.headers["via"]})`);
                            }
                        }
                        if(retryAfter >= 0) {
                            if(resp.headers["x-ratelimit-global"]) {
                                this.globalBlock = true;
                                setTimeout(() => this.globalUnblock(), retryAfter || 1);
                            } else {
                                this.ratelimits[route].reset = (retryAfter || 1) + now;
                            }
                        } else if(resp.headers["x-ratelimit-reset"]) {
                            if((~route.lastIndexOf("/reactions/:id")) && (+resp.headers["x-ratelimit-reset"] * 1000 - headerNow) === 1000) {
                                this.ratelimits[route].reset = now + 250;
                            } else {
                                this.ratelimits[route].reset = Math.max(+resp.headers["x-ratelimit-reset"] * 1000 - this.latencyRef.timeOffset, now);
                            }
                        } else {
                            this.ratelimits[route].reset = now;
                        }

                        if(resp.statusCode !== 429) {
                            this._client.emit("debug", `${body && body.content} ${now} ${route} ${resp.statusCode}: ${latency}ms (${this.latencyRef.latency}ms avg) | ${this.ratelimits[route].remaining}/${this.ratelimits[route].limit} left | Reset ${this.ratelimits[route].reset} (${this.ratelimits[route].reset - now}ms left)`);
                        }

                        if(resp.statusCode >= 300) {
                            if(resp.statusCode === 429) {
                                this._client.emit("debug", `${resp.headers["x-ratelimit-global"] ? "Global" : "Unexpected"} 429 (╯°□°）╯︵ ┻━┻: ${response}\n${body && body.content} ${now} ${route} ${resp.statusCode}: ${latency}ms (${this.latencyRef.latency}ms avg) | ${this.ratelimits[route].remaining}/${this.ratelimits[route].limit} left | Reset ${this.ratelimits[route].reset} (${this.ratelimits[route].reset - now}ms left)`);
                                if(retryAfter) {
                                    setTimeout(() => {
                                        cb();
                                        this.request(method, url, auth, body, file, route, true).then(resolve).catch(reject);
                                    }, retryAfter);
                                    return;
                                } else {
                                    cb();
                                    this.request(method, url, auth, body, file, route, true).then(resolve).catch(reject);
                                    return;
                                }
                            } else if(resp.statusCode === 502 && ++attempts < 4) {
                                this._client.emit("debug", "A wild 502 appeared! Thanks CloudFlare!");
                                setTimeout(() => {
                                    this.request(method, url, auth, body, file, route, true).then(resolve).catch(reject);
                                }, Math.floor(Math.random() * 1900 + 100));
                                return cb();
                            }
                            cb();

                            if(response.length > 0) {
                                if(resp.headers["content-type"] === "application/json") {
                                    try {
                                        response = JSON.parse(response);
                                    } catch(err) {
                                        reject(err);
                                        return;
                                    }
                                }
                            }

                            let {stack} = _stackHolder;
                            if(stack.startsWith("Error\n")) {
                                stack = stack.substring(6);
                            }
                            let err;
                            if(response.code) {
                                err = new DiscordRESTError(req, resp, response, stack);
                            } else {
                                err = new DiscordHTTPError(req, resp, response, stack);
                            }
                            reject(err);
                            return;
                        }

                        if(response.length > 0) {
                            if(resp.headers["content-type"] === "application/json") {
                                try {
                                    response = JSON.parse(response);
                                } catch(err) {
                                    cb();
                                    reject(err);
                                    return;
                                }
                            }
                        }

                        cb();
                        resolve(response);
                    });
                });

                req.setTimeout(this.requestTimeout, () => {
                    reqError = new Error(`Request timed out (>${this.requestTimeout}ms) on ${method} ${url}`);
                    req.abort();
                });

                if(Array.isArray(data)) {
                    for(const chunk of data) {
                        req.write(chunk);
                    }
                    req.end();
                } else {
                    req.end(data);
                }
            };

            if(this.globalBlock && auth) {
                this.readyQueue.push(() => {
                    if(!this.ratelimits[route]) {
                        this.ratelimits[route] = new SequentialBucket(1, this.latencyRef);
                    }
                    this.ratelimits[route].queue(actualCall, short);
                });
            } else {
                if(!this.ratelimits[route]) {
                    this.ratelimits[route] = new SequentialBucket(1, this.latencyRef);
                }
                this.ratelimits[route].queue(actualCall, short);
            }
        });
    }

    routefy(url, method) {
        let route = url.replace(/\/([a-z-]+)\/(?:[0-9]{17,19})/g, function(match, p) {
            return p === "channels" || p === "guilds" || p === "webhooks" ? match : `/${p}/:id`;
        }).replace(/\/reactions\/[^/]+/g, "/reactions/:id").replace(/^\/webhooks\/(\d+)\/[A-Za-z0-9-_]{64,}/, "/webhooks/$1/:token");
        if(method === "DELETE" && route.endsWith("/messages/:id")) { // Delete Messsage endpoint has its own ratelimit
            route = method + route;
        }
        return route;
    }

    toString() {
        return "[RequestHandler]";
    }

    toJSON(props = []) {
        return Base.prototype.toJSON.call(this, [
            "baseURL",
            "userAgent",
            "ratelimits",
            "requestTimeout",
            "agent",
            "latencyRef",
            "globalBlock",
            "readyQueue",
            ...props
        ]);
    }
}

module.exports = RequestHandler;
