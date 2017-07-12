const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		const num = parseInt(config.commandArr[0], 10) || 3;
		if(num >= 17 || num < 1){
			return reject("Please noise by a number from 1 to 17.");
		}
		console.log("noise by", num);
		const res = gm(file).noise(num);
		resolve(res);
	}), true).then(resolve).catch(reject);
});
