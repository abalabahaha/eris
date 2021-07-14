const ActionRow = require("./components/ActionRow");
const Button = require("./components/Button");
const SelectionMenu = require("./components/SelectionMenu");
const Message = require("./Message");



class MessageInteraction extends Message {
    constructor(data, client) {
        super(data, client)
        if (data?.token !== undefined) {
            this.token = data.token
        }
        if (data?.ephemeral !== undefined) {
            this.ephemeral = data?.ephemeral
        } else {
            this.ephemeral = false
        }
        if (data?.components !== undefined) {
            this.components = data.components
        }
    }

    ephemeral(ephemeral) {
        this.ephemeral = ephemeral ?? true
        return this
    }

    createMessage() {

    }

    edit() {

    }

    delete() {

    }

}

module.exports = MessageInteraction