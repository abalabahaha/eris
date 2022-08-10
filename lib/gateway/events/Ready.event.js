const EventCursor = require('../../util/EventCursor');
const { ChannelTypes } = require('../../Constants');
const ExtendedUser = require('../../structures/ExtendedUser');
class Ready extends EventCursor {
  constructor(data, client, shardController) {
    super('READY', data, data, client, shardController);
  }

  onEvent(packet) {
    if (packet.d.resume_gateway_url !== undefined) {
      this.shardController.resumeGatewayURL = packet.d.resume_gateway_url;
    }

    if (packet.d.session_type !== undefined) {
      this.shardController.sessionType = packet.d.sessionType;
    }

    this.shardController.connectAttempts = 0;
    this.shardController.reconnectInterval = 1000;

    this.shardController.connecting = false;
    if (this.shardController.connectTimeout) {
      clearTimeout(this.shardController.connectTimeout);
    }
    this.shardController.connectTimeout = null;
    this.shardController.status = 'ready';
    this.shardController.presence.status = 'online';
    this.client.shards._readyPacketCB();

    if (packet.t === 'RESUMED') {
      // Can only heartbeat after resume succeeds, discord/discord-api-docs#1619
      this.shardController.heartbeat();

      this.shardController.preReady = true;
      this.shardController.ready = true;

      /**
       * Fired when a shard finishes resuming
       * @event Shard#resume
       */
      this.shardController.emit('resume');
      return;
    }

    this.client.user = this.client.users.update(new ExtendedUser(packet.d.user, this.client), this.client);
    if (this.client.user.bot) {
      this.client.bot = true;
      if (!this.client._token.startsWith('Bot ')) {
        this.client._token = 'Bot ' + this.client._token;
      }
    } else {
      this.client.bot = false;
      this.client.userGuildSettings = {};
      if (packet.d.user_guild_settings) {
        packet.d.user_guild_settings.forEach((guildSettings) => {
          this.client.userGuildSettings[guildSettings.guild_id] = guildSettings;
        });
      }
      this.client.userSettings = packet.d.user_settings;
    }

    if (packet.d._trace) {
      this.shardController.discordServerTrace = packet.d._trace;
    }

    this.shardController.sessionID = packet.d.session_id;

    packet.d.guilds.forEach((guild) => {
      if (guild.unavailable) {
        this.client.guilds.remove(guild);
        this.client.unavailableGuilds.add(guild, this.client, true);
      } else {
        this.client.unavailableGuilds.remove(this.createGuild(guild));
      }
    });

    packet.d.private_channels.forEach((channel) => {
      if (channel.type === undefined || channel.type === ChannelTypes.DM) {
        this.client.privateChannelMap[channel.recipients[0].id] = channel.id;
        this.client.privateChannels.add(channel, this.client, true);
      } else if (channel.type === ChannelTypes.GROUP_DM) {
        this.client.groupChannels.add(channel, this.client, true);
      } else {
        this.shardController.emit('warn', new Error('Unhandled READY private_channel type: ' + JSON.stringify(channel, null, 2)));
      }
    });

    if (packet.d.relationships) {
      packet.d.relationships.forEach((relationship) => {
        this.client.relationships.add(relationship, this.client, true);
      });
    }

    if (packet.d.presences) {
      packet.d.presences.forEach((presence) => {
        if (this.client.relationships.get(presence.user.id)) { // Avoid DM channel presences which are also in here
          presence.id = presence.user.id;
          this.client.relationships.update(presence, null, true);
        }
      });
    }

    if (packet.d.notes) {
      this.client.notes = packet.d.notes;
    }

    this.client.application = packet.d.application;

    this.shardController.preReady = true;
    /**
     * Fired when a shard finishes processing the ready packet
     * @event Client#shardPreReady
     * @prop {Number} id The ID of the shard
     */
    this.shardController.emit('shardPreReady', this.shardController.id);

    if (this.client.unavailableGuilds.size > 0 && packet.d.guilds.length > 0) {
      this.shardController.restartGuildCreateTimeout();
    } else {
      this.shardController.checkReady();
    }

    return;
  }
}

module.exports = Ready;
