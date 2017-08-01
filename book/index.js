const fetch = require("node-fetch");

module.exports = config => new Promise((resolve, reject)=>{
	fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(config.commandArr.join(" "))}&prettyPrint=false&maxResults=1&key=${config.config.bookKey}&quotaUser=327884416674168847&fields=items/volumeInfo(title,averageRating,imageLinks/thumbnail,ratingsCount,description),items/selfLink,items/id`).
	then(x=>x.json()).then(obj=>
		resolve(`**${obj.items[0].volumeInfo.title}**
${obj.items[0].volumeInfo.imageLinks.thumbnail.replace("zoom=1", "zoom=2")}
${obj.items[0].volumeInfo.description}
${obj.items[0].volumeInfo.averageRating}:star: (${obj.items[0].volumeInfo.ratingsCount})
<https://books.google.com/books?id=${obj.items[0].id}>`)
	).catch(reject);
});
