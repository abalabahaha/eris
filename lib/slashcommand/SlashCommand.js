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
    this.commandRequested = 0;
    this.time = 15 * 1000;
    this.commandList = null;
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
  get getCommandList() {
    return this.commandList;
  }

  /**
   *
   * @param commands
   * @returns {Promise<SlashCommand>}
   */
  async addVolumeOfCommands(commands) {
    await this.loadCommandList();
    let keys = 0;
    if (Array.isArray(commands)) {
      const queueData = [];
      for (const commandsKey of commands) {
        if (commandsKey instanceof CommandBase) {
          const data = JSON.stringify(commandsKey.toJSON);

          const getCommandBlock = this.commandList.commandsData.get(commandsKey.name);
          if (getCommandBlock !== undefined) {
            const data_command = JSON.stringify(getCommandBlock.data);
            if (data == data_command) {
              queueData.push(commandsKey.toJSON);
            } else {
              keys++;
              queueData.push(commandsKey.toJSON);
            }
          } else {
            // eslint-disable-next-line no-unused-vars
            keys++;
            queueData.push(commandsKey.toJSON);
          }
        }
      }
      if (0 < keys) {
        if (0 < queueData.length) {
          this.client.addVolumeOfCommands(queueData, this.client.user.id);
        }
      }
      return this;
    } else {
      throw Error('This is not an array. [Eris.slashCommand(addVolumeOfCommands)]');
    }
  }
  commandOK(command) {
    this.client.emit('commandNotUpdated', command);
    this.nextCommand();
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
    this.loadCommandList().then(() => {
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

  failQueue(command, error) {
    this.client.emit('commandError', command, error);
    this.nextCommand();
  }
  async loadCommandList() {
    const data = await this.client.getCommands(this.client.user.id);

    this.commandList = new CommandList(data, this.client);

    return this;
  }

  nextCommand() {
    this.queue.shift();
    this.client.emit('nextCommand', this.queue[0]);
    if (!(this.queue.length === 0)) {
      setTimeout(() => this.startQueue(this.queue[0]), 7 * 1000);
    }
  }
  startQueue(command) {
    this.commandRequested++;
    if (this.commandRequested > 30) {
      setTimeout(() => {
        this.client.emit('startQueueCommand', command, true);
        this.update(command, this.commandList.commands.get(command.name));
      }, this.time);
    } else {
      this.client.emit('startQueueCommand', command, true);
      this.update(command, this.commandList.commands.get(command.name));
    }
  }
}

module.exports = SlashCommand;
