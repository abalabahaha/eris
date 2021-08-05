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
  async createCommandGuild(guild, ...command) {
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
   * @returns {SlashCommand}
   */
  // eslint-disable-next-line no-unused-vars
  deleteCommandGuild(...command) {
    return this;
  }
  /**
   *
   * @param command
   * @returns {SlashCommand}
   */
  // eslint-disable-next-line no-unused-vars
  deleteCommand(...command) {
    return this;
  }

  loadCommandList() {
    this.commandList = this.client.getCommands(this.client.user.id);
    this.client.emit('commandListLoaded', (this.commandList));
    return this;
  }

  startQueue(command) {
    this.client.emit('startQueueCommand', (command, true));
    this.client.createCommand(command, this.client.user.id)
      .then((commandReady) => {
        this.update(command, commandReady);
      })
      .catch((error) => {
        this.failQueue(command, error);
      });

  }

  failQueue(command, error) {
    this.client.emit('commandError', (command, error));
    this.nextCommand();
  }
  update(commandOld, commandNew) {
    if (this.commandList instanceof CommandList) {
      if (!(this.commandList.commandList.get(commandOld.name) == null)) {
        const dataOld = JSON.stringify(this.commandList.commandList.get(commandOld.name)).toString();
        const dataNew = new CommandBase(commandNew);


        if (dataOld === dataNew) {
          this.client.createCommand(commandNew, this.client.user.id).then((command) => {
            this.client.emit('commandUpdate', (command));
          })
            .catch((error) => {
              this.failQueue(commandNew, error);
            });
        } else {
          this.commandOK(commandNew);
        }
      }
    }

    return this;
  }

  nextCommand() {
    this.queue.pop();
    this.client.emit('nextCommand', (this.queue[0]));
    if (!(this.queue.length === 0)) {
      this.startQueue(this.queue[0]);
    }
  }

  commandOK(command) {
    this.queue.pop();
    this.client.emit('commandNotUpdated', (command));
  }


}


module.exports = SlashCommand;
