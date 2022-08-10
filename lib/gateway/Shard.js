'use strict';

const util = require('util');
const Base = require('../structures/Base');
const Bucket = require('../util/Bucket');
const { GATEWAY_VERSION, GatewayOPCodes } = require('../Constants');
const Constants = require('../Constants');
const PresenceUpdate = require('./events/PresenceUpdate.event');
const VoiceStateUpdate = require('./events/VoiceStateUpdate.event');
const TypingStart = require('./events/TypingStart.event');
const MessageCreate = require('./events/MessageCreate.event');
const MessageUpdate = require('./events/MessageUpdate.event');
const MessageDelete = require('./events/MessageDelete.event');
const MessageDeleteBulk = require('./events/MessageDeleteBulk.event');
const MessageReactionAdd = require('./events/MessageReactionAdd.event');
const MessageReactionRemove = require('./events/MessageReactionRemove.event');
const MessageReactionRemoveAll = require('./events/MessageReactionRemoveAll.event');
const MessageReactionRemoveEmoji = require('./events/MessageReactionRemoveEmoji.event');
const GuildMemberAdd = require('./events/GuildMemberAdd.event');
const GuildMemberUpdate = require('./events/GuildMemberUpdate.event');
const GuildMemberRemove = require('./events/GuildMemberRemove.event');
const GuildCreate = require('./events/GuildCreate.event');
const GuildUpdate = require('./events/GuildUpdate.event');
const GuildDelete = require('./events/GuildDelete.event');
const GuildBanAdd = require('./events/GuildBanAdd.event');
const GuildBanRemove = require('./events/GuildBanRemove.event');
const GuildRoleCreate = require('./events/GuildRoleCreate.event');
const GuildRoleUpdate = require('./events/GuildRoleUpdate.event');
const GuildRoleDelete = require('./events/GuildRoleDelete.event');
const InviteCreate = require('./events/InviteCreate.event');
const InviteDelete = require('./events/InviteDelete.event');
const ChannelCreate = require('./events/ChannelCreate.event');
const ChannelUpdate = require('./events/ChannelUpdate.event');
const ChannelDelete = require('./events/ChannelDelete.event');
const CallCreate = require('./events/CallCreate.event');
const CallUpdate = require('./events/CallUpdate.event');
const CallDelete = require('./events/CallDelete.event');
const ChannelRecipientAdd = require('./events/ChannelRecipientAdd.event');
const ChannelRecipientRemove = require('./events/ChannelRecipientRemove.event');
const FriendSuggestionCreate = require('./events/FriendSuggestionCreate.event');
const FriendSuggestionDelete = require('./events/FriendSuggestionDelete.event');
const GuildMembersChunk = require('./events/GuildMembersChunk.event');
const GuildSync = require('./events/GuildSync.event');
const Ready = require('./events/Ready.event');
const VoiceServerUpdate = require('./events/VoiceServerUpdate.event');
const UserUpdate = require('./events/UserUpdate.event');
const RelationShipAdd = require('./events/RelationShipAdd.event');
const RelationShipRemove = require('./events/RelationShipRemove.event');
const GuildEmojisUpdate = require('./events/GuildEmojisUpdate.event');
const ChannelPinsUpdate = require('./events/ChannelPinsUpdate.event');
const WebhooksUpdate = require('./events/WebhooksUpdate.event');
const PresencesReplace = require('./events/PresencesReplace.event');
const UserNoteUpdate = require('./events/UserNoteUpdate.event');
const UserGuildSettingsUpdate = require('./events/UserGuildSettingsUpdate');
const InteractionCreate = require('./events/InteractionCreate.event');
const InteractionUpdate = require('./events/InteractionUpdate.event');
const InteractionDelete = require('./events/InteractionDelete.event');
const ThreadCreate = require('./events/ThreadCreate.event');
const ThreadDelete = require('./events/ThreadDelete.event');
const ThreadUpdate = require('./events/ThreadUpdate.event');
const ThreadMembersUpdate = require('./events/ThreadMembersUpdate.event');

const WebSocket = typeof window !== 'undefined' ? require('../util/BrowserWebSocket') : require('ws');

