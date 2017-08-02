const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

var coins = require("./coins.json");

const writeCoins = ()=>{
	fs.writeFile("coins.json", JSON.stringify(coins), ()=>{});
};

coins[config.owner] = coins[config.owner] || config.authorBonus;

setInterval(writeCoins, 5000);

const template = function(str, obj){
	Object.keys(obj).forEach(key=>{
			const regex = new RegExp("\\{\\{" + (key + "").replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "\\}\\}", "g");
			str = str.replace(regex, obj[key]);
	});
	return str;
};

var directories = [];
var configs = {};
var msgHistory = [];
var lastmessage;

var backoff = {};
var warned = {};

var advancedBackoff = {};

var isRunning = {};

const log = function(){
	if(process.argv[2] === "--log"){
		console.log.apply(undefined, ["index.js:"].concat(Array.from(arguments)));
	}
};

fs.readdir(__dirname, function (err, files) {
	if (err) { throw err; }

	files.forEach(function (file) {
		if(file === "node_modules" || file === "temp" || file[0] === ".git"){
			return;
		}
		fs.lstat(path.join(__dirname, file), function(err, stats) {
			if (!err && (stats.isDirectory() || stats.isSymbolicLink())) {
				log("adding directory", file);
				directories.push(file);
				try{
					configs[file] = require(path.join(__dirname, file, "config.json"), "utf8");
				}catch(e){
					console.error("Config for", file, "got", e);
				}
			}
		});
	});
});

client.login(config.token);
client.on("ready", () => {
	client.user.setGame(`run $help for help`);
	console.log("Ready!");
	if(config.sendOnOff){
		client.guilds.array().filter(g=>g.available).forEach(g=>g.defaultChannel.send("Back up!"));
		const die = ()=>{//jshint ignore: line
			var promises = [];
			client.guilds.array().filter(g=>g.available).forEach(g=>{
				promises.push(g.defaultChannel.send("Going down :("));
			});
			Promise.all(promises).then(()=>process.exit(0)).catch(e=>{
				console.error(e);
				process.exit(1);
			});
		};
		process.on("SIGINT", die);
		process.on("SIGTERM", die);
		process.on("SIGBREAK", die);
		process.on("SIGHUP", die);
	}
});


class __class extends EventEmitter {}

const reactionEmitter = new __class();
client.on("messageReactionAdd", (reaction, user) => {
	reactionEmitter.emit("reaction", reaction, user);
});

