const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		const r = parseInt(config.commandArr[0], 10) || 7;
		const g = parseInt(config.commandArr[0], 10) || (config.commandArr[0] ? undefined : 21);
		const b = parseInt(config.commandArr[0], 10) || (config.commandArr[0] ? undefined : 50);
		console.log("colorizeing by", r, ",", g,  ",", b);
		const res = gm(file).colorize(7, 21, 50);
		resolve(res);
	}), true).then(resolve).catch(reject);
});
