const cfg = require("./config.json");

module.exports = config=>new Promise(function(resolve, reject) {
	if(!config.lastmessage){
		return reject(config.template(cfg.empty, config.config));
	}
	const res = Array.from(config.lastmessage).map(char=>
		char + "\u0336"//combineing strikethough char
	).join("");
	console.log("lastmessage is", config.lastmessage, "responding with", res);
	resolve(res);
});
