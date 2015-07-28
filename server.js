var kudzu = require('./server/kudzu');

var port = 9000;

if (process.argv.length == 3) {
    port = Number(process.argv[2]);
}

kudzu.initWorld(port);
