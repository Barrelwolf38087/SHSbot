module.exports = config => {
	config.privateMessage(":tada: Congradulations! You found an easter egg! (Code #d8c706bc4f00d)");
	return Promise.resolve("I couldn't find the command \"UUDDLRLRBA\". Try `$help`. (If you don't want your message to be treated as a command, add a \ before it.)");
};
