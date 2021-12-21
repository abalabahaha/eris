const EventCursor = require('../../util/EventCursor');

class GuildSync extends EventCursor {
  constructor(data, client, shardController) {
    super('GUILD_SYNC', data, data, client, shardController);
  }

  onEvent(packet) {
    const guild = this.client.guilds.get(packet.d.id);
    for (const member of packet.d.members) {
      member.id = member.user.id;
      guild.members.add(member, guild);
    }
    for (const presence of packet.d.presences) {
      if (!guild.members.get(presence.user.id)) {
        let userData = this.client.users.get(presence.user.id);
        if (userData) {
          userData = `{username: ${userData.username}, id: ${userData.id}, discriminator: ${userData.discriminator}}`;
        }
        this.shardController.emit('debug', `Presence without member. ${presence.user.id}. In global user cache: ${userData}. ` + JSON.stringify(presence), this.shardController.id);
        continue;
      }
      presence.id = presence.user.id;
      guild.members.update(presence);
    }
    if (guild.pendingVoiceStates && guild.pendingVoiceStates.length > 0) {
      for (const voiceState of guild.pendingVoiceStates) {
        if (!guild.members.get(voiceState.user_id)) {
          continue;
        }
        voiceState.id = voiceState.user_id;
        const channel = guild.channels.get(voiceState.channel_id);
        if (channel) {
          channel.voiceMembers.add(guild.members.update(voiceState));
          if (this.client.options.seedVoiceConnections && voiceState.id === this.client.user.id && !this.client.voiceConnections.get(channel.guild ? channel.guild.id : 'call')) {
            this.client.joinVoiceChannel(channel.id);
          }
        } else { // Phantom voice states from connected users in deleted channels (╯°□°）╯︵ ┻━┻
          this.client.emit('debug', 'Phantom voice state received but channel not found | Guild: ' + guild.id + ' | Channel: ' + voiceState.channel_id);
        }
      }
    }
    guild.pendingVoiceStates = null;
    --this.shardController.unsyncedGuilds;
    this.shardController.checkReady();
    return;
  }

}

module.exports = GuildSync;
