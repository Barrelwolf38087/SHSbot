const fs = require("fs");

module.exports = config => new Promise((resolve) => {
	let dryRun = false;
	let report = "";
	if(config.commandArr[1] === "dry-run"){
		config.channel.send("Debugging & dry-run enabled!");
		dryRun = true;
	}else if(config.commandArr[1] !== "IREALLYKNOWWHATIAMDOING"){
		return resolve("$purgeroles can be a very destructive command. Please run $purgeroles dry-run for a dry run or $purgeroles IREALLYKNOWWHATIAMDOING for the real thing.");
	}
	fs.readFile("purgeroles.txt", (err, data) => {
		if(err) console.error(err);
		data = data.toString();
		const roles = data.split("\n").filter(Boolean).map(role => {
			console.log(role);
			try{
				const newRole = config.channel.guild.roles.get(role);
				if(!newRole){
					config.sendMessage("Could not get role " + role);
					return;
				}
				return newRole;
			}catch(e){
				config.sendMessage("Could not get role " + role + " " + e);
			}
		}).filter(Boolean);

		config.channel.guild.roles.forEach(role => {
			if(role.name.toLowerCase().includes("advisory")){
				report += `
Found advisory role ${role.name} (${role.id})`;
				console.log("it has advisory");
				roles.push(role);
			}
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
