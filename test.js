const gm = require("gm").subClass({imageMagick: true});

gm("temp/bitdepth.png").bitdepth(32).write("temp/done.png", ()=>{});
