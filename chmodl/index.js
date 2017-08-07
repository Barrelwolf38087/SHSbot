module.exports = config => {
	config.commandArr = config.commandArr.slice(0, 2);
	return require("../.chmod/index.js")(config);
};
