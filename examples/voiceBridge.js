const Eris = require("eris");
const PassThroughStream = require('stream').PassThrough;

var channel1 = "INSERT_FIRST_VOICE_CHANNEL_ID_HERE";
var channel2 = "INSERT_SECOND_VOICE_CHANNEL_ID_HERE";

var bot = new Eris("BOT_TOKEN");
// Replace BOT_TOKEN with your bot account's token

bot.on("ready", () => { // When the bot is ready
    console.log("Ready!"); // Log "Ready!"
    bot.joinVoiceChannel(channel1).then((connection) => { // Join each channel
        bot.joinVoiceChannel(channel2).then((connection2) => {
            var stream = new PassThroughStream(); // Make a passthrough stream
            var receiver = connection2.receive(); // Receive the stream from the second connection
            receiver.on("data", (data) => { // Convert raw opus data from the second connection to DCA
                var len = new Buffer(2);
                len.writeUInt16LE(data.length);
                stream.write(len);
                stream.write(data);
            });
            connection.playDCA(stream, {
                waitForever: true
            });
            // Play the converted DCA data from the second channel to the first channel
            // Wait forever for data

            // Do the same thing in reverse for the other stream
            var stream2 = new PassThroughStream();
            var receiver2 = connection.receive();
            receiver2.on("data", (data) => {
                var len = new Buffer(2);
                len.writeUInt16LE(data.length);
                stream2.write(len);
                stream2.write(data);
            });
            connection2.playDCA(stream2, {
                waitForever: true
            });

            console.log("Bridging " + channel1 + " " + channel2 + "!"); // Log a bridging notification
        });
    });
});

bot.connect(); // Get the bot to connect to Discord
