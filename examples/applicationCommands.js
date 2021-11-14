const Eris = require("eris");

const Constants = Eris.Constants;

// Replace TOKEN with your bot account's token
const bot = new Eris("BOT TOKEN", {
    intents: [] //No intents are needed for interactions, but you still need to specify either an empty array or 0
});

bot.on("ready", async () => { // When the bot is ready
    console.log("Ready!"); // Log "Ready!"

    //Note: You should use guild commands to test, as they update instantly. Global commands can take up to an hour to update.

    const commands = await bot.getCommands();

    if(!commands.length) {
        bot.createCommand({
            name: "test_chat_input",
            description: "Test command to show how to make commands",
            options: [ //An array of Chat Input options https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure
                {
                    "name": "animal", //The name of the option
                    "description": "The type of animal",
                    "type": Constants.ApplicationCommandOptionTypes.STRING, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                    "required": true,
                    "choices": [ //The possible choices for the options
                        {
                            "name": "Dog",
                            "value": "animal_dog"
                        },
                        {
                            "name": "Cat",
                            "value": "animal_cat"
                        },
                        {
                            "name": "Penguin",
                            "value": "animal_penguin"
                        }
                    ]
                },
                {
                    "name": "only_smol",
                    "description": "Whether to show only baby animals",
                    "type": Constants.ApplicationCommandOptionTypes.BOOLEAN,
                    "required": false
                }
            ],
            type: Constants.ApplicationCommandTypes.CHAT_INPUT //Not required for Chat input type, but recommended
        }); //Create a chat input command

        bot.createCommand({
            name: "Test User Menu",
            type: Constants.ApplicationCommandTypes.USER
        }); //Create a user context menu

        bot.createCommand({
            name: "Test Message Menu",
            type: Constants.ApplicationCommandTypes.MESSAGE
        }); //Create a message context menu

        bot.createCommand({
            name: "test_edit_command",
            description: "Test command to show off how to edit commands",
            type: Constants.ApplicationCommandTypes.CHAT_INPUT //Not required for Chat input type, but recommended
        }); //Create a chat input command

        bot.createCommand({
            name: "test_delete_command",
            description: "Test command to show off how to delete commands",
            type: Constants.ApplicationCommandTypes.CHAT_INPUT //Not required for Chat input type, but recommended
        }); //Create a chat input command

        //In practice, you should use bulkEditCommands if you need to create multiple commands
    }
});

bot.on("error", (err) => {
    console.error(err); // or your preferred logger
});

bot.on("interactionCreate", (interaction) => {
    if(interaction instanceof Eris.CommandInteraction) {
        switch(interaction.data.name) {
            case "test_edit_command":
                interaction.createMessage("interaction recieved");
                return bot.editCommand(interaction.data.id, {
                    name: "edited_test_command",
                    description: "Test command that was edited by running test_edit_command"
                });
            case "test_delete_command":
                interaction.createMessage("interaction recieved");
                return bot.deleteCommand(interaction.data.id);
            default: {
                return interaction.createMessage("interaction recieved");
            }
        }
    }
});

bot.connect(); // Get the bot to connect to Discord
