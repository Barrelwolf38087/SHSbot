module.exports = config => {
	config.commandArr = config.commandArr.slice(0, 2);

	const targetC = config.configs[config.commandArr[0]];
	if(targetC && targetC.permissions === "00"){
		return Promise.reject("You can't modify that command.");
	}

	return require("../.chmod/index.js")(config);
};
