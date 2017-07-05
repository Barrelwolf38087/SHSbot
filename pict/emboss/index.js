const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		const num = parseInt(config.commandArr[0], 10) || 50;
		if(num > 50){
			return reject("Please do an emboss value less than 50.");
		}
		console.log("embossing by", num);
		const res = gm(file).emboss(num);
		resolve(res);
	}), true).then(resolve).catch(reject);
});
