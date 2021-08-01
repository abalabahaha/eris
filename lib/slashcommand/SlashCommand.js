
const CommandBase = require('./CommandBase')

class SlashCommand {
    constructor(client) {
        this.client = client
        /**
         *
         * @type {CommandBase[]}
         */
        this.queue = []
    }

    /**
     *
     * @param command
     * @returns {SlashCommand}
     */
    createCommand(...command) {
        for (let commandElement of command) {
            if (commandElement instanceof CommandBase) {
                this.queue.push(commandElement)
            }
        }
        return this
    }

    /**
     *
     * @param command
     * @returns {SlashCommand}
     */
    deleteCommand(...command) {
        for (let commandElement of command) {
            if (commandElement instanceof CommandBase) {
                this.queue.remove(commandElement)
            }
        }
        return this
    }
}


module.exports = SlashCommand
