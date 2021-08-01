

class CommandBase {
    /**
     *
     * @param data
     */
    constructor(data) {
        if (data.name !== undefined) {
            /**
             *
             * @type {string}
             */
            this.name = data.name || ''
        }
        if (data.description !== undefined) {
            /**
             *
             * @type {string|string}
             */
            this.description = data.description || ''
        }
        if (data.options !== undefined) {
            /**
             *
             * @type {CommandOptions|*[]}
             */
            this.options = data.options || []
            for (let dataKey in data.options) {
                this.options.push(new CommandOptions(dataKey))
            }
        }
    }
    /**
     *
     * @param name
     * @returns {CommandOptions}
     */
    setName(name) {
        this.name = name
        return this
    }

    /**
     *
     * @param description
     * @returns {CommandOptions}
     */
    setDescription(description) {
        this.description = description
        return this
    }


}

module.exports = CommandBase
