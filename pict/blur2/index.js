const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		const num = parseInt(config.commandArr[0], 10) || 2;
		console.log("blurr2ing by", num);
		const res = gm(file).median(num);
		resolve(res);
	}), true).then(resolve).catch(reject);
});
