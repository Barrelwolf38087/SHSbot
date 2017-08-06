const fs = require("fs");

module.exports = config => new Promise((resolve, reject)=>{
	var user = config.commandArr[0];
	const global = config.commandArr[1];

	if(isNaN(parseInt(user))){
		user = user.replace(/ /g, "").toLowerCase();
		user = config.searchForUser(user);
		if(user && user.id){
			user = user.id;
		}else{
			return reject("I couldn't find that user");
		}
	}

	if(!user){
		return reject("I couldn't find that user");
	}

	config.bans = config.bans || {};

	if(global){
		config.bans.global = config.bans.global || {};
		config.bans.global[user] = !config.bans.global[user];
	}else{
		config.bans[config.guildId] = config.bans[config.guildId] || {};
		config.bans[config.guildId][user] = !config.bans[config.guildId][user];
	}

	fs.writeFile("./bans.json", JSON.stringify(config.bans), ()=>resolve("Sucessfully banned / unbanned."));
});
