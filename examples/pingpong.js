const Eris = require("eris");

// Replace TOKEN with your bot account's token
const bot = Eris("Bot TOKEN");

bot.on("ready", () => { // When the bot is ready
  console.log("Ready!"); // Log "Ready!"
});

bot.on("error", (err) => {
  console.error(err); // or your preferred logger
});

bot.on("messageCreate", (msg) => { // When a message is created
  if (msg.content === "!ping") { // If the message content is "!ping"
    bot.createMessage(msg.channel.id, "Pong!");
    // Send a message in the same channel with "Pong!"
  } else if (msg.content === "!pong") { // Otherwise, if the message is "!pong"
    bot.createMessage(msg.channel.id, "Ping!");
    // Respond with "Ping!"
  }
});

bot.connect(); // Get the bot to connect to Discord
