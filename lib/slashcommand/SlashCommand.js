const CommandBase = require('./CommandBase');
const CommandList = require('./CommandList');

class SlashCommand {
  /**
   *
   * @param client
   */
  constructor(client) {
    /***
     *
     */
    this.client = client;
    /**
     * @description Queue of commands that are about to be checked and see if there are any changes!
     * @type {CommandBase[]}
     */
    this.queue = [];
    this.commandList = null;
  }

  get getCommandList() {
    return this.commandList;
  }

  /**
   *
   * @param command
   * @returns {Promise<SlashCommand>}
   */
  async createCommand(...command) {
    await this.loadCommandList();
    if (this.commandList == null) {
      throw new Error('Unable to load command list.');
    }
    for (const commandElement of command) {
      this.queue.push(commandElement);
    }
    if (!(this.queue.length === 0)) {
      this.startQueue(this.queue[0]);
    }
    return this;
  }

  /**
   *
   * @param command
   * @returns {Promise<SlashCommand>}
   */
  // eslint-disable-next-line no-dupe-class-members
  async createCommand(command) {
    this.loadCommandList().then((load) => {
      if (this.commandList == null) {
        throw new Error('Unable to load command list.');
      }
      for (const commandElement of command) {
        this.queue.push(commandElement);
      }
      if (!(this.queue.length === 0)) {
        this.startQueue(this.queue[0]);
      }
    });

    return this;
  }

  /**
   *
   * @param command
   * @returns {SlashCommand}
   */
  // eslint-disable-next-line no-unused-vars
  async deleteCommand({ command, guildID }) {
    if (guildID !== undefined) {
      return this.deleteCommandsGuild({
        command: command.id ?? command,
        guildID: guildID.id ?? guildID
      });
    }
    return this.client.deleteCommand(command);
  }


  /**
   *
   * @param command
   * @returns {SlashCommand}
   */
  // eslint-disable-next-line no-unused-vars,no-dupe-class-members
  async deleteCommand(command) {
    return this.client.deleteCommands(command, this.client.user.id);
  }


  /**
   *
   * @param command
   * @returns {SlashCommand}
   */
  // eslint-disable-next-line no-unused-vars,no-dupe-class-members
  async deleteCommand(commandID, guildID) {
    return this.client.deleteCommandsGuild({
      commandID, guildID
    });
  }

  async loadCommandList() {
    const data = await this.client.getCommands(this.client.user.id);

    this.commandList = new CommandList(data, this.client);

    return this;
  }

  startQueue(command) {
    this.client.emit('startQueueCommand', command, true);

    this.update(command, this.commandList.commands.get(command.name));
  }

  failQueue(command, error) {
    this.client.emit('commandError', command, error);
    this.nextCommand();
  }

  update(commandOld, commandNew) {
    if (this.commandList instanceof CommandList) {
      if (this.commandList.commands.get(commandOld.name) == null) {
        this.client.createCommand(commandOld, this.client.user.id).then((command) => {
          this.commandOK(command);
        }).catch((error) => {
          this.failQueue(commandOld, error);
        });

      } else {
        const dataOld = JSON.stringify(commandOld.data).toString();
        const dataNew = JSON.stringify(
          new CommandBase(commandNew).data
        ).toString();



        if (dataOld === dataNew) {
          this.commandOK(commandNew);
        } else {
          this.client
            .updateCommand(commandOld, commandNew.id, this.client.user.id)
            .then((command) => {
              this.client.emit('commandUpdate', command);
              this.nextCommand();
            })
            .catch((error) => {
              this.failQueue(commandNew, error);
            });
        }
      }
    }

    return this;
  }

  nextCommand() {
    this.queue.shift();
    this.client.emit('nextCommand', this.queue[0]);
    if (!(this.queue.length === 0)) {
      setTimeout(() =>  this.startQueue(this.queue[0]), 7 * 1000);
    }
  }

  commandOK(command) {
    this.client.emit('commandNotUpdated', command);
    this.nextCommand();
  }
}

module.exports = SlashCommand;
