#!/usr/bin/node
//shbangs for the win

const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

var winston = require('winston');
require('winston-loggly-bulk');

winston.add(winston.transports.Loggly, {
    token: config.logglytoken,
    subdomain: "booah8",
    tags: ["Winston-NodeJS"],
    json:true
});

if(config.isProd){
	console.log = (...args) => {
		winston.log('info',...args);
	};
	console.error = (...args) => {
		winston.log('error',...args);
	};
}

var coins = {};
var bans = {};

var uplinkFrom = {};
var uplinkTo = {};

try {
	coins = require("./coins.json");
} catch (e){}

try{
	bans = require("./bans.json");
}catch(e){}

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
var configs = Object.create(null);
var overrides = Object.create(null);
var msgHistory = [];
var lastmessage;

var backoff = {};
var warned = {};

var advancedBackoff = {};

var isRunning = {};



var files = fs.readdirSync(__dirname);

files.forEach(function (file) {
	if(file === "node_modules" || file === "temp" || file === ".git" || file === "profile_picts"){
		return;
	}
	try{
		var stats = fs.lstatSync(path.join(__dirname, file));
		if ((stats.isDirectory() || stats.isSymbolicLink())) {
			console.log("adding directory", file);
			directories.push(file);
			try{
				configs[file] = require(path.join(__dirname, file, "config.json"));
				overrides[file] = require(path.join(__dirname, file, "perm-overrides.json"));
			}catch(e){
				console.error("Config for", file, "got", e);
			}
		}
	}catch(e){
		console.error("Config for", file, "got", e);
	}
	console.error("CONFIG FILE ENOENT ERRORS ARE EXPRECTED, IGNORE THEM!!");
});

