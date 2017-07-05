const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		console.log("enhanceing");
		const res = gm(file).enhance();
		resolve(res);
	}), true).then(resolve).catch(reject);
});
