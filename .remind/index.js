module.exports = config => new Promise((resolve, reject) => {
	var guild = config.client.guilds.get(config.commandArr[0]);
	if(!config.commandArr[0] || !guild || !guild.available){
		return reject("Could not find that guild!");
	}

	guild.members.array().forEach(person => {
		if(person.user.bot){
				return;
		}
		try{
			var roles = person.roles.array().slice(1).map(x=>x.name);
			if(roles.length < 3){
				setTimeout(()=>{
					person.send(`**A Friendly Reminder from SHSbot:**
Hello, I noticed that you have less than 3 roles on the SHS official server. Adding roles for your classes allows you to unlock special channels for help with a subject.
Copy/paste some of these commands in #bot-commands based on your classes:
\`\`\`
+giveme "10a"
+giveme "10b"
+giveme "9a"
+giveme "9b"
+giveme "band"
+giveme "chorus"
+giveme "french"
+giveme "freshmen"
+giveme "junior"
+giveme "latin"
+giveme "math"
+giveme "rla"
+giveme "science"
+giveme "senior"
+giveme "sophomore"
+giveme "spanish"
+giveme "ss"
\`\`\``);
				}, Math.round(1000 * 60 * 60 + //add an hour
					Math.random() *
				 1000 * //ms in a s
				 60 * //s in a m
				 60 * //m in a h
				 10 //total h
			 ));
			}
		}catch(e){
			console.error(e);
		}
	});

	resolve();
});
