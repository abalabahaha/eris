

class CommandBase {
    constructor(data) {
        if (data.name !== undefined) {
            this.name = data.name
        }
        if (data.description !== undefined) {
            this.description = data.description
        }
        if (data.options !== undefined) {
            this.options = data.options || []
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
