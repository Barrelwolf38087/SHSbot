const cfg = require("./config.json");

module.exports = config => new Promise(function(resolve, reject) {
	/*for(var i in config.charmap){
		if(config.charmap.hasOwnProperty(i)){
			charmap[charmap[i]] = i;
		}
	}*/
	if(!config.lastmessage){
		return reject(config.template(cfg.empty, config.config));
	}

	const res = Array.from(config.lastmessage).map(char=>
		cfg.charmap[char] ? cfg.charmap[char] : char
	).reverse().join("");

	console.log("flipped", config.lastmessage, "to", res);

	resolve(res);
});