client.on("message", (message) => {
	console.log(message.content);

	if(message.content){
		msgHistory.push(message.content);
	}else{
		try{
			msgHistory.push(message.attachments.values().next().value.url);
		}catch(e){}
	}

	if(message.author.bot){ return; }

	if(message.content[0] !== config.prefix){
		lastmessage = message.content;
		return;
	}

	coins[message.author.id] = coins[message.author.id] || 100;

	if(isRunning[message.author.id] && message.author.id.toString() !== config.owner){
		log(message.author.id, "already running", isRunning);
		isRunning[message.author.id] = false;
		return message.reply(config.messages.alreadyRunning);
	}

	isRunning[message.author.id] = true;

	if(backoff[message.author.id] && Date.now() - backoff[message.author.id] <= config.timeout && message.author.id.toString() !== config.owner.toString()){
		log("simple backoff");
		if(!warned[message.author.id]){
			warned[message.author.id] = true;
			backoff[message.author.id] = Date.now() + config.penalty;
			isRunning[message.author.id] = false;
			return message.reply(config.messages.backoff);
		}else{
			log("already warned.");
			backoff[message.author.id] = Date.now() + config.penalty;
			isRunning[message.author.id] = false;
			return;
		}
	}else{
		warned[message.author.id] = false;
	}

	if(advancedBackoff[message.author.id] && message.author.id.toString() !== config.owner.toString()){
		advancedBackoff[message.author.id].messages = advancedBackoff[message.author.id].messages.filter(x=>Date.now() - x <= config.advancedTimeout);
		advancedBackoff[message.author.id].messages.push(Date.now());

		if(advancedBackoff[message.author.id].messages.length >= 5){
			log("advanced");
			advancedBackoff[message.author.id].messages.push(Date.now() + config.penalty);
			if(!advancedBackoff[message.author.id].warned){
				isRunning[message.author.id] = false;
				return message.reply(config.messages.backoff);
			}else{
				log("already warned");
				isRunning[message.author.id] = false;
				return;
			}
		}else{
			advancedBackoff[message.author.id].warned = false;
		}
	}else{
		advancedBackoff[message.author.id] = {messages: [Date.now()]};
	}

	log("author:", message.author.id, "backoff", backoff, "away", Date.now() - backoff[message.author.id], "advancedBackoff", advancedBackoff);

	backoff[message.author.id] = Date.now();


	const commandArr = message.content.slice(1).split(" ");

	if(!commandArr[0]){
		message.channel.send(config.messages.nothing);
		return;
	}
	const isHidden = !directories.includes(commandArr[0]) && directories.includes("." + commandArr[0]);

	if((directories.includes(commandArr[0]) || isHidden) && commandArr[0][0] !== "."){
		if(isHidden){
			commandArr[0] = "." + commandArr[0];
		}
		console.log("teh config", configs[commandArr[0]]);
		var file = require("./" + path.join(commandArr[0], "index.js"));

		var hasPermission = false;
		if(configs[commandArr[0]] && configs[commandArr[0]].permissions){
			const admin = (configs[commandArr[0]].permissions + "")[0] === "1";
			const everyone = ((configs[commandArr[0]].permissions + "")[1] || "1") === "1";
			log("admin", admin, "everyone", everyone);
			if(everyone){//everyone
				log(".*");
				hasPermission = true;
			}else if(message.member.hasPermission("ADMINISTRATOR") && admin){//admin
				log("admin");
				hasPermission = true;
			}
		}else{
			hasPermission = true;
		}

		if(configs[commandArr[0]] && configs[commandArr[0]].guilds && configs[commandArr[0]].guilds[message.channel.guild.id] && configs[commandArr[0]].guilds[message.channel.guild.id].userOverrides && configs[commandArr[0]].guilds[message.channel.guild.id].userOverrides[message.author.id]){
			log("override", configs[commandArr[0]].guilds[message.channel.guild.id].userOverrides[message.author.id]);
			hasPermission = configs[commandArr[0]].guilds[message.channel.guild.id].userOverrides[message.author.id];
		}

		if(message.author.id + "" === config.owner){//owner
			log("owner");
			hasPermission = true;
		}

		if(!hasPermission){
			const reply = "You don't have permission to execute this command.";
			lastmessage = reply;
			log("replying with & added to last2messages", reply);
			message.channel.send("Error: " + reply);
			isRunning[message.author.id] = false;
			log(403);
			return;
		}




		file({
			directories: directories,
			config: config,
			configs: configs,
			commandArr: commandArr.slice(1),
			template: template,
			lastmessage: lastmessage,
			sendMessage: msg=>message.channel.send(msg),
			channelId: message.channel.id,
			msgHistory: msgHistory,
			guildId: message.channel.guild.id,
			delete: msg=>client.deleteMessage(msg),
			id: message.id,
			emojis: message.channel.guild.emojis.array(),
			author: message.author,
			reactions: file.listenForReactions ? reactionEmitter : undefined,
			writeCoins: ()=>writeCoins(),
			coins: coins
		}).then(reply=>{
			isRunning[message.author.id] = false;
			if(!reply){
				return;
			}
			lastmessage = reply;
			log("replying with & added to last2messages", reply);
			if(reply && (typeof reply !== "string" || reply.trim())){
				message.channel.send(reply).catch(console.error);
			}
		}).catch(reply=>{
			lastmessage = reply;
			log("replying with & added to last2messages", reply);
			message.channel.send("Error: " + reply).catch(console.error);
			isRunning[message.author.id] = false;
		});
	}else{
		message.channel.send(template(config.messages.notFound, {command: commandArr[0], prefix: config.prefix})).then(()=>isRunning[message.author.id] = false);
	}
});
