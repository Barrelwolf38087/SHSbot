const {exec} = require("child_process");

module.exports = config => new Promise(resolve=>exec(config.commandArr.join(" "), (_, stdout)=>resolve(stdout)));
