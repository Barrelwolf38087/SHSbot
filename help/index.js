const fs = require("fs");

module.exports = config => new Promise((resolve, reject)=>{
	var str = `${config.config.messages.help}`;

	config.directories.forEach(dir=>{
		str += `\`${config.config.prefix}${dir}: ${template(config.configs[dir].description), config.config}\`\n`;
	});

	resolve(str);
});
