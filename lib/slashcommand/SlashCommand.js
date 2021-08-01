
const CommandBase = require('./CommandBase')

class SlashCommand {
    /**
     *
     * @param client
     */
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
        for (let commandElement in command) {
            if (commandElement instanceof CommandBase) {
                this.queue.push(commandElement)
            }
        }
        return this
    }

    startQueue() {
        this.client.emit('startQueueCommand', (true))
        this.client.emit('commandUpdate', (commandBase))
    }

    /**
     *
     * @param command
     * @returns {SlashCommand}
     */
    deleteCommand(...command) {
        for (let commandElement in command) {
            if (commandElement instanceof CommandBase) {
                this.queue.remove(commandElement)
            }
        }
        return this
    }
}


module.exports = SlashCommand
