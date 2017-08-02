module.exports = config => new Promise((resolve)=>{
	var str = `${config.config.messages.help}\n`;

	config.directories.forEach(dir=>{
		if(dir[0] === "."){
			return;
		}
		str += `\`${config.config.prefix}${dir}\`: ${config.template(config.configs[dir].description, config.config)}\n\n`;
	});

	str += "";
	console.log("Sending help", str);
	resolve(str);
});
