const EventCursor = require('../../util/EventCursor');
const { ChannelTypes } = require('../../Constants');
class VoiceStateUpdate extends EventCursor {
  constructor(data, client, shardController) {
    super('VOICE_STATE_UPDATE', data, data, client, shardController);
  }

  onEvent(packet) {
    if (packet.d.guild_id && packet.d.user_id === this.client.user.id) {
      const voiceConnection = this.client.voiceConnections.get(packet.d.guild_id);
      if (voiceConnection) {
        if (packet.d.channel_id === null) {
          this.client.voiceConnections.leave(packet.d.guild_id);
        } else if (voiceConnection.channelID !== packet.d.channel_id) {
          voiceConnection.switchChannel(packet.d.channel_id, true);
        }
      }
    }
    if (packet.d.guild_id === undefined) {
      packet.d.id = packet.d.user_id;
      if (packet.d.channel_id === null) {
        let flag = false;
        for (const groupChannel of this.client.groupChannels) {
          const call = (groupChannel[1].call || groupChannel[1].lastCall);
          if (call && call.voiceStates.remove(packet.d)) {
            flag = true;
            return;
          }
        }
        if (!flag) {
          for (const privateChannel of this.client.privateChannels) {
            const call = (privateChannel[1].call || privateChannel[1].lastCall);
            if (call && call.voiceStates.remove(packet.d)) {
              flag = true;
              return;
            }
          }
          if (!flag) {
            this.shardController.emit('debug', new Error('VOICE_STATE_UPDATE for user leaving call not found'));
            return;
          }
        }
      } else {
        const channel = this.client.getChannel(packet.d.channel_id);
        if (!channel.call && !channel.lastCall) {
          this.shardController.emit('debug', new Error('VOICE_STATE_UPDATE for untracked call'));
          return;
        }
        (channel.call || channel.lastCall).voiceStates.update(packet.d);
      }
      return;
    }
    const guild = this.client.guilds.get(packet.d.guild_id);
    if (!guild) {
      return;
    }
    if (guild.pendingVoiceStates) {
      guild.pendingVoiceStates.push(packet.d);
      return;
    }
    let member = guild.members.get(packet.d.id = packet.d.user_id);
    if (!member) {
      // Updates the member cache with this member for future events.
      packet.d.member.id = packet.d.user_id;
      member = guild.members.add(packet.d.member, guild);

      const channel = guild.channels.find((channel) => (channel.type === ChannelTypes.GUILD_VOICE || channel.type === ChannelTypes.GUILD_STAGE) && channel.voiceMembers.get(packet.d.id));
      if (channel) {
        channel.voiceMembers.remove(packet.d);
        this.shardController.emit('debug', 'VOICE_STATE_UPDATE member null but in channel: ' + packet.d.id, this.shardController.id);
      }
    }
    const oldState = {
      deaf: member.voiceState.deaf,
      mute: member.voiceState.mute,
      selfDeaf: member.voiceState.selfDeaf,
      selfMute: member.voiceState.selfMute,
      selfStream: member.voiceState.selfStream,
      selfVideo: member.voiceState.selfVideo
    };
    const oldChannelID = member.voiceState.channelID;
    member.update(packet.d, this.client);
    if (oldChannelID != packet.d.channel_id) {
      let oldChannel, newChannel;
      if (oldChannelID) {
        oldChannel = guild.channels.get(oldChannelID);
        if (oldChannel && oldChannel.type !== ChannelTypes.GUILD_VOICE && oldChannel.type !== ChannelTypes.GUILD_STAGE) {
          this.shardController.emit('warn', 'Old channel not a recognized voice channel: ' + oldChannelID, this.shardController.id);
          oldChannel = null;
        }
      }
      if (packet.d.channel_id && (newChannel = guild.channels.get(packet.d.channel_id)) && (newChannel.type === ChannelTypes.GUILD_VOICE || newChannel.type === ChannelTypes.GUILD_STAGE)) { // Welcome to Discord, where one can "join" text channels
        if (oldChannel) {
          /**
           * Fired when a guild member switches voice channels
           * @event Client#voiceChannelSwitch
           * @prop {Member} member The member
           * @prop {VoiceChannel | StageChannel} newChannel The new voice channel
           * @prop {VoiceChannel | StageChannel} oldChannel The old voice channel
           */
          oldChannel.voiceMembers.remove(member);
          this.shardController.emit('voiceChannelSwitch', newChannel.voiceMembers.add(member, guild), newChannel, oldChannel);
        } else {
          /**
           * Fired when a guild member joins a voice channel. This event is not fired when a member switches voice channels, see `voiceChannelSwitch`
           * @event Client#voiceChannelJoin
           * @prop {Member} member The member
           * @prop {VoiceChannel | StageChannel} newChannel The voice channel
           */
          this.shardController.emit('voiceChannelJoin', newChannel.voiceMembers.add(member, guild), newChannel);
        }
      } else if (oldChannel) {
        oldChannel.voiceMembers.remove(member);
        /**
         * Fired when a guild member leaves a voice channel. This event is not fired when a member switches voice channels, see `voiceChannelSwitch`
         * @event Client#voiceChannelLeave
         * @prop {Member?} member The member
         * @prop {VoiceChannel | StageChannel} oldChannel The voice channel
         */
        this.shardController.emit('voiceChannelLeave', member, oldChannel);
      }
    }
    if (oldState.mute !== member.voiceState.mute || oldState.deaf !== member.voiceState.deaf || oldState.selfMute !== member.voiceState.selfMute || oldState.selfDeaf !== member.voiceState.selfDeaf || oldState.selfStream !== member.voiceState.selfStream || oldState.selfVideo !== member.voiceState.selfVideo) {
      /**
       * Fired when a guild member's voice state changes
       * @event Client#voiceStateUpdate
       * @prop {Member} member The member
       * @prop {Object} oldState The old voice state
       * @prop {Boolean} oldState.deaf The previous server deaf status
       * @prop {Boolean} oldState.mute The previous server mute status
       * @prop {Boolean} oldState.selfDeaf The previous self deaf status
       * @prop {Boolean} oldState.selfMute The previous self mute status
       * @prop {Boolean} oldState.selfStream The previous self stream status
       * @prop {Boolean} oldState.selfVideo The previous self video status
       */
      this.shardController.emit('voiceStateUpdate', member, oldState);
    }
    return;
  }
}

module.exports = VoiceStateUpdate;
