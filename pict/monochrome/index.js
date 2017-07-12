const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		console.log("monochrome");
		const res = gm(file).monochrome(num);
		resolve(res);
	}), true).then(resolve).catch(reject);
});
