const EventCursor = require('../../util/EventCursor');
class PresenceUpdate extends EventCursor {
  constructor(data, client, shardController) {
    super('PRESENCE_UPDATE', data, data, client, shardController);
  }

  onEvent(packet) {
    if (packet.d.user.username !== undefined) {
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
        /**
         * Fired when a user's username, avatar, or discriminator changes
         * @event Client#userUpdate
         * @prop {User} user The updated user
         * @prop {Object?} oldUser The old user data
         * @prop {String} oldUser.username The username of the user
         * @prop {String} oldUser.discriminator The discriminator of the user
         * @prop {String?} oldUser.avatar The hash of the user's avatar, or null if no avatar
         */
        this.shardController.emit('userUpdate', user, oldUser);
      }
    }
    if (!packet.d.guild_id) {
      packet.d.id = packet.d.user.id;
      const relationship = this.client.relationships.get(packet.d.id);
      if (!relationship) { // Removing relationships
        return;
      }
      const oldPresence = {
        game: relationship.game,
        status: relationship.status
      };
      /**
       * Fired when a guild member or relationship's status or game changes
       * @event Client#presenceUpdate
       * @prop {Member | Relationship} other The updated member or relationship
       * @prop {Object?} oldPresence The old presence data. If the user was offline when the bot started and the client option getAllUsers is not true, this will be null
       * @prop {Array<Object>?} oldPresence.activities The member's current activities
       * @prop {Object?} oldPresence.clientStatus The member's per-client status
       * @prop {String} oldPresence.clientStatus.web The member's status on web. Either "online", "idle", "dnd", or "offline". Will be "online" for bots
       * @prop {String} oldPresence.clientStatus.desktop The member's status on desktop. Either "online", "idle", "dnd", or "offline". Will be "offline" for bots
       * @prop {String} oldPresence.clientStatus.mobile The member's status on mobile. Either "online", "idle", "dnd", or "offline". Will be "offline" for bots
       * @prop {Object?} oldPresence.game The old game the other user was playing
       * @prop {String} oldPresence.game.name The name of the active game
       * @prop {Number} oldPresence.game.type The type of the active game (0 is default, 1 is Twitch, 2 is YouTube)
       * @prop {String} oldPresence.game.url The url of the active game
       * @prop {String} oldPresence.status The other user's old status. Either "online", "idle", or "offline"
       */
      this.shardController.emit('presenceUpdate', this.client.relationships.update(packet.d), oldPresence);
      return;
    }
    const guild = this.client.guilds.get(packet.d.guild_id);
    if (!guild) {
      this.shardController.emit('debug', 'Rogue presence update: ' + JSON.stringify(packet), this.shardController.id);
      return;
    }
    let member = guild.members.get(packet.d.id = packet.d.user.id);
    let oldPresence = null;
    if (member) {
      oldPresence = {
        activities: member.activities,
        clientStatus: member.clientStatus,
        game: member.game,
        status: member.status
      };
    }
    if ((!member && packet.d.user.username) || oldPresence) {
      member = guild.members.update(packet.d, guild);
      this.shardController.emit('presenceUpdate', member, oldPresence);
    }
  }
}

module.exports = PresenceUpdate;
