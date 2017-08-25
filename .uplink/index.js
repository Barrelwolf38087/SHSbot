module.exports = config => new Promise((resolve, reject) => {
	if(config.commandArr[0] === "stop"){
		config.setUplinkFrom({});
		config.setUplinkTo({});
		return resolve("Uplink stopped.");
	}else{
		var to;
		var channel;
		try{
			to = config.guilds.get(config.commandArr[0]);
			console.log("guild is", to.id);
			channel = to.channels.get(config.commandArr[1]) || to.defaultChannel;
			if(!channel){
				throw "No channel found.";
			}
		}catch(e){
			console.error(e);
			return reject("Could not find the channel / guild!");
		}
		config.setUplinkTo(channel);
		config.setUplinkFrom(config.channel);
		resolve("Sucess!");
	}
});
