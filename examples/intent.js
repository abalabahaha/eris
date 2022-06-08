const Eris = require("eris");

// Replace TOKEN with your bot account's token
const bot = new Eris("Bot TOKEN", {
    intents: [
        "guilds",
        "guildMessages"
    ]
});

bot.on("ready", () => { // When the bot is ready
    console.log("Ready!"); // Log "Ready!"
});

bot.on("error", (err) => {
    console.error(err); // or your preferred logger
});

bot.on("guildCreate", (guild) => { // When the client joins a new guild
    console.log(`New guild: ${guild.name}`);
});

bot.on("messageCreate", (msg) => { // When a message is created
    console.log(`New message: ${msg.cleanContent}`);
});

// This event will never fire since the client did
// not specify `guildMessageTyping` intent
bot.on("typingStart", (channel, user) => { // When a user starts typing
    console.log(`${user.username} is typing in ${channel.name}`);
});

bot.connect(); // Get the bot to connect to Discord
