const fs = require("fs");

const markov = require("markov");
var m = markov(1);

var hasInit = false;

const init = ()=>new Promise((resolve)=>{
	if(hasInit){
		resolve();
	}else{
		var s = fs.readFileSync(__dirname + "/seed.txt", "utf-8");
		m.seed(s, ()=>{
		   resolve();
		});
	}
});

module.exports = config => new Promise((resolve, reject)=>{
	init().then(()=>{
		 var res = m.respond(config.commandArr.join(" ")).join(" ");
		 console.log("tech help", res);
		 config.sendMessage("Consulting the experts...").then(()=>setTimeout(resolve, ~~(Math.random() * 5000), res));
	}).catch(reject);
});
