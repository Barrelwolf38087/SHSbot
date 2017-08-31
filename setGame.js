/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items The array containing the items.
 */
var shuffle = function(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
		return a;//THIS FUNCTION MODIFIES THE ARRAY
};


const origQuotes = require("fs").readFileSync("quotes.txt") + "";
var quotes;
const newQuotes = () => quotes = shuffle(origQuotes.split("\n").filter(x=>x)).reduce((acc, n) => acc.concat(n.match(/.{1,19}/g) || []), []);

newQuotes();

console.log("quotes", quotes);

module.exports = client => {
	const setGame = str => client.user.setPresence({ game: { name: str, type: 0 } });

	var counter = 0;

	const func = () => {
		console.log("setGame to ", quotes[counter]);
		setGame(quotes[counter]);

		counter ++;
		if(counter === quotes.length){
			newQuotes();
			console.log("new quotes are", newQuotes);
			counter = 0;
		}
	};

	func();

	setInterval(func, 1000 * 5);
};
