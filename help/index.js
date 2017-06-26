const fs = require("fs");

module.exports = config => new Promise((resolve, reject)=>{
	var str = `${config.config.messages.help}`;

	config.directories.forEach(dir=>{
		str += `\`${config.config.prefix}${dir}: ${config.configs[dir].description}\`\n`;
	});

	resolve(str);
});
