"use strict";

class MessageActionRow {
    constructor(){
        
         /**
         * The components in this action row
         * @type {MessageActionRowComponent[]}
         */
        this.type = 1
        this.components = []
    }
    
      /**
       * Adds components to the action row.
       * @param {...MessageActionRowComponentResolvable[]} components The components to add
       * @returns {MessageActionRow}
       */
    addComponents(...components) {
        
        this.components.push(...components.flat(Infinity));
        return this;
      }
    }
    module.exports = MessageActionRow;