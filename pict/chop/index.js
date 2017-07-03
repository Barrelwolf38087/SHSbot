const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		const x = parseInt(config.commandArr[0], 10) || 50;
		const y = parseInt(config.commandArr[1], 10) || 50;
		const x2 = parseInt(config.commandArr[2], 10) || x + 50;
		const y2 = parseInt(config.commandArr[3], 10) || y + 50;
		console.log("chopping ", x, "x", y, "by", x2, "x", y2);
		const res = gm(file).chop(x, y, x2, y2).write("temp/done.jpeg", console.log);
		resolve(res);
	}), true).then(resolve).catch(reject);
});
