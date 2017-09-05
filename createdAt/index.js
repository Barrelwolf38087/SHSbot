const pad2 = str => ("0" + str).slice(-2);

module.exports = config => {
	var date = config.guilds.get(config.guildId).createdAt;
	var str = `This server was created on ${date.getMonth()}/${date.getDate()}/${date.getFullYear()} at ${date.getHours()}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
	return Promise.resolve(str);
};
