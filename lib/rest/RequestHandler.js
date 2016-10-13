"use strict";

const Endpoints = require("./Endpoints");
const HTTPS = require("https");
const MultipartData = require("../util/MultipartData");
const SequentialBucket = require("../util/SequentialBucket");

/**
* Handles APi requests
*/
class RequestHandler {
    constructor(client, forceQueueing) {
        this._client = client;
        this.baseURL = Endpoints.BASE_URL;
        this.userAgent = `DiscordBot (https://github.com/abalabahaha/eris, ${require("../../package.json").version})`;
        this.ratelimits = {};
        this.latencyRef = {
            latency: 500,
            raw: [500, 500, 500, 500, 500, 500, 500, 500, 500, 500],
            total: 5000
        };
        this.globalBlock = false;
        if(forceQueueing) {
            this.globalBlock = true;
            this.readyQueue = [];
            this._client.once("shardPreReady", () => this.globalUnblock());
        }
    }

    globalUnblock() {
        this.globalBlock = false;
        while(this.readyQueue.length > 0) {
            this.readyQueue.shift()();
        }
    }

    routefy(url) {
        return url.replace(/\/([a-z-])\/[0-9]{17,}/g, function(match, p) {
            return p === "channel" || p === "guild" ? match : `/${p}/:id`;
        });
    }

    /**
    * Make an API request
    * @arg {String} method Uppercase HTTP method
    * @arg {String} url URL of the endpoint
    * @arg {Boolean} auth Whether to add the Authorization header and token or not
    * @arg {Object} [body] Request payload
    * @arg {Object} [file] File object
    * @arg {String} file.file A readable stream or buffer
    * @arg {String} file.name What to name the file
    * @returns {Promise<Object>} Resolves with the returned JSON data
    */
    request(method, url, auth, body, file, _route) {
        var route = _route || this.routefy(url);

        return new Promise((resolve, reject) => {
            var attempts = 0;

            var actualCall = (cbs) => {
                var headers = {
                    "User-Agent": this.userAgent
                };
                var data;

                if(auth) {
                    headers.Authorization = this._client.token;
                }
                if(file && file.file) {
                    data = new MultipartData();
                    headers["Content-Type"] = "multipart/form-data; boundary=" + data.boundary;
                    data.attach("file", file.file, file.name);
                    if(body) {
                        Object.keys(body).forEach((key) => data.attach(key, body[key]));
                    }
                    data = data.finish();
                } else if(body) {
                    if(method === "GET" || (method === "PUT" && url.includes("/bans/"))) { // TODO remove PUT case when devs fix
                        var qs = "";
                        Object.keys(body).forEach(function(key) {
                            if(body[key] != undefined) {
                                 qs += `&${encodeURIComponent(key)}=${encodeURIComponent(body[key])}`;
                            }
                        });
                        url += "?" + qs.substring(1);
                    } else {
                        data = JSON.stringify(body);
                        headers["Content-Type"] = "application/json";
                    }
                }

                var req = HTTPS.request({
                    method: method,
                    host: "discordapp.com",
                    path: this.baseURL + url,
                    headers: headers
                });

                var reqError;

                req.once("abort", () => {
                    cbs.forEach((cb) => cb());
                    reqError = reqError || new Error("Request aborted by client");
                    reqError.req = req;
                    reject(reqError);
                });

                req.once("aborted", () => {
                    cbs.forEach((cb) => cb());
                    reqError = reqError || new Error("Request aborted by server");
                    reqError.req = req;
                    reject(reqError);
                });

                req.once("error", (err) => {
                    reqError = err;
                    req.abort();
                });

                var latency = Date.now();

                req.once("response", (resp) => {
                    var response = "";

                    resp.on("data", (chunk) => {
                        response += chunk;
                    });

                    resp.once("end", () => {
                        latency = Date.now() - Math.min((+resp.headers["x-ratelimit-reset"] * 1000) || Date.now(), latency);
                        this.latencyRef.total = this.latencyRef.total - this.latencyRef.raw.shift() + latency;
                        this.latencyRef.latency = ~~(this.latencyRef.total / this.latencyRef.raw.push(latency));

                        if(resp.headers["x-ratelimit-limit"]) {
                            this.ratelimits[route].limit = +resp.headers["x-ratelimit-limit"];
                        }

                        this.ratelimits[route].remaining = resp.headers["x-ratelimit-remaining"] === undefined ? 1 : +resp.headers["x-ratelimit-remaining"] || 0;

                        if(resp.headers["retry-after"]) {
                            if(resp.headers["x-ratelimit-global"]) {
                                this.globalBlock = true;
                                setTimeout(() => this.globalUnblock(), +resp.headers["retry-after"]);
                            } else {
                                this.ratelimits[route].reset = (+resp.headers["retry-after"]) + Date.now();
                            }
                        } else if(resp.headers["x-ratelimit-reset"]) {
                            this.ratelimits[route].reset = 1000 * resp.headers["x-ratelimit-reset"];
                        }

                        this._client.emit("debug", `${body && body.content} ${Date.now()} ${resp.statusCode}: ${latency}ms (${this.latencyRef.latency}ms avg) | ${this.ratelimits[route].remaining}/${this.ratelimits[route].limit} left | Reset ${this.ratelimits[route].reset} (${this.ratelimits[route].reset - Date.now()}ms left)`);

                        cbs.forEach((cb) => cb());

                        if(resp.statusCode >= 300) {
                            if(resp.statusCode === 429) {
                                this._client.emit("warn", `${resp.headers["x-ratelimit-global"] ? "Global" : "Unexpected"} 429 (╯°□°）╯︵ ┻━┻: ${response}`);
                                if(resp.headers["retry-after"]) {
                                    setTimeout(() => {
                                        this.request(method, url, auth, body, file, route).then(resolve).catch(reject);
                                    }, +resp.headers["retry-after"]);
                                    return;
                                } else {
                                    this.request(method, url, auth, body, file, route).then(resolve).catch(reject);
                                    return;
                                }
                            } else if(resp.statusCode === 502 && ++attempts < 4) {
                                this._client.emit("warn", "A wild 502 appeared! Thanks CloudFlare!");
                                setTimeout(() => {
                                    this.request(method, url, auth, body, file, route).then(resolve).catch(reject);
                                }, Math.floor(Math.random() * 1900 + 100));
                                return;
                            }
                            var err = new Error(`${resp.statusCode} ${resp.statusMessage}`);
                            err.resp = resp;
                            err.response = response;
                            err.req = req;
                            reject(err);
                            return;
                        }
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
                        resolve(response);
                    });
                });

                req.setTimeout(10000, function() {
                    reqError = new Error("Request timed out (>10000ms)");
                    req.abort();
                });

                req.end(data);
            };

            var waitFor = 0;
            var i = 0;
            var cbs = [];
            var done = (cb) => {
                if(cb) {
                    cbs.push(cb);
                }
                if(++i >= waitFor) {
                    actualCall(cbs);
                }
            };
            if(this.globalBlock && auth) {
                this.readyQueue.push(() => {
                    if(!this.ratelimits[route]) {
                        this.ratelimits[route] = new SequentialBucket(1, this.latencyRef);
                    }
                    ++waitFor;
                    this.ratelimits[route].queue(done);
                });
            } else {
                if(!this.ratelimits[route]) {
                    this.ratelimits[route] = new SequentialBucket(1, this.latencyRef);
                }
                ++waitFor;
                this.ratelimits[route].queue(done);
            }
        });
    }
}

module.exports = RequestHandler;
