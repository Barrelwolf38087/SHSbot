const config = require("./config.json");
const dialogflow = require("dialogflow");

const sessionClient = new dialogflow.SessionsClient({keyFilename: "google-cloud-key.json"});
const languageCode = "en-US";
const projectId = config.dialogflowProjectId;

const debugStr = "___ENABLE_DEBUGGING";

const done = (message, conversation, client) => {
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
		var intent = resp.intent.displayName;
		var params = resp.parameters.fields;

		Object.keys(params).forEach(key => {
			if(key === "timestamp") return;
			console.log(key, JSON.stringify(params[key]));
			if(!params[key]) return;
			if(params[key].listValue){
				params[key] = params[key].listValue.values.map(x=>{
					if(!x) return;
					return x.toLowerCase();
				});
			}else{
				const value = params[key].stringValue;
				if(!value && value !== "") return;
				params[key] = value;
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
			latin = params.Language && params.Language.includes("latin");
			spanish = params.Language && params.Language.includes("spanish");
			french = params.Language && params.Language.includes("french");
		}
		if(intent === "Language"){
			latin = params.Language === "latin";
			spanish = params.Language === "spanish";
			french = params.Language === "french";
		}
		if(intent === "Band, chorus or none of the above"){
			band = params.music && params.music.includes("band");
			chorus = params.music && params.music.includes("chorus");
		}
		if(intent === "Teacher wants support" || intent === "Support"){
			support = !!params.yes;
		}
		if(((intent === "Teaches advisory - name" && teachesAdvisory) || intent === "Advisor") && params.advisory){
			advisor = params.advisory;
		}
		if(intent === "Team"){
			team = params.Team;
		}
		if(intent === "Teaches advisory"){
			teachesAdvisory = !!params.yes;
		}
		if(intent === "Name"){
			newNickname = resp.queryText;
		}
	});

	if(conversation.debug){
		message.author.send(JSON.stringify({
			grade,
			team,
			advisor,
			teachesAdvisory,
			support,
			band,
			chorus,
			spanish,
			french,
			latin
		}));
	}

	var channels = [];
	if(grade){
		channels.push({
			"9th grade": "Freshmen",
			"10th grade": "Sophomores",
			"11th grade": "Juniors",
			"12th grade": "Seniors",
			"teacher": "teachers"
		}[grade.toLowerCase()]);
	}
	if(team){
		channels.push(team);
	}
	if(advisor){
		console.log("advisor", typeof advisor, advisor);
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

	channels = channels.filter(Boolean);

	if(conversation.debug){
		message.author.send("Your roles are: " + channels.join(", "));
	}
	if(newNickname && conversation.debug){
		message.author.send("Your new nickname is " + newNickname);
	}

	if(conversation.setVars){
		var guild = client.guilds.get(conversation.guildId);
		var member = guild.members.get(message.author.id);
		if(newNickname){
			member.setNickname(newNickname);
			console.log("set nickname of", message.author.tag, "to", newNickname);
		}

		let author = message.author;
		const send = str => author.send(str);
		const notAppliedRoles = [];

		const promises = [];

		channels.forEach(role=>{
			const foundRole = guild.roles.find(x=>
				x.name.toLowerCase().trim().includes(role.toLowerCase().trim()) ||
				x.id.toString() === role.trim()
			);
			//console.log("found role", typeof foundRole, "with id", foundRole && foundRole.id, "and name", foundRole && foundRole.name, "for role", role);
			if(!foundRole || !foundRole.id){
				notAppliedRoles.push(role);
				return;
			}
			promises.push(member.addRole(
				foundRole
			).catch(e=>{
				console.error(e);

				notAppliedRoles.push(role);
			}));
		});

		Promise.all(promises).then(() => {
			if(notAppliedRoles.length){
				send(`Looks like I couldn't give you some roles in the SHS Discord server. Please ask an admin to give you these roles: \`${notAppliedRoles.join(", ")}\``);
			}
		});
	}
};

module.exports = (message, conversation, client) => {
	let query = message.toString().trim();
	if(query.includes(debugStr)){
		conversation.debug = true;
		query = query.replace(debugStr, "").trim();
		message.author.send("Debugging enabled!");
	}

	console.log(message.author.tag + "> " + message.content);

	if(conversation.debug) console.log("debugging conversation");

	const sessionId = message.author.id;
	const sessionPath = sessionClient.sessionPath(projectId, sessionId);

	const request = {
		session: sessionPath,
		queryInput: {
			text: {
				text: query,
				languageCode: languageCode,
			},
		},
	};

	sessionClient
		.detectIntent(request)
		.then(responses => {
			const response = responses[0].queryResult;

			conversation.responses.push(response);

			console.log("SHSbot> ", response.fulfillmentText);

			message.author.send(response.fulfillmentText);

			if(response.fulfillmentText.includes("I'm done")){
				console.log("conversation completed!");
				done(message, conversation, client);
				conversation = undefined;
			}
		})
		.catch(e => {
			return console.error("ERROR: " + e);
		});
};
