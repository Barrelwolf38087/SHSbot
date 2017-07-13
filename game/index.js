const msgs = ["hi", "\\_\\_\\_\\_\\_\\_|\\_\\_\\_\\_\\_\\_|\\_\\_\\_\\_\\_\\_", "￣￣￣|￣￣￣|￣￣￣"];

var emitter;

var board = [
	["X", "", "O"],
	["", "X", "O"],
	["O", "X", ""]
];

var boardMsg = [{}, {}, {}];

const func = config=>new Promise((resolve, reject)=>{
	console.log(config.reactions);
	var emojis = config.emojis.map(x=>{
		//console.log({id: x.id, name: x.name});
		return {id: x.id, name: x.name};
	});
	emojis = emojis.filter(x=>/^((X|O)icon|empty)[123]$/.test(x.name));
	emojis = emojis.reduce((acc, curr)=>{
		//console.log("acc", acc, "curr", curr);
		acc[curr.name] = curr.id;
		return acc;
	}, {});
	if(!emitter){
		emitter = true;
		config.reactions.on("reaction", (react, auth)=>{
			const correctMsg = boardMsg.some(x=>x.id === react.message.id);
			const empty = /empty/.test(react.emoji.toString());
			if(auth.bot || !empty || !correctMsg){
				console.log("bot or not empty or wrong message", auth.bot, empty, !correctMsg);
				return;
			}
			console.log("legit reaction!" + react.emoji);
		});
	}
	//console.log(emojis);
	board.forEach((row, idx)=>{
		config.sendMessage(msgs[idx]).then(msg=>{
			boardMsg[idx] = msg;
			var promise = Promise.resolve();
			row.forEach((square, column)=>{
				console.log("square", square, "column", column);
				promise = promise.then(()=>msg.react((()=>{
					if(!square.trim()){//empty
						console.log("reacting with", emojis["empty" + (column + 1)], "empty" + (column + 1));
						return emojis["empty" + (column + 1)];
					}else{
						console.log("reacting with", emojis[square + "icon" + (column + 1)], square + "icon" + (column + 1));
						return emojis[square + "icon" + (column + 1)];
					}
				})()));
			});
		}).catch(reject);
	});
});

func.listenForReactions = true;

module.exports = func;
