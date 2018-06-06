const Discord = require("discord.js");
const fs = require("fs");
const config = require("./config.json");

const client = new Discord.Client();
var voiceChannel; 


client.on("ready", () => {
	console.log("Logged in as " + client.user.username + "!");
	console.log(config.ids[0]);
});

client.on("message", message => {
	
	if(message.author.bot) return; //if message is from the bot itself, ignore
  
	if(message.content.indexOf(config.prefix) !== 0) return; //if message doesn't start with prefix, ignore

	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	if (command == "dc"){
		if(message.author.id == config.ids[0]){
			message.delete();
			setTimeout(function() {
				client.destroy();
				process.exit();
			}, 1000);	
		}
		else{
			message.channel.send("You don't have permission to use this command!")
			.then(sentMessage => sentMessage.delete(3000));
		}
		
	}
	if (command == "enter" || command == "fuckme"){
		if(!voiceChannel){
			voiceChannel = client.channels.get(config.voiceChannel);
			voiceChannel.join();
		}
	}
	if (command == "exit" || command == "fuckoff"){
		if(voiceChannel){
			voiceChannel.leave();
			voiceChannel = null;
		}
	}
	if (command == "pf"){
		if (voiceChannel){
			if (args.length == 0){
				message.channel.send("Include a filename!")
				.then(sentMessage => sentMessage.delete(3000));
			}
			else {
				const str = args.join("");
				voiceChannel.connection.playFile("./assets/" + str + ".wav");
				//else {
					//message.channel.send("No such file!")
					//.then(sentMessage => sentMessage.delete(3000));
				//}
			}
		}
		else{
			message.channel.send("No voice connection!")
			.then(sentMessage => sentMessage.delete(3000));
		}
	}
	message.delete(1000);
});
	
client.on("voiceStateUpdate", (oldMember, newMember) => {
  	let newUserChannel = newMember.voiceChannel
  	let oldUserChannel = oldMember.voiceChannel

  	if(oldUserChannel === undefined && newUserChannel !== undefined && oldMember.id != config.ids[3]) {
		var name = ""
		// User enters a voice channel
		console.log(newMember.id);
		for (i in config.ids){
			if (config.ids[i] == newMember.id){
				name = config.names[i];
			}
		}
		if (name != ""){
			client.guilds.first().channels.get(config.textChannel).send("Hi there " + name + "! <3")
			.then(sentMessage => sentMessage.delete(10000));
		}
	
  	} else if(newUserChannel === undefined){

		// User leaves a voice channel

  	}
});

client.login(config.token);