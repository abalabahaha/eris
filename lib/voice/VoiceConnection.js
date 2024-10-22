"use strict";

const util = require("util");
const Base = require("../structures/Base");
const ChildProcess = require("child_process");
const { VOICE_VERSION, VoiceOPCodes, GatewayOPCodes } = require("../Constants");
const Dgram = require("dgram");
const Net = require("net");
const Piper = require("./Piper");
const VoiceDataStream = require("./VoiceDataStream");
const { createOpus } = require("../util/Opus");

const WebSocket = typeof window !== "undefined" ? require("../util/BrowserWebSocket") : require("ws");

let EventEmitter;
try {
  EventEmitter = require("eventemitter3");
} catch {
  EventEmitter = require("events").EventEmitter;
}

let StableLib = null;
let Sodium = null;
let nodeCrypto = null;
let aes256Available = false;

// Sorted by preference, will choose the first available mode
const SUPPORTED_ENCRYPTION_MODES = ["aead_aes256_gcm_rtpsize", "aead_xchacha20_poly1305_rtpsize"];
const MAX_FRAME_SIZE = 1276 * 3;
const SILENCE_FRAME = Buffer.from([0xF8, 0xFF, 0xFE]);

const converterCommand = {
  cmd: null,
  libopus: false,
};

converterCommand.pickCommand = function pickCommand() {
  let tenative;
  for (const command of ["./ffmpeg", "./avconv", "ffmpeg", "avconv"]) {
    const res = ChildProcess.spawnSync(command, ["-encoders"]);
    if (!res.error) {
      if (!res.stdout.toString().includes("libopus")) {
        tenative = command;
        continue;
      }
      converterCommand.cmd = command;
      converterCommand.libopus = true;
      return;
    }
  }
  if (tenative) {
    converterCommand.cmd = tenative;
    return;
  }
};

/**
 * Represents a voice connection
 * @extends EventEmitter
 * @prop {String} channelID The ID of the voice connection's current channel
 * @prop {Boolean} connecting Whether the voice connection is connecting
 * @prop {Object?} current The state of the currently playing stream
 * @prop {Object} current.options The custom options for the current stream
 * @prop {Array<String>?} current.options.encoderArgs Additional encoder parameters to pass to ffmpeg/avconv (after -i)
 * @prop {String?} current.options.format The format of the resource. If null, FFmpeg will attempt to guess and play the format. Available options: "dca", "ogg", "webm", "pcm", "opusPackets", null
 * @prop {Number?} current.options.frameDuration The resource opus frame duration (required for DCA/Ogg)
 * @prop {Number?} current.options.frameSize The resource opus frame size
 * @prop {Boolean?} current.options.inlineVolume Whether to enable on-the-fly volume changing. Note that enabling this leads to increased CPU usage
 * @prop {Array<String>?} current.options.inputArgs Additional input parameters to pass to ffmpeg/avconv (before -i)
 * @prop {Number?} current.options.sampleRate The resource audio sampling rate
 * @prop {Number?} current.options.voiceDataTimeout Timeout when waiting for voice data (-1 for no timeout)
 * @prop {Number} current.pausedTime How long the current stream has been paused for, in milliseconds
 * @prop {Number} current.pausedTimestamp The timestamp of the most recent pause
 * @prop {Number} current.playTime How long the current stream has been playing for, in milliseconds
 * @prop {Number} current.startTime The timestamp of the start of the current stream
 * @prop {String} id The ID of the voice connection (guild ID)
 * @prop {Boolean} paused Whether the voice connection is paused
 * @prop {Boolean} playing Whether the voice connection is playing something
 * @prop {Boolean} ready Whether the voice connection is ready
 * @prop {Boolean} resuming Whether the voice connection is waiting for resuming
 * @prop {Number} volume The current volume level of the connection
 */
