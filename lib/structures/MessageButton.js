"use strict";

const { ButtonStyles } = require("../Constants");

class MessageButton {
    constructor() {
        this.type = 2;
    }

    /**
     * @param {String} custom_id The custom id
     * @returns {MessageButton}
     */
    setCustomID(custom_id) {
        this.custom_id = custom_id;
        return this;
    }

    /**
     * @param {String} label The label name
     * @returns {MessageButton}
     */
    setLabel(label) {
        this.label = label;
        return this;
    }

    /**
     * 
     * @param {String} emoji The button's emoji
     * @returns {MessageButton}
     */
    setEmoji(emoji) {
        this.emoji = emoji;
        return this;
    }

    /**
     * 
     * @param {Boolean} disabled The button will be disabled ?
     * @returns {MessageButton}
     */
    setDisabled(disabled = true) {
        this.disabled = disabled;
        return this;
    }

    /**
     * 
     * @param {String} style The button's style
     * @type {import('../Constants').ButtonStyles} 
     * @returns 
     */
    setStyle(style) {
        if (!ButtonStyles[style])
            throw new Error('Invalid styles ' + style);
        this.style = ButtonStyles[style];
        return this;
    }
}
module.exports = MessageButton;