const zalgoConfig = require("./config.json");

const zalgoIt = function(str, num){
	console.log("zalgoing", str, "x", num);
	const chars = ["̍","̎","̄","̅","̿","̑","̆","̐","͒","͗","͑","̇","̈","̊","͂","̓","̈́","͊","͋","͌","̃","̂","̌","̀","́","̋","̏","̒","̓","̔","̽","̉","̾","͆","̚","̖","̗","̘","̙","̜","̝","̞","̟","̠","̤","̥","̦","̩","̪","̫","̬","̭","̮","̯","̰","̱","̲","̳","̹","̺","̻","̼","ͅ","͇","͈","͉","͍","͎","͓","͚","̣","̕","̛","̀","́","͘","̡","̢","̧","̨","̴","̵","̶","͏","͜","͝","͞","͟","͠","͢","̸","̷","͡","҉"];
	const randChar = ()=>chars[Math.floor(Math.random() * chars.length)];

	str = Array.from(str).map(char=>{
		for(var i = 0; i < num; i ++){
			char += randChar();
		}
		return char;
	}).join("");

	console.log("zalgoed to", str);

	return str;
};

module.exports = config => new Promise((resolve, reject)=>{
	const num = parseInt(config.commandArr[0], 10);

	if(isNaN(num)){
		reject(config.template(zalgoConfig.invalidNum, {prefix: config.config.prefix, subcommand: config.commandArr.join("")}));
	}


	resolve(zalgoIt(config.lastmessage, num));
});
