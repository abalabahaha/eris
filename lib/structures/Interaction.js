const MessageInteraction = require('./MessageInteraction');
const HookInteraction = require('../hooks/HookInteraction');
const CommandFolder = require('../slashcommand/data/CommandFolder');




class Interaction {
  constructor(data, client, guild, member, channel) {
    if (data?.type !== undefined) {
      this.type = data.type;
    }
    if (data?.application_id !== undefined) {
      this.applicationID = data.application_id;
    }
    if (data?.token !== undefined) {
      this.token = data.token;
    }
    if (data?.member !== undefined) {
      this.member = member || this.member;
    }
    if (data?.id !== undefined) {
      this.id = data.id;
    }
    if (data?.guild_id !== undefined) {
      this.guild = guild || data.guild_id;
    }
    if (data?.message !== undefined) {
      this.message = new MessageInteraction(data?.message, client);
    }
    if (data?.data !== undefined) {
      this.hook = new HookInteraction(client, this);
      this.command = new CommandFolder(data.data, guild);
    }
    if (data?.channel !== undefined) {
      this.channel = channel || data.channel_id;
    }
    if (client !== undefined) {
      this.client = client;
    }

  }
}

module.exports = Interaction;
