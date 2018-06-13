const fetch = require("node-fetch");
const emojiz = "new_moon waxing_crescent_moon first_quarter_moon waxing_gibbous_moon full_moon waning_gibbous_moon last_quarter_moon waning_crescent_moon new_moon new_moon".split(" ");


module.exports = config => new Promise(resolve=>{
	fetch("http://api.wunderground.com/api/" + config.config.wuKey +  "/astronomy/conditions/alerts/q/NH/Amherst.json").then(x=>x.json()).then(obj=>{
		var moon = emojiz[~~(obj.moon_phase.ageOfMoon * emojiz.length / 30)];
		config.sendMessage("It's " + obj.current_observation.icon + " today, and it feels like " + obj.current_observation.feelslike_string + (obj.current_observation.feelslike_string === obj.current_observation.temperature_string ?
		 ""
			: ", even though it's " + obj.current_observation.temperature_string) +
		 ". " + (obj.alerts && obj.alerts[0] && obj.alerts[0].type ?
			"Looks like there's a " + obj.alerts[0].description.toLowerCase() + "! Yikes!"
			: "(Un)fortunately, there's no extreme weather nearby." ) +
			" The moon is a " + moon.replace(/_/g, " ") + " :" + moon + ":.");
		resolve({file: {attachment: "https://cdn.discordapp.com/attachments/340940153424052225/342008111801958401/WU.png"}});
	});
});
