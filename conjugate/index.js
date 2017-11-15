const fetch = require("node-fetch");

module.exports = config => fetch("https://store.apicultur.com/api/verbo/conjuga/completo/1.0.0/?infinitivo=" + config.commandArr.join(" "), {headers: {"Authorization": "Bearer " + config.config.espToken}}).then(x=>x.json()).then(data => data.response.filter(x=>x.tiempoNum === 1 && x.modoNum === 1).reduce((acc, nw) => acc + "\n" + nw.persona + ": " + nw.formaregular, "").slice(1));
