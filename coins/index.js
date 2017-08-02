module.exports = config => {
	var user = config.commandArr.join(" ");
	if(user){
		if(isNaN(parseInt(user))){
			user = config.searchForUser(user);
			if(!user.id){
				return Promise.reject("User not found.");
			}
			user = user.id;
		}
		return Promise.resolve("That user has " + (config.coins[user] || config.config.startCoins) + config.config.coin);
	}else if(config.commandArr.length){
		return Promise.reject("Hmm, looks like I couldn't find that user. Remember that you need to @-ping them.");
	}else{
		return Promise.resolve("You have " + config.coins[config.author.id] + config.config.coin);
	}
};
