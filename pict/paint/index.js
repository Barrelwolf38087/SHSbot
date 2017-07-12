const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		const num = parseInt(config.commandArr[0], 10) || 1;
		if(num > 20 || num < 1){
			return reject("Please specify a paint value of less than 20.");
		}
		console.log("painting by", num);
		const res = gm(file).paint(num);
		resolve(res);
	}), true).then(resolve).catch(reject);
});
