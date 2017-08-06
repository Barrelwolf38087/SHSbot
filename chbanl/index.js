module.exports = config => {
	config.commandArr = config.commandArr.slice(0, 1);
	return require("../.chban/index.js")(config);
};
