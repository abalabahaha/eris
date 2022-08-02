const MessageInteraction = require('./MessageInteraction');
const HookInteraction = require('../hooks/HookInteraction');
const CommandFolder = require('../slashcommand/data/CommandFolder');
const Member = require('./Member');
const EventEmitter = require('events');
const AutoComplete = require('../slashcommand/autocomplete/AutoComplete');

class Interaction extends EventEmitter {
  constructor(data, client, guild, member, channel, isHttp) {
    super();
    if (data?.type !== undefined) {
      this.type = data.type;
    }
    if (data?.isHttp !== undefined) {
      this.isHttp = isHttp;
    } else {
      this.isHttp = false;
    }
    if (data?.application_id !== undefined) {
      this.applicationID = data.application_id;
    }
    if (data?.token !== undefined) {
      this.token = data.token;
    }
    if (data?.app_permissions !== undefined) {
      this.appPermissions = data.app_permissions;
    }
    if (data?.member !== undefined) {
      this.member = guild.members.get(data?.member?.user?.id) ?? new Member(data?.member, guild, client);
    }
    if (data?.id !== undefined) {
      this.id = data.id;
    }
    if (data?.guild_id !== undefined) {
      this.guild = guild ?? data.guild_id;
    }
    if (data?.message !== undefined) {
      this.message = new MessageInteraction(data?.message, client) ?? data?.message;
    }
    if (data?.data !== undefined) {
      this.hook = new HookInteraction(client, this);
      this.command = new CommandFolder(data.data, guild) ?? null;
      if (this.type == 4) {
        this.autoComplete = new AutoComplete(this);
      }
    }
    if (data?.channel_id !== undefined) {
      this.channel = guild.channels.get(data.channel_id) ?? data?.channel_id;
    }
    if (client !== undefined) {
      this.client = client ?? null;
    }
  }

  get author() {
    if (this.member !== undefined) {
      return this.member;
    } else {
      return null;
    }
  }
}

module.exports = Interaction;
