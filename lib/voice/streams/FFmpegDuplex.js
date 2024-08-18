"use strict";
const util = require("util");
const Base = require("../../structures/Base");
const ChildProcess = require("child_process");
const DuplexStream = require("stream").Duplex;
const PassThroughStream = require("stream").PassThrough;

const delegateEvents = {
    readable: "_reader",
    data: "_reader",
    end: "_reader",
    drain: "_writer",
    finish: "_writer"
};

class FFmpegDuplex extends DuplexStream {
    constructor(command, options = {}) {
        if(options.highWaterMark === undefined) {
            options.highWaterMark = 0;
        }
        super(options);

        this.command = command;
        this._reader = new PassThroughStream(options);
        this._writer = new PassThroughStream(options);

        this._onError = this.emit.bind(this, "error");

        this._reader.on("error", this._onError);
        this._writer.on("error", this._onError);

        this._readableState = this._reader._readableState;
        this._writableState = this._writer._writableState;

        ["on", "once", "removeListener", "removeListeners", "listeners"].forEach((method) => {
            const og = DuplexStream.prototype[method];

            this[method] = function(ev, fn) {
                const substream = delegateEvents[ev];
                if(substream) {
                    return this[substream][method](ev, fn);
                } else {
                    return og.call(this, ev, fn);
                }
            };
        });
    }

    destroy() {
    }

    end(chunk, enc, cb) {
        return this._writer.end(chunk, enc, cb);
    }

    kill() {
    }

    noop() {
    }

    pipe(dest, opts) {
        return this._reader.pipe(dest, opts);
    }

    read(size) {
        return this._reader.read(size);
    }

    setEncoding(enc) {
        return this._reader.setEncoding(enc);
    }

    spawn(args, options = {}) {
        let ex, exited, killed, ended;
        let stderr = [];

        const onStdoutEnd = () => {
            if(exited && !ended) {
                ended = true;
                this._reader.end();
                setImmediate(this.emit.bind(this, "close"));
            }
        };

        const onStderrData = (chunk) => {
            stderr.push(chunk);
        };

        const cleanup = () => {
            this._process =
            this._stderr =
            this._stdout =
            this._stdin =
            stderr =
            ex =
            killed = null;

            this.kill =
            this.destroy = this.noop;
        };

        const onExit = (code, signal) => {
            if(exited) {
                return;
            }
            exited = true;

            if(killed) {
                if(ex) {
                    this.emit("error", ex);
                }
                this.emit("close");
            } else if(code === 0 && signal == null) {
                // All is well
                onStdoutEnd();
            } else {
                // Everything else
                ex = new Error("Command failed: " + Buffer.concat(stderr).toString("utf8"));
                ex.killed = this._process.killed || killed;
                ex.code = code;
                ex.signal = signal;
                this.emit("error", ex);
                this.emit("close");
            }

            cleanup();
        };

        const onError = (err) => {
            ex = err;
            this._stdout.destroy();
            this._stderr.destroy();
            onExit();
        };

        const kill = () => {
            if(killed) {
                return;
            }
            this._stdout.destroy();
            this._stderr.destroy();

            killed = true;

            try {
                this._process.kill(options.killSignal || "SIGTERM");
                setTimeout(() => this._process && this._process.kill("SIGKILL"), 2000);
            } catch(e) {
                ex = e;
                onExit();
            }
        };

        this._process = ChildProcess.spawn(this.command, args, options);
        this._stdin = this._process.stdin;
        this._stdout = this._process.stdout;
        this._stderr = this._process.stderr;
        this._writer.pipe(this._stdin);
        this._stdout.pipe(this._reader, {
            end: false
        });
        this.kill = this.destroy = kill;
        
        // In some rare and consistent cases, streams will cut out completely and they will stop.
        // It is found that setting highWaterMark to an insanely high number will fix this.
        this._stdout._readableState.highWaterMark = 2147483647

        this._stderr.on("data", onStderrData);

        // In some cases ECONNRESET can be emitted by stdin because the process is not interested in any
        // more data but the _writer is still piping. Forget about errors emitted on stdin and stdout
        this._stdin.on("error", this.noop);
        this._stdout.on("error", this.noop);

        this._stdout.on("end", onStdoutEnd);

        this._process.once("close", onExit);
        this._process.once("error", onError);

        return this;
    }

    unpipe(dest) {
        return this._reader.unpipe(dest) || this.kill();
    }

    write(chunk, enc, cb) {
        return this._writer.write(chunk, enc, cb);
    }

    [util.inspect.custom]() {
        return Base.prototype[util.inspect.custom].call(this);
    }
}

FFmpegDuplex.prototype.addListener = FFmpegDuplex.prototype.on;

FFmpegDuplex.spawn = function(connection, args, options) {
    return new FFmpegDuplex(connection, options).spawn(args, options);
};

module.exports = FFmpegDuplex;
