module.exports = config => new Promise((resolve, reject) => {
	if(!config.commandArr[0]){
		return reject("You need to specify a user to ban!");
	}
	var user = config.searchForUser(config.commandArr.join(" "));
	if(!user){
		return reject("I couldn't find that user.");
	}
	config.addPermakick(user.user.id);
	user.kick("Permakicked");
	return resolve("Done!");
});
