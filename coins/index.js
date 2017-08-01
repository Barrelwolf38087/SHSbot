module.exports = config => {
	const user = config.commandArr.join(" ").slice(2, -1);
	if(/^<@\d+>$/.test(config.commandArr.join(" ")) && user){
		return Promise.resolve(config.coins[user] || config.config.startCoins);
	}else if(config.commandArr.length){
		return Promise.reject("Hmm, looks like I couldn't find that user. Remember that you need to @-ping them.");
	}else{
		return Promise.resolve(config.coins[config.author.id]);
	}
};
