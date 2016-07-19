var express = require('express'),
    config = require('./server/config'),
    kudzu = require('./server/kudzu');

var httpPort = config.httpServer.port,
    wsPort = config.wsServer.port;

if (process.argv.length >= 3 && process.argv.length <= 4) {
    httpPort = Number(process.argv[2]);

    if (process.argv.length == 4) {
        wsPort = Number(process.argv[3]);
    }
}

// HTTP server
var app = express();

app.use(express.static(__dirname + '/public'));

app.listen(httpPort, function () {
    console.log('HTTP server listening on port %s...', httpPort);
});

// WebSockets server
kudzu.initWorld(wsPort);

