const msgs = ["hi", "\\_\\_\\_\\_\\_\\_|\\_\\_\\_\\_\\_\\_|\\_\\_\\_\\_\\_\\_", "￣￣￣|￣￣￣|￣￣￣"];

var emitter;
var reacted;

var board = [
	["X", "", "O"],
	["", "X", "O"],
	["O", "X", ""]
];

const underline = str=>Array.from(str).map(x=>x + "\u0332").join("");

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
			var row;
			const correctMsg = boardMsg.some((msg, idx)=>{
				if(msg.id === react.message.id){
					row = idx;
					console.log("row", row);
					return true;
				}
			});
			const empty = /empty/.test(react.emoji.name);
			if(auth.bot || !empty || !correctMsg || reacted){
				console.log("bot or not empty or wrong message or reacted", auth.bot, empty, !correctMsg, reacted);
				return;
			}
			reacted = true;
			console.log("legit reaction!" + react.emoji.name);
			boardMsg.forEach(msg=>msg.delete());
			var str = board.reduce((row, str)=>{
				return str + " " + row[0] + " | " + row[1] + " | " + row[2];
			}, "");
			console.log(str);
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
