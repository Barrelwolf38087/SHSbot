const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		const num = parseInt(config.commandArr[0], 10) || 5;
		console.log("adding contrast", num);
		const res = gm(file).contrast(num);
		resolve(res);
	}), true).then(resolve).catch(reject);
});
