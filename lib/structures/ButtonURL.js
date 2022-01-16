"use strict";

class ButtonURL {
    constructor() {
        this.type = 2;
        this.style = 5;
    }

    /**
     * 
     * @param {String} url The button's url
     * @returns {ButtonURL}
     */
    setURL(url) {
        this.url = url;
        return this;
    }

    /**
     * 
     * @param {String} label The button's label
     * @returns {ButtonURL}
     */
    setLabel(label) {
        this.label = label;
        return this;
    }

    /**
     * 
     * @param {String} emoji The button's emoji
     * @returns {ButtonURL}
     */
    setEmoji(emoji) {
        this.emoji = emoji;
        return this;
    }

    /**
     * 
     * @param {Boolean} disabled The button will be disabled ?
     * @returns {ButtonURL}
     */
    setDisabled(disabled = true) {
        this.disabled = disabled;
        return this;
    }
}
module.exports = ButtonURL;