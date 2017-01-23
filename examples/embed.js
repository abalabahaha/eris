const Eris = require("eris");

var bot = new Eris("BOT_TOKEN");
// Replace BOT_TOKEN with your bot account's token

bot.on("ready", () => { // When the bot is ready
    console.log("Ready!"); // Log "Ready!"
});

bot.on("messageCreate", (msg) => { // When a message is created
    if(msg.content === "!info") { // If the message content is "!info"
        bot.createMessage(msg.channel.id, {embed: {
            title: "I'm an embed!",
            description: "Here is some more info, with **awesome** formatting.\nPretty *neat*, huh?",
            author: {
                name: msg.author.username,
                icon_url: msg.author.avatarURL
            },
            color: 0x008000,
            fields: [
                {
                    name: "Some extra info.",
                    value: "Some extra value.",
                    inline: true
                },
                {
                    name: "Some more extra info.",
                    value: "Another extra value.",
                    inline: true
                }
            ],
            footer: {
                text: "Created with Eris."
            }
        }});
    }
});

bot.connect(); // Get the bot to connect to Discord
