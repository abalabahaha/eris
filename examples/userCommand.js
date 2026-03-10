const Eris = require("eris");

const Constants = Eris.Constants;

const bot = new Eris.Client("Bot token", {
  intents: [],
});

bot.on("ready", async () => {
  console.log("connected!");
  bot.createCommand({
    type: Constants.ApplicationCommandTypes.CHAT_INPUT,
    name: "ping",
    description: "Reply with pong",
    options: [],
    /* The following 2 lines set the state of the application command as both user installable and guild installable */
    contexts: [
      Constants.ApplicationCommandContextType.GUILD,
      Constants.ApplicationCommandContextType.BOT_DM,
      Constants.ApplicationCommandContextType.PRIVATE,
    ],
    integrationTypes: [
      Constants.ApplicationCommandIntegrationTypes.GUILD_INSTALL,
      Constants.ApplicationCommandIntegrationTypes.USER_INSTALL,
    ],
  });
});

bot.on("interactionCreate", (interaction) => {
  if (interaction instanceof Eris.CommandInteraction) {
    if (interaction.data.name === "ping") {
      let where = "";
      /**
       * <CommandInteraction>.context includes information of where the command was executed.
       * if <CommandInteraction>.context matches ...
       *    Constants.ApplicationCommandContextType.GUILD it means it is executed from a server
       *    Constants.ApplicationCommandContextType.BOT_DM it means it is executed from the bot's DM
       *    Constants.ApplicationCommandContextType.PRIVATE it means it is executed as a user installable
       *
       * Incase of BOT_DM and PRIVATE, the CommandInteraction will lose all its guild related properties such as the guild information and member data
       */
      const context = interaction.context;

      // Check where the command is sent from.
      // Keep in mind, context will be the same for commands that are ran as user-installables and guild-invited bots unless user-installables are ran in DMs or are sent in the bot's DMs
      if (context === Constants.ApplicationCommandContextType.GUILD) {
        where = "as a server interaction.";
      } else if (context === Constants.ApplicationCommandContextType.BOT_DM) {
        where = "as a bot DM interaction.";
      } else if (context === Constants.ApplicationCommandContextType.PRIVATE) {
        where = "as a private interaction (user installable).";
      } else {
        where = "as a server interaction.";
      }

      interaction.createMessage(`🏓 pong ${where}`);
    }
  }
});

bot.connect();
