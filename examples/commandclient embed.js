const Eris = require("eris");

// Replace BOT_TOKEN with your bot account's token
var bot = new Eris.CommandClient("BOT_TOKEN", {}, {
    description: "A test bot made with Eris",
    owner: "somebody",
    prefix: "!"
});

bot.on("ready", () => { // When the bot is ready
    console.log("Ready!"); // Log "Ready!"
});


bot.registerCommand('COMMANDNAME', (msg) => {
    const embed = {
        title: 'EMBED TITLE',
        color: 9184198,
        fields: [
            {
                name: 'EMBED NAME',
                value: `EMBED TEXT`,
                inline: true
            },
            {
                name: 'EMBED NAME',
                value: `EMBED TEXT`,
                inline: true
            },
            {
                name: 'EMBED NAME',
                value: 'EMBED TEXT',
                inline: true
            },
            {
                name: 'EMBED NAME',
                value: 'EMBED TEXT',
                inline: true
            }
        ]
    }
    bot.createMessage(msg.channel.id, {
        embed: embed
    })
});
