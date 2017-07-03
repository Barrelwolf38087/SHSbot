const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		const x = parseInt(config.commandArr[0], 10) || 500;
		const y = parseInt(config.commandArr[1], 10) || 500;
		const width = parseInt(config.commandArr[2], 10) || 10;
		const height = parseInt(config.commandArr[3], 10) || 10;
		console.log("cropping by", x, "x", y, "x", width, "x", height);
		const res = gm(file).crop(width, height, x, y);
		resolve(res);
	}), true).then(resolve).catch(reject);
});
