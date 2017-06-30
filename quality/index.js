const fs = require("fs");
const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../lastimg.js")(config, file=>new Promise(function(resolve, reject) {
		const quality = parseInt(config.commandArr[0], 10) || 70;
		const res = gm(file).setFormat("png").quality(quality);
		resolve(res);
	})).then(resolve).catch(reject);
});
