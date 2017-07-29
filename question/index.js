const fetch = require("node-fetch");
const AsciiTable = require("ascii-table");

const limitStr = (str, limit) => {
	if(str.length > limit){
		return str.slice(0, limit - 1) + "…";
	}
	return str;
};

const maxLength = 150;

module.exports = config => new Promise((resolve)=>{
	fetch("https://api.wolframalpha.com/v2/query?input=" + encodeURIComponent(config.commandArr.join(" ")) + "&appid=3797QR-TYTV53QGGG&format=plaintext&ignorecase=true&output=json").then(x=>x.json()).then(obj=>{
		var str = "https://www.wolframalpha.com/input/?i=" + encodeURIComponent(config.commandArr.join(" ")) + "\n";
		console.log(obj);
		try{
			obj.queryresult.pods.forEach(pod=>{
				try{
		        if(/input/i.test(pod.title)){
		            return;
		        }
		        var name = pod.title;
		        var plaintext = pod.subpods[0].plaintext;
		        if(plaintext.includes("|")){
		            plaintext = (new AsciiTable()).setAlignLeft().removeBorder();
		            const arr = pod.subpods[0].plaintext.split("\n");
		            arr.forEach(y=>{
		                plaintext.addRow(
		                    ...y.split(/\s+\|\s+/g).map(x=>limitStr(x.trim(), maxLength))
		                );
		            });
		        }
		        var text = limitStr(plaintext + "", maxLength) || pod.subpods[0].img.src;
		        str += "**" + name + "**\n" + text/*.replace(/\s+\|\s+/g, "\t")*/ + "\n\n";
			   }catch(e){
					console.error(e, pod);
				}
			});
			str = limitStr(str, 2000);
			/*var a = [];
			var i = 200;

			do{a.push(str.substring(0, i));}
			while((str = str.substring(i, str.length)) !== "");
			a.forEach(bit=>{
				config.sendMessage(bit);
			});*/
			resolve(str);
		}catch(e){
			if(!obj.queryresult.success){
				var help = "";
				if(obj.queryresult){
					if(obj.queryresult.tips && obj.queryresult.tips.text){
						help = obj.queryresult.tips.text;
					}
					if(obj.queryresult.didyoumeans){
						help = obj.queryresult.didyoumeans.reduce((acc, o)=>acc + "\n" +  o.val, "**Did you mean:**");
					}
				}
				resolve(help);
			}
		}
	});
});
