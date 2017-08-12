const cfg = require("./config.json");
const path = require("path");

module.exports = config => new Promise(function(resolve, reject) {
	if(!config.commandArr[0]){
		return reject(config.template(cfg.messages.empty, config.config));
	}
	var subcommand;
	console.log("getting subcommand", config.commandArr[0], "at", "./" + path.join(config.commandArr[0], "index.js"));
	try{
		subcommand = require("./" + path.join(".", config.commandArr[0], "index.js"));
	}catch(e){
		console.error(e);
		return reject(config.template(cfg.messages.notFound, config.config));
	}
	subcommand({
		directories: config.directories,
		config: config.config,
		configs: config.configs,
		commandArr: config.commandArr.slice(1),
		template: config.template,
		lastmessage: config.lastmessage,
		sendMessage: config.sendMessage,
		msgHistory: config.msgHistory,
		delete: config.delete,
		id: config.id,
		privateMessage: config.privateMessage
	}).then(resolve).catch(reject);
});
