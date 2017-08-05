const fs = require("fs");
const path = require("path");

module.exports = config => new Promise((resolve, reject)=>{
	const command = config.commandArr[0];
	const permissions = config.commandArr[1];
	var config2 = config.configs[command];
	var override = config.overrides[command] || {};
	if(!config2){
		return reject("Command not found");
	}
	if(config2.permissions && config2.permissions[2] === "0"){
		return reject("Sticky bit set");
	}
	override.permissionsOverride = permissions;
	config.overrides[command] = override;
	console.log("write", JSON.stringify(override), "to", path.join(__dirname, "..", command, "perm-overrides.json"));
	fs.writeFile(path.join(__dirname, "..", command, "perm-overrides.json"), JSON.stringify(override), err=>err ? reject(err) : resolve("Completed"));
});
