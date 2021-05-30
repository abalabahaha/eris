"use strict";

const Base = require("./Base");

/**
* Data within an Interaction Object
* @prop {Number?} componentType The type of Message Component (Message Component only)
* @prop {String?} id The ID of the Interaction Data Button id (Message Component), or Command Id (Slash Command)
* @prop {String?} name The command name (Slash Command only)
* @prop {Array<Object>?} options The run Slash Command options (Slash Command only)
* @prop {String?} options.name The name of the Slash Command option (Slash Command only)
* @prop {String?} options.value The value of the run Slash Command (Slash Command only)
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
