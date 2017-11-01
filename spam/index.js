module.exports = config => Promise.resolve(config.commandArr.join(" ").repeat(2000).slice(0, 2000));
