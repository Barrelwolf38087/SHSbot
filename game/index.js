const msgs = ["Ready? It's {{author}} ({{role}})'s turn!", "\\_\\_\\_\\_\\_\\_|\\_\\_\\_\\_\\_\\_|\\_\\_\\_\\_\\_\\_", "￣￣￣|￣￣￣|￣￣￣"];

var emitter;
var reacted;

var isX = false;

var state = 0;

var board;
var resetBoard = ()=>{
	board = [
		["", "", ""],
		["", "", ""],
		["", "", ""]
	];
	isX = false;
};

var playerX;
var playerY;

resetBoard();

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
	console.log(config.author + "");
	if(state === 2){
		console.log("resetting...");
		resetBoard();
		state = 0;
	}
	if(state === 0.5){
		if(playerX.tag === config.author.tag){
			config.sendMessage("You want to play Tick-Tack-Toe *by yourself*? Oookkk...");
		}
		state = 1;
		playerY = config.author;
		config.sendMessage("Starting Tick-Tack-Toe between " + playerX + " (X) and " + playerY + " (O)");
	}

	if(state === 1){
		isX = !isX;
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
			console.log("got emitter!");
			config.reactions.on("reaction", (react, auth)=>{
				console.log("reaction!");
				var row;
				const correctMsg = boardMsg.some((msg, idx)=>{
					if(msg.id === react.message.id){
						row = idx;
						console.log("row", row);
						return true;
					}
				});
				const empty = /empty/.test(react.emoji.name);
				if((isX && auth.tag !== playerX.tag) || (!isX && auth.tag !== playerY.tag)){
					console.log("wrong player combo: ", auth.tag, "X", playerX.tag, "y",  playerY.tag);
					return;
				}
				if(auth.bot || !empty || !correctMsg || reacted){
					console.log("bot or not empty or wrong message or reacted", auth.bot, empty, !correctMsg, reacted);
					return;
				}
				//reacted = true;
				console.log("legit reaction!" + react.emoji.name);
				boardMsg.forEach(msg=>msg.delete());
				board[row][react.emoji.identifier.split(":")[0].slice(-1) - 1] = isX ? "X" : "O";

				var winner;

				const won = winners.some(combo=>{
					console.log(board[combo[0][0]][combo[0][1]] + "===" +  board[combo[1][0]][combo[1][1]] + "===" + board[combo[2][0]][combo[2][1]]);
					const right = board[combo[0][0]][combo[0][1]] === board[combo[1][0]][combo[1][1]] && board[combo[1][0]][combo[1][1]]=== board[combo[2][0]][combo[2][1]] && board[combo[0][0]][combo[0][1]];
					if(right){
						console.log("right!");
						winner = board[combo[0][0]][combo[0][1]];
					}
					return right;
				});

				var msg;

				if(won){
					console.log("won!");
					state = 2;
					config.sendMessage(winner + " won!").then(()=>resolve());
					msg = "The winning board:";
				}

				const draw = board.every(row=>row.every(sq=>sq.trim()));

				if(draw){
					console.log("draw");
					state = 2;
					msg = "It's a tie! Play again?";
				}

				if(!draw && !won){
					msg = "Here's the new board:";
				}

				var str = board.reduce((str, row, index)=>{
					var res = ("_" + (row[0] || "_") + "_|_" + (row[1] || "_") + "_|_" + (row[2] || "_") + "_");
					if(index == 2){
						res = res.replace(/_/g, " ");
					}
					return str + res + "\n";
				}, msg + "\n```\n");
				console.log("new board:\n", str);
				config.sendMessage(str + "```Send `$game` for the next " + won ? "turn!").then(()=>resolve());
			});
		}
		//console.log(emojis);
		board.forEach((row, idx)=>{
			const message = idx ? msgs[idx] : config.template(msgs[idx], {role: isX ? "X" : "O", author: isX ? playerX : playerY});
			config.sendMessage(message).then(msg=>{
				boardMsg[idx] = msg ;
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
	}else if(state === 0){
		config.sendMessage("Ok, you're X. The next person to send `$game` gets to be O.");
		playerX = config.author;
		state = 0.5;
	}
});

func.listenForReactions = true;

module.exports = func;
