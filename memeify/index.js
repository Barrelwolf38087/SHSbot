const fetch = require("node-fetch");
const fs = require("fs");
const cfg = require("./config.json");
const gm = require("gm").subClass({imageMagick: true});
const URLregex = /^http(s)?:\/\/[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

module.exports = config => new Promise(function(resolve, reject) {
	var msg;
	config.sendMessage("Memeifying...").then(message=>msg = message);

	const callback = ()=>{
		console.log("done");
		gm(file).size(function (err, size) {
			console.log("size is", size);
			if(err) return reject(err);
			var lastText;
			config.msgHistory.reverse().some(message=>{
				if(!URLregex.test(message) && message[0] !== config.config.prefix && message !== "Memeifying..."){
					lastText = message;
					console.log("Caption: ", message);
					return true;
				}
			});

			if(!lastText){
				return reject(cfg.noCaption);
			}
			lastText = lastText.toUpperCase();

			var fontSize = 1;

			const getSize = function(str){
				console.log("Trying a fontSize of", fontSize);
				var width = 0;
				str.split("").forEach(char=>{
					if(cfg.map[char]){
						width += cfg.map[char] / 100 * fontSize;
					}
				});
				const percent = width / size.width;
				console.log("Width:", width, "percent", percent);
				if((percent > 0.8 && percent < 0.95) || fontSize / size.width > 0.2){
					console.log("Works! (gived up)", fontSize / size.width > 0.2);
					return fontSize;
				}
				fontSize++;
				return getSize(str);
			};

			var svgString = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
			<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
		<image xlink:href="${file}" id="svg_3" height="${size.width}" width="${size.height}" y="0" x="0"/>`;
			const split = lastText.split("|");
			if(split[0]){
				getSize(split[0]);
				svgString += `<text fill="#000000" stroke="#ffffff" x="${size.height / 2}" y="${30 + fontSize}" font-size="${fontSize}" width="${size.width}" font-family="Impact" stroke-width="2" text-anchor="middle">${split[0]}</text>`;
			}
			if(split[1]){
				getSize(split[1]);
				svgString += `<text fill="#000000" stroke-width="2" stroke="#ffffff" x="${size.height / 2}" y="${size.height - 30}" font-size="${fontSize}" width="${size.width}" font-family="Impact" text-anchor="middle">${split[1]}</text>`;
			}

			if(!split[0] && !split[1]){
				return reject("Couldn't find the text to memeify, are you trying to create a wordless meme?");
			}

			svgString += "</svg>";

			fs.writeFile("temp/temp.svg", svgString, (err)=>{
				if(err) return reject(err);

				gm("temp/temp.svg").stream("png", function (err, stdout, stderr) {
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
						config.sendMessage({file: {attachment: Buffer.concat(chunks)}}).then(message=>{
							message.react("👍");
							message.react("👎");
							message.react("❤");
							msg.delete();
						}).catch(console.error);
						resolve("Is it a spicy meme?");
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
				file = "temp/TEMP.svg";
				return resp.buffer();
			}else if(type === "image/png"){
				file = "temp/TEMP.png";
				return resp.buffer();
			}else if(type === "image/jpeg"){
				file = "temp/TEMP.jpeg";
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
