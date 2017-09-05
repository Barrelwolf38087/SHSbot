
module.exports = config => {
	var date = config.guilds.get(config.guildId).createdAt;
	var str = `This server was created on ${date.getMonth()}/${date.getDate()}/${date.getFullYear()} at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
	return Promise.resolve(str);
};
