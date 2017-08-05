const fs = require("fs");
const path = require("path");

module.exports = config => new Promise((resolve, reject)=>{
	const command = config.commandArr[0];
	var user = config.commandArr[1];
	if(isNaN(parseInt(user))){
		user = user.replace(/ /g, "").toLowerCase();
		user = config.searchForUser(user);
		if(user && user.id){
			user = user.id;
		}else{
			return reject("I couldn't find that user");
		}
	}
	const permission = config.commandArr[2] === "1";
	var config2 = config.configs[command];
	var override = config.overrides[command] || {};
	if(!config2){
		return reject("Command not found");
	}
	if(config2.permissions && config2.permissions[2] === "0"){
		return reject("Sticky bit set");
	}
	override.guilds = override.guilds || {};
	override.guilds[config.guildId] = override.guilds[config.guildId] || {};
	override.guilds[config.guildId].userOverrides = override.guilds[config.guildId].userOverrides || {};
	override.guilds[config.guildId].userOverrides[user] = permission;
	console.log("write", JSON.stringify(override), "to", path.join(__dirname, "..", command, "perm-overrides.json"));
	fs.writeFile(path.join(__dirname, "..", command, "perm-overrides.json"), JSON.stringify(override), err=>err ? reject(err) : resolve("Completed."));
});