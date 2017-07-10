const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		const num = (parseInt(config.commandArr[0], 10) || 200) / 100;
		console.log("BLOWING UP by", num);
		const res = gm(file).magnify(num);
		resolve(res);
	}), true).then(resolve).catch(reject);
});
