const CommandBase = require('./CommandBase');

class CommandList {
  constructor(data, client) {
    this.client = client;
    if (data !== undefined) {
      /**
       * @type {Map<String, CommandBase>}
       */
      this.commands = new Map();
      this.commandsData = new Map();
      this.commandsArray = [];
      for (const command of data) {

        const commandData = new CommandBase(command);
        this.commandsArray.push(commandData.data);
        this.commandsData.set(commandData.name, commandData);
        this.commands.set(commandData.name, commandData.toJSON);
      }
    }
  }
}

module.exports = CommandList;
