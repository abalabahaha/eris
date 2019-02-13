const Eris   = require('../index');
const config = require('./config.json');
const bot    = Eris.create(config.token);

bot.on('ready', () => {
    bot.guilds.forEach(guild => {
        console.log(guild.emojis);
    });
    process.exit();
});

bot.connect();