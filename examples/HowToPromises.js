/*
* The Ultimate "How To Promises 101" for beginners!
*/
const Eris = require('eris')
var shards = 2 // You can set your shard count here, recommend moving that to a config file.
var bot = new Eris('MjA1OTk3MTM2NzgzOTk4OTc2.CnOJSA.CxzPOS-ksWya3VPtyq03VI9AiGs', {maxShards: shards, lastShardID: shards - 1}) // Simple shard options
// Replace BOT_TOKEN with your bot account's token

bot.on('ready', () => { // When the bot is ready
  console.log('Ready!') // Log "Ready!"
  /*
  * Set game for each shard to be unique
  */
  bot.shards.forEach((shard) => { // ${shard.id + 1} is so it won't say 0 out of x
    shard.editGame({name: `Something | Shard ${shard.id + 1} of ${shards}!`})
  })
})

bot.on('messageCreate', (msg) => { // When a message is created
// Accepting promises results
  /*
  * Direct Message
  */
  if (msg.content === '!dm') { // If the message is "!dm"
    bot.getDMChannel(msg.author.id).then((channel) => { // Get DM Channel of msg.author.id
      return bot.createMessage(channel.id, 'Input your response text here.') // return the DM channel in a promise
    })
    /*
    * Editing message for commands like ping
    */
  } else if (msg.content === '!ping') { // Else If the message is "!ping"
    var initialTime = new Date()
    bot.createMessage(msg.channel.id, 'Ping!').then((message) => {
      var latency = new Date() - initialTime
      return bot.editMessage(msg.channel.id, message.id, 'Pong! Time taken: ' + latency + 'ms.')
    })
  } else if (msg.content === '!promisetest') {
    // Look below for "function promiseTest()" to know more
    promiseTest().then((result) => {
      return bot.createMessage(msg.channel.id, result)
    }).catch((e) => {
      return bot.createMessage(msg.channel.id, e)
    })
  }
})

/*
* How to make a Promise.
*/

function promiseTest() {
  return new Promise((resolve, reject) => {
    /*
    * So how it works, you "return" a new Promise, you can
    * decline it with "return reject('Reply')", or accept it with
    * resolve('Whatever you want to output inside the then(() => {})')
    * -- For a recap
    * reject() will return something in .catch(() => {})
    * resolve() will return something in .then(() => {})
    */
    if (shards >= 2) return resolve('You have 2 or more shards.') // This will be thrown into .then(()
    if (shards <= 1) return reject("You don't have 2 or more shards!") // This will be thrown into .catch(()
  })
}

bot.connect() // Get the bot to connect to Discord
