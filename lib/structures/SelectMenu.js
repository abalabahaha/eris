"use strict";

class SelectMenu {
    constructor(){
        this.type = 3

    }

/**
 * 
 * @param {String} custom_id The button's custom id
 * @returns {SelectMenu}
 */    
setCustomID(custom_id) {
        this.custom_id = custom_id;
        return this;
}

/**
 * 
 * @param {Array<Object>} options The options to add
 * @returns {SelectMenu}
 */
addOptions(options){
    if (!Array.isArray(options)) 
    throw new Error(`Options must be a Array !`)
this.options = options
return this
}

/**
 * 
 * @param {String} placeholder Custom placeholder text to display when nothing is selected
 * @returns {SelectMenu}
 */
setPlaceholder(placeholder){
    this.placeholder = placeholder
    return this
}

/**
 * 
 * @param {Number} min_values The minimum number of selections required
 * @returns {SelectMenu}
 */
setMinValues(min_values){
this.min_values = min_values
return this
}

/**
 * 
 * @param {Number} max_values The maximum number of selections allowed
 * @returns {SelectMenu}
 */
setMaxValues(max_values){
this.max_values = max_values
return this
}

/**
 * 
 * @param {Boolean} disabled Whether this select menu should be disabled
 * @returns {SelectMenu}
 */
setDisabled(disabled = true) {
    this.disabled = disabled;
    return this;
}                 
}
module.exports = SelectMenu