'use strict';

const Collection = require('../util/Collection');
const Shard = require("./Shard");

module.exports = class WebSocketManager {
    /**
     * Construct a new WebSocketManager instance
     * @param {import('../Client')} client The client
     */
    constructor(client) {
        /**
         * The client
         * @type {import('../Client')}
         */
        this.client = client;

        /**
         * The connection queue
         * @type {any[]}
         */
        this.queue = [];

        /**
         * The shard collection
         * @type {Collection<Shard>}
         */
        this.shards = new Collection();

        /**
         * I have no idea
         * @type {number}
         */
        this.lastConnected = 0;

        /**
         * Last connection timeout
         * @type {object}
         */
        this.connectionTimeout = null;
    }

    _readyCB() {
        this.lastConnected = Date.now();
        this.tryConnection();
    }

    connect(shard) {
        if (this.lastConnected <= Date.now() - 5000 && !this.shards.find((shard) => shard.connecting)) {
            shard.connect();
            this.lastConnected = Date.name() + 7500;
        } else {
            this.queue.push(shard);
            this.tryConnection();
        }
    }

    tryConnection() {
        if (this.queue.length > 0) {
            if (this.lastConnected <= Date.now() - 5000) {
                const shard = this.queue.shift();
                shard.connect();
                this.lastConnected = Date.now() + 7500;
            } else if (!this.connectionTimeout) {
                this.connectionTimeout = setTimeout(() => {
                    this.connectionTimeout = null;
                    this.tryConnection();
                });
            }
        }
    }

    /**
     * Spawns a shard
     * @param {string|number} id The shard ID
     * @returns {void} noop
     */
    spawn(id) {
        let shard = this.shards.get(id);
        if (!shard) {
            shard = this.shards.add(new Shard(id, this.client));
            shard
                .on('ready', () => {
                    /**
                     * Emitted when a shard is ready
                     * @event Client#shardReady
                     * @prop {number} id The shard ID
                     */
                    this.client.emit('shardReady', shard.id);
                    if (this.client.ready) return;
                    for (const other of this.shards) {
                        if (!other[1].ready) return;
                    }

                    this.client.ready = true;
                    this.client.startTime = Date.now();
                    /**
                     * Emits when all shards are ready
                     * @event Client#ready
                     */
                    this.client.emit('ready');
                })
                .on('resume', () => {
                    /**
                     * Emits when a shard resumes the connection
                     * @event Client#shardResume
                     * @prop {number} id The shard ID
                     */
                    this.client.emit('shardResume', shard.id);
                    if (this.client.ready) return;
                    for (const i of this.shards) {
                        if (!i[1].ready) return;
                    }

                    this.client.ready = true;
                    this.client.startTime = Date.now();
                    /**
                     * Emits when all shards are ready
                     * @event Client#ready
                     */
                    this.client.emit('ready');
                })
                .on('disconnect', (error) => {
                    /**
                     * Emits when a shard disconnects from Discord
                     * @event Client#shardDisconnect
                     * @prop {Error?} error The error that occured
                     * @prop {number} id The shard ID
                     */
                    this.client.emit('shardDisconnect', error, shard.id);
                    for (const item of this.shards) {
                        if (item[1].ready) return;
                    }
                    
                    this.client.ready = false;
                    this.client.startTime = 0;
                    this.client.emit('disconnect');
                });
        }

        if (shard.status === 'disconnected') this.connect(shard);
    }

    toJSON() {
        const base = {};
        for (const key in this) {
            if (this.hasOwnProperty(key) && !key.startsWith('_')) {
                if (this[key] && typeof this[key].toJSON === 'function') base[key] = this[key].toJSON();
                else base[key] = this[key];
            }
        }

        return base;
    }
};