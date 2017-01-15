"use strict";

const Bucket = require("../util/Bucket");
const Constants = require("../Constants");
const OPCodes = Constants.GatewayOPCodes;
const WebSocket = typeof window !== "undefined" ? window.WebSocket : require("ws");
const Zlib = require("zlib");
const ShardEvents = require('./ShardEvents');

var EventEmitter;
try {
    EventEmitter = require("eventemitter3");
} catch(err) {
    EventEmitter = require("events").EventEmitter;
}
var Pako;
try {
    Pako = require("pako");
} catch(err) { // eslint-disable no-empty
}
var Inflator = typeof window !== "undefined" && Pako ? Pako.inflate : Zlib.inflateSync;

/**
* Represents a shard
* @extends EventEmitter
* @prop {Number} id The ID of the shard
* @prop {Boolean} connecting Whether the shard is connecting
* @prop {Boolean} ready Whether the shard is ready
* @prop {Number} guildCount The number of guilds this shard should be handling
* @prop {Array<String>?} discordServerTrace Debug trace of Discord servers
* @prop {String} status The status of the shard. "disconnected"/"connecting"/"handshaking"/"connected"
* @prop {Number} lastHeartbeatReceived Last time Discord acknowledged a heartbeat, null if shard has not sent heartbeat yet
* @prop {Number} lastHeartbeatSent Last time shard sent a heartbeat, null if shard has not sent heartbeat yet
* @prop {Number} latency Current latency between shard and Discord
*/
class Shard extends EventEmitter {
    constructor(id, client) {
        super();

        this.id = id;
        this.client = client;

        this.hardReset();
    }

    get latency() {
        return this.lastHeartbeatSent && this.lastHeartbeatReceived ? this.lastHeartbeatReceived - this.lastHeartbeatSent : Infinity;
    }

    /**
    * Tells the shard to connect
    */
    connect() {
        if(this.ws && this.ws.readyState != WebSocket.CLOSED) {
            this.client.emit("error", new Error("Existing connection detected"), this.id);
            return;
        }
        ++this.connectAttempts;
        this.connecting = true;
        return this.initializeWS();
    }

