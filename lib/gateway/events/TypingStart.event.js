const EventCursor = require('../util/EventCursor');

class TypingStart extends EventCursor {
  constructor(data, client, shardController) {
    super('TYPING_START', data, data, client, shardController);
  }

  onEvent(packet) {
    let member = null;
    const guild = this.client.guilds.get(packet.d.guild_id);
    if (guild) {
      packet.d.member.id = packet.d.user_id;
      member = guild.members.update(packet.d.member, guild);
    }
    if (this.client.listeners('typingStart').length > 0) {
      /**
       * Fired when a user begins typing
       * @event Client#typingStart
       * @prop {PrivateChannel | TextChannel | NewsChannel | Object} channel The text channel the user is typing in. If the channel is not cached, this will be an object with an `id` key. No other property is guaranteed
       * @prop {User | Object} user The user. If the user is not cached, this will be an object with an `id` key. No other property is guaranteed
       * @prop {Member?} member The guild member, if typing in a guild channel, or `null`, if typing in a PrivateChannel
       */
      this.shardController.emit('typingStart', this.client.getChannel(packet.d.channel_id) || { id: packet.d.channel_id }, this.client.users.get(packet.d.user_id) || { id: packet.d.user_id }, member);
    }
    return;
  }

}

module.exports = TypingStart;
