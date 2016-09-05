"use strict";

const ChildProcess = require("child_process");

var EventEmitter;
try {
    EventEmitter = require("eventemitter3");
} catch(err) {
    EventEmitter = require("events").EventEmitter;
}

class FFmpegBaseTransformer extends EventEmitter {
    constructor(connection) {
        super();

        this._connection = connection;
        this.stream = null;

        this.baseArgs = [
            "-analyzeduration", "0",
            "-vn",
            "-loglevel", "warning" // "0"
        ];
        this.inputArgs = [];
        this.outputArgs = [];

        this.pickCommand();
    }

    attach(source) {
        if(this.stream) {
            this.unattach();
        }

        this._encoder = ChildProcess.spawn(this.converterCommand, this.baseArgs.concat(this.inputArgs, "-i", (typeof source === "string" ? source : "-"), this.outputArgs, "-"), {
            stdio: ["pipe", "pipe", "pipe"]
        });

        this._encoder.stderr.on("data", (data) => {
            console.error(this.constructor.name);
            console.error(data.toString());
        });

        var killEncoder = (e) => {
            if(typeof source.unpipe === "function") {
                source.unpipe(this._encoder.stdin);
            }
            if(typeof source.destroy === "function") {
                source.destroy();
            }

            var after = () => {
                if((e instanceof Error) && this.playing) {
                    this.emit("error", e);
                }
            };

            if(!this._encoder.killed) {
                this._encoder.once("exit", after);
                this._encoder.kill();
            } else {
                after();
            }
        };

        if(typeof source !== "string") {
            var pipe = source.pipe(this._encoder.stdin, {
                end: false
            });

            source.once("error", killEncoder);

            pipe.once("unpipe", killEncoder);
            pipe.once("end", killEncoder);
        }

        this._encoder.once("exit", killEncoder);
        this._encoder.stdin.once("error", killEncoder);
        this._encoder.stdout.once("error", killEncoder);

        this.stream = this._encoder.stdout;
    }

    unattach() {
        if(this.stream) {
            this.stream.unpipe();
        }
        this._encoder.kill();
        this.stream = null;
    }

    pipe(stream) {
        return this.stream.pipe(stream);
    }

    unpipe(stream) {
        return this.stream.unpipe(stream);
    }

    pickCommand() {
        for(var command of ["./ffmpeg", "./avconv", "ffmpeg", "avconv"]) {
            if(!ChildProcess.spawnSync(command, ["-h"]).error) {
                this.converterCommand = command;
                return;
            }
        }
        this.emit("error", new Error("Neither ffmpeg nor avconv was found. Make sure you install either one, and check that it is in your PATH"));
    }
}

module.exports = FFmpegBaseTransformer;