    /**
    * Disconnects the shard
    * @arg {Object?} [options] Shard disconnect options
    * @arg {String | Boolean} [options.reconnect] false means destroy everything, true means you want to reconnect in the future, "auto" will autoreconnect
    */
    disconnect(options, error) {
        if(!this.ws) {
            return;
        }
        options = options || {};
        if(this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if(this.ws) {
            this.ws.onclose = undefined;
            try {
                if(options.reconnect && this.sessionID) {
                    this.ws.terminate();
                } else {
                    this.ws.close();
                }
            } catch(err) {
                /**
                * Fired when the shard encounters an error
                * @event Client#error
                * @prop {Error} err The error
                * @prop {Number} id The ID of the shard
                */
                this.client.emit("error", err, this.id);
            }
            /**
            * Fired when the shard disconnects
            * @event Shard#disconnect
            * @prop {Error?} err The error, if any
            */
            this.emit("disconnect", error || null);
            this.ws = null;
        }
        this.status = "disconnected";
        this.reset();
        if(options.reconnect === "auto" && this.client.options.autoreconnect) {
            /**
            * Fired when stuff happens and gives more info
            * @event Client#debug
            * @prop {String} message The debug message
            * @prop {Number} id The ID of the shard
            */
            this.client.emit("debug", `Queueing reconnect in ${this.reconnectInterval}ms | Attempt ${this.connectAttempts}`, this.id);
            setTimeout(() => {
                this.client.shards.connect(this);
            }, this.reconnectInterval);
            this.reconnectInterval = Math.min(Math.round(this.reconnectInterval * (Math.random() * 2 + 1)), 30000);
        } else if(!options.reconnect) {
            this.hardReset();
        }
    }

    reset() {
        this.connecting = false;
        this.ready = false;
        this.preReady = false;
        this.getAllUsersCount = {};
        this.getAllUsersQueue = [];
        this.getAllUsersLength = 1;
        this.guildSyncQueue = [];
        this.guildSyncQueueLength = 1;
        this.unsyncedGuilds = 0;
        this.lastHeartbeatAck = true;
        this.lastHeartbeatReceived = null;
        this.lastHeartbeatSent = null;
        this.status = "disconnected";
    }

    hardReset() {
        this.reset();
        this.seq = 0;
        this.guildCount = 0;
        this.sessionID = null;
        this.reconnectInterval = 1000;
        this.connectAttempts = 0;
        this.ws = null;
        this.heartbeatInterval = null;
        this.guildCreateTimeout = null;
        this.idleSince = null;
        this.globalBucket = new Bucket(120, 60000, 0);
        this.presenceUpdateBucket = new Bucket(5, 60000, 0);
        this.presence = JSON.parse(JSON.stringify(this.client.presence));
    }

    resume() {
        this.sendWS(OPCodes.RESUME, {
            token: this.client.token,
            session_id: this.sessionID,
            seq: this.seq
        }, true);
    }

    identify() {
        var identify = {
            token: this.client.token,
            v: Constants.GATEWAY_VERSION,
            compress: !!this.client.options.compress,
            large_threshold: this.client.options.largeThreshold,
            properties: {
                "os": process.platform,
                "browser": "Eris",
                "device": "Eris"
            }
        };
        if(this.client.options.maxShards > 1) {
            identify.shard = [this.id, this.client.options.maxShards];
        }
        if(this.presence.status) {
            identify.presence = this.presence;
        }
        this.sendWS(OPCodes.IDENTIFY, identify, true);
    }

    wsEvent(packet) {
        // var startTime = Date.now();
        // var debugStr = "";
        let eventHandler = ShardEvents[packet.t];
        if(!eventHandler) {
            this.client.emit("unknown", packet, this.id);
            return;
        }
        eventHandler(this, packet);
        // this.client.emit("debug", packet.t + ": " + (Date.now() - startTime) + "ms" + debugStr, this.id);
    }

    syncGuild(guildID) {
        if(this.guildSyncQueueLength + 3 + guildID.length > 4081) { // 4096 - "{\"op\":12,\"d\":[]}".length + 1 for lazy comma offset
            this.requestGuildSync(this.guildSyncQueue);
            this.guildSyncQueue = [guildID];
            this.guildSyncQueueLength = 1 + guildID.length + 3;
        } else if(this.ready) {
            this.requestGuildSync([guildID]);
        } else {
            this.guildSyncQueue.push(guildID);
            this.guildSyncQueueLength += guildID.length + 3;
        }
    }

    requestGuildSync(guildID) {
        this.sendWS(OPCodes.SYNC_GUILD, guildID);
    }

    createGuild(_guild) {
        this.client.guildShardMap[_guild.id] = this.id;
        var guild = this.client.guilds.add(_guild, this.client, true);
        if(this.client.bot === false) {
            ++this.unsyncedGuilds;
            this.syncGuild(guild.id);
        }
        if(this.client.options.getAllUsers && guild.members.size < guild.memberCount) {
            guild.fetchAllMembers();
        }
        return guild;
    }

    restartGuildCreateTimeout() {
        if(this.guildCreateTimeout) {
            clearTimeout(this.guildCreateTimeout);
            this.guildCreateTimeout = null;
        }
        if(!this.ready) {
            if(this.client.unavailableGuilds.size === 0 && this.unsyncedGuilds === 0) {
                return this.checkReady();
            }
            this.guildCreateTimeout = setTimeout(() => {
                this.checkReady();
            }, this.client.options.guildCreateTimeout);
        }
    }

    getGuildMembers(guildID, chunkCount) {
        this.getAllUsersCount[guildID] = chunkCount;
        if(this.getAllUsersLength + 3 + guildID.length > 4048) { // 4096 - "{\"op\":8,\"d\":{\"guild_id\":[],\"query\":\"\",\"limit\":0}}".length + 1 for lazy comma offset
            this.requestGuildMembers(this.getAllUsersQueue);
            this.getAllUsersQueue = [guildID];
            this.getAllUsersLength = 1 + guildID.length + 3;
        } else if(this.ready) {
            this.requestGuildMembers([guildID]);
        } else {
            this.getAllUsersQueue.push(guildID);
            this.getAllUsersLength += guildID.length + 3;
        }
    }

    requestGuildMembers(guildID, query, limit) {
        this.sendWS(OPCodes.GET_GUILD_MEMBERS, {
            guild_id: guildID,
            query: query || "",
            limit: limit || 0
        });
    }

    checkReady() {
        if(!this.ready) {
            if(this.guildSyncQueue.length > 0) {
                this.requestGuildSync(this.guildSyncQueue);
                this.guildSyncQueue = [];
                this.guildSyncQueueLength = 1;
                return;
            }
            if(this.unsyncedGuilds > 0) {
                return;
            }
            if(this.getAllUsersQueue.length > 0) {
                this.requestGuildMembers(this.getAllUsersQueue);
                this.getAllUsersQueue = [];
                this.getAllUsersLength = 1;
                return;
            }
            if(Object.keys(this.getAllUsersCount).length === 0) {
                this.ready = true;
                /**
                * Fired when the shard turns ready
                * @event Shard#ready
                */
                this.emit("ready");
            }
        }
    }

    initializeWS() {
        this.status = "connecting";
        this.ws = new WebSocket(this.client.gatewayURL);
        this.ws.onopen = () => {
            if(!this.client.token) {
                return this.disconnect(null, new Error("Token not specified"));
            }
            this.status = "handshaking";
            /**
            * Fired when the shard establishes a connection
            * @event Client#connect
            * @prop {Number} id The ID of the shard
            */
            this.client.emit("connect", this.id);
            this.lastHeartbeatAck = true;
        };
        this.ws.onmessage = (m) => {
            try {
                m = m.data;
                if(typeof m !== "string") {
                    m = Inflator(m).toString();
                }

                var packet = JSON.parse(m);

                if(this.client.listeners("rawWS").length > 0) {
                    /**
                    * Fired when the shard receives a websocket packet
                    * @event Client#rawWS
                    * @prop {Object} packet The packet
                    * @prop {Number} id The ID of the shard
                    */
                    this.client.emit("rawWS", packet, this.id);
                }

                if(packet.s > this.seq + 1 && this.ws) {
                    /**
                    * Fired to warn of something weird but non-breaking happening
                    * @event Client#warn
                    * @prop {String} message The warning message
                    * @prop {Number} id The ID of the shard
                    */
                    this.client.emit("warn", "Non-consecutive sequence, requesting resume", this.id);
                    this.resume();
                } else if(packet.s) {
                    this.seq = packet.s;
                }

                switch(packet.op) {
                    case OPCodes.EVENT: {
                        if(!this.client.options.disableEvents[packet.t]) {
                            this.wsEvent(packet);
                        }
                        break;
                    }
                    case OPCodes.HEARTBEAT: {
                        this.heartbeat();
                        break;
                    }
                    case OPCodes.INVALID_SESSION: {
                        this.seq = 0;
                        this.sessionID = null;
                        this.client.emit("warn", "Invalid session, reidentifying!", this.id);
                        this.identify();
                        break;
                    }
                    case OPCodes.RECONNECT: {
                        this.disconnect({
                            reconnect: "auto"
                        });
                        break;
                    }
                    case OPCodes.HELLO: {
                        if(packet.d.heartbeat_interval > 0) {
                            if(this.heartbeatInterval) {
                                clearInterval(this.heartbeatInterval);
                            }
                            this.heartbeatInterval = setInterval(() => this.heartbeat(true), packet.d.heartbeat_interval);
                        }

                        this.discordServerTrace = packet.d._trace;
                        this.connecting = false;

                        if(this.sessionID) {
                            this.resume();
                        } else {
                            this.identify();
                        }
                        this.heartbeat();
                        break; /* eslint-enable no-unreachable */
                    }
                    case OPCodes.HEARTBEAT_ACK: {
                        this.lastHeartbeatAck = true;
                        this.lastHeartbeatReceived = new Date().getTime();
                        break;
                    }
                    default: {
                        this.client.emit("unknown", packet, this.id);
                        break;
                    }
                }
            } catch(err) {
                this.client.emit("error", err, this.id);
            }
        };
        this.ws.onerror = (event) => {
            this.client.emit("error", event, this.id);
        };
        this.ws.onclose = (event) => {
            var err = event.code === 1000 ? null : new Error(event.code + ": " + event.reason);
            if(event.code) {
                this.client.emit("warn", `${event.code === 1000 ? "Clean" : "Unclean"} WS close: ${event.code}: ${event.reason}`, this.id);
                if(event.code === 4001) {
                    err = new Error("Gateway received invalid OP code");
                } else if(event.code === 4002) {
                    err = new Error("Gateway received invalid message");
                } else if(event.code === 4003) {
                    err = new Error("Not authenticated");
                } else if(event.code === 4004) {
                    err = new Error("Authentication failed");
                } else if(event.code === 4005) {
                    err = new Error("Already authenticated");
                } else if(event.code === 4006 || event.code === 4009) {
                    this.sessionID = null;
                    err = new Error("Invalid session");
                } else if(event.code === 4007) {
                    err = new Error("Invalid sequence number: " + this.seq);
                    this.seq = 0;
                } else if(event.code === 4008) {
                    err = new Error("Gateway connection was ratelimited");
                } else if(event.code === 4010) {
                    err = new Error("Invalid shard key");
                } else if(event.code === 1006) {
                    err = new Error("Connection reset by peer");
                } else if(!event.wasClean && event.reason) {
                    err = new Error(event.code + ": " + event.reason);
                }
            } else {
                this.client.emit("warn", event, this.id);
            }
            this.disconnect({
                reconnect: "auto"
            }, err);
        };

        setTimeout(() => {
            if(this.connecting) {
                this.disconnect({
                    reconnect: "auto"
                }, new Error("Connection timeout"));
            }
        }, this.client.options.connectionTimeout);
    }

    heartbeat(normal) {
        if(normal && !this.lastHeartbeatAck) {
            return this.disconnect({
                reconnect: "auto"
            }, new Error("Server didn't acknowledge previous heartbeat, possible lost connection"));
        }
        this.lastHeartbeatAck = false;
        this.lastHeartbeatSent = new Date().getTime();
        this.sendWS(OPCodes.HEARTBEAT, this.seq, true);
    }

    sendWS(op, data) {
        if(this.ws && this.ws.readyState === WebSocket.OPEN) {
            var i = 0;
            var waitFor = 1;
            var func = () => {
                if(++i >= waitFor && this.ws && this.ws.readyState === WebSocket.OPEN) {
                    data = JSON.stringify({op: op, d: data});
                    this.ws.send(data);
                    this.client.emit("debug", data, this.id);
                }
            };
            if(op === OPCodes.STATUS_UPDATE) {
                ++waitFor;
                this.presenceUpdateBucket.queue(func);
            }
            this.globalBucket.queue(func);
        }
    }

    /**
    * Updates the bot's status on all guilds the shard is in
    * @arg {String} [status] Sets the bot's status, either "online", "idle", "dnd", or "invisible"
    * @arg {Object} [game] Sets the bot's active game, null to clear
    * @arg {String} game.name Sets the name of the bot's active game
    * @arg {Number} [game.type] The type of game. 0 is default, 1 is streaming (Twitch only)
    * @arg {String} [game.url] Sets the url of the shard's active game
    */
    editStatus(status, game) {
        if(game === undefined && typeof status === "object") {
            game = status;
            status = undefined;
        }
        if(status) {
            this.presence.status = status;
        }
        if(game !== undefined) {
            this.presence.game = game;
        }

        this.sendWS(OPCodes.STATUS_UPDATE, {
            afk: this.presence.status === "idle", // TODO: what's this AFK field?
            game: this.presence.game,
            since: this.presence.status === "idle" ? Date.now() : 0,
            status: this.presence.status
        });

        this.client.guilds.forEach((guild) => {
            if(guild.shard.id === this.id) {
                guild.members.get(this.client.user.id).update(this.presence);
            }
        });
    }
}

module.exports = Shard;