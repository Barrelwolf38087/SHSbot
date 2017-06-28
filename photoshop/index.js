module.exports = config=>new Promise(function(resolve, reject) {
	if(!config.lastmessage){
		return reject("Please®©™ post®©™ something®©™ to®©™ photoshopify®©™!");
	}
	resolve(config.lastmessage.replace(/(\w+)/g, "$1®©™"));
});
