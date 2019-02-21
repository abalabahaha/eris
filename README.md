Modified Content:
====
- Removed `lib/command`
- Added more stuff (most from discord.js):
  - Emojis as an collection, not an array
  - Replace `ShardManager`:
    - Use `Client.ws` for websocket stuff (example: shards)
    - Renamed `ShardManager` to `WebSocketManager` (bc it sounds cool)
  - `User.tag` getter
  - Add MessageCollector, MessageReaction, MessageMentions, and more c00l stuff
- Updated typings:
 - Fix everything
 - Use namespaces (bc they cool)

Eris [![NPM version](https://img.shields.io/npm/v/eris.svg?style=flat-square)](https://npmjs.com/package/eris)
====

A NodeJS wrapper for interfacing with Discord.

Installing
----------

You will need NodeJS 8+. If you need voice support you will also need Python 2.7 and a C++ compiler. Refer to [the Getting Started section of the docs](https://abal.moe/Eris/docs.html) for more details.

```
npm install --no-optional eris
```

If you need voice support, remove the `--no-optional`

Ping Pong Example
-----------------

```js
const Eris = require("@augu/eris");

var bot = Eris.create("BOT_TOKEN");
// Replace BOT_TOKEN with your bot account's token

bot.on("ready", () => { // When the bot is ready
    console.log("Ready!"); // Log "Ready!"
});

bot.on("messageCreate", (msg) => { // When a message is created
    const content = msg.getContent();
    if (content === '!ping') return msg.channel.createMessage('Pong!');
    if (content === '!pong') return msg.channel.createMessage('Ping!');
});

bot.connect(); // Get the bot to connect to Discord
```

More examples can be found in [the examples folder](https://github.com/auguwu/eris/tree/master/examples).

Useful Links
------------

[The website](https://abal.moe/Eris) includes more detailed information on getting started, as well as documentation for the different components.

[The Discord API channel (#js_eris)](https://abal.moe/Eris/invite) is the best place to get support/contact me.

[The GitHub repo](https://github.com/abalabahaha/eris) has the most updated code.

[The NPM package](https://npmjs.com/package/eris)

License
-------

Refer to the [LICENSE](LICENSE) file.
