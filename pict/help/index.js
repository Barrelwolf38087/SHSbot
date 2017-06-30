const fs = require("fs");
const path = require("path");
const util = require("util");

var directories = [];
const getDirs = () => new Promise(function(resolve, reject) {
	fs.readdir(path.join(__dirname, ".."), function (err, files) {
		if (err) return reject(err);
		var promises = [];
		const stat = util.promisify(fs.lstat);
		files.forEach(function (file) {
			console.log("file", file);
			promises.push(new Promise((resolve2, reject)=>{
				stat(path.join(path.join(__dirname, ".."), file)).then(stats=>{
					if(err) return reject(err);
					if (stats.isDirectory() || stats.isSymbolicLink()) {
						directories.push(file);
						console.log("resolving");
						resolve2();
					}else{
						resolve2();
					}
				});
			}));
		});
		Promise.all(promises).then(()=>{
			console.log("resolving");
			resolve();
		});
	});
});

module.exports = config => new Promise((resolve, reject)=>{
	const main = ()=>{
		var str = `${config.config.messages.help}\n`;
		console.log("directories", directories);
		directories.forEach(dir=>{
			var cfg;
			try{
				cfg = require(path.join(path.join(__dirname, ".."), dir, "config.json"));
			}catch(e){
				console.error(e);
			}

			if(dir[0] === "." || !cfg){
				return;
			}
			str += `\`${config.config.prefix}${dir}\`: ${config.template(cfg.description, config.config)}\n\n`;
		});

		str += "";
		console.log("Sending help", str);
		resolve(str);
	};
	if(directories.length){
		main();
	}else{
		getDirs().then(()=>{
			console.log("hi");
			main();
		}).catch(reject);
	}
});
