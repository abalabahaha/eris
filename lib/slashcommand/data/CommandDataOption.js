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
    if (data.value !== undefined) {
      if (guild !== undefined) {
        if (!(guild.members.get(data.value) == null)) {
          this.ok = true;
          this.value = guild.members.get(data.value);
        }
        if (!(guild.channels.get(data.value) == null)) {
          this.ok = true;
          this.value = guild.channels.get(data.value);
        }
        if (!(guild.voiceStates.get(data.value) == null)) {
          this.ok = true;
          this.value = guild.voiceStates.get(data.value);
        }
      }
      if (this.ok === false) {
        this.value = data.value;
      }
    }
    if (data.name !== undefined) {
      this.name = data.name;
    }

    if (data?.options !== undefined) {
      for (const option of data.options ?? data) {
        this.options.push(new CommandDataOption(commandFolder, option));
      }
    }
    this.commandFolder.updateName();
  }
}

module.exports = CommandDataOption;
