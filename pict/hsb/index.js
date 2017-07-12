const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		const num = parseInt(config.commandArr[0], 10) * 2 || 100;
		const num2 = parseInt(config.commandArr[1], 10) * 2 || 100;
		const num3 = parseInt(config.commandArr[2], 10) * 2 || 100;
		console.log("modulate by", num);
		const res = gm(file).modulate(num3, num2, num);
		resolve(res);
	}), true).then(resolve).catch(reject);
});
