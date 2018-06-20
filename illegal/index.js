const illegalize = require("isnowillegal");
const regex = /^[a-z0-9\s]{1,10}$/i;

module.exports = data => new Promise((resolve, reject) => {
	const string = data.commandArr.join(" ").trim();
	if(!regex.test(string)) return reject("Invalid text! You must provide up to 10 letters/numbers.");
	illegalize(string).then(url => {
		resolve({
			files: [url]
		});
	}).catch(err => {
		console.error(err);
		return reject("Unknown error!");
	});
});
