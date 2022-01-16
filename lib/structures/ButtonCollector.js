"use strict";

/**
 * @typedef {Function} CollectorFilter
 * @param {...*} args
 * @returns {boolean|Promise<boolean>}
 */

/**
 * @typedef {object} CollectorOptions
 * @property {number} max
 * @property {number} timeIdle
 * @property {number} timeLimit
 * @property {CollectorFilter} filter
 */

 const BaseCollector = require('./BaseCollector.js');


 class ButtonCollector extends BaseCollector {
     /**
      *
      * @param {CollectorOptions} options
      *
      */
     constructor(client, options) {
         super(client, options);
         this.msg = options.message
         this.client = client
         const handleInteractionCreate = this.handleInteractionCreate.bind(this);
         this.client.on('interactionCreate', handleInteractionCreate);
         this.once('end', () => {
             this.client.removeListener('interactionCreate', handleInteractionCreate);
         });
     }
 
    
     async handleInteractionCreate(interaction) {
         if (!this.running) return false;
        
         if(!interaction.message) return
         if(interaction.message.id !== this.msg.id) return
 
         const resFilter = await this.options.filter(interaction);
 
         if (!resFilter) return;
 
         if (++this.usages == this.options.max) {
             this.emit('collect', interaction);
             this.stop('max');
         } else {
 
             if (this.options.timeIdle) {
                 clearTimeout(this._idleTimeout);
                 this._idleTimeout = setTimeout(() => this.stop('idle'), this.options.timeIdle);
             }
 
             this.emit('collect', interaction);
 
         }
 
         return true;
 
     }
 
     get channelId() {
         return this.channel.id;
     }
 
     get guildId() {
         // @ts-ignore
         return this.channel.guild ? this.channel.guild.id : '';
     }
 }
 
 module.exports =  ButtonCollector;