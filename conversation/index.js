module.exports = data => new Promise((resolve, reject) => {
	console.log(data);
	let user = data.commandArr[0];
	if(user){
		user = data.searchForUser(user);
		if(!user || !user.id){
			return reject("User not found.");
		}
	}else{
		user = data.author;
	}
	require("../conversation_loader")(user, data.channel.guild, data.conversations);
	resolve(`<@${user.id}>, check your DMs for questions!`);
});
