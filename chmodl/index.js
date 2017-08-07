module.exports = config => {
	config.commandArr = config.commandArr.slice(0, 1);
	return require("../.chmod/index.js")(config);
};
