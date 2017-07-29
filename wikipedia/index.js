const fetch = require("node-fetch");

module.exports = config => new Promise(resolve=>{
	fetch("https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages%7Cpageterms&generator=prefixsearch&redirects=1&formatversion=2&piprop=thumbnail&pithumbsize=50&pilimit=10&wbptterms=description&gpssearch=" + encodeURIComponent(config.commandArr.join(" ")) + "&gpslimit=1").then(x=>x.json()).then(resp=>{
		try{
			resolve("https://en.wikipedia.org/wiki/" + encodeURIComponent(resp.query.pages[0].title));
		}catch(e){
			resolve("Article not found. https://en.wikipedia.org/wiki/HTTP_404");
		}
	});
});
