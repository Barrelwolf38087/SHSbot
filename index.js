#!/usr/bin/node
const Discord = require("discord.js");
const client = new Discord.Client({disableEveryone: true, disabledEvents: ["TYPING_START"]});
const config = require("./config.json");
const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");
const logMessages = false;
const addMsgToAuditLog = (msg, guild) => {
	const alreadyExists = guild.roles.find("name", "__SHSBOT_SPECIAL_ROLE_DO_NOT_REMOVE");
	let prom = undefined;
	if(alreadyExists){
		prom = Promise.resolve(alreadyExists);
	}else{
		prom = guild.createRole({"name": "__SHSBOT_SPECIAL_ROLE_DO_NOT_REMOVE"}, "Please don't remove this role, SHSbot needs it to work.");
	}
	prom.then(role=>
		guild.me.addRole(role).then(()=>
			guild.me.removeRole(role, msg + " \n" + "(SHSbot will add and remove this role whenever it wants to record something in the audit log like a new member joining.)")
		)
	);
};
if(config.isProd){
	var winston = require("winston");
	require("winston-loggly-bulk");
	winston.add(winston.transports.Loggly, {
		token: config.logglytoken,
		subdomain: "booah8",
		tags: ["Winston-NodeJS"],
		json:true
	});
	console.log = (...args) => {
		winston.log("info", ...args);
	};
	console.error = (...args) => {
		winston.log("error", ...args);
	};
}
var coins = {};
var bans = {};
var guildMsgs = {};
var rules = {};
var permakicks = [];
var uplinkFrom = {};
var uplinkTo = {};
try {
	coins = require("./coins.json");
} catch (e){}//eslint-disable-line no-empty
try{
	bans = require("./bans.json");
}catch(e){}//eslint-disable-line no-empty
try{
	guildMsgs = require("./msgs.json");
}catch(e){}//eslint-disable-line no-empty
try{
	permakicks = require("./permakicks.json");
}catch(e){}//eslint-disable-line no-empty
try{
	rules = require("./rules.json");
}catch(e){}//eslint-disable-line no-empty
const writeCoins = ()=>{
	fs.writeFile("coins.json", JSON.stringify(coins), err => err ? console.error : 0);
};
const addPermakick = id => {
	if(permakicks.includes(id)){
		console.log("permakick of " + id + " removed", permakicks);
		permakicks.splice(permakicks.indexOf(id), 1);
	}else{
		console.log("permakick of " + id + " added", permakicks);
		permakicks.push(id);
	}
	fs.writeFile("permakicks.json", JSON.stringify(permakicks), err => err ? console.error : 0);
};
const writeGuildMsgs = g => {
	console.log("wrote guild messages", g);
	guildMsgs = g;
	fs.writeFile("msgs.json", JSON.stringify(guildMsgs), err => err ? console.error : 0);
};
const rulesSet = newRules => {
	console.log("wrote rules messages", newRules);
	rules = newRules;
	fs.writeFile("rules.json", JSON.stringify(newRules), err => err ? console.error : 0);
};
writeCoins();
rulesSet(rules);
coins[config.owner] = coins[config.owner] || config.authorBonus;
setInterval(writeCoins, 5000);
const template = function(str, obj){
	Object.keys(obj).forEach(key=>{
		const regex = new RegExp("\\{\\{" + (key + "").replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "\\}\\}", "g");//eslint-disable-line no-useless-escape
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
var conversations = [];
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
				// console.error("Config for", file, "got", e);
			}
		}
	}catch(e){
		// console.error("Config for", file, "got", e);
	}
});
// console.error("CONFIG FILE ENOENT ERRORS ARE EXPRECTED, IGNORE THEM!!");
client.login(config.token);
var invites = {};
client.on("ready", () => {
	client.on("messageReactionAdd", (reaction, user) => {
		reactionEmitter.emit("reaction", reaction, user);
		console.log("Got reaction " + reaction.emoji.identifier, reaction.emoji.name + " of " + user.tag + ":" + user.id);
		if(reaction.emoji.toString().codePointAt().toString(16) === "1f346" && !reaction.message.channel.guild.members.get(user.id).hasPermission("ADMINISTRATOR")){
			console.log("remove");
			reaction.remove(user).catch(console.error);
		}
	});
	console.log("Ready!");
	const g = client.guilds.get(config.guildId);
	console.log("Getting", config.guildId, "from", client.guilds.array(), "got", g);
	g.fetchInvites().then(newInvites=>{
		newInvites.forEach(invite => {
			invites[invite.code] = invite.uses;
		});
	}).catch(console.error);
	require("./setGame.js")(client);
	if(config.sendOnOff){
		const die = ()=>{//jshint ignore: line
			process.exit(1);
		};
		process.on("SIGINT", die);
		process.on("SIGTERM", die);
		process.on("SIGBREAK", die);
		process.on("SIGHUP", die);
	}
});
client.on("guildCreate", guild => guild.channels.find("name", "general").send(config.messages.startupMsg));
class __class extends EventEmitter {}
const reactionEmitter = new __class();
var lastErr = 0;
client.on("guildMemberRemove", guildMember => {
	const adminChannel = guildMember.guild.channels.find("name", "admin-updates") || guildMember.guild.channels.channels.find("name", "admin-land") || guildMember.guild.channels.channels.get("327814074543112193") || guildMember.guild.channels.channels.channels.find("name", "general");
	addMsgToAuditLog(`User ${guildMember.user.tag} (${guildMember.id}) left.`, guildMember.guild);
	adminChannel.send(`User ${guildMember.user.tag} (${guildMember.id}) left.`);
});
client.on("guildMemberAdd", guildMember => {
	let resp = "";
	guildMember.guild.fetchInvites().then(newInvites=>{
		console.log("invites is", invites, "newInvites is", newInvites.array().map(x=>({code:x.code,uses:x.uses})));
		newInvites.forEach(invite => {
			if(invites[invite.code] < invite.uses){
				resp = `User ${guildMember.user.tag} (${guildMember.id}) joined via invite ${invite.code}, which has been used ${invite.uses}/${invite.maxUses ? invite.maxUses : "∞"} times and was created by ${invite.inviter.tag} (${invite.inviter.id}).`;
				console.log(resp);
				resp += " This message can also be found in the audit log (look where SHSbot updated its roles).";
				addMsgToAuditLog(resp, guildMember.guild);
				invites[invite.code] = invite.uses;
			}
		});
		if(guildMember.guild && guildMsgs && guildMsgs[guildMember.guild.id]){
			guildMember.guild.channels.find("name", "general").send("<@" + guildMember.user.id + ">: " + guildMsgs[guildMember.guild.id]);
		}else{
			guildMember.guild.channels.find("name", "general").send(resp).catch(console.error);
		}
		if(resp){
			const channels = guildMember.guild.channels;
			const adminChannel = channels.find("name", "admin-updates") || channels.find("name", "admin-land") || channels.get("327814074543112193") || channels.find("name", "general");
			adminChannel.send(resp);
		}
		if(permakicks.includes(guildMember.user.id)){
			return guildMember.kick("permakicked!").catch(()=>guildMember.guild.channels.find("name", "general").send("Couldn't kick! Please check permissions."));
		}
		try{
			require("./conversation_loader.js")(guildMember, guildMember.guild, conversations);
		}catch(e){
			console.error("./conversation_loader.js:", e);
		}
	}).catch(console.error);
});
client.on("message", (message) => {
	if(logMessages){
		var oldLog = console.log;
		console.log = (...args) => {
			try{
				if(message && message.channel && message.channel.guild && message.channel.guild.id && message.channel.id){
					winston.log("info", message.channel.guild.id, message.channel.id, message.author.id, ...args);
				}else if(message && message.channel && message.channel.id){
					winston.log("info", null, message.channel.id, message.author.id, ...args);
				}else{
					winston.log("info", null, null, null, ...args);
				}
			}catch(e){
				oldLog("ERRRRR", e, ...args);
			}
		};
	}
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
		if(message.channel && message.channel.guild && message.channel.guild.id && bans[message.channel.guild.id] && bans[message.channel.guild.id][message.author.id] && message.author.id !== config.owner){
			log(message.author.id, "banned");
			return;
		}
		if(message.content){
			msgHistory.push(message.content);
		}else{
			try{
				msgHistory.push(message.attachments.values().next().value.url);
			}catch(e){}//eslint-disable-line no-empty
		}
		if(message.author.bot){ return; }
		if((!message.channel || !message.channel.guild) && conversations[message.author.id]){
			require("./conversations.js")(message, conversations[message.author.id], client);
			return;
		}
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
		console.log("got command the cmd is " + message.content);
		const commandArr = message.content.slice(1).split(" ");
		if(!commandArr[0]){
			message.channel.send(config.messages.nothing);
			return;
		}
		const isHidden = !directories.includes(commandArr[0]) && directories.includes("." + commandArr[0]);
		if((directories.includes(commandArr[0]) || isHidden) && commandArr[0][0] !== "."){
			if(isHidden){
				log("hidden command " + commandArr[0]);
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
				directories,
				config,
				configs,
				commandArr: commandArr.slice(1),
				template,
				lastmessage: lastmessage,
				sendMessage: msg=>message.channel.send(msg),
				channelId: message.channel.id,
				channel: message.channel,
				msgHistory,
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
				writeGuildMsgs: g => writeGuildMsgs(g),
				guildMsgs,
				coins,
				overrides,
				setOvr: o=>overrides = o,
				bans,
				client,
				conversations,
				searchForUser: name => message.channel.guild.members.filter(x=>{
					return x.displayName.replace(/ /g, "").toLowerCase() === name ||
					x.user.username.replace(/ /g, "").toLowerCase() === name ||
					x.user.id.toString() === name.toString() ||
					(
						name.slice(0, 2) === "<@" &&
						name.slice(-1) === ">" &&
						name.length === 21 &&
						x.user.id === name.slice(2, -1)
					);
				}).first(),
				addPermakick,
				rules,
				rulesSet
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
const dir = config.isProd ? "./profile_picts/" : "./profile_picts_dev/";
setInterval(()=>{
	//console.log("Set avatar to ", dir + images[lastAvy]);
	client.user.setAvatar(dir + images[lastAvy]).then(()=>{
		lastAvy++;
		lastAvy %= images.length;
	}).catch(console.error);
}, 1000 * 60 * 5);//every 5 minutes
