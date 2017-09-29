const fetch = require("node-fetch");

var done = (message, conversation) => {
	var grade;
	var team;
	var advisor;
	var teachesAdvisory = true;
	var support = false;
	var band = false;
	var chorus = false;
	var spanish = false;
	var french = false;
	var latin = false;

	var newNickname;

	conversation.responses.forEach(resp => {
		var intent = resp.result.metadata.intentName;
		var params = resp.result.parameters;

		console.log(intent, params);

		Object.keys(params).forEach(key => {
			if(params[key].map){
				params[key] = params[key].map(x=>x.toLowerCase());
			}else{
				params[key] = params[key].toLowerCase();
			}
		});

		if(intent === "Grade"){
			grade = params.grade9or10 || params.grade11or12 || params.teacher;
		}
		if(intent === "Teaches band/chorus"){
			band = params.music.includes("band");
			chorus = params.music.includes("chorus");
		}
		if(intent === "Teaches language"){
			latin = params.Language.includes("latin");
			spanish = params.Language.includes("spanish");
			french = params.Language.includes("french");
		}
		if(intent === "Language"){
			latin = params.Language === "latin";
			spanish = params.Language === "spanish";
			french = params.Language === "french";
		}
		if(intent === "Band, chorus or none of the above"){
			band = params.music.includes("band");
			chorus = params.music.includes("chorus");
		}
		if(intent === "Teacher wants support" || intent === "Support"){
			support = !!params.yes;
		}
		if((intent === "Teaches advisory - name" && teachesAdvisory) || intent === "Advisor"){
			advisor = params.advisory;
		}
		if(intent === "Team"){
			team = params.Team;
		}
		if(intent === "Teaches advisory"){
			teachesAdvisory = !!params.yes;
		}
		if(intent === "Name"){
			newNickname = resp.result.resolvedQuery;
		}
	});

	var channels = [];
	if(grade){
		channels.push({
			"9th grade": "Cringy Freshmen",
			"10th grade": "Decent Sophomores",
			"11th grade": "Pretty Dank Juniors",
			"12th grade": "Spicy Seniors",
			"teacher": "teachers"
		}[grade.toLowerCase()]);
	}
	if(team){
		channels.push(team);
	}
	if(advisor){
		channels.push(advisor.replace("'", "").replace(/ /g, "-") + "-advisory");
	}
	if(grade === "teacher" && teachesAdvisory){
		newNickname = advisor;
	}

	if(newNickname){
		newNickname = newNickname.split(" ").map(x=>x[0].toUpperCase() + x.slice(1)).join(" ");
	}

	channels.push(latin && "latin");
	channels.push(spanish && "spanish");
	channels.push(french && "french");
	channels.push(band && "band");
	channels.push(chorus && "chorus");
	channels.push(support && "support");

	channels = channels.filter(x=>x);
	console.log(channels, newNickname);

	message.author.send("Your roles are: " + channels.join(", "));
	if(newNickname){
		message.author.send("Your new nickname is " + newNickname);
	}
};

module.exports = (message, conversation) => {
	var value = message.toString().trim();

	fetch("https://api.api.ai/v1/query?v=20150910&lang=en&query=" + encodeURIComponent(value) + "&sessionId=" +
	conversation.sessionId, {headers:
		{"Authorization": "Bearer " + require("./config.json").apiAiToken}})
		.then(x=>x.json()).then(data => {
			
			conversation.responses.push(data);

			if(!data || !data.status || !data.status.code || data.status.code >= 400 || !data.result){
				return console.error("ERROR: " + (data && data.status && data.status.errorDetails));
			}
			
			if((data.result.fulfillment.messages[1] && data.result.fulfillment.messages[1].done) || data.result.fulfillment.speech.includes("I'm done")){
				console.log("conversation is done!");
				done(message, conversation);
				conversation = undefined;
			}
			console.log("got response", data.result.fulfillment.speech);

			message.author.send(data.result.fulfillment.speech || "I'm sorry, I didn't get that. Please try repeating that in a diffrent way or \"start over\"");
		});
	};
