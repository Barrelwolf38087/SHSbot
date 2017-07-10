const gm = require("gm");

module.exports = config => new Promise(function(resolve, reject) {
	require("../../lastimg.js")(config, file=>new Promise(function(resolve) {
		let percent;
		if(config.commandArr[0]){
			if(config.commandArr[0].slice(-1) !== "%"){
				config.commandArr[0] = config.commandArr[0].slice(0, -1);
			}
			percent = parseInt(config.commandArr[0].slice(0, -1), 10);
		}else{
			percent = "10";
		}
		percent += "%";
		const color = config.commandArr[1] || "white";
		console.log("transparent percent", percent, "with color of", color);
		const res = gm(file).fuzz(percent).transparent(color);
		resolve(res);
	}), true).then(resolve).catch(reject);
});
