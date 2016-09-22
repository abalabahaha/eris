"use strict";

const Bucket = require("../util/Bucket");
const Endpoints = require("../Constants").Endpoints;
const HTTPS = require("https");
const MultipartData = require("../util/MultipartData");
const SequentialBucket = require("../util/SequentialBucket");

/**
* Handles APi requests
*/
class RequestHandler {
    /**
    * Construct a RequestHandler
    * @returns {RequestHandler} A RequestHandler object
    */
    constructor(client, forceQueueing) {
        this.client = client;
        this.baseURL = Endpoints.BASE_URL(client.options.gatewayVersion);
        this.userAgent = `DiscordBot (https://github.com/abalabahaha/eris, ${require("../../package.json").version})`;
        this.ratelimits = {
            global: new Bucket(50, 1000, 20)
        };

        this.queueing = !!forceQueueing;
        if(this.client.bot === undefined && forceQueueing === undefined) {
            this.queueing = true;
            this.readyQueue = [];
            this.client.once("shardPreReady", () => {
                while(this.readyQueue.length > 0) {
                    this.readyQueue.shift()();
                }
                this.queueing = false;
                while(this.readyQueue.length > 0) {
                    this.readyQueue.shift()();
                }
            });
        }
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
    request(method, url, auth, body, file) {
        var resolve, reject;
        var promise = new Promise(function(res, rej) {
            resolve = res;
            reject = rej;
        });
        var attempts = 0;

        var actualCall = (cbs) => {
            var headers = {
                "User-Agent": this.userAgent
            };
            var data;

            if(auth) {
                headers.Authorization = this.client.token;
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

            req.once("response", (resp) => {
                var response = "";

                resp.on("data", (chunk) => {
                    response += chunk;
                });

                resp.once("end", () => {
                    if(resp.headers["x-ratelimit-limit"]) {
                        if(!this.ratelimits[url]) {
                            this.ratelimits[url] = new SequentialBucket(+resp.headers["x-ratelimit-limit"]);
                        } else {
                            this.ratelimits[url].limit = +resp.headers["x-ratelimit-limit"];
                        }

                        if(resp.headers["retry-after"]) {
                            this.ratelimits[url].reset = (+resp.headers["retry-after"]) + Date.now();
                        } else {
                            this.ratelimits[url].reset = 1000 * resp.headers["x-ratelimit-reset"];
                        }

                        this.ratelimits[url].remaining = +resp.headers["x-ratelimit-remaining"] || 0;
                    }

                    cbs.forEach((cb) => cb());

                    if(resp.statusCode >= 300) {
                        if(resp.statusCode === 429) {
                            if(!this.client.bot) {
                                this.client.emit("warn", "Unexpected 429 (╯°□°）╯︵ ┻━┻ " + response);
                            }
                            if(resp.headers["retry-after"]) {
                                setTimeout(() => {
                                    this.request(method, url, auth, body, file).then(resolve).catch(reject);
                                }, +resp.headers["retry-after"]);
                                return;
                            } else {
                                this.request(method, url, auth, body, file).then(resolve).catch(reject);
                                return;
                            }
                        } else if(resp.statusCode === 502 && ++attempts < 4) {
                            this.client.emit("warn", "A wild 502 appeared! Thanks CloudFlare!");
                            setTimeout(() => {
                                this.request(method, url, auth, body, file).then(resolve).catch(reject);
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
                req.abort();
            });

            req.end(data);
        };

        var waitFor = 1;
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
        if(this.queueing && auth) {
            this.readyQueue.push(() => {
                if(this.ratelimits[url]) {
                    ++waitFor;
                    this.ratelimits[url].queue(done);
                }
                this.ratelimits.global.queue(done);
            });
        } else {
            if(this.ratelimits[url]) {
                ++waitFor;
                this.ratelimits[url].queue(done);
            }
            this.ratelimits.global.queue(done);
        }

        return promise;
    }
}

module.exports = RequestHandler;
