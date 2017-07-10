const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		const num = parseInt(config.commandArr[0], 10) || "50%";
		const num2 = parseInt(config.commandArr[1], 10) || "50%";
		const num3 = parseInt(config.commandArr[2], 10) || "50%";
		console.log("EXTREME COLORZ", num, num2, num3);
		const res = gm(file).level(num, num2, num3);
		resolve(res);
	}), true).then(resolve).catch(reject);
});
