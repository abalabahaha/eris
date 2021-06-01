//const ButtonInteracion = require('../lib/structures/Button');
const eris = require('../index.js');
require('dotenv').config();
const bot = new eris.Client(null, { cacheMembers: false, cacheUsers: false, cacheEmojis: false });//process.env.DISCORD_TOKEN=token
bot.connect()
bot.on('ready', () => {

    console.log('online');

});


bot.on('messageCreate', async msg => {

    const prefix = '!!';
    const args = msg.content.slice(prefix.length).split(' ').map(item => item.trim());
    const command = args.shift();
    if (!msg.content.startsWith(prefix)) return;
    if (!msg.channel.name) return;
    const xd = msg.channel;
    xd.createMessage({
        content: 'xd',
        components: [{
            "components": [
                {
                    "type": 2,
                    "label": "Click me!a",
                    "style": 1,
                    "custom_id": 'unoa',
                    "emoji": {
                        name: 'poto', id: '811436270768619540'
                    }
                }
                , {
                    "type": 2,
                    "label": "Click me!e",
                    "style": 1,
                    "custom_id": 'unoe',
                    "emoji": {
                        name: 'poto', id: '811436270768619540'
                    }
                }, {
                    "type": 2,
                    "label": "Click me!i",
                    "style": 1,
                    "custom_id": 'unoi',
                    "emoji": {
                        name: 'poto', id: '811436270768619540'
                    }
                }, {
                    "type": 2,
                    "label": "Click me!o",
                    "style": 1,
                    "custom_id": 'unoo',
                    "emoji": {
                        name: 'poto', id: '811436270768619540'
                    }
                }, {
                    "type": 2,
                    "label": "Click me!u",
                    "style": 1,
                    "custom_id": 'unou',
                    "emoji": {
                        name: 'poto', id: '811436270768619540'
                    }
                }],
            type: 1
        }]
    })

    if (command == 'test') {

        return msg.channel.createMessage('Hi.');

    }

    else if (command == 'eval') {

        try {
            const code = args.join(" ");
            const res_evalued = await eval(code);
            let evalued = require('util').inspect(res_evalued, { depth: 0 });
            return await msg.channel.createMessage('```js\n' + evalued.slice(0, 1950) + '```');
        }
        catch (err) {
            return msg.channel.createMessage('```js\n' + err.toString().slice(0, 1500) + '```');
        }

    };

});
bot.on('clickButton', async (data) => {

    data.reply({ content: 'xd' });

});

/*
const consola = new (require('kufa').KufaConsole)({
    format: `[§a%time%§r] [%prefix%§r] %message% %trace% %memory%`,
    log_prefix: `§2LOG`,
    warn_prefix: `§6WARN`,
    error_prefix: `§4ERROR`,
    traceFun: true
});

consola.log('xd');
*/