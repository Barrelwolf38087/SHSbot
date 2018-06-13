module.exports = config => {
	config.rules[config.commandArr[0]] = config.commandArr.slice(1).join(" ");
	config.rulesSet(config.rules);
	return Promise.resolve("Done!");
};
