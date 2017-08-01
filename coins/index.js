module.exports = config => {
	const user = config.commandArr.join(" ").slice(2, -1);
	if(/^<@\d+>$/.test(config.commandArr.join(" ")) && user){
		return Promise.resolve("That user has " + (config.coins[user] || config.config.startCoins) + config.config.coin);
	}else if(config.commandArr.length){
		return Promise.reject("Hmm, looks like I couldn't find that user. Remember that you need to @-ping them.");
	}else{
		return Promise.resolve("You have " + config.coins[config.author.id] + config.config.coin);
	}
};
