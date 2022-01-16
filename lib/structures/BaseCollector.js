"use strict";

const Collection = require("../util/Collection");
const EventEmitter = require('events');
const Client = require("../Client");

/**
 * Filter to be applied to the collector.
 * @typedef {Function} CollectorFilter
 * @param {...*} args Any arguments received by the listener
 * @param {Collection} collection The items collected by this collector
 * @returns {boolean|Promise<boolean>}
 */

/**
 * @typedef {Object} CollectorOptions
 * @property {number} max
 * @property {number} timeIdle
 * @property {number} timeLimit
 * @property {CollectorFilter} filter
 */
 
class BaseCollector extends EventEmitter {

    constructor(client, options = {}) {
        super();
        /**
         * @type {Client} 
         * 
        */
        /**
         * @type {CollectorOptions} 
         * 
        */
        this.options = options;
        this.client = client;
     
     /**
     * The items collected by this collector
     * @type {Collection}
     */
    this.collected = new Collection();

      
        if (typeof this.options.filter != 'function')
            this.options.filter = () => true;

        /**@type {boolean} */
        this.running = true;
        this.incrementMaxListeners();
        this.usages = 0;
        if (options.timeLimit) this._timeTimeout = setTimeout(() => {
            this.stop('time');
        }, options.timeLimit);
        if (options.timeIdle) this._idleTimeout = setTimeout(() => {
            this.stop('idle');
        }, options.timeIdle);

        const handleMessageDelete = this.handleMessageDelete.bind(this);
        const handleMessageDeleteBulk = this.handleMessageDeleteBulk.bind(this);
        const handleChannelDelete = this.handleChannelDelete.bind(this);
        const handleGuildDelete = this.handleGuildDelete.bind(this);

        this.incrementMaxListeners();
        this.client.on('messageDelete', handleMessageDelete);
        this.client.on('messageDeleteBulk', handleMessageDeleteBulk);
        this.client.on('channelDelete', handleChannelDelete);
        this.client.on('guildDelete', handleGuildDelete);

        this.once('end', () => {
            this.client.removeListener('messageDelete', handleMessageDelete);
            this.client.removeListener('messageDeleteBulk', handleMessageDeleteBulk);
            this.client.removeListener('channelDelete', handleChannelDelete);
            this.client.removeListener('guildDelete', handleGuildDelete);
            this.decrementMaxListeners();
        });

    }

    handleMessageDelete(message) {

        if (message.messageId == this.messageId)
            this.stop('messageDelete');

    }

    handleMessageDeleteBulk(messages) {

        if (messages.some(item => item && item.id == this.messageId))
            this.stop('messageDelete');

    }

    handleGuildDelete(guild) {

        if (guild.id == this.guildId)
            this.stop('guildDelete');

    }

    handleChannelDelete(channel) {

        if (channel.id == this.messageId)
            this.stop('channelDelete');

    }

    handleThreadDelete(thread) {

        if (thread.id == this.channelId)
            this.stop('threadDelete');

    }

    stop(reason) {
        if (!this.running) return;
        this.emit('end', reason);
        this.running = false;
    }

    incrementMaxListeners() {
        const maxListeners = this.client.getMaxListeners();
        if (maxListeners !== 0) {
            this.client.setMaxListeners(maxListeners + 1);
        }
    }

    decrementMaxListeners() {
        const maxListeners = this.client.getMaxListeners();
        if (maxListeners !== 0) {
            this.client.setMaxListeners(maxListeners - 1);
        }
    }

    get channelId() {
        return '';
    }

    get messageId() {
        return '';
    }

    get guildId() {
        return '';
    }


}

module.exports = BaseCollector;