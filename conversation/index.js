
const randStr = len => Array.from(crypto.getRandomValues(new Uint8Array(len / 2))).reduce((acc,nw) => acc + ("0" + nw.toString(36)).slice(-2), "");


module.exports = config => {
	config.conversations[message.author.id] = {responses: [], };
};
