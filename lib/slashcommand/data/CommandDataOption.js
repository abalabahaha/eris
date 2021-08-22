class CommandDataOption {
  constructor(commandFolder, data, guild) {
    this.commandFolder = commandFolder;
    this.options = [];
    this.ok = false;
    if (data?.type !== undefined) {
      this.type = data.type;
    }
    switch (data.type) {
      case 1:
        commandFolder.commandNameArray.push(data.name);
        break;
      case 2:
        commandFolder.commandNameArray.push(data.name);
        break;
      default:
        commandFolder.addMap(data.name, this);
    }
    if (data.name !== undefined) {
      this.name = data.name;
    }
    this.ids = [];
    this.typeOfValue = this.checkType(data?.value ?? null, data?.value ?? null, guild);
    this.member = this.searchItem(data?.value, guild, 'user') ?? null;
    this.channel = this.searchItem(data?.value, guild, 'channel') ?? null;
    this.role = this.searchItem(data?.value, guild, 'role') ?? null;
    this.mentionEmoji = [];
    if (data.value !== undefined) {
      if (this.ok === false) {
        this.value = data.value;
      }
    }
    if (data.name !== undefined) {
      this.name = data.name;
    }

    if (data?.options !== undefined) {
      for (const option of data.options ?? data) {
        this.options.push(new CommandDataOption(commandFolder, option, guild));
      }
    }
    this.commandFolder.updateName();
  }
  checkType(value, id, guild) {
    if (guild !== undefined) {
      if (id !== undefined) {
        if (!(guild.roles.get(id) == null)) {
          return 'role';
        }
        if (!(guild.members.get(id) == null)) {
          return 'user';
        }
        if (!(guild.channels.get(id) == null)) {
          return 'channel';
        }
      }
    }
    if (typeof value === 'string') {
      return 'string';
    }
    if (typeof value === 'number') {
      return 'number';
    }
    if (typeof value === 'bigint') {
      return 'bigint';
    }
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    return 'unknown';
  }
  searchItem(id, guild, nameOfItem) {
    if (guild !== undefined) {
      if (guild.members.get(id) !== null) {
        if (nameOfItem === 'user') {
          return guild.members.get(id);
        }
      }
      if (guild.roles.get(id) !== null) {
        if (nameOfItem === 'role') {
          return guild.roles.get(id);
        }
      }
      if (guild.channels.get(id) !== null) {
        if (nameOfItem === 'channel') {
          return guild.channels.get(id);
        }
      }
    }
    return null;
  }

}

module.exports = CommandDataOption;
