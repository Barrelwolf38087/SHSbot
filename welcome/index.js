module.exports = config => new Promise((resolve, reject) => {
	config.guildMsgs = config.config.guildMsgs || {};
	config.config.guildMsgs[config.guildId] = config.commandArr.join("");
	config.writeConfig();
	resolve("Updated welcome message!");
});
