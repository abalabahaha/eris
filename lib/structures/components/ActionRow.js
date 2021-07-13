

class ActionRow { 
    constructor(data) {
        this.type = 4
        this.components = []
    }

    addComponent(...component) {
        component.forEach((a) => this.components.push(a))
        return this
    }
}


module.exports = ActionRow