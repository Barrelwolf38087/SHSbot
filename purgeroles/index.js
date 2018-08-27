const fs = require("fs");

module.exports = config => new Promise((resolve, reject) => {
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
		config.channel.guild.members.array().forEach(member => {
			roles.forEach(role => {
				member.removeRole(role).catch(() => {
					config.sendMessage(`Could not remove role ${role} from ${member.user.tag} (${member.user.id})`);
					resolve("Done!");
				});
			});
		});
	});
});
