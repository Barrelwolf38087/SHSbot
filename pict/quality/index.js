const fs = require("fs");
const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		const quality = parseInt(config.commandArr[0], 10) || 70;
		console.log("quality", quality);
		const res = gm(file).setFormat("jpeg").quality(quality);
		resolve(res);
	})).then(resolve).catch(reject);
});
