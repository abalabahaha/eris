const Eris   = require('../index');
const config = require('./config.json');
const bot    = Eris.create(config.token);

bot.on('ready', () => {
    console.log('> @augu/eris works!');
});

bot.on('messageCreate', (msg) => {
    console.log(msg);
});

bot.connect();