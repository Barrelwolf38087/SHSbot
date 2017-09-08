const msgs = ["Ready? It's {{author}} ({{role}})'s turn!", "\\_\\_\\_\\_\\_\\_|\\_\\_\\_\\_\\_\\_|\\_\\_\\_\\_\\_\\_", "￣￣￣|￣￣￣|￣￣￣"];

const coinReward = coins => Math.min(Math.round((coins - 100) / 20 + 1), 20);

var emitter;

var ChannelFactory = function(){
	this.isX = false;

	this.state = 0;

	this.resetBoard = ()=>{
		this.board = [
			["", "", ""],
			["", "", ""],
			["", "", ""]
		];
		this.isX = false;
		this.playerX = null;
		this.playerY = null;
		this.boardMsg = [{}, {}, {}];
	};

	this.playerX = null;
	this.playerY = null;

	this.resetBoard();

	this.winners = [
		[[0, 0], [0, 1], [0, 2]],
		[[1, 0], [1, 1], [1, 2]],
		[[2, 0], [2, 1], [2, 2]],

		[[0, 0], [1, 0], [2, 0]],
		[[0, 1], [1, 1], [2, 1]],
		[[0, 2], [1, 2], [2, 2]],

		[[0, 0], [1, 1], [2, 2]],
		[[0, 2], [1, 1], [2, 0]]
	];

	this.boardMsg = [{}, {}, {}];
};

var channelObjs = [];

const func = config=>new Promise((resolve, reject)=>{
	const cents = config.config.coin;

	const o = channelObjs[config.channelId] || new ChannelFactory();
	channelObjs[config.channelId] = o;

	if(config.commandArr.join(" ").trim() === "quit"){
		o.state = 2;
		return resolve((o.isX ? o.playerY : o.playerX) + " quit! Send `" + config.config.prefix + "game` for the next game!");
	}

	console.log(config.author + "");
	if(o.state === 2){
		console.log("resetting...");
		o.resetBoard();
		o.state = 0;
	}
	if(o.state === 0.5){
		if(o.playerX.tag === config.author.tag){
			config.sendMessage("You want to play Tick-Tack-Toe *by yourself*? You don't get any coins.");
		}
		o.state = 1;
		o.playerY = config.author;
		console.log("ID:", o.playerX.id + "");
		config.sendMessage(`Starting Tick-Tack-Toe between ${o.playerX} ${config.coins[o.playerX.id]}¢ (X) and ${o.playerY} ${config.coins[o.playerY.id]}¢ (O)`);
		o.isX = !o.isX;
	}

	if(o.state === 1){
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

		if(!emojis || Object.keys(emojis).length !== 9){
			return reject("YOU NO HAS TEH EMOJIZ!! Add them by following these instructions: https://shsbot.github.io/#youll-need-some-special-custom-emojis (you'll need to be an admin on this server)");
		}

		if(!emitter){
			emitter = true;
			console.log("got emitter!");
			config.reactions.on("reaction", (react, auth)=>{
				console.log("reaction!");
				var row;
				const correctMsg = o.boardMsg.some((msg, idx)=>{
					if(msg.id === react.message.id){
						row = idx;
						console.log("row", row);
						return true;
					}
				});
				const empty = /empty/.test(react.emoji.name);
				if((o.isX && auth.tag !== o.playerX.tag) || (!o.isX && auth.tag !== o.playerY.tag)){
					console.log("wrong player combo: ", auth.tag + "", "X", o.playerX.tag, "y",  o.playerY.tag);
					return;
				}
				if(auth.bot || !empty || !correctMsg){
					console.log("bot or not empty or wrong message", auth.bot, empty, !correctMsg);
					return;
				}


				console.log("legit reaction!" + react.emoji.name);
				o.boardMsg.forEach(msg=>msg && msg.delete && msg.delete().catch());
				o.board[row][react.emoji.identifier.split(":")[0].slice(-1) - 1] = o.isX ? "X" : "O";

				var winner;

				const won = o.winners.some(combo=>{
					const right = o.board[combo[0][0]][combo[0][1]] === o.board[combo[1][0]][combo[1][1]] && o.board[combo[1][0]][combo[1][1]] === o.board[combo[2][0]][combo[2][1]] && o.board[combo[0][0]][combo[0][1]];
					if(right){
						console.log("right!");
						winner = o.board[combo[0][0]][combo[0][1]];
					}
					return right;
				});

				var msg;

				if(won){
					console.log("won!");
					o.state = 2;

					const winnerPlayer = o.isX ? o.playerX : o.playerY;

					var loser;

					if(o.playerX === winner){
						loser = o.playerY;
					}else{
						loser = o.playerX;
					}

					console.log("loser", loser + "", "coins", config.coins[loser.id]);

					const reward = coinReward(config.coins[loser.id]);

					var msg2;

					if(o.playerX.id === o.playerY.id){
						msg2 = winner + " won the game!";
					}else{
						msg2 = winner + " (" + winnerPlayer + ") won the game and " + reward + cents + "!";

						config.coins[winnerPlayer.id] += reward;
						console.log("gave " + winnerPlayer, reward, "coins");
					}

					config.sendMessage(msg2).catch(console.error);
					msg = "The winning board:";
				}

				const draw = o.board.every(row=>row.every(sq=>sq.trim()));

				o.isX = !o.isX;

				if(draw){
					console.log("draw");
					o.state = 2;
					msg = "It's a tie! Play again?";
				}

				if(!draw && !won){
					msg = "Here's the new board:";
				}

				var str = o.board.reduce((str, row, index)=>{
					var res = ("_" + (row[0] || "_") + "_|_" + (row[1] || "_") + "_|_" + (row[2] || "_") + "_");
					if(index === 2){
						res = res.replace(/_/g, " ");
					}
					return str + res + "\n";
				}, msg + "\n```\n");
				console.log("str", str);
				config.sendMessage(str + "```" + ((draw || won) ? "" : (o.isX ? o.playerX : o.playerY) + ": ") + "Send `" + config.config.prefix + "game` for the next " + (won || draw ? "game!" : "turn!"));
			});
		}

		o.board.forEach((row, idx)=>{
			const message = idx ? msgs[idx] : config.template(msgs[idx], {role: o.isX ? "X" : "O", author: o.isX ? o.playerX : o.playerY});
			config.sendMessage(message).then(msg=>{
				o.boardMsg[idx] = msg ;
				var promise = Promise.resolve();
				row.forEach((square, column)=>{
					console.log("square", square, "column", column);
					promise = promise.then(()=>msg.react((()=>{
						if(!square.trim()){//empty
							console.log("reacting with", emojis["empty" + (column + 1)] + "", "empty" + (column + 1));
							return emojis["empty" + (column + 1)];
						}else{
							console.log("reacting with", emojis[square + "icon" + (column + 1)] + "", square + "icon" + (column + 1));
							return emojis[square + "icon" + (column + 1)];
						}
					})()).catch());
				});
				promise.then(resolve);
			}).catch(reject);
		});
	}else if(o.state === 0){
		o.playerX = config.author;
		o.state = 0.5;
		return resolve("Ok, you're X. The next person to send `$game` gets to be O.");
	}

	resolve();
});

func.listenForReactions = true;

module.exports = func;
