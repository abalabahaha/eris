const Eris   = require('../index');
const config = require('./config.json');
const bot    = Eris.create(config.token);

bot.on('ready', () => {
    console.info('> Test Bot is ready!');
    process.exit();
});

bot.connect();