let EventEmitter;
try {
  EventEmitter = require('eventemitter3');
} catch (err) {
  EventEmitter = require('events').EventEmitter;
}
let Erlpack;
try {
  Erlpack = require('erlpack');
} catch (err) { // eslint-disable no-empty
}
let ZlibSync;
try {
  ZlibSync = require('zlib-sync');
} catch (err) {
  try {
    ZlibSync = require('pako');
  } catch (err) { // eslint-disable no-empty
  }
}

/**
* Represents a shard
* @extends EventEmitter
* @prop {Number} id The ID of the shard
* @prop {Boolean} connecting Whether the shard is connecting
* @prop {Array<String>?} discordServerTrace Debug trace of Discord servers
* @prop {Number} lastHeartbeatReceived Last time Discord acknowledged a heartbeat, null if shard has not sent heartbeat yet
* @prop {Number} lastHeartbeatSent Last time shard sent a heartbeat, null if shard has not sent heartbeat yet
* @prop {Number} latency The current latency between the shard and Discord, in milliseconds
* @prop {Boolean} ready Whether the shard is ready
* @prop {String} status The status of the shard. 'disconnected'/'connecting'/'handshaking'/'ready'
*/
class Shard extends EventEmitter {
  constructor(id, client) {
    super();

    this.id = id;
    this.client = client;

    this.onPacket = this.onPacket.bind(this);
    this._onWSOpen = this._onWSOpen.bind(this);
    this._onWSMessage = this._onWSMessage.bind(this);
    this._onWSError = this._onWSError.bind(this);
    this._onWSClose = this._onWSClose.bind(this);

    this.hardReset();
  }

  checkReady() {
    if (!this.ready) {
      if (this.guildSyncQueue.length > 0) {
        this.requestGuildSync(this.guildSyncQueue);
        this.guildSyncQueue = [];
        this.guildSyncQueueLength = 1;
        return;
      }
      if (this.unsyncedGuilds > 0) {
        return;
      }
      if (this.getAllUsersQueue.length > 0) {
        this.requestGuildMembers(this.getAllUsersQueue);
        this.getAllUsersQueue = [];
        this.getAllUsersLength = 1;
        return;
      }
      if (Object.keys(this.getAllUsersCount).length === 0) {
        this.ready = true;
        /**
        * Fired when the shard turns ready
        * @event Shard#ready
        */
        super.emit('ready');
      }
    }
  }

  /**
  * Tells the shard to connect
  */
  connect() {
    if (this.ws && this.ws.readyState != WebSocket.CLOSED) {
      this.emit('error', new Error('Existing connection detected'), this.id);
      return;
    }
    ++this.connectAttempts;
    this.connecting = true;
    return this.initializeWS();
  }

  createGuild(_guild) {
    this.client.guildShardMap[_guild.id] = this.id;
    const guild = this.client.guilds.add(_guild, this.client, true);
    if (this.client.bot === false) {
      ++this.unsyncedGuilds;
      this.syncGuild(guild.id);
    }
    if (this.client.options.getAllUsers && guild.members.size < guild.memberCount) {
      this.getGuildMembers(guild.id);
    }
    return guild;
  }

  /**
  * Disconnects the shard
  * @arg {Object?} [options] Shard disconnect options
  * @arg {String | Boolean} [options.reconnect] false means destroy everything, true means you want to reconnect in the future, 'auto' will autoreconnect
  * @arg {Error} [error] The error that causes the disconnect
  */
  disconnect(options = {}, error) {
    if (!this.ws) {
      return;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.ws.readyState !== WebSocket.CLOSED) {
      this.ws.removeEventListener('close', this._onWSClose);
      try {
        if (options.reconnect && this.sessionID) {
          if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.close(4901, 'Eris: reconnect');
          } else {
            this.emit('debug', `Terminating websocket (state: ${this.ws.readyState})`, this.id);
            this.ws.terminate();
          }
        } else {
          this.ws.close(1000, 'Eris: normal');
        }
      } catch (err) {
        this.emit('error', err, this.id);
      }
    }
    this.ws = null;
    this.reset();

