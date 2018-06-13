const fetch = require("node-fetch");

module.exports = config => new Promise((resolve, reject) => {
	const commandArr = config.commandArr;

	fetch("https://content-translation.googleapis.com/language/translate/v2/languages?target=en&key=" + config.config.shortURLKey)
		.then(x=>x.json()).then(resp => {
			if(resp.error){
				return reject(resp.error.message);
			}

			var from;
	    if(commandArr[0] === "detect"){
				from = {language: ""};
			}else{
	        from = resp.data.languages.find(x=>x.language.toLowerCase() === commandArr[0].toLowerCase() || x.name.toLowerCase() === commandArr[0].toLowerCase());
	        if(!from || !from.language){
	            return reject("The language " + commandArr[0] + " could not be found.");
	        }
	    }

			var to = resp.data.languages.find(x=>x.language.toLowerCase() === commandArr[1].toLowerCase() || x.name.toLowerCase() === commandArr[1].toLowerCase());
			if(!to || !to.language){
				return reject("The language " + commandArr[1] + " could not be found.");
			}
	    fetch("https://content-translation.googleapis.com/language/translate/v2?key=" + config.config.shortURLKey,
	    {
	        headers: {
	          "Accept": "application/json",
	          "Content-Type": "application/json"
	        },
	        method: "POST",
	        body: JSON.stringify({
	         "q": [
	          commandArr.slice(2).join(" ")
	         ],
	         "target": to.language,
	         "source": from.language
	        })
	    })
	    .then(x=>x.json()).then(data => {
	        if(data.error || !data.data || !data.data.translations || !data.data.translations[0] || !data.data.translations[0].translatedText){
	            return reject(data.error.message || "Could not translate text!");
	        }

					var text = data.data.translations[0].translatedText;

					resolve({
						"embed": {
							"title": "Translate \"" + commandArr.slice(2).join(" ").slice(0, 150) + "\" to Spanish",
							"url": "https://translate.google.com/#" + (from.language || "auto") + "/" + to.language + "/" + encodeURIComponent(commandArr.slice(2).join(" ")),
							"color": 0,
							"timestamp": (new Date()).toISOString(),
							"footer": {
								"text": "Translated by Google Translate"
							},
							"fields": [
								{
									"name": "From",
									"value": from.name ? (from.name +  " (" + from.language + ")") : "Auto-detect",
									"inline": true
								},
								{
									"name": "To",
									"value": to.name + " (" + to.language + ")",
									"inline": true
								},
								{
									"name": "Result",
									"value": text
								}
							]
						}
					});
				}).catch(reject);
		}).catch(reject);
});
