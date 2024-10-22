"use strict";

const Base = require("./Base");

/**
 * Represents an Auto Moderation Rule
 * @prop {Array<Object>} actions The actions that will be executed if the rule is triggered
 * @prop {Object?} actions[].metadata Additional data used when an action is executed
 * @prop {String?} actions[].metadata.channelID The channel where user content will be logged (action type 2 only)
 * @prop {String?} actions[].metadata.customMessage Optional custom message up to 150 characters that will be shown to users when their message gets blocked (action type 1 only)
 * @prop {Number?} actions[].metadata.durationSeconds Timeout duration in seconds, up to 4 weeks (action type 3 only)
 * @prop {User} creator The user that created the Auto Moderation rule. If the user is uncached, this will be an object with an id key. No other properties are guaranteed
 * @prop {Boolean} enabled Whether the rule is enabled or not
 * @prop {Number} eventType Whether this rule applies for message sends (1) or member updates (2)
 * @prop {Array<String>} exemptChannels A list of channel IDs that aren't affected by this rule
 * @prop {Array<String>} exemptRoles A list of role IDs that aren't affected by this rule
 * @prop {Guild} guild The guild which this rule applies to. If the guild is uncached, this will be an object with an id key. No other properties are guaranteed
 * @prop {String} id The Auto Moderation Rule ID
 * @prop {String} name The name of this rule
 * @prop {Object} triggerMetadata Additional data used to determine whether a rule is triggered or not
 * @prop {Array<String>?} triggerMetadata.allowList Substrings which shouldn't trigger this rule (trigger types 1, 4 and 6 only). Max of 100 for types 1 and 6, max of 1000 for type 4
 * @prop {Array<String>?} triggerMetadata.keywordFilter Substrings which should trigger this rule (trigger types 1 and 6 only). Max of 1000
 * @prop {Boolean?} triggerMetadata.mentionRaidProtectionEnabled Whether to automatically detect mention raids
 * @prop {Number?} triggerMetadata.mentionTotalLimit The number of unique roles/user mentions allowed per message. Max of 50
 * @prop {Array<Number>?} triggerMetadata.presets The predefined wordsets which should trigger this rule. 1 for profanity, 2 for sexual content, 3 for slurs
 * @prop {Array<String>?} triggerMetadata.regexPatterns Rust flavored Regex patterns which should trigger this rule. Max of 10
 * @prop {Number} triggerType The type of content which triggers this rule
 */
class AutoModerationRule extends Base {
  constructor(data, client) {
    super(data.id);
    this._client = client;
    this.guild = client.guilds.get(data.guild_id) || { id: data.guild_id };
    this.creator = client.users.get(data.creator_id) || { id: data.creator_id };
    this.triggerType = data.trigger_type;

    this.update(data);
  }

  update(data) {
    if (data.name !== undefined) {
      this.name = data.name;
    }
    if (data.event_type !== undefined) {
      this.eventType = data.event_type;
    }
    if (data.trigger_metadata !== undefined) {
      if (data.trigger_metadata.keyword_filter !== undefined) {
        data.trigger_metadata.keywordFilter = data.trigger_metadata.keyword_filter;
        delete data.trigger_metadata.keyword_filter;
      }
      if (data.trigger_metadata.regex_patterns !== undefined) {
        data.trigger_metadata.regexPatterns = data.trigger_metadata.regex_patterns;
        delete data.trigger_metadata.regex_patterns;
      }
      if (data.trigger_metadata.allow_list !== undefined) {
        data.trigger_metadata.allowList = data.trigger_metadata.allow_list;
        delete data.trigger_metadata.allow_list;
      }
      if (data.trigger_metadata.mention_total_limit !== undefined) {
        data.trigger_metadata.mentionTotalLimit = data.trigger_metadata.mention_total_limit;
        delete data.trigger_metadata.mention_total_limit;
      }
      if (data.trigger_metadata.mention_raid_protection_enabled !== undefined) {
        data.trigger_metadata.mentionRaidProtectionEnabled = data.trigger_metadata.mention_raid_protection_enabled;
        delete data.trigger_metadata.mention_raid_protection_enabled;
      }
      this.triggerMetadata = data.trigger_metadata;
    }
    if (data.actions !== undefined) {
      this.actions = data.actions.map((action) => {
        if (action.metadata) {
          if (action.metadata.channel_id !== undefined) {
            action.metadata.channelID = action.metadata.channel_id;
            delete action.metadata.channel_id;
          }
          if (action.metadata.duration_seconds !== undefined) {
            action.metadata.durationSeconds = action.metadata.duration_seconds;
            delete action.metadata.duration_seconds;
          }
          if (action.metadata.custom_message !== undefined) {
            action.metadata.customMessage = action.metadata.custom_message;
            delete action.metadata.custom_message;
          }
        }
        return action;
      });
    }
    if (data.enabled !== undefined) {
      this.enabled = data.enabled;
    }
    if (data.exempt_roles !== undefined) {
      this.exemptRoles = data.exempt_roles;
    }
    if (data.exempt_channels !== undefined) {
      this.exemptChannels = data.exempt_channels;
    }
  }

  /**
   * Delete the auto moderation rule
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  delete(reason) {
    return this._client.deleteAutoModerationRule.call(this._client, this.guild.id, this.id, reason);
  }

  /**
   * Edit an existing auto moderation rule
   * @arg {Object} options The properties to edit
   * @arg {Array<Object>} [options.actions] The [actions](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object) done when the rule is violated
   * @arg {Boolean} [options.enabled=false] If the rule is enabled, false by default
   * @arg {Number} [options.eventType] The [event type](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-event-types) for the rule
   * @arg {Array<String>} [options.exemptChannels] Any channels where this rule does not apply
   * @arg {Array<String>} [options.exemptRoles] Any roles to which this rule does not apply
   * @arg {String} [options.name] The name of the rule
   * @arg {Object} [options.triggerMetadata] The [trigger metadata](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata) for the rule
   * @arg {Number} [options.triggerType] The [trigger type](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-types) of the rule
   * @arg {String} [options.reason] The reason to be displayed in audit logs
   * @returns {Promise<AutoModerationRule>}
   */
  edit(options) {
    return this._client.editAutoModerationRule.call(this._client, this.guild.id, this.id, options);
  }

  toJSON(props = []) {
    return super.toJSON([
      "actions",
      "creator",
      "enabled",
      "eventType",
      "exemptChannels",
      "exemptRoles",
      "name",
      "triggerMetadata",
      "triggerType",
      ...props,
    ]);
  }
}

module.exports = AutoModerationRule;
