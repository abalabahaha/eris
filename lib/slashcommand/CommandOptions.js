const Choice = require('./Choice')


class CommandOptions {
    constructor(data) {
        if (data.name !== undefined) {
            this.name = data.name
        }
        if (data.description !== undefined) {
            this.description = data.description
        }
        if (data.type !== undefined) {
            this.type = data.type
        }
        if (data.required !== undefined) {
            this.required = data.required || false
        }
        if (data.choices !== undefined) {
            this.choices = data.choices || []
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

    /**
     *
     * @param type
     * @returns {CommandOptions}
     *
     * | Name              | Value | Note                                    |
     * |-------------------|-------|-----------------------------------------|
     * | SUB_COMMAND       | 1     |                                         |
     * | SUB_COMMAND_GROUP | 2     |                                         |
     * | STRING            | 3     |                                         |
     * | INTEGER           | 4     | Any integer between -2^53 and 2^53      |
     * | BOOLEAN           | 5     |                                         |
     * | USER              | 6     |                                         |
     * | CHANNEL           | 7     | Includes all channel types + categories |
     * | ROLE              | 8     |                                         |
     * | MENTIONABLE       | 9     | Includes users and roles                |
     * | NUMBER            | 10    | Any double between -2^53 and 2^53       |
     */
    setType(type) {
        this.type = type;
        return this
    }

    /***
     *
     * @returns {CommandOptions}
     */
    isRequired() {
        this.required = true
        return this
    }

    /**
     *
     * @param choice
     * @returns {CommandOptions}
     */
    addChoices(...choice = Choice) {
        for (let choiceElement of choice) {
            if (choiceElement instanceof Choice) {
                this.choices.push(choiceElement)
            }
        }
        return this
    }

    /**
     *
     * @param options
     * @returns {CommandOptions}
     */
    addOptions(...options = new CommandOptions()) {
        for (let optionsElement of options) {
            if (optionsElement instanceof CommandOptions) {
                this.options.push(optionsElement)
            }
        }
        return this
    }

    /**
     * @returns {{name, options: (CommandOptions), description, type, choices: (Choice[]), required: (*|boolean)}}
     */
    toJSON() {
        return {
            type: this.type,
            name: this.name,
            description: this.description,
            required: this.required,
            choices: this.choices,
            options: this.options
        }
    }



}

module.exports = CommandOptions;
