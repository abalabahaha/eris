const util = require("util");
const Base = require("../structures/Base");

let EventEmitter;
try {
    EventEmitter = require("eventemitter3");
} catch(err) {
    EventEmitter = require("events").EventEmitter;
}

class BrowserWebSocketError extends Error {
    constructor(message, event) {
        super(message);
        this.event = event;
    }
}

/**
* Represents a browser's websocket usable by Eris
* @extends EventEmitter
* @prop {String} url The URL to connect to
*/
class BrowserWebSocket extends EventEmitter {
    constructor(url) {
        super();

        if(typeof window === "undefined") {
            throw new Error("BrowserWebSocket cannot be used outside of a browser environment");
        }

        this._ws = new window.WebSocket(url);
        this._ws.onopen = () => this.emit("open");
        this._ws.onmessage = this._onMessage.bind(this);
        this._ws.onerror = (event) => this.emit("error", new BrowserWebSocketError("Unknown error", event));
        this._ws.onclose = (event) => this.emit("close", event.code, event.reason);
    }

    get readyState() {
        return this._ws.readyState;
    }

    close(code, reason) {
        return this._ws.close(code, reason);
    }

    removeEventListener(type, listener) {
        return this.removeListener(type, listener);
    }

    send(data) {
        return this._ws.send(data);
    }

    terminate() {
        return this._ws.close();
    }

    async _onMessage(event) {
        if(event.data instanceof window.Blob) {
            this.emit("message", await event.data.arrayBuffer());
        } else {
            this.emit("message", event.data);
        }
    }

    [util.inspect.custom]() {
        return Base.prototype[util.inspect.custom].call(this);
    }
}

BrowserWebSocket.CONNECTING = 0;
BrowserWebSocket.OPEN = 1;
BrowserWebSocket.CLOSING = 2;
BrowserWebSocket.CLOSED = 3;

module.exports = BrowserWebSocket;
