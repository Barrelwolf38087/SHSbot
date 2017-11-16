module.exports = config => {
	if(config.rules[parseInt(config.commandArr[0])]){
		return Promise.resolve(rules[parseInt(config.commandArr[0])]);
	}else{
    return Promise.reject("Rule #" + config.commandArr[0] + "not found!");
  }
};
