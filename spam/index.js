module.exports = config => Promise.resolve((config.commandArr.join(" ") || "i\nh").repeat(2000).slice(0, 2000));