class VoiceConnection extends EventEmitter {
  constructor(id, options = {}) {
    super();

    if (typeof window !== "undefined") {
      throw new Error("Voice is not supported in browsers at this time");
    }

    if (!Sodium && !StableLib) {
      try {
        Sodium = require("sodium-native");
      } catch {
        try {
          StableLib = require("@stablelib/xchacha20poly1305");
        } catch {
          throw new Error("Error loading libsodium/stablelib, voice not available");
        }
      }
    }

    if (!nodeCrypto) {
      try {
        nodeCrypto = require("node:crypto");
        aes256Available = nodeCrypto.getCiphers().includes("aes-256-gcm");
      } catch {
        aes256Available = false;
      }
    }

    this.id = id;
    this.samplingRate = 48000;
    this.channels = 2;
    this.frameDuration = 20;
    this.frameSize = this.samplingRate * this.frameDuration / 1000;
    this.pcmSize = this.frameSize * this.channels * 2;
    this.bitrate = 64000;
    this.shared = !!options.shared;
    this.shard = options.shard || {};
    this.opusOnly = !!options.opusOnly;

    if (!this.opusOnly && !this.shared) {
      this.opus = {};
    }

    this.channelID = null;
    this.paused = true;
    this.speaking = false;
    this.sequence = 0;
    this.timestamp = 0;
    this.ssrcUserMap = {};
    this.connectionTimeout = null;
    this.connecting = false;
    this.reconnecting = false;
    this.resuming = false;
    this.ready = false;
    this.wsSequence = -1;

    this.sendBuffer = Buffer.allocUnsafe(16 + 32 + MAX_FRAME_SIZE);
    this.sendHeader = Buffer.alloc(12);
    this.sendHeader[0] = 0x80;
    this.sendHeader[1] = 0x78;

    this._nonce = 0;

    if (!options.shared) {
      if (!converterCommand.cmd) {
        converterCommand.pickCommand();
      }

      this.piper = new Piper(converterCommand.cmd, () => createOpus(this.samplingRate, this.channels, this.bitrate));
      /**
       * Fired when the voice connection encounters an error. This event should be handled by users
       * @event VoiceConnection#error
       * @prop {Error} err The error object
       */
      this.piper.on("error", (e) => this.emit("error", e));
      if (!converterCommand.libopus) {
        this.piper.libopus = false;
      }
    }

    this._send = this._send.bind(this);
  }

  get volume() {
    return this.piper.volumeLevel;
  }

