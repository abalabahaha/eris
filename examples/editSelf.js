const Eris = require("eris");

const bot = new Eris("BOT TOKEN", {
  intents: [
    "guilds",
  ],
});

bot.on("ready", async () => { // When the bot is ready
  console.log("Ready!"); // Log "Ready!"
  await bot.editSelf({ nick: "Really cool dude" }, "12345678012345678"); // Edits bot nickname to Really cool dude
});

bot.on("error", (err) => {
  console.error(err); // or your preferred logger
});

bot.connect(); // Get the bot to connect to Discord
