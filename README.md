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
const { Client } = require('eris');
const client = new Client('Bot TOKEN');
// Replace TOKEN with your bot account's token

client.on('ready', () => { // When the bot is ready
  console.log('Ready!'); // Log "Ready!"
});

client.on('error', (err) => {
  console.error(err); // or your preferred logger
});

client.on('messageCreate', (msg) => { // When a message is created
  if (msg.content === '!ping') { // If the message content is "!ping"
    msg.channel.createMessage('Pong!');
      // Send a message in the same channel with "Pong!"
  } else if (msg.content === '!pong') { // Otherwise, if the message is "!pong"
    msg.channel.createMessage('Ping!');
    // Respond with "Ping!"
  }
});

client.connect(); // Get the bot to connect to Discord
```

More examples can be found in [the examples folder](https://github.com/abalabahaha/eris/tree/master/examples).

Useful Links
------------

- [The website](https://abal.moe/Eris/) has more details and documentation.
- [The Discord API channel (#js_eris)](https://abal.moe/Eris/invite) is the best place to get support/contact me.
- [The GitHub repo](https://github.com/abalabahaha/eris) is where development primarily happens.
- [The NPM package webpage](https://npmjs.com/package/eris) is, well, the webpage for the NPM package.

License
-------

Refer to the [LICENSE](LICENSE) file.
