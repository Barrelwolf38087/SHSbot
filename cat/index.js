const fetch = require("node-fetch");
var parseString = require("xml2json").toJson;


var images = [];

console.log("meow!");

const refreshImgs = function(){
	console.log("let's get some kitties!");
	return new Promise(function(resolve, reject) {
		fetch("http://thecatapi.com/api/images/get?format=xml&results_per_page=100&api_key=MTk3NjIx&side=med").then(resp=>resp.text()).then(text=>{
			try{
				//console.log(parseString(text));
				JSON.parse(parseString(text)).response.data.images.image.forEach(image=>{
					images.push({src: image.source_url, img: image.url})
				});
				resolve();
			}catch(e){
				reject(e);
			}
		}).catch(reject);
	});
};

refreshImgs();

module.exports = config => new Promise(function(resolve, reject) {
	const reply = ()=>{
		const picked = images[Math.floor(Math.random() * images.length)];
		fetch(picked.img).then(()=>{
			if(config.lastmessage) config.sendMessage(config.lastmessage);
			config.sendMessage({file: {attachment: picked.img}});
			resolve("(From " + picked.src + " )");
		}).catch(reply);
	};
	if(images.length){
		reply();
	}else{
		refreshImgs().then(reply);
	}
});

setTimeout(refreshImgs, 1000 * 60 * 60 * 6);//1000ms = 1s, 60s = 1m, 60m = 1h, so refresh our cat videos 4 times a day (every 6 hours)
