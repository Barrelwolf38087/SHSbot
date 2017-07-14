const msgs = ["Ready?", "\\_\\_\\_\\_\\_\\_|\\_\\_\\_\\_\\_\\_|\\_\\_\\_\\_\\_\\_", "￣￣￣|￣￣￣|￣￣￣"];

var emitter;
var reacted;

var board = [
	["X", "", "O"],
	["", "X", "O"],
	["O", "X", ""]
];

var winners = [
	[[0, 0], [0, 1], [0, 2]],
	[[1, 0], [1, 1], [1, 2]],
	[[2, 0], [2, 1], [2, 2]],

	[[0, 0], [1, 0], [2, 0]],
	[[0, 1], [1, 1], [2, 1]],
	[[0, 2], [1, 2], [2, 2]],

	[[0, 0], [1, 1], [2, 2]],
	[[0, 2], [1, 1], [2, 0]]
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
			//reacted = true;
			console.log("legit reaction!" + react.emoji.name);
			boardMsg.forEach(msg=>msg.delete());
			board[row][react.emoji.identifier.split(":")[0].slice(-1) - 1] = "X";

			var winner;

			const won = winners.some(combo=>{
				console.log(board[combo[0][0]][combo[0][1]] + "===" +  board[combo[1][0]][combo[1][1]] + "===" + board[combo[2][0]][combo[2][1]]);
				const right = board[combo[0][0]][combo[0][1]] === board[combo[1][0]][combo[1][1]] && board[combo[1][0]][combo[1][1]]=== board[combo[2][0]][combo[2][1]];
				if(right){
					console.log("right!");
					winner = board[combo[0][0]][combo[0][1]];
				}
				return right;
			});
			if(won){
				console.log("won!");
				config.sendMessage(winner + " won!");
			}else{
				var str = board.reduce((str, row, index)=>{
					console.log("row", row, "str", str);
					return str + (index < 2 ? underline : x=>x)(" " + (row[0] || " ") + " | " + (row[1] || " ") + " | " + (row[2] || " ") + " ") + "\n";
				}, "Here's the new board:\n```\n");
				config.sendMessage(str + "```");
			}
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
