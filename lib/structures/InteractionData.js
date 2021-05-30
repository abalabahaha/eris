"use strict";

const Base = require("./Base");

/**
* Data within an Interaction Object
* @prop {String?} id The ID of the Interaction Data Button id (Message Component), or Command Id (Slash Command)
* @prop {Number?} componentType The type of Message Component (Message Component only)
* @prop {String?} name The command name (Slash Command only)

* @prop {Object?} options The command options (Slash Command only)
* @prop {Object?} options.name The type of Message Component (Slash Command only)
*/
class InteractionData extends Base {
    constructor(data) {
        super(data.id||data.custom_id);

        if(data.component_type) {
            this.componentType = data.component_type;
        } else {
            this.componentType = null;
        } 

        if(data.options) {
            this.options = data.options;
        } else {
            this.options = null;
        } 
        
    }

}

module.exports = InteractionData;
