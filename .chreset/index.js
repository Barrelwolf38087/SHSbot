const fs = require("fs");
const path = require("path");

module.exports = config => new Promise((resolve, reject) => {
	const command = config.commandArr[0];
	const global = config.commandArr[1];
	console.log("wiping perms of command", command);

	const rmLocal = command => new Promise((resolve, reject) => {
		if(config.overrides[command] && config.overrides[command].guilds  && config.overrides[command].guilds[config.guildId]){
			delete config.overrides[command].guilds[config.guildId];
			console.log("local wipe of", command);
			fs.writeFile(path.join(command, "perm-overrides.json"), JSON.stringify(config.overrides[command]), err => err ? reject(err) : resolve());
		}else{
			resolve();
		}
	});

	if(command && command !== "*"){
		if(!config.configs[command]){
			return reject("Command not found.");
		}
		if(global){
			console.log("global");
			fs.unlink(path.join(command, "perm-overrides.json"), err => err ?
				reject("Could not reset perms of that command.", console.error(err))  :
			resolve("Completed!", config.overrides[command] = {}));
		}else{
			console.log("rmlocaling", command);
			rmLocal(command).then(resolve).catch(reject);
		}
	}else{
		console.log("resetting everything...");
		const promRm = command => new Promise((resolve) => {
			if(!config.configs[command]){
				return resolve("Not a command");
			}

			if(global){
				fs.unlink(path.join(command, "perm-overrides.json"), err => (err && err.code !== "ENOENT") ?
					reject(console.error("Could not reset perms of ${commnad}.", err))  :
				resolve("Completed!", config.overrides[command] = {}));
			}else{
				rmLocal(command).then(resolve).catch(reject);
			}
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
