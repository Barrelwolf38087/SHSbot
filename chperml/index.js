module.exports = config => {
	config.commandArr = config.commandArr.slice(0, 3);
	return require("../.chperm/index.js")(config);
};
