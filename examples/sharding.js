const Eris = require("eris");

// Replace TOKEN with your bot account's token
const bot = new Eris("Bot TOKEN", {
    firstShardID: 0,
    lastShardID: 15,
    maxShards: 16,
    getAllUsers: false,
    intents: ["guilds", "guildMembers", "guildPresences"]
});

bot.on("ready", () => { // When the bot is ready
    console.log("Ready!"); // Log "Ready!"
    console.timeEnd("ready");
});

bot.on("error", (err) => {
    console.error(err); // or your preferred logger
});

bot.on("shardReady", (id) => {
    console.log(`Shard ${id} ready!`);
});

console.time("ready");
bot.connect(); // Get the bot to connect to Discord
