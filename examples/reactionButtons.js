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

var reactionButtons = [ // add your buttons here
    {
        emoji: "🕰",
        type: "edit",
        response: () => {
            return `you pressed the time button at ${new Date().toLocaleString()}`
        }
    },
    {
        emoji: "👾",
        type: "edit",
        response: "space heck!"
    },
    {
        emoji: "🎲",
        type: "edit",
        response: ["one", "two", "three"]
    },
    {
        emoji: "⏹",
        type: "cancel"
    }
];

bot.registerCommand("react", (msg, args) => {
    return "heck!!"; // the default message of the command
}, {
    description: "do a thing",
    fullDescription: "do a spooky thing",
    usage: "<text>",
    reactionButtons: reactionButtons, // enable the command's reaction buttons
    reactionButtonTimeout: 30000 // how long the command will watch for reaction buttons
});

bot.connect();
