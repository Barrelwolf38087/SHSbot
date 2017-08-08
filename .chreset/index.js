const fs = require("fs");
const path = require("path");

module.exports = config => new Promise((resolve, reject) => {
	const command = config.commandArr[0];
	console.log("wiping perms of command", command);
	if(command){
		if(!config.configs[command]){
			return reject("Command not found.");
		}
		fs.unlink(path.join(command, "perm-overrides.json"), err => err ?
			reject("Could not reset perms of that command.", console.error(err))  :
		resolve("Completed!", config.overrides[command] = {}));
	}else{
		const promRm = command => new Promise((resolve) => {
			if(!config.configs[command]){
				return resolve("Not a command");
			}
			fs.unlink(path.join(command, "perm-overrides.json"), err => (err && err.code !== "ENOENT") ?
				reject(console.error("Could not reset perms of ${commnad}.", err))  :
			resolve("Completed!", config.overrides[command] = {}));
		});

		fs.readdir(".", (err, files) => {
			if(err) {
				return reject(err);
			}

			var promises = [];

			files.forEach(file => promises.push(promRm(file)));

			Promise.all(promises).then(() => {
				config.overrides = {};
				resolve("Sucsessfully reset permissions!");
			}).catch(() => {
				reject("Could not reset permissions.");
			});
		});
	}
});
