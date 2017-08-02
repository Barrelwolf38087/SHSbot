const fs = require("fs");
const path = require("path");

module.exports = config => new Promise((resolve, reject)=>{
	const command = config.commandArr[0];
	const user = config.commandArr[1];
	const permission = config.commandArr[2] === "1";
	var config2 = config.configs[command];
	if(!config2){
		return reject("Command not found");
	}
	if(config2.permissions && config2.permissions[2] === "0"){
		return reject("Sticky bit set");
	}
	config2.guilds = config2.guilds || {};
	config2.guilds[config.guildId] = config2.guilds[config.guildId] || {};
	config2.guilds[config.guildId].userOverrides = config2.guilds[config.guildId].userOverrides || {};
	config2.guilds[config.guildId].userOverrides[user] = permission;
	console.log("write", JSON.stringify(config2), "to", path.join(__dirname, "..", command, "config.json"));
	fs.writeFile(path.join(__dirname, "..", command, "config.json"), JSON.stringify(config2), err=>err ? reject(err) : resolve());
});
