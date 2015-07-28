var express = require('express'),
    kudzu = require('./server/kudzu');

var httpPort = 8000,
    wsPort = 9000;

if (process.argv.length >= 3 && process.argv.length <= 4) {
    httpPort = Number(process.argv[2]);

    if (process.argv.length == 4) {
        wsPort = Number(process.argv[3]);
    }
}

// HTTP server
var app = express();

app.use(express.static('public'));

var server = app.listen(httpPort, function () {
    console.log('HTTP server listening on port %s...', httpPort);
});

// WebSockets server
kudzu.initWorld(wsPort);

