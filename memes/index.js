const cfg = require("./config.json");
const allofthem = [].concat.apply([], Object.entries(cfg.memes).map(x=>x[1]));
const randElem = arr=>arr[Math.floor(Math.random() * arr.length)];

module.exports = config => new Promise(function(resolve, reject) {
	if(!config.commandArr[0]){
		const picked = randElem(allofthem);
		console.log("Sending meme", picked);
		resolve({file: {attachment: picked}});
	}else if(config.commandArr.length > 1 || !cfg.memes[config.commandArr[0]]){
		reject(config.template(cfg["404"], {prefix: config.config.prefix, list: Object.keys(cfg.memes).join(", ")}));
	}else{
		const picked = randElem(cfg.memes[config.commandArr[0]]);
		console.log("Sending meme", picked, "from category", config.commandArr[0]);
		resolve({file: {attachment: picked}});
	}
});
