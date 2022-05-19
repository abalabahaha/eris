const Eris = require(".");
const client = new Eris.Client("Bot MzU5NTEyNjA3NzE3MDY0NzA2.GfzxP2.SLEqmVu8oQMTVdkGmoOJZaTH6G8GBs6NHte8z8", {
    intents: Eris.Constants.Intents.all
});
client.on("ready", async() => {
    client.createCommand({
        name: "test",
        description: "yes",
        options: [
            {
                name: "channel",
                description: "e",
                type: Eris.Constants.ApplicationCommandOptionTypes.CHANNEL
            }
        ]
    });
})
    .on("interactionCreate", async(interaction) => {
        if(interaction.type === Eris.Constants.InteractionTypes.MESSAGE_COMPONENT) {
            await interaction.editOriginalMessage({content: "edited"});
        }
    })
    .on("messageCreate", async(message) => {
        if(message.content === "!yeet") {
            await message.channel.createMessage({
                content: "Yeet",
                components: [
                    {
                        type:1 ,
                        components: [
                            {
                                type: 2,
                                style: 1,
                                label: "e",
                                custom_id: "ee"
                            }
                        ]
                    }
                ]
            });
        }
    });
client.connect();
