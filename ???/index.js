module.exports = config=>new Promise(resolve=>{
	const num = parseInt(config.commandArr[0], 10) || 1;
	const res = "???(".repeat(num) + "???" + ")".repeat(num);
	console.log("??? by", num, "is", res);
	resolve(res);
});
