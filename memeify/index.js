const fetch = require("node-fetch");
const fs = require("fs");
const gm = require("gm").subClass({imageMagick: true});
const URLregex = /^http(s)?:\/\/[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

module.exports = config => new Promise(function(resolve, reject) {
	const callback = ()=>{
		console.log("done");
		gm(file).size(function (err, size) {
			console.log("size is", size);
			if(err) return reject(err);
			var lastText;
			config.msgHistory.reverse().some(message=>{
				if(!URLregex.test(message) && message[0] !== config.config.prefix){
					lastText = message;
					console.log("Caption: ", message);
					return true;
				}
			});

			fs.writeFile("temp.svg", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
			<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
		<image xlink:href="${file}" id="svg_3" height="${size.width}" width="${size.height}" y="0" x="0"/>
		<text id="svg_1" fill="#000000" stroke-width="2" stroke="#ffffff" x="${size.height / 2}" y="${size.height - 50}" font-size="30" font-family="Impact" text-anchor="middle">${lastText}</text>
		<text id="svg_2" fill="#000000" stroke="#ffffff" x="${size.height / 2}" y="50" font-size="30" font-family="Impact" stroke-width="2" text-anchor="middle">${lastText}</text>
	</svg>`, (err)=>{
				if(err) return reject(err);

				gm("temp.svg").stream("png", function (err, stdout, stderr) {
					const chunks = [];

					stderr.on("data", function (chunk) {
						console.log("ERROR: " + chunk);
					});

					stdout.on("data", function (chunk) {
						console.log("got chunk", chunk);
						chunks.push(chunk);
					});

					// Send the buffer or you can put it into a var
					stdout.on("end", function () {
						//fs.writeFile("done.png", Buffer.concat(chunks), ()=>{});
						resolve({file: {attachment: Buffer.concat(chunks)}});
					});
				});
			});
		});
	};

	var counter = config.msgHistory.length - 1;
	var file;
	const doit = function(){
		console.log("Trying out", config.msgHistory[counter]);
		if(!config.msgHistory[counter]){
			return reject("No image found!");
		}

		if(!URLregex.test(config.msgHistory[counter])){//http://www.regexpal.com/94502
			console.log("Invalid regex");
			counter--;
			return doit();
		}

		console.log("fetching...");
		fetch(config.msgHistory[counter]).then(resp=>{
			const type = resp.headers.get("content-type");
			if(type === "image/svg"){
				file = "TEMP.svg";
				return resp.buffer();
			}else if(type === "image/png"){
				file = "TEMP.png";
				return resp.buffer();
			}else if(type === "image/jpeg"){
				file = "TEMP.jpeg";
				return resp.buffer();
			}else{
				console.log("Not an image");
				counter--;
				doit();
			}
		}).then(buffer=>{
			if(!buffer) return;
			console.log("got text", buffer, "and writing to", file);
			fs.writeFile(file, buffer, (err)=>{
				if(err) return reject(err);
				console.log("done!")
				callback();
			});
		});
	};

	doit();
});
