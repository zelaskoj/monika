const Discord = require("discord.js");
const fs = require("fs");
const tp = require("./src/timeProcess.js");
const config = require("./custom/config.json");
const stats = require("./assets/stats.txt");
const client = new Discord.Client();
const thonk = new Discord.MessageAttachment("./assets/thonk.png");

var connectedUsers = new Map(); //This map represents the list of currently connected users. Their name is unique and is mapped to a Date object created when they connect. 
								//TODO: If users are already connected, initialize this list with those users and assign it a Date object from whenever the bot is initialized.
								
client.on('unhandledRejection', console.error); //Catches any unhandled rejections by outputting their error information to console

client.on("ready", () => { //When the bot initializes
	client.channels.get(config.voiceChannel).join(); //Grabs the voice channel id as specificed in config.json and joins it
	var d = new Date(); //Whenever you see this line, it's likely just to create a timestamp for an event, usually for logging purposes.
	connectedUsers.set("Monika", d);
	console.log(tp.timestamp(d) + " System: Monika connected");
});

client.on("message", message => {
	
	if (message.author.bot) return; //if message is from the bot itself, ignore
  
	if (message.content.indexOf(config.prefix) !== 0) return; //if message doesn't start with prefix, ignore
	
	var d = new Date(); 
	console.log(tp.timestamp(d) + " " + message.author.username + ": " + message.content); //Logs every non-Bot created message
	
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
			.then(sentMessage => sentMessage.delete({timeout:3000}));
		}
	}
	if (command == "enter" || command == "fuckme"){ //Commands the bot to enter the channel
		if(client.voiceConnections != null){ //If the bot isn't already connected
			const vc = client.channels.get(config.voiceChannel);
			vc.join();
			var d = new Date();
			connectedUsers.set("Monika", d);
			setTimeout(function() { 
				vc.connection.play("./assets/audio/doot.wav");
			}, 1000);
			console.log(tp.timestamp(d) + " System: Monika connected");
		}
		else {
			message.channel.send("I'm already connected!")
			.then(sentMessage => sentMessage.delete({timeout:3000}));
		}
	}
	if (command == "exit" || command == "fuckoff"){ //Commands the bot to exit the channel
		if(client.voiceConnections){ //If the bot is connected
			client.channels.get(config.voiceChannel).leave();
			var d = new Date();
			connectedUsers.delete("Monika");
			console.log(tp.timestamp(d) + " System: Monika disconnected");
		}
		else{
			message.channel.send("I'm not connected!")
			.then(sentMessage => sentMessage.delete({timeout:3000}));
		}
	}
	if (command == "help" && message.author.id == 90165848467070976){ //admin only for now
		const help = fs.createReadStream("./assets/help.txt", "utf8").on('readable', function(){
			client.guilds.first().channels.get(config.commandChannel).send(help.read());
		});	
		setTimeout(function() {
			var files = fs.readdirSync("./assets/audio/");
			for (i in files){
				files[i] = files[i].substring(0, files[i].length - 4);
			}
			client.guilds.first().channels.get(config.commandChannel).send("\```Audio files: \n\n" + files.toString().replace(/,/g, "\n") + "\```");
		}, 1000);
	}
	if (command == "pf"){ //The command for playing audio clips
		if (client.voiceConnections != null){ //If the bot is connected
			if (args.length == 0){ //Checks for a file name
				message.channel.send("Include a filename!")
				.then(sentMessage => sentMessage.delete({timeout:3000}));
			}
			else {
				var str = args.join("").toLowerCase();
				var files = fs.readdirSync("./assets/audio/");
				if (str == "thot"){
					client.channels.get(config.voiceChannel).connection.play("./assets/audio/thot.wav");
					if (Math.floor(Math.random() * 4) == 0){
						setTimeout(function() { 
							client.channels.get(config.voiceChannel).leave();
							var d = new Date();
							connectedUsers.delete("Monika");
							console.log(tp.timestamp(d) + " System: Monika disconnected");
						}, 2000);
					}
				}
				if (str == "random"){
					while (str == "thonk.png" || str == "random"){
						str = files[Math.floor(Math.random()*files.length)];
					}
					client.channels.get(config.voiceChannel).connection.play("./assets/audio/" + str);
				}
				else {
					if (!files.includes(str + ".wav")){
						message.channel.send("No such file!")
						.then(sentMessage => sentMessage.delete({timeout:3000}));
					}
					else {
						client.channels.get(config.voiceChannel).connection.play("./assets/audio/" + str + ".wav");
					}
				}
			}
		}
		else{
			message.channel.send("No voice connection!")
			.then(sentMessage => sentMessage.delete({timeout:3000}));
		}
	}
	if (command == "thonk"){ //Literally just sends a thonk Discord attachment
		message.channel.send("hmmm", thonk)
		.then(sentMessage => sentMessage.delete({timeout:5000}));
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
			.then(sentMessage => sentMessage.delete({timeout:10000}));
			
		}
		else {
			const str = args.join("");
			var d = connectedUsers.get(str); //Gets the Date object that the name is presumably associated with from the map.
			if (d == undefined){ //If the user doesn't exist, the Date object won't either.
				message.channel.send("No user with that name in the channel!")
				.then(sentMessage => sentMessage.delete({timeout:3000}));
			}
			else{
				message.channel.send(str + " has been in the channel since " + tp.simpleDate(d) + " @ " + tp.simpleTime(d) + "\nThat's " + tp.timeSince(d) + "!")
				.then(sentMessage => sentMessage.delete({timeout:5000}));
			}
		}
	}
	message.delete();
});
	
client.on("voiceStateUpdate", (oldMember, newMember) => { //This event is called whenever a user enters or exits a voice channel
	if (newMember.id != config.bot){
		if (oldMember.channel == null && newMember.channel != null){ //User joins a voice channel
			var d = new Date();
			connectedUsers.set(newMember.member.user.username, d);
			console.log(tp.timestamp(d) + " System: " + newMember.member.user.username + " connected"); //Logs when a user connects
			client.guilds.first().channels.get(config.textChannel).send(config.greeting1 + newMember.member.user.username + config.greeting2)
			.then(sentMessage => sentMessage.delete({timeout:10000}));
			client.channels.get(config.voiceChannel).connection.play("./assets/audio/doot.wav");
		}
		if(newMember.channel == null){ // User leaves a voice channel
			connectedUsers.delete(newMember.member.user.username);
			var d = new Date();
			console.log(tp.timestamp(d) + " System: " + newMember.member.user.username + " disconnected"); //Logs when a user disconnects
		}
	}
});

client.login(config.token);