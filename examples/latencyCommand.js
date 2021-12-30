const Eris = require("eris"); //Requires eris dependency 

// Replace <TOKEN> with your bot account's token

const bot = new Eris("Bot <TOKEN>");

bot.on("ready", () => { // When the bot is ready

    console.log("Ready!"); // Log "Ready!"

});

bot.on("error", (err) => { // When The client has a error! 

    console.error(err); // or your preferred logger

});

bot.on("messageCreate", (msg) => { // When a message is created

            if (msg.content === "!latency") { // If the message content is "!latency"

                bot.createMessage(msg.channel.id, {

                    content: `My latency is ${bot.shards.get(0).latency}ms!`

                })

               } 

            });

        bot.connect(); // Get the bot to connect to Discord 
