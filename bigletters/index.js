const cfg = require("./config.json");

module.exports = config=>new Promise(function(resolve, reject) {
	if(!config.lastmessage){
		return reject(config.template(cfg.empty, config.config));
	}

	const res = Array.from(config.lastmessage).map(char=>{
		if(/^[a-z]$/i.test(char)){
			return String.fromCharCode(char.charCodeAt() + 65248);
		}
		if(char === " "){
			return "  ";
		}
		return char;
	}).join("");
	console.log("all caps res is ", res);

	resolve(res);
});
