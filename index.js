const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");



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
		if(file === "node_modules" || file === "temp"){ return; }
		fs.lstat(path.join(__dirname, file), function(err, stats) {
			if (!err && (stats.isDirectory() || stats.isSymbolicLink())) {
				log("adding directory", file);
				directories.push(file);
				try{
					configs[file] = require(path.join(__dirname, file, "config.json"), "utf8");
				}catch(e){}
			}
		});
	});
});

client.login(config.token);
client.on("ready", () => {
	client.user.setGame(`run $help for help`);
	console.log("Ready!");
});

class __class extends EventEmitter {}

const reactionEmitter = new __class();
client.on("messageReactionAdd", (reaction, user) => {
	reactionEmitter.emit("reaction", reaction, user);
});

client.on("message", (message) => {
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

	if(isRunning[message.author.id] && message.author.id.toString() !== config.owner.toString()){
		log(message.author.id, "already running");
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
		var file = require("./" + path.join(commandArr[0], "index.js"));
		file({
			directories: directories,
			config: config,
			configs: configs,
			commandArr: commandArr.slice(1),
			template: template,
			lastmessage: lastmessage,
			sendMessage: msg=>message.channel.send(msg),
			msgHistory: msgHistory,
			delete: msg=>client.deleteMessage(msg),
			id: message.id,
			emojis: message.channel.guild.emojis.array(),
			author: message.author,
			reactions: file.listenForReactions ? reactionEmitter : undefined
		}).then(reply=>{
			if(!reply){
				return;
			}
			lastmessage = reply;
			log("replying with & added to last2messages", reply);
			message.channel.send(reply);
			isRunning[message.author.id] = false;
		}).catch(reply=>{
			lastmessage = reply;
			log("replying with & added to last2messages", reply);
			message.channel.send("Error: " + reply);
			isRunning[message.author.id] = false;
		});
	}else{
		message.channel.send(template(config.messages.notFound, {command: commandArr[0], prefix: config.prefix})).then(()=>isRunning[message.author.id] = false);
	}
});
