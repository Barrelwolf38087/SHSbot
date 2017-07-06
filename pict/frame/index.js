const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		console.log("FRAME");
		const res = gm(file).frame(40, 40, 10, 10);
		resolve(res);
	}), true).then(resolve).catch(reject);
});
