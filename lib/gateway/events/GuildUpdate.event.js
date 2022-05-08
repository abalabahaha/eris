const EventCursor = require('../../util/EventCursor');
class GuildUpdate extends EventCursor {
  constructor(data, client, shardController) {
    super('GUILD_UPDATE', data, data, client, shardController);
  }

  onEvent(packet) {
    const guild = this.client.guilds.get(packet.d.id);
    if (!guild) {
      this.shardController.emit('debug', `Guild ${packet.d.id} undefined in GUILD_UPDATE`);
      return;
    }
    const oldGuild = {
      afkChannelID: guild.afkChannelID,
      afkTimeout: guild.afkTimeout,
      banner: guild.banner,
      defaultNotifications: guild.defaultNotifications,
      description: guild.description,
      discoverySplash: guild.discoverySplash,
      emojis: guild.emojis,
      explicitContentFilter: guild.explicitContentFilter,
      features: guild.features,
      icon: guild.icon,
      large: guild.large,
      maxMembers: guild.maxMembers,
      maxVideoChannelUsers: guild.maxVideoChannelUsers,
      mfaLevel: guild.mfaLevel,
      name: guild.name,
      nsfw: guild.nsfw,
      ownerID: guild.ownerID,
      preferredLocale: guild.preferredLocale,
      premiumSubscriptionCount: guild.premiumSubscriptionCount,
      premiumTier: guild.premiumTier,
      publicUpdatesChannelID: guild.publicUpdatesChannelID,
      region: guild.region,
      rulesChannelID: guild.rulesChannelID,
      splash: guild.splash,
      systemChannelFlags: guild.systemChannelFlags,
      systemChannelID: guild.systemChannelID,
      vanityURL: guild.vanityURL,
      verificationLevel: guild.verificationLevel
    };
    /**
     * Fired when a guild is updated
     * @event Client#guildUpdate
     * @prop {Guild} guild The guild
     * @prop {Object} oldGuild The old guild data
     * @prop {String?} oldGuild.afkChannelID The ID of the AFK voice channel
     * @prop {Number} oldGuild.afkTimeout The AFK timeout in seconds
     * @prop {String?} oldGuild.banner The hash of the guild banner image, or null if no splash (VIP only)
     * @prop {Number} oldGuild.defaultNotifications The default notification settings for the guild. 0 is "All Messages", 1 is "Only @mentions"
     * @prop {String?} oldGuild.description The description for the guild (VIP only)
     * @prop {Array<Object>} oldGuild.emojis An array of guild emojis
     * @prop {Number} oldGuild.explicitContentFilter The explicit content filter level for the guild. 0 is off, 1 is on for people without roles, 2 is on for all
     * @prop {Array<String>} oldGuild.features An array of guild features
     * @prop {String?} oldGuild.icon The hash of the guild icon, or null if no icon
     * @prop {Boolean} oldGuild.large Whether the guild is "large" by "some Discord standard"
     * @prop {Number?} oldGuild.maxMembers The maximum number of members for this guild
     * @prop {Number?} oldGuild.maxVideoChannelUsers The max number of users allowed in a video channel
     * @prop {Number} oldGuild.mfaLevel The admin 2FA level for the guild. 0 is not required, 1 is required
     * @prop {String} oldGuild.name The name of the guild
     * @prop {Boolean} oldGuild.nsfw Whether the guild is designated as NSFW by Discord
     * @prop {String} oldGuild.ownerID The ID of the user that is the guild owner
     * @prop {String} oldGuild.preferredLocale Preferred "COMMUNITY" guild language used in server discovery and notices from Discord
     * @prop {Number?} oldGuild.premiumSubscriptionCount The total number of users currently boosting this guild
     * @prop {Number} oldGuild.premiumTier Nitro boost level of the guild
     * @prop {String?} oldGuild.publicUpdatesChannelID ID of the guild's updates channel if the guild has "COMMUNITY" features
     * @prop {String} oldGuild.region The region of the guild
     * @prop {String?} oldGuild.rulesChannelID The channel where "COMMUNITY" guilds display rules and/or guidelines
     * @prop {String?} oldGuild.splash The hash of the guild splash image, or null if no splash (VIP only)
     * @prop {Number} oldGuild.systemChannelFlags the flags for the system channel
     * @prop {String?} oldGuild.systemChannelID The ID of the default channel for system messages (built-in join messages and boost messages)
     * @prop {String?} oldGuild.vanityURL The vanity URL of the guild (VIP only)
     * @prop {Number} oldGuild.verificationLevel The guild verification level
     */
    this.shardController.emit('guildUpdate', this.client.guilds.update(packet.d, this.client), oldGuild);
    return;
  }
}

module.exports = GuildUpdate;
