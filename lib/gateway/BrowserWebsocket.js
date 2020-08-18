let EventEmitter;
try {
    EventEmitter = require("eventemitter3");
} catch(err) {
    EventEmitter = require("events").EventEmitter;
}

/**
* Represents a browser's websocket usable by Eris
* @extends EventEmitter
* @prop {string} url The URL to connect to
*/
class BrowserWebsocket extends EventEmitter {
    constructor(url) {
        super();

        if(typeof window === "undefined") {
            new Error("BrowserWebsocket cannot be used outside of a browser environment");
        }

        this._ws = new window.WebSocket(url);
        this._ws.onopen = () => this.emit("open");
        this._ws.onmessage = this._onMessage.bind(this);
        this._ws.onerror = (event) => this.emit("error", event);
        this._ws.onclose = (event) => this.emit("close", event.code, event.reason);
    }

    async _onMessage(event) {
        if(event.data instanceof window.Blob) {
            this.emit("message", await event.data.arrayBuffer());
        } else {
            this.emit("message", event.data);
        }
    }

    get readyState() {
        return this._ws.readyState;
    }

    send(data) {
        return this._ws.send(data);
    }

    close(code, reason) {
        return this._ws.close(code, reason);
    }

    terminate() {
        return this._ws.close();
    }

    removeEventListener(type, listener) {
        return this.removeListener(type, listener);
    }
}

BrowserWebsocket.CONNECTING = 0;
BrowserWebsocket.OPEN = 1;
BrowserWebsocket.CLOSING = 2;
BrowserWebsocket.CLOSED = 3;

module.exports = BrowserWebsocket;
