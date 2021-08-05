const CommandBase = require('./CommandBase');

class CommandList {
  constructor(data, client) {
    this.client = client;
    if (data !== undefined) {
      /**
       * @type {Map<String, CommandBase>}
       */
      this.commands = new Map();

      for (const command of data) {
        const commandData = new CommandBase(command);
        this.commands.set(commandData.name, commandData);
      }
    }
  }
}

module.exports = CommandList;
