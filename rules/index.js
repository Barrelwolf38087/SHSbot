var rules = {};

try{
	rules = require("../rules.json");
}catch(e){}

module.exports = config => {
	if(rules[config.guildId] && rules[config.guildId][parseInt(config.commandArr[0])])
};
