var ws = require('ws'),
    quotes = require('./quotes');

var socketServer = function() {
    var data = null,
        timerID = null,
	socketServer = null,
	WebSocketServer = ws.Server,
//	http = require('http'),
//	fs = require('fs'),
	url = require('url'),
	domain = require('domain'),
	socketDomain = domain.create(),
	httpDomain = domain.create(),

/*	httpListen = function (port) {
	    httpDomain.on('error', function (err) {
		console.log('Error caught in http domain:' + err);
	    });

	    httpDomain.run(function () {
		http.createServer(function (req, res) {
		    var pathname = url.parse(req.url).pathname;
		    console.log(pathname);
		    if (pathname == '/' || pathname == '/index.html') {
			readFile(res, 'index.html');
		    }
		    else {
			readFile(res, '.' + pathname);
		    }
		}).listen(port);
	    });
	},*/

/*	readFile = function(res, pathname) {
	    fs.readFile(pathname, function (err, data) {
		if (err) {
		    console.log(err.message);
		    res.writeHead(404, {'content-type': 'text/html'});
		    res.write('File not found: ' + pathname);
		    res.end();
		}
		else {
		    res.write(data);
		    res.end();
		}
	    });       
	},*/

	socketListen = function(port) {
	    socketDomain.on('error', function(err) {
		console.log('Error caught in socket domain:' + err);
	    });

	    socketDomain.run(function() { 
		socketServer = new WebSocketServer({ port: port });

		socketServer.broadcast = function(data) {
		    socketServer.clients.forEach(function(client) {
			client.send(data);
		    });
		};

		socketServer.on('listening',function(){
		    console.log('SocketServer is running');
		});

		socketServer.on('connection', function (socket) {

		    console.log('Connected to client');
		    if (data == null) getQuotes();

		    socket.on('message', function (data) { 
			console.log('Message received:', data);
		    });

		    socket.on('close', function () {
			try {
			    socket.close();

			    if (socketServer.clients.length == 0) {
				clearInterval(timerID);
				data = null;
			    }
			}
			catch (e) {
			    console.log(e);
			}
		    });

		});  
	    });      
	},

	getQuotes = function() {
	    var json = {"quotes" : quotes};

	    processJson(json);
	},

	sendQuote = function() {
	    if (socketServer.clients.length > 0) {
		var randomQuoteIndex = Math.floor(Math.random() * data.quotes.length);
		socketServer.broadcast(data.quotes[randomQuoteIndex]);
	    }
	},

	processJson = function(json) {
	    data = json;
	    sendQuote();
	    timerID = setInterval(sendQuote, 5000);

	},

	init = function(socketPort) {
//	    httpListen(httpPort);
	    socketListen(socketPort);
	};

    return {
	init: init
    };
 
}();

module.exports = socketServer;
