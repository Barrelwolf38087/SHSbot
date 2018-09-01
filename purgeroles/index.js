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
	fs.readFile("purgeroles.txt", (err, data) => {
		if(err) console.error(err);
		data = data.toString().split("\n").filter(Boolean);
		const roles = config.channel.guild.roles.filter(role => {
			if(role.name === "@everyone") return false;
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
			filter(member =>
				member.roles.some(role => /freshmen|sophomores|juniors|seniors/.test(role.name.toLowerCase()))
			).
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
			});
		if(dryRun){
			if(report.length > 2000){
				return resolve(config.channel.send(new require("discord.js").Attachment(Buffer.from(report), "report.txt").then()));
			}
			return resolve(config.channel.send(report).then());
		}
	});
});
