const Discord = require("discord.js");
const fs = require("fs");
const tp = require("./timeProcess.js");
const config = require("./config.json");
const thonk = new Discord.Attachment("./assets/thonk.png");

const client = new Discord.Client();
var voiceChannel;
var connectedUsers = new Map(); //This map represents the list of currently connected users. Their name is unique and is mapped to a Date object created when they connect. 
								//TODO: If users are already connected, initialize this list with those users and assign it a Date object from whenever the bot is initialized.

client.on('unhandledRejection', console.error);

client.on("ready", () => { //When the bot initializes
	voiceChannel = client.channels.get(config.voiceChannel); //Grabs the voice channel id as specificed in config.json
	voiceChannel.join();
	var d = new Date(); //Whenever you see this line, it's likely just to create a timestamp for an event, usually for logging purposes.
	connectedUsers.set("Monika", d);
	console.log(tp.timestamp(d) + " System: Monika connected");
});

client.on("message", message => {
	
	if(message.author.bot) return; //if message is from the bot itself, ignore
  
	if(message.content.indexOf(config.prefix) !== 0) return; //if message doesn't start with prefix, ignore
	
	var d = new Date(); 
	console.log(tp.timestamp(d) + " " + message.author.username + ": " + message); //Logs every non-Bot created message
	
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g); //splits the prefix from the actual message
	const command = args.shift().toLowerCase(); //formats the command to be checked against code
	
	if (command == "dc"){ //Safely disconnects the bot. This is preferred over Ctrl+C'ing the bot in console. 
		if(message.author.id == 90165848467070976){ //This should obviously be an admin only command.
			message.delete(); //Have to manually delete the message here because the process will be closed before it gets to the delete at the end of the client.on("message") code block.
			setTimeout(function() { 
				client.destroy(); 
				process.exit(); 
			}, 1000);	
		}
		else{ //Returns this when someone who isn't an admin attempts to use the command.
			message.channel.send("You don't have permission to use this command!")
			.then(sentMessage => sentMessage.delete(3000));
		}
	}
	if (command == "enter" || command == "fuckme"){ //Commands the bot to enter the channel
		if(!voiceChannel){ //If the bot isn't already connected
			voiceChannel = client.channels.get(config.voiceChannel);
			voiceChannel.join();
			var d = new Date();
			connectedUsers.set("Monika", d);
			console.log(tp.timestamp(d) + " System: Monika connected");
		}
		else {
			message.channel.send("I'm already connected!")
			.then(sentMessage => sentMessage.delete(3000));
		}
	}
	if (command == "exit" || command == "fuckoff"){ //Commands the bot to exit the channel
		if(voiceChannel){ //If the bot is connected
			voiceChannel.leave();
			var d = new Date();
			voiceChannel = null;
			connectedUsers.delete("Monika");
			console.log(tp.timestamp(d) + " System: Monika disconnected");
		}
		else{
			message.channel.send("I'm not connected!")
			.then(sentMessage => sentMessage.delete(3000));
		}
	}
	if (command == "files"){ //returns a list of the files in the assets folder, typically to be used with !pf. This may not be necessary if I can get access to the #bot-commands channel.
		var files = fs.readdirSync("./assets/");
		for (i in files){
			files[i] = files[i].substring(0, files[i].length - 4);
		}
		message.author.send(files);
	}
	if (command == "help"){ //TODO: need to rework this
		var files = fs.readdirSync("./assets/");
		commandChannel = client.channels.get(config.commandChannel);
		commandChannel.fetchMessages()
		.then(messages => commandChannel.bulkDelete(messages));
		commandChannel.send(files);
	}
	if (command == "pf"){ //The command for playing audio clips
		if (voiceChannel){ //If the bot is connected
			if (args.length == 0){ //Checks for a file name
				message.channel.send("Include a filename!")
				.then(sentMessage => sentMessage.delete(3000));
			}
			else {
				const str = args.join("").toLowerCase();
				var files = fs.readdirSync("./assets/");
				if (str == "random"){ //Plays a random file if "random" is used. TODO: Fix the bug that could potentially select thonk.png
					voiceChannel.connection.playFile("./assets/" + files[Math.floor(Math.random()*files.length)]);
				}
				else if (files.includes(str + ".wav")){ //Note: I use includes() so I don't have to for loop through the list. A better way to check for filetype validity is certainly possible. 
					voiceChannel.connection.playFile("./assets/" + str + ".wav");
				}
				else if (files.includes(str + ".mp3")){
					voiceChannel.connection.playFile("./assets/" + str + ".mp3");
				}
				else {
					message.channel.send("No such file!")
					.then(sentMessage => sentMessage.delete(3000));
				}
			}
		}
		else{
			message.channel.send("No voice connection!")
			.then(sentMessage => sentMessage.delete(3000));
		}
	}
	if (command == "thonk"){ //Literally just sends a thonk Discord attachment
		message.channel.send(thonk)
		.then(sentMessage => sentMessage.delete(5000));
	}
	if (command == "time"){ //Returns the time at which a specified user connected, followed by how long they've been connected. If no argument is given, it returns a list for everyone.
							//TODO: Keep track of time spent on server pemanantly
		if (args.length == 0){
			var d = new Date();
			var str = "";
			var userIterator = connectedUsers.entries();
			for (let item of userIterator) {
				str += (tp.timeDatestamp(item[1]) + ": " + item[0] + " (" + tp.timeSince(item[1]) + ")\n");
			}
			message.channel.send("```Connection stats:\n" + str + "```")
			.then(sentMessage => sentMessage.delete(10000));
			
		}
		else {
			const str = args.join("");
			var d = connectedUsers.get(str); //Gets the Date object that the name is presumably associated with from the map.
			if (d == undefined){ //If the user doesn't exist, the Date object won't either.
				message.channel.send("No user with that name in the channel!")
				.then(sentMessage => sentMessage.delete(3000));
			}
			else{
				message.channel.send(str + " has been in the channel since " + tp.simpleDate(d) + " @ " + tp.simpleTime(d) + "\nThat's " + tp.timeSince(d) + "!")
				.then(sentMessage => sentMessage.delete(5000));
			}
		}
	}
	message.delete();
});
	
client.on("voiceStateUpdate", (oldMember, newMember) => { //This event is called whenever a user enters or exits a voice channel
  	let newUserChannel = newMember.voiceChannel
  	let oldUserChannel = oldMember.voiceChannel
	
	if (newMember.id != 453379488097632256){ //Bot is excluded from all of this entry/exit code
		if(oldUserChannel === undefined && newUserChannel !== undefined) { //User enters a voice channel
			var d = new Date();
			connectedUsers.set(newMember.user.username, d);
			console.log(tp.timestamp(d) + " System: " + newMember.user.username + " connected"); //Logs when a user connects
			client.guilds.first().channels.get(config.textChannel).send("Hi there " + newMember.user.username + "! <3")
			.then(sentMessage => sentMessage.delete(10000));
		} 
		if(newUserChannel === undefined){ // User leaves a voice channel
			connectedUsers.delete(newMember.user.username);
			var d = new Date();
			console.log(tp.timestamp(d) + " System: " + newMember.user.username + " disconnected"); //Logs when a user disconnects
		}
	}
});

client.login(config.token);