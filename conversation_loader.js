
const randStr = len => require("crypto").rng(Math.round(len / 2)).slice(0, len).toString("hex");


module.exports = (user, guild, conversations) => new Promise((resolve, reject) => {
	conversations[user.id] = {responses: [], sessionId: randStr(36), guildId: guild.id, setVars: true};

	user.send("Hello, I'm SHSbot! I'd like to help you get access to the channels you need for the SHS Discord server. First off, what grade are you in? Or are you a teacher?")
		.then(()=>resolve("Check your PMs!"))
		.catch(()=>reject("Uh oh! Make sure that you allow direct messages from server members!"));
});
