module.exports = config => new Promise(resolve => {
	config.coins[config.commandArr[0]] = config.commandArr[1];
	config.writeCoins();
	resolve("Coins set.");
});
