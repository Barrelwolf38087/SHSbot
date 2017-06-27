const fs = require("fs");
const path = require("path");

const randElem = arr=>arr[Math.floor(Math.random() * arr.length)];

var storedFiles = {};

const getFiles = function(){
	return new Promise((resolve, reject)=>{
		fs.readdir(__dirname, (err, files)=>{
			files = files.filter(x=>/\.txt$/.test(x));
			console.log("reading up", files);
			const readFileProm = file=>new Promise(function(resolve, reject) {
				console.log("reading", file);
				fs.readFile(path.join(__dirname, file), (err, res)=>{
					if(err)return reject(err);
					res = res + "";
					console.log("file is\n" + res);
					resolve(res);
				});
			});
			var promises = [];
			files.forEach(file=>promises.push(readFileProm(file)));

			Promise.all(promises).then(data=>{
				console.log("got data", data);
				data.forEach((fileContents, counter)=>{
					storedFiles[files[counter]] = fileContents;
				});
				fs.writeFile(path.join(__dirname, "files.json"),  JSON.stringify(storedFiles), ()=>{});
				resolve(storedFiles);
			});
		});
	});
};


module.exports = config=>new Promise(function(resolve, reject) {
	if(config.commandArr.length){
		reject(config.template("Just do `{{prefix}}art` without anything after that.", config.config));
	}

	const final = art=>{
		const picked = art[randElem(Object.keys(art))];
		console.log("\npicked\n" + picked);
		resolve("```\n" + picked + "\n```");
	};

	fs.readFile(path.join(__dirname, "files.json"), (err, data)=>{
		if(err){
			console.log("getting files because", err);
			return getFiles().then(final);
		}
		data = data + "";
		console.log("read files.json successfully:", data);
		final(JSON.parse(data));
	});
});

module.exports();