  connect(data) {
    this.connecting = true;
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      this.disconnect(undefined, true);
      setTimeout(() => {
        if (!this.connecting && !this.ready) {
          this.connect(data);
        }
      }, 500).unref();
      return;
    }
    clearTimeout(this.connectionTimeout);
    this.connectionTimeout = setTimeout(() => {
      if (this.connecting) {
        this.disconnect(new Error("Voice connection timeout"));
      }
      this.connectionTimeout = null;
    }, this.shard.client ? this.shard.client.options.connectionTimeout : 30000).unref();
    if (!data.endpoint) {
      return; // Endpoint null, wait next update.
    }
    if (!data.token || !data.session_id || !data.user_id) {
      this.disconnect(new Error("Malformed voice server update: " + JSON.stringify(data)));
      return;
    }
    this.channelID = data.channel_id;
    const lastEndpoint = this.endpoint ? this.endpoint.hostname : null;
    this.endpoint = new URL(`wss://${data.endpoint}`);
    if (this.endpoint.port === "80") {
      this.endpoint.port = "";
    }
    this.endpoint.searchParams.set("v", VOICE_VERSION);
    this.ws = new WebSocket(this.endpoint.href);
    this.resuming = this.reconnecting && data.session_id === this.sessionID && data.token === this.token && lastEndpoint === this.endpoint.hostname;
    /**
     * Fired when stuff happens and gives more info
     * @event VoiceConnection#debug
     * @prop {String} message The debug message
     */
    this.emit("debug", "Connection: " + JSON.stringify(data));
    this.ws.on("open", () => {
      /**
       * Fired when the voice connection connects
       * @event VoiceConnection#connect
       */
      this.emit("connect");
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
      if (this.resuming) {
        this.emit("debug", `Resuming session (sequence ${this.wsSequence})`);
        this.sendWS(VoiceOPCodes.RESUME, {
          server_id: this.id,
          session_id: data.session_id,
          token: data.token,
          seq_ack: this.wsSequence,
        });
      } else {
        this.emit("debug", "Identifying");
        this._closeUDP(); // Closing UDP if still open during reconnect
        this.sendWS(VoiceOPCodes.IDENTIFY, {
          server_id: this.id,
          user_id: data.user_id,
          session_id: data.session_id,
          token: data.token,
        });
      }
    });
    this.ws.on("message", (m) => {
      const packet = JSON.parse(m);
      if (this.listeners("debug").length > 0) {
        this.emit("debug", "Rec: " + JSON.stringify(packet));
      }
      if (packet.seq) {
        this.wsSequence = packet.seq;
      }
      switch (packet.op) {
        case VoiceOPCodes.READY: {
          this.ssrc = packet.d.ssrc;
          this.sendHeader.writeUInt32BE(this.ssrc, 8);

          const availableMode = SUPPORTED_ENCRYPTION_MODES.find((mode) => packet.d.modes.includes(mode) && (mode !== "aead_aes256_gcm_rtpsize" || aes256Available));
          if (!availableMode) {
            throw new Error("No supported voice mode found");
          }

          this.modes = packet.d.modes;

          this.udpIP = packet.d.ip;
          this.udpPort = packet.d.port;

          this.sessionID = data.session_id;
          this.token = data.token;

          this.emit("debug", "Connecting to UDP: " + this.udpIP + ":" + this.udpPort);

          this.udpSocket = Dgram.createSocket(Net.isIPv6(this.udpIP) ? "udp6" : "udp4");
          this.udpSocket.on("error", (err, msg) => {
            this.emit("error", err);
            if (msg) {
              this.emit("debug", "Voice UDP error: " + msg);
            }
            if (this.ready || this.connecting) {
              this.disconnect(err);
            }
          });
          this.udpSocket.once("message", (packet) => {
            let i = 8;
            while (packet[i] !== 0) {
              i++;
            }
            const localIP = packet.toString("ascii", 8, i);
            const localPort = packet.readUInt16BE(packet.length - 2);
            this.emit("debug", `Discovered IP: ${localIP}:${localPort} (${packet.toString("hex")})`);

            this.sendWS(VoiceOPCodes.SELECT_PROTOCOL, {
              protocol: "udp",
              data: {
                address: localIP,
                port: localPort,
                mode: availableMode,
              },
            });
          });
          this.udpSocket.on("close", (err) => {
            if (err) {
              this.emit("warn", "Voice UDP close: " + err);
            }
            if (this.ready || this.connecting) {
              this.disconnect(err);
            }
          });
          const udpMessage = Buffer.allocUnsafe(74);
          udpMessage.writeUInt16BE(0x1, 0);
          udpMessage.writeUInt16BE(70, 2);
          udpMessage.writeUInt32BE(this.ssrc, 4);
          this.sendUDPPacket(udpMessage);
          break;
        }
        case VoiceOPCodes.RESUMED: {
          this.connecting = false;
          this.reconnecting = false;
          this.resuming = false;
          this.ready = true;
          /**
           * Fired when the voice connection was resumed
           * @event VoiceConnection#resumed
           */
          this.emit("resumed");
          break;
        }
        case VoiceOPCodes.SESSION_DESCRIPTION: {
          this.mode = packet.d.mode;
          this.secret = Buffer.from(packet.d.secret_key);
          this._nonceBuffer = Buffer.alloc(this.mode === "aead_aes256_gcm_rtpsize" ? 12 : 24);
          if (this.mode === "aead_xchacha20_poly1305_rtpsize" && StableLib) {
            this._stablelib = new StableLib.XChaCha20Poly1305(this.secret);
          }
          this.connecting = false;
          this.reconnecting = false;
          this.resuming = false;
          this.ready = true;
          // Send audio to properly establish the socket (e.g. for voice receive)
          this.sendAudioFrame(SILENCE_FRAME, this.frameSize);
          /**
           * Fired when the voice connection turns ready
           * @event VoiceConnection#ready
           */
          this.emit("ready");
          this.resume();
          if (this.receiveStreamOpus || this.receiveStreamPCM) {
            this.registerReceiveEventHandler();
          }
          break;
        }
        case VoiceOPCodes.HEARTBEAT_ACK: {
          /**
           * Fired when the voice connection receives a pong
           * @event VoiceConnection#pong
           * @prop {Number} latency The current latency in milliseconds
           */
          this.emit("pong", Date.now() - packet.d.t);
          break;
        }
        case VoiceOPCodes.SPEAKING: {
          this.ssrcUserMap[packet.d.ssrc] = packet.d.user_id;
          /**
           * Fired when a user begins speaking
           * @event VoiceConnection#speakingStart
           * @prop {String} userID The ID of the user that began speaking
           */
          /**
           * Fired when a user stops speaking
           * @event VoiceConnection#speakingStop
           * @prop {String} userID The ID of the user that stopped speaking
           */
          this.emit(packet.d.speaking ? "speakingStart" : "speakingStop", packet.d.user_id);
          break;
        }
        case VoiceOPCodes.HELLO: {
          if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
          }
          this.heartbeatInterval = setInterval(() => {
            this.heartbeat();
          }, packet.d.heartbeat_interval);

          this.heartbeat();
          break;
        }
        case VoiceOPCodes.CLIENTS_CONNECT: {
          /**
           * Fired when one or more clients connect to the voice channel
           * @event VoiceConnection#usersConnect
           * @prop {String[]} userIDs The IDs of the users that connected
           */
          this.emit("usersConnect", packet.d.user_ids);
          break;
        }
        case VoiceOPCodes.CLIENT_DISCONNECT: {
          if (this.opus) {
            // opusscript requires manual cleanup
            if (this.opus[packet.d.user_id] && this.opus[packet.d.user_id].delete) {
              this.opus[packet.d.user_id].delete();
            }

            delete this.opus[packet.d.user_id];
          }

          /**
           * Fired when a user disconnects from the voice server
           * @event VoiceConnection#userDisconnect
           * @prop {String} userID The ID of the user that disconnected
           */
          this.emit("userDisconnect", packet.d.user_id);
          break;
        }
        default: {
          this.emit("unknown", packet);
          break;
        }
      }
    });
    this.ws.on("error", (err) => {
      this.emit("error", err);
    });
    this.ws.on("close", (code, reason) => {
      let err = !code || code === 1000 ? null : new Error(code + ": " + reason);
      this.emit("warn", `Voice WS close ${code}: ${reason}`);
      if (this.connecting || this.ready) {
        let reconnecting = true;
        if (code === 4006) {
          reconnecting = false;
        } else if (code === 4014) {
          if (this.channelID) {
            data.endpoint = null;
            reconnecting = true;
            err = null;
          } else {
            reconnecting = false;
          }
        } else if (code === 1000) {
          reconnecting = false;
        }

        this.disconnect(err, reconnecting);

        // Reset resume params if we cant resume
        const canResume = code === 4015 || code < 4000;
        if (!canResume) {
          this.wsSequence = -1;
          this.sessionID = null;
          this.token = null;
          this._closeUDP();
        }

        if (reconnecting) {
          setTimeout(() => {
            if (!this.connecting && !this.ready) {
              this.connect(data);
            }
          }, 500).unref();
        }
      }
    });
  }

  disconnect(error, reconnecting) {
    this.connecting = false;
    this.reconnecting = reconnecting;
    this.resuming = false;
    this.ready = false;
    this.speaking = false;
    this.timestamp = 0;
    this.sequence = 0;

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    try {
      if (reconnecting) {
        this.pause();
      } else {
        this.stopPlaying();
      }
    } catch (err) {
      this.emit("error", err);
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (!reconnecting) {
      this._closeUDP();
    }
    if (this.ws) {
      try {
        if (reconnecting) {
          if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.close(4901, "Eris: reconnect");
          } else {
            this.emit("debug", `Terminating websocket (state: ${this.ws.readyState})`);
            this.ws.terminate();
          }
        } else {
          this.ws.close(1000, "Eris: normal");
        }
      } catch (err) {
        this.emit("error", err);
      }
      this.ws = null;
    }
    if (reconnecting) {
      if (error) {
        this.emit("error", error);
      }
    } else {
      this.channelID = null;
      this.sessionID = null;
      this.token = null;
      this.wsSequence = -1;
      this._stablelib = null;
      this.updateVoiceState();
      /**
       * Fired when the voice connection disconnects
       * @event VoiceConnection#disconnect
       * @prop {Error?} error The error, if any
       */
      this.emit("disconnect", error);
    }
  }

  heartbeat() {
    this.sendWS(VoiceOPCodes.HEARTBEAT, {
      t: Date.now(),
      seq_ack: this.wsSequence,
    });
    if (this.udpSocket) {
      // NAT/connection table keep-alive
      const udpMessage = Buffer.from([0x80, 0xC8, 0x0, 0x0]);
      this.sendUDPPacket(udpMessage);
    }
  }

  /**
   * Pause sending audio (if playing)
   */
  pause() {
    this.paused = true;
    this.setSpeaking(0);
    if (this.current) {
      if (!this.current.pausedTimestamp) {
        this.current.pausedTimestamp = Date.now();
      }
      if (this.current.timeout) {
        clearTimeout(this.current.timeout);
        this.current.timeout = null;
      }
    }
  }

  /**
   * Play an audio or video resource. If playing from a non-opus resource, FFMPEG should be compiled with --enable-libopus for best performance. If playing from HTTPS, FFMPEG must be compiled with --enable-openssl
   * @arg {ReadableStream | String} resource The audio or video resource, either a ReadableStream, URL, or file path
   * @arg {Object} [options] Music options
   * @arg {Array<String>} [options.encoderArgs] Additional encoder parameters to pass to ffmpeg/avconv (after -i)
   * @arg {String} [options.format] The format of the resource. If null, FFmpeg will attempt to guess and play the format. Available options: "dca", "ogg", "webm", "pcm", null
   * @arg {Number} [options.frameDuration=20] The resource opus frame duration (required for DCA/Ogg)
   * @arg {Number} [options.frameSize=2880] The resource opus frame size
   * @arg {Boolean} [options.inlineVolume=false] Whether to enable on-the-fly volume changing. Note that enabling this leads to increased CPU usage
   * @arg {Array<String>} [options.inputArgs] Additional input parameters to pass to ffmpeg/avconv (before -i)
   * @arg {Number} [options.pcmSize=options.frameSize*2*this.channels] The PCM size if the "pcm" format is used
   * @arg {Number} [options.samplingRate=48000] The resource audio sampling rate
   * @arg {Number} [options.voiceDataTimeout=2000] Timeout when waiting for voice data (-1 for no timeout)
   */
  play(source, options = {}) {
    if (this.shared) {
      throw new Error("Cannot play stream on shared voice connection");
    }
    if (!this.ready) {
      throw new Error("Not ready yet");
    }

    options.format = options.format || null;
    options.voiceDataTimeout = !isNaN(options.voiceDataTimeout) ? options.voiceDataTimeout : 2000;
    options.inlineVolume = !!options.inlineVolume;
    options.inputArgs = options.inputArgs || [];
    options.encoderArgs = options.encoderArgs || [];

    options.samplingRate = options.samplingRate || this.samplingRate;
    options.frameDuration = options.frameDuration || this.frameDuration;
    options.frameSize = options.frameSize || options.samplingRate * options.frameDuration / 1000;
    options.pcmSize = options.pcmSize || options.frameSize * 2 * this.channels;

    if (!this.piper.encode(source, options)) {
      this.emit("error", new Error("Unable to encode source"));
      return;
    }

    this.ended = false;
    this.current = {
      startTime: 0, // later
      playTime: 0,
      pausedTimestamp: 0,
      pausedTime: 0,
      bufferingTicks: 0,
      options: options,
      timeout: null,
      buffer: null,
    };

    this.playing = true;

    /**
     * Fired when the voice connection starts playing a stream
     * @event VoiceConnection#start
     */
    this.emit("start");

    this._send();
  }

  /**
   * Generate a receive stream for the voice connection.
   * @arg {String} [type="pcm"] The desired voice data type, either "opus" or "pcm"
   * @returns {VoiceDataStream}
   */
  receive(type) {
    if (type === "pcm") {
      if (!this.receiveStreamPCM) {
        this.receiveStreamPCM = new VoiceDataStream(type);
        if (!this.receiveStreamOpus) {
          this.registerReceiveEventHandler();
        }
      }
    } else if (type === "opus") {
      if (!this.receiveStreamOpus) {
        this.receiveStreamOpus = new VoiceDataStream(type);
        if (!this.receiveStreamPCM) {
          this.registerReceiveEventHandler();
        }
      }
    } else {
      throw new Error(`Unsupported voice data type: ${type}`);
    }
    return type === "pcm" ? this.receiveStreamPCM : this.receiveStreamOpus;
  }

  registerReceiveEventHandler() {
    this.udpSocket.on("message", (msg) => {
      if (msg[1] !== 0x78) { // unknown payload type, ignore
        return;
      }
      const rtpVersion = msg[0] >> 6;
      if (rtpVersion !== 2) { // Check if RTP version is 2
        this.emit("warn", "Recieved packet with an invalid RTP version: " + rtpVersion);
        return;
      }

      // RFC3550 5.1: RTP Fixed Header Fields
      const hasExtension = !!(msg[0] & 0b10000);
      const hasPadding = !!(msg[0] & 0b100000);
      const cc = msg[0] & 0b1111;
      const nonce = Buffer.alloc(this.mode === "aead_aes256_gcm_rtpsize" ? 12 : 24);
      msg.copy(nonce, 0, msg.length - 4, msg.length);

      // Header Size = Fixed Header Length + (CSRC Identifier Length * CSRC count) + Extension
      let headerSize = 12 + (cc * 4);
      if (hasExtension) {
        headerSize += 4;
      }

      let data;
      if (this.mode === "aead_aes256_gcm_rtpsize") {
        const decipher = nodeCrypto.createDecipheriv("aes-256-gcm", this.secret, nonce);
        decipher.setAAD(msg.subarray(0, headerSize));
        decipher.setAuthTag(msg.subarray(msg.length - 20, msg.length - 4));
        data = Buffer.concat([decipher.update(msg.subarray(headerSize, msg.length - 20)), decipher.final()]);
      } else if (Sodium) {
        data = Buffer.alloc(msg.length - (headerSize + 4) - Sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES);
        Sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
          data,
          null,
          msg.subarray(headerSize, msg.length - 4),
          msg.subarray(0, headerSize),
          nonce,
          this.secret,
        );
      } else if (this._stablelib) {
        data = this._stablelib.open(
          nonce,
          msg.subarray(headerSize, msg.length - 4),
          msg.subarray(0, headerSize),
        );
        if (!data) {
          return this.emit("warn", "Failed to unseal received packet");
        }
        // Stablelib returns a UInt8Array, but we should keep it a buffer to be consistent
        data = Buffer.from(data.buffer);
      }

      // RFC3550 5.1: Padding (may need testing)
      if (hasPadding) {
        const paddingAmount = data.subarray(0, data.length - 1);
        if (paddingAmount < data.length) {
          data = data.subarray(0, data.length - paddingAmount);
        }
      }

      // Not a RFC5285 One Byte Header Extension (not negotiated)
      if (hasExtension) {
        const extOffset = headerSize - 4;
        if (msg[extOffset + 0] === 0xbe && msg[extOffset + 1] === 0xde) { // RFC3550 5.3.1: RTP Header Extension
          // For rtpsize modes, the length bit is outside of the decrypted data.
          const l = msg[extOffset + 2] << 8 | msg[extOffset + 3];
          data = data.subarray(l * 4);
        }
      }

      if (this.receiveStreamOpus) {
        /**
         * Fired when a voice data packet is received
         * @event VoiceDataStream#data
         * @prop {Buffer} data The voice data
         * @prop {String} userID The user who sent the voice packet
         * @prop {Number} timestamp The intended timestamp of the packet
         * @prop {Number} sequence The intended sequence number of the packet
         */
        this.receiveStreamOpus.emit("data", data, this.ssrcUserMap[msg.readUIntBE(8, 4)], msg.readUIntBE(4, 4), msg.readUIntBE(2, 2));
      }
      if (this.receiveStreamPCM) {
        const userID = this.ssrcUserMap[msg.readUIntBE(8, 4)];
        if (!this.opus[userID]) {
          this.opus[userID] = createOpus(this.samplingRate, this.channels, this.bitrate);
        }

        data = this.opus[userID].decode(data, this.frameSize);
        if (!data) {
          return this.emit("warn", "Failed to decode received packet");
        }
        this.receiveStreamPCM.emit("data", data, userID, msg.readUIntBE(4, 4), msg.readUIntBE(2, 2));
      }
    });
  }

  /**
   * Resume sending audio (if paused)
   */
  resume() {
    this.paused = false;
    if (this.current) {
      this.setSpeaking(1);
      if (this.current.pausedTimestamp) {
        this.current.pausedTime += Date.now() - this.current.pausedTimestamp;
        this.current.pausedTimestamp = 0;
      }
      this._send();
    } else {
      this.setSpeaking(0);
    }
  }

  /**
   * Send a packet containing an Opus audio frame
   * @arg {Buffer} frame The Opus audio frame
   * @arg {Number} [frameSize] The size (in samples) of the Opus audio frame
   */
  sendAudioFrame(frame, frameSize = this.frameSize) {
    this.timestamp = (this.timestamp + frameSize) >>> 0;
    this.sequence = (this.sequence + 1) & 0xFFFF;

    return this._sendAudioFrame(frame);
  }

  /**
   * Send a packet through the connection's UDP socket. The packet is dropped if the socket isn't established
   * @arg {Buffer} packet The packet data
   */
  sendUDPPacket(packet) {
    if (this.udpSocket) {
      try {
        this.udpSocket.send(packet, 0, packet.length, this.udpPort, this.udpIP);
      } catch (e) {
        this.emit("error", e);
      }
    }
  }

  sendWS(op, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      data = JSON.stringify({ op: op, d: data });
      this.ws.send(data);
      this.emit("debug", data);
    }
  }

  setSpeaking(value, delay = 0) {
    this.speaking = value === true ? 1 : value === false ? 0 : value;
    this.sendWS(VoiceOPCodes.SPEAKING, {
      speaking: value,
      delay: delay,
      ssrc: this.ssrc,
    });
  }

  /**
   * Modify the output volume of the current stream (if inlineVolume is enabled for the current stream)
   * @arg {Number} [volume=1.0] The desired volume. 0.0 is 0%, 1.0 is 100%, 2.0 is 200%, etc. It is not recommended to go above 2.0
   */
  setVolume(volume) {
    this.piper.setVolume(volume);
  }

  /**
   * Stop the bot from sending audio
   */
  stopPlaying() {
    if (this.ended) {
      return;
    }
    this.ended = true;
    if (this.current && this.current.timeout) {
      clearTimeout(this.current.timeout);
      this.current.timeout = null;
    }
    this.current = null;
    if (this.piper) {
      this.piper.stop();
      this.piper.resetPackets();
    }

    if (this.secret) {
      for (let i = 0; i < 5; i++) {
        this.sendAudioFrame(SILENCE_FRAME, this.frameSize);
      }
    }
    this.playing = false;
    this.setSpeaking(0);

    /**
     * Fired when the voice connection finishes playing a stream
     * @event VoiceConnection#end
     */
    this.emit("end");
  }

  /**
   * Switch the voice channel the bot is in. The channel to switch to must be in the same guild as the current voice channel
   * @arg {String} channelID The ID of the voice channel
   */
  switchChannel(channelID, reactive) {
    if (this.channelID === channelID) {
      return;
    }

    this.channelID = channelID;
    if (reactive) {
      if (this.reconnecting && !channelID) {
        this.disconnect();
      }
    } else {
      this.updateVoiceState();
    }
  }

  /**
   * Update the bot's voice state
   * @arg {Boolean} selfMute Whether the bot muted itself or not (audio receiving is unaffected)
   * @arg {Boolean} selfDeaf Whether the bot deafened itself or not (audio sending is unaffected)
   */
  updateVoiceState(selfMute, selfDeaf) {
    if (this.shard.sendWS) {
      this.shard.sendWS(GatewayOPCodes.VOICE_STATE_UPDATE, {
        guild_id: this.id === "call" ? null : this.id,
        channel_id: this.channelID || null,
        self_mute: !!selfMute,
        self_deaf: !!selfDeaf,
      });
    }
  }

  _closeUDP() {
    if (this.udpSocket) {
      try {
        this.udpSocket.close();
      } catch (err) {
        if (err.message !== "Not running") {
          this.emit("error", err);
        }
      }
      this.udpSocket = null;
    }
  }

  _destroy() {
    if (this.opus) {
      for (const key in this.opus) {
        if (this.opus[key].delete) {
          this.opus[key].delete();
        }
        delete this.opus[key];
      }
    }
    delete this.piper;
    if (this.receiveStreamOpus) {
      this.receiveStreamOpus.removeAllListeners();
      this.receiveStreamOpus = null;
    }
    if (this.receiveStreamPCM) {
      this.receiveStreamPCM.removeAllListeners();
      this.receiveStreamPCM = null;
    }
  }

  _send() {
    if (!this.piper.encoding && this.piper.dataPacketCount === 0) {
      return this.stopPlaying();
    }

    if ((this.current.buffer = this.piper.getDataPacket())) {
      if (this.current.startTime === 0) {
        this.current.startTime = Date.now();
      }
      if (this.current.bufferingTicks > 0) {
        this.current.bufferingTicks = 0;
        this.setSpeaking(1);
      }
    } else if (this.current.options.voiceDataTimeout === -1 || this.current.bufferingTicks < this.current.options.voiceDataTimeout / (4 * this.current.options.frameDuration)) { // wait for data
      if (++this.current.bufferingTicks === 1) {
        this.setSpeaking(0);
      }
      this.current.pausedTime += 4 * this.current.options.frameDuration;
      this.timestamp = (this.timestamp + 3 * this.current.options.frameSize) >>> 0;
      this.current.timeout = setTimeout(this._send, 4 * this.current.options.frameDuration);
      return;
    } else {
      return this.stopPlaying();
    }

    this.sendAudioFrame(this.current.buffer, this.current.options.frameSize);
    this.current.playTime += this.current.options.frameDuration;
    this.current.timeout = setTimeout(this._send, this.current.startTime + this.current.pausedTime + this.current.playTime - Date.now());
  }

  _sendAudioFrame(frame) {
    const headerSize = this.sendHeader.length;
    this.sendHeader.writeUInt16BE(this.sequence, 2);
    this.sendHeader.writeUInt32BE(this.timestamp, 4);

    this._nonce = (this._nonce + 1) >>> 0;
    this._nonceBuffer.writeUInt32BE(this._nonce, 0);

    if (this.mode === "aead_aes256_gcm_rtpsize") {
      const cipher = nodeCrypto.createCipheriv("aes-256-gcm", this.secret, this._nonceBuffer);
      cipher.setAAD(this.sendHeader);
      const result = Buffer.concat([cipher.update(frame), cipher.final(), cipher.getAuthTag()]);
      this.sendHeader.copy(this.sendBuffer, 0, 0, headerSize);
      result.copy(this.sendBuffer, headerSize);
      this._nonceBuffer.copy(this.sendBuffer, headerSize + result.length, 0, 4); // nonce padding
      return this.sendUDPPacket(this.sendBuffer.subarray(0, headerSize + result.length + 4));
    } else if (Sodium) {
      const ABYTES = Sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES;
      const length = frame.length + ABYTES;
      this.sendBuffer.fill(0, headerSize + frame.length, headerSize + frame.length + ABYTES);
      frame.copy(this.sendBuffer, headerSize);
      Sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
        this.sendBuffer.subarray(headerSize, headerSize + length),
        this.sendBuffer.subarray(headerSize, headerSize + frame.length),
        this.sendHeader,
        null,
        this._nonceBuffer,
        this.secret,
      );
      this.sendHeader.copy(this.sendBuffer, 0, 0, headerSize);
      this._nonceBuffer.copy(this.sendBuffer, headerSize + length, 0, 4); // nonce padding
      return this.sendUDPPacket(this.sendBuffer.subarray(0, headerSize + length + 4));
    } else if (this._stablelib) {
      const length = frame.length + StableLib.TAG_LENGTH;
      this.sendBuffer.fill(0, headerSize + frame.length, headerSize + length);
      this._stablelib.seal(
        this._nonceBuffer,
        frame,
        this.sendHeader,
        this.sendBuffer.subarray(headerSize, headerSize + length),
      );
      this.sendHeader.copy(this.sendBuffer, 0, 0, headerSize);
      this._nonceBuffer.copy(this.sendBuffer, headerSize + length, 0, 4); // nonce padding
      return this.sendUDPPacket(this.sendBuffer.subarray(0, headerSize + length + 4));
    }
  }

  /** @deprecated */
  _sendAudioPacket(audio) {
    return this._sendAudioFrame(audio);
  }

  [util.inspect.custom]() {
    return Base.prototype[util.inspect.custom].call(this);
  }

  toString() {
    return `[VoiceConnection ${this.channelID}]`;
  }

  toJSON(props = []) {
    return Base.prototype.toJSON.call(this, [
      "channelID",
      "connecting",
      "current",
      "id",
      "paused",
      "playing",
      "ready",
      "volume",
      ...props,
    ]);
  }
}

VoiceConnection._converterCommand = converterCommand;

module.exports = VoiceConnection;
