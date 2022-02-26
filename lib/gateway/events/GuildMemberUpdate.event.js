const EventCursor = require('../../util/EventCursor');
const Constants = require('../../Constants');
class GuildMemberUpdate extends EventCursor {
  constructor(data, client, shardController) {
    super('GUILD_MEMBER_UPDATE', data, data, client, shardController);
  }

  onEvent(packet) {
    // Check for member update if guildPresences intent isn't set, to prevent emitting twice
    if (!(this.client.options.intents & Constants.Intents.guildPresences) && packet.d.user.username !== undefined) {
      let user = this.client.users.get(packet.d.user.id);
      let oldUser = null;
      if (user && (user.username !== packet.d.user.username || user.avatar !== packet.d.user.avatar || user.discriminator !== packet.d.user.discriminator)) {
        oldUser = {
          username: user.username,
          discriminator: user.discriminator,
          avatar: user.avatar
        };
      }
      if (!user || oldUser) {
        user = this.client.users.update(packet.d.user, this.client);
        this.shardController.emit('userUpdate', user, oldUser);
      }
    }
    const guild = this.client.guilds.get(packet.d.guild_id);
    if (!guild) {
      this.shardController.emit('debug', `Missing guild ${packet.d.guild_id} in GUILD_MEMBER_UPDATE`);
      return;
    }
    let member = guild.members.get(packet.d.id = packet.d.user.id);
    let oldMember = null;
    if (member) {
      oldMember = {
        roles: member.roles,
        nick: member.nick,
        premiumSince: member.premiumSince,
        pending: member.pending
      };
    }
    member = guild.members.update(packet.d, guild);
    /**
     * Fired when a member's roles or nickname are updated or they start boosting a server
     * @event Client#guildMemberUpdate
     * @prop {Guild} guild The guild
     * @prop {Member} member The updated member
     * @prop {Object?} oldMember The old member data
     * @prop {Array<String>} oldMember.roles An array of role IDs this member is a part of
     * @prop {String?} oldMember.nick The server nickname of the member
     * @prop {Number} oldMember.premiumSince Timestamp of when the member boosted the guild
     * @prop {Boolean?} oldMember.pending Whether the member has passed the guild's Membership Screening requirements
     */
    this.shardController.emit('guildMemberUpdate', guild, member, oldMember);
    return;
  }

}

module.exports = GuildMemberUpdate;
