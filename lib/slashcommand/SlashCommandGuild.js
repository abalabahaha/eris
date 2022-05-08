const CommandBase = require('./CommandBase');
const SlashCommand = require('./SlashCommand');
const CommandList = require('./CommandList');

class SlashCommandGuild extends SlashCommand {
  constructor(client, guild) {
    super(client);
    this.guild = guild;
    this.client = client;
  }

  /**
   *
   * @param command
   * @returns {SlashCommand}
   */
  update(commandOld, commandNew) {
    if (this.commandList instanceof CommandList) {
      if (!(this.commandList.commands.get(commandOld.name) == null)) {
        const dataOld = JSON.stringify(commandOld.data).toString();

        const dataNew = JSON.stringify(
          new CommandBase(commandNew).data
        ).toString();

        if (dataOld === dataNew) {
          this.commandOK(commandNew);
        } else {
          this.client
            .updateCommandGuild({
              command: commandOld,
              commandID: commandNew.id,
              guildID: commandNew.id
            })
            .then((command) => {
              this.nextCommand();
              this.client.emit(
                `commandUpdate-${this.guild.id}`,
                command,
                this.guild
              );
            })
            .catch((error) => {
              this.failQueue(commandNew, error);
            });
        }
      } else {
        this.client.createCommandGuild({
          command: commandOld,
          guildID: this.guild.id
        });
      }
    }

    return this;
  }
  commandOK(command) {
    this.client.emit(`commandNotUpdated-${this.guild.id}`, command, this.guild);
    this.nextCommand();
  }
  /**
   *
   * @param command
   * @returns {Promise<SlashCommand>}
   */
  // eslint-disable-next-line no-unused-vars
  async createCommand(...command) {
    throw new Error(
      `This method is totally disabled! SlashCommandGuild[${this.guild.id}](createCommand)`
    );
  }
  /**
   *
   * @param command
   * @returns {Promise<SlashCommand>}
   */
  async createCommandGuild({ ...command }) {
    await this.loadCommandList();
    if (this.commandList == null) {
      throw new Error(`Unable to load command list. (Guild: ${this.guild.id})`);
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
  async deleteCommand(command) {
    throw new Error(
      `This method is totally disabled! SlashCommandGuild[${this.guild.id}](deleteCommand)`
    );
  }
  // eslint-disable-next-line no-unused-vars
  deleteCommandGuild({ command, id }) {
    if (command instanceof CommandBase) {
      if (command.id !== undefined) {
        return this.client.deleteCommandsGuild({
          commandID: command.id,
          guildID: this.guild.id
        });
      } else {
        this.client.deleteCommandsGuild({
          commandID: id,
          guildID: this.guild.id
        });
      }
    }
    return this.client.deleteCommandsGuild({
      commandID: command,
      guildID: this.guild.id
    });
  }

  failQueue(command, error) {
    this.client.emit(
      `commandError-${this.guild.id}`,
      command,
      error,
      this.guild
    );
    this.nextCommand();
  }
  async loadCommandList() {
    const data = await this.client.getCommandsGuild({
      id: this.client.user.id,
      guildID: this.guild.id
    });

    this.commandList = new CommandList(data, this.client);

    return this;
  }

  nextCommand() {
    this.queue.shift();
    this.client.emit(`nextCommand-${this.guild.id}`, this.queue[0], this.guild);
    if (!(this.queue.length === 0)) {
      setTimeout(() => this.startQueue(this.queue[0]), 900);
    }
  }
  startQueue(command) {
    this.client.emit(
      `startQueueCommand-${this.guild.id}`,
      command,
      this.guild,
      true
    );
    this.update(command, this.commandList.commands.get(command.name));
  }
}

module.exports = SlashCommandGuild;
