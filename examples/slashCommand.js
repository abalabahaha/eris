const Eris = require('eris');

// Replace TOKEN with your bot account's token
const bot = new Eris.CommandClient('Bot TOKEN', {}, {
  description: 'A test bot made with Eris',
  owner: 'somebody',
  prefix: '!'
});


bot.on('ready', async () => { // When the bot is ready
  console.log('Ready!'); // Log "Ready!"

  // First we have to load the command list.

  await bot.slashCommand.loadCommandList();


    // Let's create commands globally.
  await bot.slashCommand.createCommand(
    new CommandBase()
      .setName('blep')
      .setDescription('Send a random adorable animal photo')
      .addOptions(
        new CommandOptions()
          .setName('animal')
          .setDescription('The type of animal')
          .setType(3)
          .addChoices(
            new Choice()
              .setName('Dog')
              .setValue('animal_dog'),
            new Choice()
              .setName('Cat')
              .setValue('animal_cat'),
            new Choice()
              .setName('Penguin')
              .setValue('animal_penguin')
          )
          .isRequired(),


        // Other options ^^
        new CommandOptions()
          .setName('only_smol')
          .setDescription('Whether to show only baby animals')
          .setType(5)
          .isRequired()
      )
  );

  // Ready. Now you can see in Discord if the commands were loaded.
});

bot.connect();
