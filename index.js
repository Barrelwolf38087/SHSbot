const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
const path = require("path");



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

fs.readdir(__dirname, function (err, files) {
	if (err) throw err;

	files.forEach(function (file) {
		if(file === "node_modules" || file === ".git" || file === "temp") return;
		fs.lstat(path.join(__dirname, file), function(err, stats) {
			if (!err && (stats.isDirectory() || stats.isSymbolicLink())) {
				console.log("adding directory", file);
				directories.push(file);
				configs[file] = require(path.join(__dirname, file, "config.json"), "utf8");
			}
		});
	});
});

client.login(config.token);

client.on("ready", () => {

	console.log(client.deleteMessage, Discord.deleteMessage, Object.keys(client), Object.keys(Discord));
	client.user.setGame(`run $help for help`);
	console.log("Ready!");
});

client.on("message", (message) => {
	//console.log(message);

	msgHistory.push(message.content);

	if(message.content[0] !== config.prefix){
		lastmessage = message.content;
		return;
	}

	if(message.author.bot) return;

	const commandArr = message.content.slice(1).split(" ");

	if(!commandArr[0]){
		message.channel.send(config.messages.nothing);
		return;
	}

	if(directories.includes(commandArr[0])){
		require("./" + path.join(commandArr[0], "index.js"))({
			directories: directories,
			config: config,
			configs: configs,
			commandArr: commandArr.slice(1),
			template: template,
			lastmessage: lastmessage,
			sendMessage: msg=>message.channel.send(msg),
			msgHistory: msgHistory,
			delete: msg=>client.deleteMessage(msg)
		}).then(reply=>{
			lastmessage = reply;
			console.log("replying with & added to last2messages", reply);
			message.channel.send(reply);
		}).catch(reply=>{
			lastmessage = reply;
			console.log("replying with & added to last2messages", reply);
			message.channel.send("Error: " + reply);
		});
	}else{
		message.channel.send(template(config.messages.notFound, {command: commandArr[0], prefix: config.prefix}));
	}
});
