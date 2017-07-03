const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		const num = parseInt(config.commandArr[0], 10) || 1;
		console.log("charcoal by", num);
		const res = gm(file).charcoal(num);
		resolve(res);
	}), true).then(resolve).catch(reject);
});
