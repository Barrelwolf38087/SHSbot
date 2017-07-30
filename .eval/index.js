module.exports = config=>new Promise(resolve=>resolve(JSON.stringify(
	eval(//jshint ignore: line
		config.commandArr.join(" ")
	)
)));
