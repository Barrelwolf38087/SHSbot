const fs = require("fs");

module.exports = config => new Promise((resolve, reject)=>{
	var str = `${config.config.messages.help}\n`;

	config.directories.forEach(dir=>{

		str += `\`${config.config.prefix}${dir}\`: ${config.template(config.configs[dir].description, config.config)}\n\n`;
	});

	str += "";
	console.log("Sending help", str);
	resolve(str);
});