    if (error) {
      this.emit('error', error, this.id);
    }

    /**
    * Fired when the shard disconnects
    * @event Shard#disconnect
    * @prop {Error?} err The error, if any
    */
    super.emit('disconnect', error);

    if (this.sessionID && this.connectAttempts >= this.client.options.maxResumeAttempts) {
      this.emit('debug', `Automatically invalidating session due to excessive resume attempts | Attempt ${this.connectAttempts}`, this.id);
      this.sessionID = null;
    }

    if (options.reconnect === 'auto' && this.client.options.autoreconnect) {
      /**
      * Fired when stuff happens and gives more info
      * @event Client#debug
      * @prop {String} message The debug message
      * @prop {Number} id The ID of the shard
      */
      if (this.sessionID) {
        this.emit('debug', `Immediately reconnecting for potential resume | Attempt ${this.connectAttempts}`, this.id);
        this.client.shards.connect(this);
      } else {
        this.emit('debug', `Queueing reconnect in ${this.reconnectInterval}ms | Attempt ${this.connectAttempts}`, this.id);
        setTimeout(() => {
          this.client.shards.connect(this);
        }, this.reconnectInterval);
        this.reconnectInterval = Math.min(Math.round(this.reconnectInterval * (Math.random() * 2 + 1)), 30000);
      }
    } else if (!options.reconnect) {
      this.hardReset();
    }
  }

  /**
  * Update the bot's AFK status. Setting this to true will enable push notifications for userbots.
  * @arg {Boolean} afk Whether the bot user is AFK or not
  */
  editAFK(afk) {
    this.presence.afk = !!afk;

    this.sendStatusUpdate();
  }

  /**
  * Updates the bot's status on all guilds the shard is in
  * @arg {String} [status] Sets the bot's status, either 'online', 'idle', 'dnd', or 'invisible'
  * @arg {Object} [game] Sets the bot's active game, null to clear
  * @arg {String} game.name Sets the name of the bot's active game
  * @arg {Number} [game.type] The type of game. 0 is default, 1 is streaming (Twitch only)
  * @arg {String} [game.url] Sets the url of the shard's active game
  */
  editStatus(status, game) {
    if (game === undefined && typeof status === 'object') {
      game = status;
      status = undefined;
    }
    if (status) {
      this.presence.status = status;
    }
    if (game !== undefined) {
      if (game !== null && !game.hasOwnProperty('type')) {
        game.type = game.url ? 1 : 0; // No other types _yet_
      }
      this.presence.game = game;
    }

    this.sendStatusUpdate();

    this.client.guilds.forEach((guild) => {
      if (guild.shard.id === this.id) {
        if (!(guild.members.get(this.client.user.id))) {
          guild.members.get(this.client.user.id).update(this.presence);
        }
      }
    });
  }

  emit(event, ...args) {
    this.client.emit.call(this.client, event, ...args);
    if (event !== 'error' || this.listeners('error').length > 0) {
      super.emit.call(this, event, ...args);
    }
  }

  getGuildMembers(guildID, timeout) {
    if (this.getAllUsersCount.hasOwnProperty(guildID)) {
      throw new Error('Cannot request all members while an existing request is processing');
    }
    this.getAllUsersCount[guildID] = true;
    // Using intents, request one guild at a time
    if (this.client.options.intents) {
      if (!(this.client.options.intents & Constants.Intents.guildMembers)) {
        throw new Error('Cannot request all members without guildMembers intent');
      }
      this.requestGuildMembers([guildID], timeout);
    } else {
      if (this.getAllUsersLength + 3 + guildID.length > 4048) { // 4096 - '{\'op\':8,\'d\':{\'guild_id\':[],\'query\':\'\',\'limit\':0}}'.length + 1 for lazy comma offset
        this.requestGuildMembers(this.getAllUsersQueue);
        this.getAllUsersQueue = [guildID];
        this.getAllUsersLength = 1 + guildID.length + 3;
      } else {
        this.getAllUsersQueue.push(guildID);
        this.getAllUsersLength += guildID.length + 3;
      }
    }
  }

  hardReset() {
    this.reset();
    this.seq = 0;
    this.sessionID = null;
    this.reconnectInterval = 1000;
    this.connectAttempts = 0;
    this.ws = null;
    this.heartbeatInterval = null;
    this.guildCreateTimeout = null;
    this.globalBucket = new Bucket(120, 60000, { reservedTokens: 5 });
    this.presenceUpdateBucket = new Bucket(5, 60000);
    this.presence = JSON.parse(JSON.stringify(this.client.presence)); // Fast copy
    this.sessionType = null;
    this.resumeGatewayURL = null;
    this.url = (this.resumeGatewayURL != null ? this.resumeGatewayURL : this.client.gatewayURL);
    Object.defineProperty(this, '_token', {
      configurable: true,
      enumerable: false,
      writable: true,
      value: this.client._token
    });
  }

  heartbeat(normal) {
    // Can only heartbeat after resume succeeds, discord/discord-api-docs#1619
    if (this.status === 'resuming') {
      return;
    }
    if (normal) {
      if (!this.lastHeartbeatAck) {
        this.emit('debug', 'Heartbeat timeout; ' + JSON.stringify({
          lastReceived: this.lastHeartbeatReceived,
          lastSent: this.lastHeartbeatSent,
          interval: this.heartbeatInterval,
          status: this.status,
          timestamp: Date.now()
        }));
        return this.disconnect({
          reconnect: 'auto'
        }, new Error('Server didn\'t acknowledge previous heartbeat, possible lost connection'));
      }
      this.lastHeartbeatAck = false;
    }
    this.lastHeartbeatSent = Date.now();
    this.sendWS(GatewayOPCodes.HEARTBEAT, this.seq, true);
  }

  identify() {
    if (this.client.options.compress && !ZlibSync) {
      /**
      * Fired when the shard encounters an error
      * @event Client#error
      * @prop {Error} err The error
      * @prop {Number} id The ID of the shard
      */
      this.emit('error', new Error('pako/zlib-sync not found, cannot decompress data'));
      return;
    }
    const identify = {
      token: this._token,
      v: GATEWAY_VERSION,
      compress: !!this.client.options.compress,
      large_threshold: this.client.options.largeThreshold,
      guild_subscriptions: !!this.client.options.guildSubscriptions,
      intents: this.client.options.intents,
      properties: {
        'os': process.platform,
        'browser': 'Eris',
        'device': 'Eris'
      }
    };
    if (this.client.options.maxShards > 1) {
      identify.shard = [this.id, this.client.options.maxShards];
    }
    if (this.presence.status) {
      identify.presence = this.presence;
    }
    this.sendWS(GatewayOPCodes.IDENTIFY, identify);
  }

  initializeWS() {
    if (!this._token) {
      return this.disconnect(null, new Error('Token not specified'));
    }

    this.status = 'connecting';
    if (this.client.options.compress) {
      this.emit('debug', 'Initializing zlib-sync-based compression');
      this._zlibSync = new ZlibSync.Inflate({
        chunkSize: 128 * 1024
      });
    }
    this.ws = new WebSocket(this.url, this.client.options.ws);
    this.ws.on('open', this._onWSOpen);
    this.ws.on('message', this._onWSMessage);
    this.ws.on('error', this._onWSError);
    this.ws.on('close', this._onWSClose);

    this.connectTimeout = setTimeout(() => {
      if (this.connecting) {
        this.disconnect({
          reconnect: 'auto'
        }, new Error('Connection timeout'));
      }
    }, this.client.options.connectionTimeout);
  }

  onPacket(packet) {
    if (this.listeners('rawWS').length > 0 || this.client.listeners('rawWS').length) {
      /**
      * Fired when the shard receives a websocket packet
      * @event Client#rawWS
      * @prop {Object} packet The packet
      * @prop {Number} id The ID of the shard
      */
      this.emit('rawWS', packet, this.id);
    }

    if (packet.s) {
      if (packet.s > this.seq + 1 && this.ws && this.status !== 'resuming') {
        /**
        * Fired to warn of something weird but non-breaking happening
        * @event Client#warn
        * @prop {String} message The warning message
        * @prop {Number} id The ID of the shard
        */
        this.emit('warn', `Non-consecutive sequence (${this.seq} -> ${packet.s})`, this.id);
      }
      this.seq = packet.s;
    }

    switch (packet.op) {
      case GatewayOPCodes.EVENT: {
        if (!this.client.options.disableEvents[packet.t]) {
          this.wsEvent(packet);
        }
        break;
      }
      case GatewayOPCodes.HEARTBEAT: {
        this.heartbeat();
        break;
      }
      case GatewayOPCodes.INVALID_SESSION: {
        this.seq = 0;
        this.sessionID = null;
        this.emit('warn', 'Invalid session, reidentifying!', this.id);
        this.identify();
        break;
      }
      case GatewayOPCodes.RECONNECT: {
        this.emit('debug', 'Reconnecting due to server request', this.id);
        this.disconnect({
          reconnect: 'auto'
        });
        break;
      }
      case GatewayOPCodes.HELLO: {
        if (packet.d.heartbeat_interval > 0) {
          if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
          }
          this.heartbeatInterval = setInterval(() => this.heartbeat(true), packet.d.heartbeat_interval);
        }

        this.discordServerTrace = packet.d._trace;
        this.connecting = false;
        if (this.connectTimeout) {
          clearTimeout(this.connectTimeout);
        }
        this.connectTimeout = null;

        if (this.sessionID) {
          this.resume();
        } else {
          this.identify();
          // Cannot heartbeat when resuming, discord/discord-api-docs#1619
          this.heartbeat();
        }
        /**
        * Fired when a shard receives an OP:10/HELLO packet
        * @event Client#hello
        * @prop {Array<String>} trace The Discord server trace of the gateway and session servers
        * @prop {Number} id The ID of the shard
        */
        this.emit('hello', packet.d._trace, this.id);
        break; /* eslint-enable no-unreachable */
      }
      case GatewayOPCodes.HEARTBEAT_ACK: {
        this.lastHeartbeatAck = true;
        this.lastHeartbeatReceived = Date.now();
        this.latency = this.lastHeartbeatReceived - this.lastHeartbeatSent;
        break;
      }
      default: {
        this.emit('unknown', packet, this.id);
        break;
      }
    }
  }

  requestGuildMembers(guildID, options) {
    const opts = {
      guild_id: guildID,
      limit: (options && options.limit) || 0,
      user_ids: options && options.userIDs,
      query: options && options.query,
      nonce: Date.now().toString() + Math.random().toString(36),
      presences: options && options.presences
    };
    if (!opts.user_ids && !opts.query) {
      opts.query = '';
    }
    if (!opts.query && !opts.user_ids && (this.client.options.intents && !(this.client.options.intents & Constants.Intents.guildMembers))) {
      throw new Error('Cannot request all members without guildMembers intent');
    }
    if (opts.presences && (this.client.options.intents && !(this.client.options.intents & Constants.Intents.guildPresences))) {
      throw new Error('Cannot request members presences without guildPresences intent');
    }
    if (opts.user_ids && opts.user_ids.length > 100) {
      throw new Error('Cannot request more than 100 users by their ID');
    }
    this.sendWS(GatewayOPCodes.GET_GUILD_MEMBERS, opts);
    return new Promise((res) => this.requestMembersPromise[opts.nonce] = {
      res: res,
      received: 0,
      members: [],
      timeout: setTimeout(() => {
        res(this.requestMembersPromise[opts.nonce].members);
        delete this.requestMembersPromise[opts.nonce];
      }, (options && options.timeout) || this.client.options.requestTimeout)
    });
  }

  requestGuildSync(guildID) {
    this.sendWS(GatewayOPCodes.SYNC_GUILD, guildID);
  }

  reset() {
    this.connecting = false;
    this.ready = false;
    this.preReady = false;
    if (this.requestMembersPromise !== undefined) {
      for (const guildID in this.requestMembersPromise) {
        if (!this.requestMembersPromise.hasOwnProperty(guildID)) {
          continue;
        }
        clearTimeout(this.requestMembersPromise[guildID].timeout);
        this.requestMembersPromise[guildID].res(this.requestMembersPromise[guildID].received);
      }
    }
    this.requestMembersPromise = {};
    this.getAllUsersCount = {};
    this.getAllUsersQueue = [];
    this.getAllUsersLength = 1;
    this.guildSyncQueue = [];
    this.guildSyncQueueLength = 1;
    this.unsyncedGuilds = 0;
    this.latency = Infinity;
    this.lastHeartbeatAck = true;
    this.lastHeartbeatReceived = null;
    this.lastHeartbeatSent = null;
    this.status = 'disconnected';
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
    }
    this.connectTimeout = null;
  }

  restartGuildCreateTimeout() {
    if (this.guildCreateTimeout) {
      clearTimeout(this.guildCreateTimeout);
      this.guildCreateTimeout = null;
    }
    if (!this.ready) {
      if (this.client.unavailableGuilds.size === 0 && this.unsyncedGuilds === 0) {
        return this.checkReady();
      }
      this.guildCreateTimeout = setTimeout(() => {
        this.checkReady();
      }, this.client.options.guildCreateTimeout);
    }
  }

  resume() {
    this.status = 'resuming';
    this.sendWS(GatewayOPCodes.RESUME, {
      token: this._token,
      session_id: this.sessionID,
      seq: this.seq
    });
  }

  sendStatusUpdate() {
    this.sendWS(GatewayOPCodes.STATUS_UPDATE, {
      afk: !!this.presence.afk, // For push notifications
      game: this.presence.game,
      since: this.presence.status === 'idle' ? Date.now() : 0,
      status: this.presence.status
    });
  }

  sendWS(op, _data, priority = false) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      let i = 0;
      let waitFor = 1;
      const func = () => {
        if (++i >= waitFor && this.ws && this.ws.readyState === WebSocket.OPEN) {
          const data = Erlpack ? Erlpack.pack({ op: op, d: _data }) : JSON.stringify({ op: op, d: _data });
          this.ws.send(data);
          if (_data.token) {
            delete _data.token;
          }
          this.emit('debug', JSON.stringify({ op: op, d: _data }), this.id);
        }
      };
      if (op === GatewayOPCodes.STATUS_UPDATE) {
        ++waitFor;
        this.presenceUpdateBucket.queue(func, priority);
      }
      this.globalBucket.queue(func, priority);
    }
  }

  syncGuild(guildID) {
    if (this.guildSyncQueueLength + 3 + guildID.length > 4081) { // 4096 - '{\'op\':12,\'d\':[]}'.length + 1 for lazy comma offset
      this.requestGuildSync(this.guildSyncQueue);
      this.guildSyncQueue = [guildID];
      this.guildSyncQueueLength = 1 + guildID.length + 3;
    } else if (this.ready) {
      this.requestGuildSync([guildID]);
    } else {
      this.guildSyncQueue.push(guildID);
      this.guildSyncQueueLength += guildID.length + 3;
    }
  }

  wsEvent(packet) {
    switch (packet.t) { /* eslint-disable no-redeclare */ // (╯°□°）╯︵ ┻━┻
      case 'PRESENCE_UPDATE': {
        new PresenceUpdate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'VOICE_STATE_UPDATE': { // (╯°□°）╯︵ ┻━┻
        new VoiceStateUpdate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'TYPING_START': {
        new TypingStart(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'MESSAGE_CREATE': {
        new MessageCreate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'MESSAGE_UPDATE': {
        new MessageUpdate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'MESSAGE_DELETE': {
        new MessageDelete(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'MESSAGE_DELETE_BULK': {
        new MessageDeleteBulk(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'MESSAGE_REACTION_ADD': {
        new MessageReactionAdd(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'MESSAGE_REACTION_REMOVE': {
        new MessageReactionRemove(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'MESSAGE_REACTION_REMOVE_ALL': {
        new MessageReactionRemoveAll(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'MESSAGE_REACTION_REMOVE_EMOJI': {
        new MessageReactionRemoveEmoji(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'GUILD_MEMBER_ADD': {
        new GuildMemberAdd(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'GUILD_MEMBER_UPDATE': {
        new GuildMemberUpdate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'GUILD_MEMBER_REMOVE': {
        new GuildMemberRemove(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'GUILD_CREATE': {
        new GuildCreate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'GUILD_UPDATE': {
        new GuildUpdate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'GUILD_DELETE': {
        new GuildDelete(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'GUILD_BAN_ADD': {
        new GuildBanAdd(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'GUILD_BAN_REMOVE': {
        new GuildBanRemove(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'GUILD_ROLE_CREATE': {
        new GuildRoleCreate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'GUILD_ROLE_UPDATE': {
        new GuildRoleUpdate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'GUILD_ROLE_DELETE': {
        new GuildRoleDelete(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'INVITE_CREATE': {
        new InviteCreate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'INVITE_DELETE': {
        new InviteDelete(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'CHANNEL_CREATE': {
        new ChannelCreate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'CHANNEL_UPDATE': {
        new ChannelUpdate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'CHANNEL_DELETE': {
        new ChannelDelete(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'THREAD_CREATE': {
        new ThreadCreate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'THREAD_DELETE': {
        new ThreadDelete(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'THREAD_UPDATE': {
        new ThreadUpdate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'THREAD_MEMBERS_UPDATE': {
        new ThreadMembersUpdate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'CALL_CREATE': {
        new CallCreate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'CALL_UPDATE': {
        new CallUpdate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'CALL_DELETE': {
        new CallDelete(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'CHANNEL_RECIPIENT_ADD': {
        new ChannelRecipientAdd(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'CHANNEL_RECIPIENT_REMOVE': {
        new ChannelRecipientRemove(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'FRIEND_SUGGESTION_CREATE': {
        new FriendSuggestionCreate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'FRIEND_SUGGESTION_DELETE': {
        new FriendSuggestionDelete(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'GUILD_MEMBERS_CHUNK': {
        new GuildMembersChunk(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'GUILD_SYNC': {// (╯°□°）╯︵ ┻━┻ thx Discord devs
        new GuildSync(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'RESUMED':
      case 'READY': {
        new Ready(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'VOICE_SERVER_UPDATE': {
        new VoiceServerUpdate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'USER_UPDATE': {
        new UserUpdate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'RELATIONSHIP_ADD': {
        new RelationShipAdd(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'RELATIONSHIP_REMOVE': {
        new RelationShipRemove(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'GUILD_EMOJIS_UPDATE': {
        new GuildEmojisUpdate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'CHANNEL_PINS_UPDATE': {
        new ChannelPinsUpdate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'WEBHOOKS_UPDATE': {
        new WebhooksUpdate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'PRESENCES_REPLACE': {
        new PresencesReplace(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'USER_NOTE_UPDATE': {
        new UserNoteUpdate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'USER_GUILD_SETTINGS_UPDATE': {
        new UserGuildSettingsUpdate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'MESSAGE_ACK': // Ignore these
      case 'GUILD_INTEGRATIONS_UPDATE':
      case 'USER_SETTINGS_UPDATE':
      case 'CHANNEL_PINS_ACK': {
        break;
      }
      case 'INTERACTION_UPDATE': {
        new InteractionUpdate(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'INTERACTION_DELETE': {
        new InteractionDelete(packet, this.client, this).onEvent(packet);
        break;
      }
      case 'INTERACTION_CREATE': {
        new InteractionCreate(packet, this.client, this).onEvent(packet);
        break;
      }
      default: {
        /**
         * Fired when the shard encounters an unknown packet
         * @event Client#unknown
         * @prop {Object} packet The unknown packet
         * @prop {Number} id The ID of the shard
         */
        this.emit('unknown', packet, this.id);
        break;
      }
    } /* eslint-enable no-redeclare */
  }
  _onWSClose(code, reason) {
    this.emit('debug', 'WS disconnected: ' + JSON.stringify({
      code: code,
      reason: reason,
      status: this.status
    }));
    let err = !code || code === 1000 ? null : new Error(code + ': ' + reason);
    let reconnect = 'auto';
    if (code) {
      this.emit('debug', `${code === 1000 ? 'Clean' : 'Unclean'} WS close: ${code}: ${reason}`, this.id);
      if (code === 4001) {
        err = new Error('Gateway received invalid OP code');
      } else if (code === 4002) {
        err = new Error('Gateway received invalid message');
      } else if (code === 4003) {
        err = new Error('Not authenticated');
        this.sessionID = null;
      } else if (code === 4004) {
        err = new Error('Authentication failed');
        this.sessionID = null;
        reconnect = false;
        this.emit('error', new Error(`Invalid token: ${this._token}`));
      } else if (code === 4005) {
        err = new Error('Already authenticated');
      } else if (code === 4006 || code === 4009) {
        err = new Error('Invalid session');
        this.sessionID = null;
      } else if (code === 4007) {
        err = new Error('Invalid sequence number: ' + this.seq);
        this.seq = 0;
      } else if (code === 4008) {
        err = new Error('Gateway connection was ratelimited');
      } else if (code === 4010) {
        err = new Error('Invalid shard key');
        this.sessionID = null;
        reconnect = false;
      } else if (code === 4011) {
        err = new Error('Shard has too many guilds (>2500)');
        this.sessionID = null;
        reconnect = false;
      } else if (code === 4013) {
        err = new Error('Invalid intents specified');
        this.sessionID = null;
        reconnect = false;
      } else if (code === 4014) {
        err = new Error('Disallowed intents specified');
        this.sessionID = null;
        reconnect = false;
      } else if (code === 1006) {
        err = new Error('Connection reset by peer'); // IA0-WARNING
      } else if (code !== 1000 && reason) {
        err = new Error(code + ': ' + reason);
      }
      if (err) {
        err.code = code;
      }
    } else {
      this.emit('debug', 'WS close: unknown code: ' + reason, this.id);
    }
    this.disconnect({
      reconnect
    }, err);
  }

  _onWSError(err) {
    this.emit('error', err, this.id);
  }

  _onWSMessage(data) {
    try {
      if (data instanceof ArrayBuffer) {
        if (this.client.options.compress || Erlpack) {
          data = Buffer.from(data);
        }
      } else if (Array.isArray(data)) { // Fragmented messages
        data = Buffer.concat(data); // Copyfull concat is slow, but no alternative
      }
      if (this.client.options.compress) {
        if (data.length >= 4 && data.readUInt32BE(data.length - 4) === 0xFFFF) {
          this._zlibSync.push(data, ZlibSync.Z_SYNC_FLUSH);
          if (this._zlibSync.err) {
            this.emit('error', new Error(`zlib error ${this._zlibSync.err}: ${this._zlibSync.msg}`));
            return;
          }

          data = Buffer.from(this._zlibSync.result);
          if (Erlpack) {
            return this.onPacket(Erlpack.unpack(data));
          } else {
            return this.onPacket(JSON.parse(data.toString()));
          }
        } else {
          this._zlibSync.push(data, false);
        }
      } else if (Erlpack) {
        return this.onPacket(Erlpack.unpack(data));
      } else {
        return this.onPacket(JSON.parse(data.toString()));
      }
    } catch (err) {
      this.emit('error', err, this.id);
    }
  }

  _onWSOpen() {
    this.status = 'handshaking';
    /**
    * Fired when the shard establishes a connection
    * @event Client#connect
    * @prop {Number} id The ID of the shard
    */
    this.emit('connect', this.id);
    this.lastHeartbeatAck = true;
  }

  [util.inspect.custom]() {
    return Base.prototype[util.inspect.custom].call(this);
  }

  toString() {
    return Base.prototype.toString.call(this);
  }

  toJSON(props = []) {
    return Base.prototype.toJSON.call(this, [
      'connecting',
      'ready',
      'discordServerTrace',
      'status',
      'lastHeartbeatReceived',
      'lastHeartbeatSent',
      'latency',
      'preReady',
      'getAllUsersCount',
      'getAllUsersQueue',
      'getAllUsersLength',
      'guildSyncQueue',
      'guildSyncQueueLength',
      'unsyncedGuilds',
      'lastHeartbeatAck',
      'seq',
      'sessionID',
      'reconnectInterval',
      'connectAttempts',
      ...props
    ]);
  }
}

module.exports = Shard;
