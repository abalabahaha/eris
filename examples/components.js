const Eris = require("eris");

const Constants = Eris.Constants;

// Replace TOKEN with your bot account's token
const bot = new Eris("BOT TOKEN", {
    intents: ["guildMessages"]
});

bot.on("ready", async () => { // When the bot is ready
    console.log("Ready!"); // Log "Ready!"
});

bot.on("error", (err) => {
    console.error(err); // or your preferred logger
});

bot.on("messageCreate", (msg) => { // When a message is created
    if(msg.content === "!button") { // If the message content is "!button"
        bot.createMessage(msg.channel.id, {
            content: "Button Example",
            components: [
                {
                    type: Constants.ComponentTypes.ACTION_ROW, // You can have up to 5 action rows, and 1 select menu per action row
                    components: [
                        {
                            type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                            style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                            custom_id: "click_one",
                            label: "Click me!",
                            disabled: false // Whether or not the button is disabled, is false by default
                        }
                    ]
                }
            ]
        });
        // Send a message in the same channel with a Button
    } else if(msg.content === "!select") { // Otherwise, if the message is "!select"
        bot.createMessage(msg.channel.id, {
            content: "Select Menu Example",
            components: [
                {
                    type: Constants.ComponentTypes.ACTION_ROW, // You can have up to 5 action rows, and 5 buttons per action row
                    components: [
                        {
                            type: Constants.ComponentTypes.SELECT_MENU, // https://discord.com/developers/docs/interactions/message-components#select-menus
                            custom_id: "select_one",
                            placeholder: "Select an option",
                            options: [ // The options to select from https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure
                                {
                                    label: "Option 1",
                                    value: "option_1",
                                    description: "[Insert description here]"
                                },
                                {
                                    label: "Option 2",
                                    value: "option_2",
                                    description: "This is only here to show off picking one"
                                }
                            ],
                            min_values: 1,
                            max_values: 1,
                            disabled: false // Whether or not the select menu is disabled, is false by default
                        }
                    ]
                }
            ]
        });
        // Send a message in the same channel with a Select Menu
    }
});

bot.on("interactionCreate", (interaction) => {
    if(interaction instanceof Eris.ComponentInteraction) {
        return interaction.createMessage({
            content: "Interaction Recieved",
            flags: 64
        });
    }
});

bot.connect(); // Get the bot to connect to Discord
