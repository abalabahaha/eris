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
        if (data?.components !== undefined) {
            this.components = []
            data.components.forEach((component) => {
                if (component.type !== undefined) {
                    switch (component.type) {
                        case 1:
                            this.components.push(new ActionRow(component))
                        break;
                        case 2:
                            this.components.push(new Button(component))
                        break;
                        case 3:
                            this.components.push(new SelectionMenu(component))
                        break;
                    }
                }
            })
        }
    }
}

module.exports = MessageInteraction