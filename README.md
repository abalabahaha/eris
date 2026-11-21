Eris [![NPM version](https://img.shields.io/npm/v/eris.svg?style=flat-square&color=informational)](https://npmjs.com/package/eris)
====

A Node.js wrapper for interfacing with Discord.

Installing
----------

You will need NodeJS 10.4+. If you need voice support you will also need Python 2.7 and a C++ compiler. Refer to [the Getting Started section of the docs](https://abal.moe/Eris/docs) for more details.

```
npm install --no-optional eris
```

If you need voice support, remove the `--no-optional`.

Ping Pong Example
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

Translated bot replies
----------------------

Each client has an i18n catalog. The bundled music keys are `music.nowPlaying`,
`music.queueEmpty`, `music.paused`, and `music.resumed`. They cover English,
Malayalam, Hindi, Tamil, Korean, Japanese, Chinese (Simplified and Traditional),
Indonesian, Brazilian Portuguese, Spanish, and French.

```js
const bot = new Eris.Client(token, { defaultLocale: "en" });
bot.i18n.register("en", { "music.added": "Added {title} to the queue." });
bot.i18n.register("ml", { "music.added": "{title} ക്യൂവിൽ ചേർത്തു." });

// In a command interaction handler:
await interaction.createMessage(interaction.t("music.nowPlaying", { title }));

// For prefix commands, pass the user's or server's saved language explicitly:
const reply = bot.i18n.t("music.added", "ml", { title });
```

For each key, interactions try the user's Discord locale, the guild locale,
the client's default locale, then English. Each locale also tries its parent
language (for example, `fr-CA` tries `fr`). Missing keys return the key itself.
Registration merges flat string keys and can override the starter messages.
Existing replies use translations only when the bot calls a translation method.

Useful Links
------------

- [The website](https://abal.moe/Eris/) has more details and documentation.
- [The official Eris server](https://abal.moe/Eris/invite) is the best place to get support.
- [The GitHub repo](https://github.com/abalabahaha/eris) is where development primarily happens.
- [The NPM package webpage](https://npmjs.com/package/eris) is, well, the webpage for the NPM package.

License
-------

Refer to the [LICENSE](LICENSE) file.
