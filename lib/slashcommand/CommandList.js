const CommandBase = require('./CommandBase')

class CommandList {
    constructor(data, client) {
        this.client = client
        if (data !== undefined) {
            /***
             *
             * @type {CommandBase[]}
             */
            this.commands = []

            for (let command in data) {
                this.commands.push(new CommandBase(command))
            }
        }
    }
}

module.exports = CommandList;
