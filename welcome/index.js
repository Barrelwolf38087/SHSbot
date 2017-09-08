module.exports = config => new Promise(resolve => {
	config.guildMsgs = config.guildMsgs || {};
	config.guildMsgs[config.guildId] = config.commandArr.join(" ");
	console.log("config.guildMsgs", config.guildMsgs);
	config.writeGuildMsgs(config.guildMsgs);
	resolve("Updated welcome message!");
});
