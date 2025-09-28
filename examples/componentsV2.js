const Eris = require("eris");

const Constants = Eris.Constants;

// Replace BOT_TOKEN with your bot account's token
const bot = new Eris("Bot BOT_TOKEN", {
  intents: ["guildMessages"],
});

// Custom IDs so we can identify the button interactions later (must stay unique per message)
const INFO_BUTTON_ID = "components_v2_info";
const MORE_BUTTON_ID = "components_v2_more";
const DISMISS_BUTTON_ID = "components_v2_dismiss";

bot.on("ready", () => { // When the bot is ready
  console.log("Ready!"); // Log "Ready!"
});

bot.on("error", (err) => {
  console.error(err); // or your preferred logger
});

bot.on("messageCreate", (msg) => { // When a message is created
  if (msg.content === "!componentsv2") { // If the message content is "!componentsv2"
    bot.createMessage(msg.channel.id, {
      // Required so Discord accepts the structured components payload.
      flags: Constants.MessageFlags.IS_COMPONENTS_V2,
      components: [
        {
          // Top-level section gives an overview with a button accessory on the right
          type: Constants.ComponentTypes.SECTION,
          components: [
            {
              type: Constants.ComponentTypes.TEXT_DISPLAY,
              content: "Components V2 let you create card-style layouts inside a message.",
            },
          ],
          accessory: {
            type: Constants.ComponentTypes.BUTTON,
            style: Constants.ButtonStyles.PRIMARY,
            custom_id: INFO_BUTTON_ID,
            label: "What is this?",
          },
        },
        {
          type: Constants.ComponentTypes.SEPARATOR,
          spacing: 2, // Adds extra breathing room between the section and container
        },
        {
          // Container lets us bundle multiple sections and traditional components together
          type: Constants.ComponentTypes.CONTAINER,
          accent_color: 0x5865F2,
          components: [
            {
              type: Constants.ComponentTypes.TEXT_DISPLAY,
              content: "**Highlights**", // Simple heading inside the container
            },
            {
              // Section inside the container to demonstrate stacked text blocks
              type: Constants.ComponentTypes.SECTION,
              components: [
                {
                  type: Constants.ComponentTypes.TEXT_DISPLAY,
                  content: "Sections stack text displays and optionally add a rich accessory.",
                },
                {
                  type: Constants.ComponentTypes.TEXT_DISPLAY,
                  content: "Accessories can be thumbnails or buttons placed on the right side.",
                },
              ],
              accessory: {
                type: Constants.ComponentTypes.THUMBNAIL,
                media: {
                  url: "https://cdn.discordapp.com/embed/avatars/0.png",
                }, // Thumbnail accessories render on the right edge of the section
              },
            },
            {
              type: Constants.ComponentTypes.SEPARATOR,
              spacing: 1,
            },
            {
              // Media gallery showcases how multiple images fit into a single card
              type: Constants.ComponentTypes.MEDIA_GALLERY,
              items: [
                {
                  media: {
                    url: "https://cdn.discordapp.com/embed/avatars/1.png",
                  },
                  description: "Gallery items can show multiple images.",
                },
                {
                  media: {
                    url: "https://cdn.discordapp.com/embed/avatars/2.png",
                  },
                  spoiler: false,
                },
              ],
            },
            {
              // Standard action row still works inside the container for interactive controls
              type: Constants.ComponentTypes.ACTION_ROW,
              components: [
                {
                  type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#button
                  style: Constants.ButtonStyles.PRIMARY,
                  custom_id: MORE_BUTTON_ID,
                  label: "Tell me more",
                },
                {
                  type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#button
                  style: Constants.ButtonStyles.SECONDARY,
                  custom_id: DISMISS_BUTTON_ID,
                  label: "Dismiss",
                },
              ],
            },
          ],
        },
      ],
    });
  }
});

bot.on("interactionCreate", async (interaction) => {
  if (interaction instanceof Eris.ComponentInteraction) {
    if (interaction.data.custom_id === INFO_BUTTON_ID || interaction.data.custom_id === MORE_BUTTON_ID) {
      await interaction.createMessage({
        content: "Components V2 combine text, media, and classic components to build rich cards.",
        flags: 64,
      });
    } else if (interaction.data.custom_id === DISMISS_BUTTON_ID) {
      await interaction.createMessage({
        content: "Dismissed! Run !componentsv2 again to reopen the card.",
        flags: 64,
      });
    }
  }
});

bot.connect(); // Get the bot to connect to Discord
