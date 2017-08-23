const fetch = require("node-fetch");

module.exports = config => new Promise((resolve)=>{
	fetch("https://api.wolframalpha.com/v2/query?input=" + encodeURIComponent(config.commandArr.join(" ")) + "&appid=" + config.config.wolframKey + "&format=plaintext,img,image&ignorecase=true&output=json").then(x=>x.json()).then(obj=>{
		var resp = {
		  "embed": {
		    "title": "Wolfram | Alpha query",
		    "description": "Your input: `" + config.commandArr.join(" ") + "`",
		    "url": "https://www.wolframalpha.com/input/?i" + encodeURIComponent(config.commandArr.join(" ")),
		    "color": 0,
		    "timestamp": "2017-08-22T17:59:31.297Z",
		    "footer": {
		      "icon_url": "https://cdn.discordapp.com/avatars/327884416674168847/a1ac7baecca695bb0679c6ef86ea636a.webp?size=256",
		      "text": "SHSbot"
		    },
		    "author": {
		      "name": "Wolfram | Alpha",
		      "url": "https://www.wolframalpha.com/",
		      "icon_url": "http://products.wolframalpha.com/images/products/products-wa.png"
		    },
		    "fields": [
		    ]
		  }
		};
		//console.log(JSON.stringify(obj));
		try{
			obj.queryresult.pods.forEach(pod=>{
				try{
		        if(/input/i.test(pod.title)){
		            return;
		        }
		        var name = pod.title;
		        var plaintext = pod.subpods[0].plaintext;
						if(name && plaintext){
							resp.embed.fields.push({name: name, value: plaintext});
						}
						if(pod.subpods && pod.subpods[0] && pod.subpods[0].img && pod.subpods[0].img.src && !resp.embed.image){
							resp.embed.image = {};
							resp.embed.image.url = pod.subpods[0].img.src;
						}
			   }catch(e){
					console.error(e, pod);
				}
			});
			/*var a = [];
			var i = 200;

			do{a.push(str.substring(0, i));}
			while((str = str.substring(i, str.length)) !== "");
			a.forEach(bit=>{
				config.sendMessage(bit);
			});*/
			console.log("\n\n\n\n\n", JSON.stringify(resp));
			resolve(resp);
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
