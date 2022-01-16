//@ts-check

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
 
 class MessageCollector extends BaseCollector {
     /**
      *
      * @param {CollectorOptions} options
      * @param {import('./TextChannel')} channel
      */
     constructor(channel, options) {
         super(options, channel.client);
         this.channel = channel;
         const handleMessageCreate = this.handleMessageCreate.bind(this);
         channel.client.on('messageCreate', handleMessageCreate);
         this.once('end', () => {
             this.client.removeListener('messageCreate', handleMessageCreate);
         });
     }
 
     /**
      * 
      * @param {import('./Message')} message
      */
     async handleMessageCreate(message) {
 
         if (!this.running) return false;
 
         if (this.channelId !== message.channel.id) return;
 
         const resFilter = await this.options.filter(message);
 
         if (!resFilter) return;
 
         if (++this.usages == this.options.max) {
             this.emit('collect', message);
             this.stop('max');
         } else {
 
             if (this.options.timeIdle) {
                 clearTimeout(this._idleTimeout);
                 this._idleTimeout = setTimeout(() => this.stop('idle'), this.options.timeIdle);
             }
 
             this.emit('collect', message);
 
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
 
 module.exports = MessageCollector;