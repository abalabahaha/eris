const Eris = require("eris");

const Constants = Eris.Constants;

const bot = new Eris("Bot token", {
    intents: []
});

bot.on("ready", () => {
    console.log("connected!")
    bot.createCommand({
        type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        name: "ping",
        description: "Reply with pong",
        options: [],
        contexts: [Constants.ApplicationCommandContextType.GUILD, Constants.ApplicationCommandContextType.BOT_DM, Constants.ApplicationCommandContextType.PRIVATE]
    })
})

bot.on("interactionCreate", (interaction) => {
    if(interaction instanceof Eris.CommandInteraction) {
        if(interaction.data.name === "ping") {
            let where = ""
            const context = interaction.context

            console.log(interaction)

            if(context === Constants.ApplicationCommandContextType.GUILD) {
                where = "as a server interaction."
            } else if(context === Constants.ApplicationCommandContextType.BOT_DM) {
                where = "as a bot DM interaction."
            } else if(context === Constants.ApplicationCommandContextType.PRIVATE) {
                where = "as a private interaction (user installable)."
            } else {
                where = "as a server interaction."
            }

            interaction.createMessage(`🏓 pong ${where}`)
        }
    }
})

bot.connect()