client.login(config.token);
client.on("ready", () => {
	client.user.setGame(`run $help for help`);
	console.log("Ready!");
	if(config.sendOnOff){
		client.guilds.array().filter(g=>g.available).forEach(g=>g.defaultChannel.send(config.messages.startupMsg));
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

var lastErr = 0;

client.on("message", (message) => {
	var oldLog = console.log;
	console.log = (...args) => {
		if(message){
			winston.log("info", message.channel.guild.id, message.channel.id, message.author.id, ...args);
		}else{
			oldLog(...args);
		}
	};
	const log = (...args) => {
		console.log("index.js:", ...args);
	};
	const fail2 = e => {
		console.error(e);
		try {
			message.author.send("Sorry, there was an unexpected error. SHSbot might not have permissions to send or read messages.").catch(console.error);
		} catch (e) {
			console.error(e);
		}
	};

	const fail1 = e => {
		console.error("FAIL ERROR!!!", e);
		if(message.channel && message.channel.guild && message.channel.guild.id && Date.now() - lastErr > 4000){
			lastErr = Date.now();
			try {
				message.channel.send("Sorry, there was an unexpected error.").catch(fail2);
				message.channel.stopTyping(true);
			} catch (e) {
				fail2();
			}
		}
	};

	try{
		var isTo;
		var isFrom;

		if(message.channel.id === uplinkTo.id && message.author.id !== client.user.id && message.content[0] !== config.prefix){
			isTo = true;
		}else if(message.channel.id === uplinkFrom.id && message.author.id !== client.user.id && message.content[0] !== config.prefix){
			isFrom = true;
		}

		if(isFrom){
			uplinkTo.send(message + "");
		}
		if(isTo){
			uplinkFrom.send("User " + message.author.username + " (" + message.author.id + ") sent " + message);
		}

		if(bans.global && bans.global[message.author.id] && message.author.id !== config.owner){
			log(message.author.id, "banned");
			return;
		}
		if(bans[message.channel.guild.id] && bans[message.channel.guild.id][message.author.id] && message.author.id !== config.owner){
			log(message.author.id, "banned");
			return;
		}

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
			var o = overrides[commandArr[0]];

			const guildId = message.channel.guild.id;

			var perms;

			const globalPerms = () => {
				if(configs[commandArr[0]] && configs[commandArr[0]].permissions){
					log("global");
					perms = configs[commandArr[0]].permissions;
				}
			};

			const globalPermsOverride = () => {
				log("o is", o);
				if(o && o.permissionsOverride){
					log("command-specific");
					perms = o.permissionsOverride;
				}
			};

			const guildSpecificPerms = () => {
				if(o && o.guilds && o.guilds[guildId]){
					log("guild-specific");
					perms = o.guilds[guildId].permissionsOverride;
				}
			};

			const allPerms = () => {
				if(configs[commandArr[0]]){
					if(perms){
						const admin = (perms + "")[0] === "1";
						const everyone = ((perms + "")[1] || "1") === "1";
						log("admin", admin, "everyone", everyone);
						if(everyone){
							log(".*");
							hasPermission = true;
						}else if(message.member.hasPermission("ADMINISTRATOR") && admin){
							log("admin");
							hasPermission = true;
						}
					}else{
						log("no perms");
						hasPermission = true;
					}
				}else{
					log("no configs");
					hasPermission = true;
				}
			};

			const guildSpecificUserOverride = () =>{
				var thisGuild;
				if(o && o.guilds && o.guilds[message.channel.guild.id]){
					thisGuild = o.guilds[message.channel.guild.id];
						log("thisGuild", thisGuild, "id", message.channel.guild.id);
				}
				if(thisGuild && thisGuild.userOverrides && thisGuild.userOverrides[message.author.id] !== undefined){
					log("override", thisGuild.userOverrides[message.author.id]);
					hasPermission = thisGuild.userOverrides[message.author.id];
				}
			};

			const globalUserOverride = () => {
				if(o && o.userOverrides && o.userOverrides[message.author.id] !== undefined){
					log("global user overrides");
					hasPermission = o.userOverrides[message.author.id];
				}
			};

			const owner = () => {
				if(message.author.id + "" === config.owner){//owner
					log("owner");
					hasPermission = true;
				}
			};

				globalPerms();
				globalPermsOverride();
				guildSpecificPerms();
			allPerms();

			guildSpecificUserOverride();

			globalUserOverride();

			owner();

			if(!hasPermission){
				const reply = "You don't have permission to execute this command.";
				lastmessage = reply;
				log("replying with & added to last2messages", reply);
				message.channel.send("Error: " + reply);
				isRunning[message.author.id] = false;
				log(403);
				message.channel.stopTyping(true);
				return;
			}

			message.channel.startTyping(1);
			file({
				directories: directories,
				config: config,
				configs: configs,
				commandArr: commandArr.slice(1),
				template: template,
				lastmessage: lastmessage,
				sendMessage: msg=>message.channel.send(msg),
				channelId: message.channel.id,
				channel: message.channel,
				msgHistory: msgHistory,
				guilds: client.guilds,
				guildId: message.channel.guild.id,
				setUplinkFrom: str => uplinkFrom = str,
				setUplinkTo: str => uplinkTo = str,
				delete: msg=>client.deleteMessage(msg),
				id: message.id,
				privateMessage: msg => message.author.send(msg).catch(console.error),
				emojis: message.channel.guild.emojis.array(),
				author: message.author,
				reactions: file.listenForReactions ? reactionEmitter : undefined,
				writeCoins: ()=>writeCoins(),
				coins: coins,
				overrides: overrides,
				setOvr: o=>overrides = o,
				bans: bans,
				searchForUser: name=>message.channel.guild.members.filter(x=>{
					return x.displayName.replace(/ /g, "").toLowerCase() === name;
				}).first()
			}).then(reply=>{
				isRunning[message.author.id] = false;
				if(!reply){
					message.channel.stopTyping(true);
					return;
				}
				lastmessage = reply;
				log("replying with & added to last2messages", reply);
				if(reply && (typeof reply !== "string" || reply.trim())){
					message.channel.send(reply).catch(console.error);
				}
				message.channel.stopTyping(true);
			}).catch(reply=>{
				lastmessage = reply;
				log("replying with & added to last2messages", reply);
				message.channel.send("Error: " + reply).catch(console.error);
				isRunning[message.author.id] = false;
				message.channel.stopTyping(true);
			});
		}else{
			message.channel.send(template(config.messages.notFound, {command: commandArr[0], prefix: config.prefix})).then(()=>isRunning[message.author.id] = false).catch(fail1);
			message.channel.stopTyping(true);
		}
	}catch(e){
		fail1(e);
	}
});


var lastAvy = 0;

var images = fs.readdirSync("profile_picts");

setInterval(()=>{
	console.log("Set avatar to ", "./profile_picts/" + images[lastAvy]);
	client.user.setAvatar("./profile_picts/" + images[lastAvy]).then(()=>{
		lastAvy++;
		lastAvy %= images.length;
	}).catch(console.error);
}, 1000 * 60 * 5);//every 5 minutes
