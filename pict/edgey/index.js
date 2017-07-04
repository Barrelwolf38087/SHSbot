const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		const num = parseInt(config.commandArr[0], 10) || 100;
		console.log("blurring by", num);
		const res = gm(file).edge(num);
		resolve(res);
	}), true).then(resolve).catch(reject);
});
