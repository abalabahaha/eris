const Eris = require("eris");

// Replace TOKEN with your bot account's token
const bot = Eris("Bot TOKEN", {
  intents: ["guildMessages", "messageContent"],
});

bot.on("ready", () => { // When the bot is ready
  console.log("Ready!"); // Log "Ready!"
});

bot.on("error", (err) => {
  console.error(err); // or your preferred logger
});

bot.on("messageCreate", (msg) => { // When a message is created
  if (msg.content === "!embed") { // If the message content is "!embed"
    bot.createMessage(msg.channel.id, {
      embeds: [{
        title: "I'm an embed!", // Title of the embed
        description: "Here is some more info, with **awesome** formatting.\nPretty *neat*, huh?",
        author: { // Author property
          name: msg.author.username,
          icon_url: msg.author.avatarURL,
        },
        color: 0x008000, // Color, either in hex (show), or a base-10 integer
        fields: [ // Array of field objects
          {
            name: "Some extra info.", // Field title
            value: "Some extra value.", // Field
            inline: true, // Whether you want multiple fields in same line
          },
          {
            name: "Some more extra info.",
            value: "Another extra value.",
            inline: true,
          },
        ],
        footer: { // Footer text
          text: "Created with Eris.",
        },
      }],
    });
  }
});

bot.connect(); // Get the bot to connect to Discord
