"use strict";

const Channel = require("./Channel");
const Permission = require("./Permission");
const { Permissions } = require("../Constants");

/**
 * Represents a guild channel. You also probably want to look at CategoryChannel, ForumChannel, NewsChannel, StageChannel, TextChannel, ThreadChannel, and VoiceChannel. See Channel for more properties
 * @extends Channel
 * @prop {Number} flags The channel's flags (see constants). Currently only applies to thread/forum/media channels
 * @prop {Guild} guild The guild that owns the channel
 * @prop {String} name The name of the channel
 * @prop {String?} parentID The ID of the category (or channel for threads) this channel belongs to
 */
class GuildChannel extends Channel {
  constructor(data, client) {
    super(data, client);
    this.guild = client.guilds.get(data.guild_id) || {
      id: data.guild_id,
    };

    this.update(data);
  }

  update(data) {
    if (data.type !== undefined) {
      this.type = data.type;
    }
    if (data.name !== undefined) {
      this.name = data.name;
    }
    if (data.parent_id !== undefined) {
      this.parentID = data.parent_id;
    }
    if (data.flags !== undefined) {
      this.flags = data.flags; // NOTE - Channel flags appear everywhere including in DMs?
    }
  }

  /**
   * Delete the channel
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<CategoryChannel | ForumChannel | NewsChannel | NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel | TextChannel | VoiceChannel>}
   */
  delete(reason) {
    return this._client.deleteChannel.call(this._client, this.id, reason);
  }

  /**
   * Edit the channel's properties
   * @arg {Object} options The properties to edit
   * @arg {Array<String>} [options.appliedTags] [Th] The tags applied to a forum/media thread
   * @arg {Boolean} [options.archived] [Th] The archive status of the channel
   * @arg {Number} [options.autoArchiveDuration] [Th] The duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080
   * @arg {Array<Object>} [options.availableTags] [FM] An array of [tags](https://discord.dev/resources/channel#forum-tag-object) that can be applied. This will overwrite all existing tags unless edited by specifying the tag ID
   * @arg {Number?} [options.bitrate] [VS] The bitrate of the channel
   * @arg {Number?} [options.defaultAutoArchiveDuration] [TAFM] The default duration of newly created threads in minutes to automatically archive the thread after inactivity (60, 1440, 4320, 10080)
   * @arg {Number} [options.defaultForumLayout] [F] The default post [layout type](https://discord.dev/resources/channel#channel-object-forum-layout-types)
   * @arg {Object?} [options.defaultReactionEmoji] [FM] The [emoji](https://discord.dev/resources/channel#default-reaction-object) to show in the Add Reaction Button
   * @arg {Number?} [options.defaultSortOrder] [FM] The default post sort type (0 for latest activity, 1 for creation date)
   * @arg {Number} [options.defaultThreadRateLimitPerUser] [TFM] The default rate limit duration for newly created threads
   * @arg {Number} [options.flags] [FM/Th] The channel's flag [bit set](https://discord.dev/resources/channel#channel-object-channel-flags)
   * @arg {Boolean} [options.invitable] [Th] Whether non-moderators can add other non-moderators to the channel
   * @arg {Boolean} [options.locked] [Th] The lock status of the channel
   * @arg {String} [options.name] [All/Th] The name of the channel
   * @arg {Boolean?} [options.nsfw] [TVASFM] The NSFW status of the channel
   * @arg {String?} [options.parentID] [TVASFM] The ID of the parent channel category for this channel
   * @arg {Array<Object>?} [options.permissionOverwrites] [All] An object containing [permission overwrite](https://discord.dev/resources/channel#overwrite-object) objects
   * @arg {Number?} [options.position] [All] The sorting position of the channel
   * @arg {Number?} [options.rateLimitPerUser] [TVSFM/Th] The time in seconds a user has to wait before sending another message (does not affect bots or users with manageMessages/manageChannel permissions)
   * @arg {String?} [options.rtcRegion] [VS] The RTC region ID of the channel (automatic if `null`)
   * @arg {String?} [options.topic] [TAFM] The topic of the channel
   * @arg {Boolean} [options.type] [TA] The type of channel (only between types 0 and 5)
   * @arg {Number?} [options.userLimit] [VS] The channel user limit
   * @arg {Number?} [options.videoQualityMode] [VS] The camera video quality mode of the channel. `1` is auto, `2` is 720p
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<CategoryChannel | ForumChannel | NewsChannel | NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel | TextChannel | VoiceChannel>}
   */
  edit(options, reason) {
    return this._client.editChannel.call(this._client, this.id, options, reason);
  }

  /**
   * Get the channel-specific permissions of a member
   * @arg {String | Member | Object} memberID The ID of the member or a Member object
   * @returns {Permission}
   */
  permissionsOf(memberID) {
    const member = typeof memberID === "string" ? this.guild.members.get(memberID) : memberID;
    let permission = this.guild.permissionsOf(member).allow;
    if (permission & Permissions.administrator) {
      return new Permission(Permissions.all);
    }
    const channel = this instanceof ThreadChannel ? this.guild.channels.get(this.parentID) : this;
    let overwrite = channel && channel.permissionOverwrites.get(this.guild.id);
    if (overwrite) {
      permission = (permission & ~overwrite.deny) | overwrite.allow;
    }
    let deny = 0n;
    let allow = 0n;
    for (const roleID of member.roles) {
      if ((overwrite = channel && channel.permissionOverwrites.get(roleID))) {
        deny |= overwrite.deny;
        allow |= overwrite.allow;
      }
    }
    permission = (permission & ~deny) | allow;
    overwrite = channel && channel.permissionOverwrites.get(member.id);
    if (overwrite) {
      permission = (permission & ~overwrite.deny) | overwrite.allow;
    }
    return new Permission(permission);
  }

  toJSON(props = []) {
    return super.toJSON([
      "flags",
      "name",
      "parentID",
      "type",
      ...props,
    ]);
  }
}

module.exports = GuildChannel;

const ThreadChannel = require("./ThreadChannel");
