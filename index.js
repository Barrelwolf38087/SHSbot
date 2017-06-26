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

fs.readdir(__dirname, function (err, files) {
	if (err) throw err;

	files.forEach(function (file) {
		if(file === "node_modules" || file === ".git") return;
		fs.lstat(path.join(__dirname, file), function(err, stats) {
			if (!err && stats.isDirectory()) {
				console.log("adding directory", file);
				directories.push(file);
				configs[file] = require(path.join(__dirname, file, "config.json"), "utf8");
			}
		});
	});
});

client.login(config.token);

client.on("ready", () => {
	console.log("I am ready!");
});

client.on("message", (message) => {
	if(message.author.bot || message.content[0] !== config.prefix) return;
	console.log(Object.entries(message), message.content);

	const commandArr = message.content.slice(1).split(" ");

	if(directories.includes(commandArr[0])){
		require("./" + path.join(commandArr[0], "index.js"))({
			directories: directories,
			config: config,
			configs: configs,
			commandArr: commandArr.slice(1),
			template: template
		}).then(x=>message.reply(x));
	}else{
		message.reply(template(config.messages.notFound, {command: commandArr[0], prefix: config.prefix}));
	}
});
