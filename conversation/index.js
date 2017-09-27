
const randStr = len => require("crypto").rng(len / 2).toString("hex");


module.exports = config => new Promise((resolve, reject) => {
	config.conversations[config.author.id] = {responses: [], sessionId: randStr(36)};

	config.author.send("Hello, I'm SHSbot! I'd like to help you get access to the channels you need for the SHS Discord server. First off, what grade are you in? Or are you a teacher?").then(()=>resolve()).catch(()=>reject("Uh oh! Make sure that you allow direct messages from server members!"));
});
