
const CommandBase = require('./CommandBase')

class SlashCommand {
    /**
     *
     * @param client
     */
    constructor(client) {
        this.client = client
        /**
         * @description Queue of commands that are about to be checked and see if there are any changes!
         * @type {CommandBase[]}
         */
        this.queue = []
        /**
         * @description It is a queue to remove command that does not exist globally.
         * @type {*[]}
         */
        this.queueDelete = []
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

    startQueue(command) {
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
