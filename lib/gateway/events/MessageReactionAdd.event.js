const EventCursor = require('../../util/EventCursor');
class MessageReactionAdd extends EventCursor {
  constructor(data, client, shardController) {
    super('MESSAGE_REACTION_ADD', data, data, client, shardController);
  }

  onEvent(packet) {
    const channel = this.client.getChannel(packet.d.channel_id);
    let message;
    let member;
    if (channel) {
      message = channel.messages.get(packet.d.message_id);
      if (channel.guild) {
        if (packet.d.member) {
          // Updates the member cache with this member for future events.
          packet.d.member.id = packet.d.user_id;
          member = channel.guild.members.update(packet.d.member, channel.guild);
        }
      }
    }
    if (message) {
      const reaction = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
      if (message.reactions[reaction]) {
        ++message.reactions[reaction].count;
        if (packet.d.user_id === this.client.user.id) {
          message.reactions[reaction].me = true;
        }
      } else {
        message.reactions[reaction] = {
          count: 1,
          me: packet.d.user_id === this.client.user.id
        };
      }
    } else {
      message = {
        id: packet.d.message_id,
        channel: channel || { id: packet.d.channel_id }
      };

      if (packet.d.guild_id) {
        message.guildID = packet.d.guild_id;
        if (!message.channel.guild) {
          message.channel.guild = { id: packet.d.guild_id };
        }
      }
    }
    /**
     * Fired when someone adds a reaction to a message
     * @event Client#messageReactionAdd
     * @prop {Message | Object} message The message object. If the message is not cached, this will be an object with `id`, `channel`, and if inside a guild, `guildID` keys. If the channel is not cached, channel key will be an object with only an id. `guildID` will be present if the message was sent in a guild channel. No other property is guaranteed
     * @prop {Object} emoji The reaction emoji object
     * @prop {Boolean?} emoji.animated Whether the emoji is animated or not
     * @prop {String?} emoji.id The emoji ID (null for non-custom emojis)
     * @prop {String} emoji.name The emoji name
     * @prop {Member | Object} reactor The member, if the reaction is in a guild. If the reaction is not in a guild, this will be an object with an `id` key. No other property is guaranteed
     */
    this.shardController.emit('messageReactionAdd', message, packet.d.emoji, member || { id: packet.d.user_id });
    return;
  }

}

module.exports = MessageReactionAdd;
