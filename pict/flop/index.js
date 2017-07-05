const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		console.log("flop");
		const res = gm(file).flop();
		resolve(res);
	}), true).then(resolve).catch(reject);
});
