const status = {
    reply: 4,
    think: 5,
    defer: 6
};

const Base = require('./Base');
const Member = require('./Member');
const Message = require('./Message');
const util = require('util');

class ButtonInteracion {
    /**
     * 
     * @param {any} data 
     * @param {import('../Client')} client
     */
    constructor(data, client) {
        /**@type {string} */
        this.token = data.token;
        /**@type {string} */
        this.id = data.id;
        this.message = new Message(data.message, client);
        this.member = new Member(data.member, this.message.guild, client);
        /**@type {string} */
        this.customID = data.data.custom_id;
        this.defeered = false;
        this.replied = false;
        this.client = client;
    }

    async reply({ content, embeds, files }, invisible = true) {
        await this.client.requestHandler.request(
            'POST',
            `/interactions/${this.id}/${this.token}/callback`,
            true,
            { "data": { flags: invisible ? 1 << 6 : null, content, embeds }, type: status.reply },
            files
        );
        this.replied = true;
        return true;

    };

    async think(invisible = true) {
        await this.client.requestHandler.request(
            'POST',
            `/interactions/${this.id}/${this.token}/callback`,
            true,
            { "data": { flags: invisible ? 1 << 6 : null }, type: status.think }
        );
        this.defeered = true;
        return true;
    };

    async defer() {

        await this.client.requestHandler.request(
            'POST',
            `/interactions/${this.id}/${this.token}/callback`,
            true,
            { type: status.defer }
        );
        this.defeered = true;
        return true;

    };

    [util.inspect.custom]() {
        return Base.prototype[util.inspect.custom].call(this);
    };

};

module.exports = ButtonInteracion;