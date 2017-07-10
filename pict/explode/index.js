const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		const num = (parseInt(config.commandArr[0], 10) || 7) / 10;
		console.log("imploding by -" + num);
		const res = gm(file).implode(0 - num);
		resolve(res);
	}), true).then(resolve).catch(reject);
});
