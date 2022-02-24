const EventCursor = require('../../util/EventCursor');

class GuildMembersChunk extends EventCursor {
  constructor(data, client, shardController) {
    super('GUILD_MEMBERS_CHUNK', data, data, client, shardController);
  }

  onEvent(packet) {
    const guild = this.client.guilds.get(packet.d.guild_id);
    if (!guild) {
      this.shardController.emit('debug', `Received GUILD_MEMBERS_CHUNK, but guild ${packet.d.guild_id} is ` + (this.client.unavailableGuilds.has(packet.d.guild_id) ? 'unavailable' : 'missing'), this.id);
      return;
    }

    const members = packet.d.members.map((member) => {
      member.id = member.user.id;
      return guild.members.add(member, guild);
    });

    if (packet.d.presences) {
      packet.d.presences.forEach((presence) => {
        const member = guild.members.get(presence.user.id);
        if (member) {
          member.update(presence);
        }
      });
    }

    if (this.shardController.requestMembersPromise.hasOwnProperty(packet.d.nonce)) {
      this.shardController.requestMembersPromise[packet.d.nonce].members.push(...members);
    }

    if (packet.d.chunk_index >= packet.d.chunk_count - 1) {
      if (this.shardController.requestMembersPromise.hasOwnProperty(packet.d.nonce)) {
        clearTimeout(this.shardController.requestMembersPromise[packet.d.nonce].timeout);
        this.shardController.requestMembersPromise[packet.d.nonce].res(this.shardController.requestMembersPromise[packet.d.nonce].members);
        delete this.shardController.requestMembersPromise[packet.d.nonce];
      }
      if (this.shardController.getAllUsersCount.hasOwnProperty(guild.id)) {
        delete this.shardController.getAllUsersCount[guild.id];
        this.shardController.checkReady();
      }
    }

    /**
     * Fired when Discord sends member chunks
     * @event Client#guildMemberChunk
     * @prop {Guild} guild The guild the chunked members are in
     * @prop {Array<Member>} members The members in the chunk
     */
    this.shardController.emit('guildMemberChunk', guild, members);

    this.shardController.lastHeartbeatAck = true;

    return;
  }

}

module.exports = GuildMembersChunk;
