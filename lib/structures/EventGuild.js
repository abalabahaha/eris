/**
 * ### Warn 1
 * Currently Discord hasn't developed this feature for other Guilds yet, and it hasn't been implemented 100%... I'm keeping up with the changes. If Discord complains about these implementations...they will be removed.
 *
 * ### Assurance
 * I'm still not sure if this will be created especially for bots or bots will be able to access this event data, I'm not sure. I'm still following the changes being made.
 */
class EventGuild {
  constructor(data, guild) {
    this.guild = guild;
    if (data.channel_id !== undefined) {
      this.channelID = data?.channel_id;
      if (guild.channels !== undefined) {
        if (guild.channels.get(data.channel_id) !== undefined) {
          this.channel = guild.channels.get(data.channel_id);
        }
      }
    }
    if (data.entity_id !== undefined) {
      this.entityID = data.entity_id;
    }
    if (data.entity_metadata !== undefined) {
      this.entityMetadata = data.entity_metadata;
    }
    if (data.guild_id !== undefined) {
      this.guildID = data.guild_id;
      if (guild !== undefined) {
        this.guild = guild;
      }
    }
    if (data.id !== undefined) {
      this.id = data.id;
    }
    if (data.image !== undefined) {
      this.image = data.image;
    }
    if (data.name !== undefined) {
      this.name = data.name;
    }
    if (data.privacy_level !== undefined) {
      this.privacyLevel = data.privacy_level;
    }
    if (data.scheduled_end_time !== undefined) {
      this.scheduledEndTime = data.scheduled_end_time;
    }
    if (data.scheduled_start_time !== undefined) {
      this.scheduledStartTime = data.scheduled_start_time;
    }
    if (data.sku_ids !== undefined) {
      this.skuIDs = data.sku_ids;
    }
    if (data.skus !== undefined) {
      this.skus = data.skus;
    }
    if (data.status !== undefined) {
      this.status = data.status;
    }
    if (data.user_count !== undefined) {
      this.userCount = data.user_count;
    }
  }
}

module.exports = EventGuild;
