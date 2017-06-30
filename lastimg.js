const fetch = require("node-fetch");
const fs = require("fs");
const gm = require("gm");
const URLregex = /^http(s)?:\/\/[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;


function gmToBuffer (data) {//https://github.com/aheckmann/gm/issues/572#issuecomment-293768810
  return new Promise((resolve, reject) => {
    data.stream((err, stdout, stderr) => {
      if (err) { return reject(err); }
      const chunks = [];
      stdout.on('data', (chunk) => { chunks.push(chunk); });
      // these are 'once' because they can and do fire multiple times for multiple errors,
      // but this is a promise so you'll have to deal with them one at a time
      stdout.once('end', () => { resolve(Buffer.concat(chunks)); });
      stderr.once('data', (data) => { reject(String(data)); });
    });
  });
}

module.exports = (config, prom, hush) => new Promise(function(resolve, reject) {
	const log = function(){
		if(!hush){
			console.log.apply(undefined, ["lastimg.js:"].concat(Array.from(arguments)));
		}
	};

	var file;
	var counter = config.msgHistory.length - 1;

	const num = parseInt(config.commandArr[0], 10) || 1;

	log(config.msgHistory);

	const doit = function(){
		log("Trying out", config.msgHistory[counter]);
		if(!config.msgHistory[counter]){
			return reject("No image found!");
		}

		if(!URLregex.test(config.msgHistory[counter])){//http://www.regexpal.com/94502
			log("Invalid regex");
			counter--;
			return doit();
		}

		log("fetching...");
		fetch(config.msgHistory[counter]).then(resp=>{
			const type = resp.headers.get("content-type");
			if(type === "image/svg"){
				file = "temp/TEMP.svg";
				return resp.buffer();
			}else if(type === "image/png"){
				file = "temp/TEMP.png";
				return resp.buffer();
			}else if(type === "image/jpeg"){
				file = "temp/TEMP.jpeg";
				return resp.buffer();
			}else if(type === "image/gif"){
				file = "temp/TEMP.gif";
				return resp.buffer();
			}else{
				log("Not an image", type);
				counter--;
				doit();
			}
		}).then(buffer=>{
			if(!buffer) return;
			log("got text", buffer, "and writing to", file);
			fs.writeFile(file, buffer, (err)=>{
				if(err) return reject(err);
				log("done!");
				prom(file).then(gmObj=>{
					gmToBuffer(gmObj).then(buff=>{
						log("got buffer", buff);
						resolve({file: {attachment: buff}});
					}).catch(reject);
				});
			});
		}).catch(console.error);
	};
	doit();
});
