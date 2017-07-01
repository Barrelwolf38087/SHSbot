const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		const res = gm(file).bitdepth(16);
		resolve(res);
	}), true).then(resolve).catch(reject);
});
