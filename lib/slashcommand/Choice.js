

class Choice {
    /**
     *
     * @param data
     */
    constructor(data) {
        if (data.name !== undefined) {
            this.name = data.name
        }
        if (data.value !== undefined) {
            this.value = data.value
        }
    }

    /**
     *
     * @param name
     * @returns {Choice}
     */
    setName(name) {
        this.name = name
        return this
    }

    /**
     *
     * @param value
     * @returns {Choice}
     */
    setValue(value) {
        this.value = value
        return this
    }

    /**
     *
     * @returns {{name, value}}
     */
    toJSON() {
        return {
            name: this.name,
            value: this.value
        }
    }
}

module.exports = Choice;
