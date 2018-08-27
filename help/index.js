module.exports = config => new Promise((resolve, reject)=>{
	var str = config.commandArr[0] ? "" : `${config.config.messages.help}\n`;

	var hasFound = false;

	config.directories.filter(x=>x[0] !== ".").filter(x=>
		(!config.commandArr[0] || config.commandArr[0] === x) &&
		config.configs[x] &&
		config.configs[x].description &&
		config.configs[x].description.length
	).forEach(dir=>{
		try{
			hasFound = true;
			str += `\`${config.config.prefix}${dir}\`: ${config.template(config.configs[dir].description, config.config)}\n`;
		}catch(e){}//eslint-disable-line no-empty
	});

	if(!hasFound){
		return reject("That command was not found!");
	}
	str = str.trim();

	if(str.length <= 2000){
		console.log("less than 2000!");
		resolve(str);
	}else if(str.length){
		const doit = async function (str){
			if(str.length > 2000){
				console.log(str.slice(0, 2000).length);
				await config.sendMessage(str.slice(0, 2000));
				await doit(str.slice(2000));
				return;
			}else{
				console.log(str.length);
				await config.sendMessage(str);
				return;
			}
		};
		doit(str).then(resolve);
	}
});
