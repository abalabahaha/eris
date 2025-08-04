 <p align="center">
     <img src="assets/eris.png" alt="Centered" width="300">
 </p>

[![NPM version](https://img.shields.io/npm/v/eris.svg?style=flat-square&color=informational)](https://npmjs.com/package/eris)

A Node.js library wrapper for interfacing with Discord.

## Installing
```
- npm install eris
- yarn add eris
- pnpm add eris
- bun add eris
```
If you're use any of Those Package Managers
here you can find the Ways install Packages.

# Start Eris with Ping Pong
-----------------

```js
const Eris = require("eris");

// Replace TOKEN with your bot account's token
const bot = new Eris("Bot TOKEN", {
    intents: [
        "guildMessages"
    ]
});

bot.on("ready", () => { // When the bot is ready
    console.log("Ready!"); // Log "Ready!"
});

bot.on("error", (err) => {
  console.error(err); // or your preferred logger
});

bot.on("messageCreate", (msg) => { // When a message is created
    if(msg.content === "!ping") { // If the message content is "!ping"
        bot.createMessage(msg.channel.id, "Pong!");
        // Send a message in the same channel with "Pong!"
    } else if(msg.content === "!pong") { // Otherwise, if the message is "!pong"
        bot.createMessage(msg.channel.id, "Ping!");
        // Respond with "Ping!"
    }
});

bot.connect(); // Get the bot to connect to Discord
```

More examples can be found in [the examples folder](https://github.com/abalabahaha/eris/tree/master/examples).

## Useful Links

- [The website](https://abal.moe/Eris/) has more details and documentation.
- [The official Eris server](https://abal.moe/Eris/invite) is the best place to get support.
- [The GitHub repo](https://github.com/abalabahaha/eris) is where development primarily happens.
- [The NPM package webpage](https://npmjs.com/package/eris) is, well, the webpage for the NPM package.

## License

Refer to the [LICENSE](LICENSE) file.
