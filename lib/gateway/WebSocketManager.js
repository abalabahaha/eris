'use strict';

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
    }
};