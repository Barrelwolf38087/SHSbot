const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		const num = parseInt(config.commandArr[0], 10) || 1;
		const scaleDown = 0.1 / num * 100;
		const scaleUp = 100 * (100 / scaleDown);
		console.log("num is", num, "down", scaleDown + "%", "up", scaleUp + "%");
		var scaled = gm(file).scale(scaleDown + "%").scale(scaleUp + "%");
		resolve(scaled);
	}), true).then(resolve).catch(reject);
});
