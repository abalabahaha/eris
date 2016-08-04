"use strict";
const Eris = require("eris");
var http = require('http');
var bot = new Eris('BOT_TOKEN');

// PREFIX
var prefix = ("!");

bot.on('ready', () => {
    console.log('Ready!');
});

// MAIN STUFF
bot.on('messageCreate', (msg) => {

  if (msg.content.startsWith(prefix + "checkweb ")) {
		var args = message.split(prefix + "checksite ");
		var site = args.join('');
		http.get("http://" + site, function (res) {
		  bot.createMessage(msg.channel.id, "`" + site + "` is up!")
		}).on('error', function(e) {
			bot.createMessage(msg.channel.id, "`" + site + "` is **NOT** up!\nIf you get this error, then you either put the `http://` which you dont need, or it isnt up, or the site doesnt exist.")
		});
    } else if (msg.content.startsWith(prefix + "checksite ")) {
		var args = message.split(prefix + "checksite ");
		var site = args.join('');
		http.get("http://" + site, function (res) {
		  bot.createMessage(msg.channel.id, "`" + site + "` is up!")
		}).on('error', function(e) {
			bot.createMessage(msg.channel.id, "`" + site + "` is **NOT** up!\nIf you get this error, then you either put the `http://` which you dont need, or it isnt up, or the site doesnt exist.")
		});
});

