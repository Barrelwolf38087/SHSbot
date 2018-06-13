const fetch = require("node-fetch");

module.exports = config => new Promise((resolve, reject)=>{
	var text;
	if(config.commandArr.length){
		text = config.commandArr.join("");
	}else{
		text = config.lastmessage;
	}

	if(!text){
		return reject("Could not find the URL you want to shorten.");
	}

	fetch("https://www.googleapis.com/urlshortener/v1/url?key=" + config.config.shortURLKey + "&fields=id", { headers: {
		"Accept": "application/json",
		"Content-Type": "application/json"
	},
	method: "POST",
	body: JSON.stringify({
		longUrl: text
	})}).then(x=>x.json()).then(data => {
		if(data.error || !data.id){
			console.error(data);
			return reject("Something went wrong!");
		}

		return resolve("<" + data.id + ">");
	}).catch(reject);
});
