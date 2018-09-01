const fs = require("fs");

module.exports = config => new Promise((resolve) => {
	let dryRun = false;
	let report = "";
	if(config.commandArr[0] === "dry-run"){
		config.channel.send("Debugging & dry-run enabled!");
		dryRun = true;
	}else if(config.commandArr[0] !== "IREALLYKNOWWHATIAMDOING"){
		return resolve("$purgeroles can be a very destructive command. Please run $purgeroles dry-run for a dry run or $purgeroles IREALLYKNOWWHATIAMDOING for the real thing.");
	}
	let conversation = false;
	if(config.commandArr[1] === "true" || config.commandArr[1] === "1"){
		conversation = true;
		config.sendMessage("Conversation enabled.");
	}
	fs.readFile("purgeroles.txt", (err, data) => {
		if(err) console.error(err);
		data = data.toString().split("\n").filter(Boolean);
		const roles = config.channel.guild.roles.filter(role => {
			if(role.name === "@everyone") return false;
			if(role.managed){
				report += `
Role ${role.name} (${role.id}) was added by a bot or integration and can't be removed.`;
				return false;
			}
			if(data.some(dataRole => role.id === dataRole)){
				report += `
Role ${role.name} (${role.id}) is blacklisted`;
				return false;
			}
			report += `
Adding role ${role.name} (${role.id})`;
			return true;
		});

		if(dryRun){
			report += `

Final Roles:`;
			roles.forEach(role => {
				report += `
${role.name} (${role.id})`;
			});
		}

		config.channel.guild.members.array().
			filter(member => {
				const isStudent = member.roles.some(role => /freshmen|sophomores|juniors|seniors/.test(role.name.toLowerCase()));
				if(!isStudent){
					report += `
${member.user.tag} (${member.id}) is not a student.`;
				}
				return isStudent;
			}).
			forEach(member => {
				report += `

Member ${member.user.tag}`;
				roles.forEach(role => {
					report += `
Removing role ${role.name} (${role.id})`;
					if(!dryRun){
						member.removeRole(role).catch(() => {
							config.sendMessage(`Could not remove role ${role} from ${member.user.tag} (${member.user.id})`);
							resolve("Done!");
						});
					}
				});
				if(conversation){
					if(dryRun){
						report += `
Sending conversation (if not for a dry run).`;
					}else{
						require("../conversation_loader")(member, config.channel.guild, config.conversations);
					}
				}
			});
		if(dryRun){
			if(report.length > 1990){
				return resolve(config.channel.send(new require("discord.js").Attachment(Buffer.from(report), "report.txt")).then(() => "Done!"));
			}
			return resolve(config.channel.send(report).then(() => "Done!"));
		}else{
			resolve("Done!");
		}
	});
});
