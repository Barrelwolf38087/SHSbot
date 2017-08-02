module.exports = config => new Promise((resolve, reject) => {
	if(isNaN(parseInt(config.commandArr[0]))){
		const orig = config.commandArr[0];
		config.commandArr[0] = config.searchForUser(config.commandArr[0]);
		if(!config.commandArr[0].id){
			return reject("User " + orig + " not found");
		}
		config.commandArr[0] = config.commandArr[0].id;
	}
	config.coins[config.commandArr[0]] = parseInt(config.commandArr[1]);
	config.writeCoins();
	resolve("Coins set.");
});
