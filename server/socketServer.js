var ws = require('ws');

var socketServer = function() {
    var data = null,
        timerID = null,
        listener = null,
        WebSocketServer = ws.Server,
        url = require('url'),
        domain = require('domain'),
        socketDomain = domain.create(),
        httpDomain = domain.create(),

        socketListen = function(port) {
            socketDomain.on('error', function(err) {
                console.log('Error caught in socket domain:' + err);
            });

            socketDomain.run(function() { 
                listener = new WebSocketServer({ port: port });

                listener.broadcast = function(data) {
                    listener.clients.forEach(function(client) {
                        client.send(data);
                    });
                };

                listener.on('listening',function(){
                    console.log('SocketServer is running');
                });

                listener.on('connection', function (socket) {

                    console.log('Connected to client');

                    socket.on('message', function (data) { 
                        //console.log('Message received:', data);
                    });

                    socket.on('close', function () {
                        try {
                            socket.close();

                            if (listener.clients.length == 0) {
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

        init = function(socketPort, callback) {
            socketListen(socketPort);
            callback(listener);
        };

    return {
        init: init
    };
    
}();

module.exports = socketServer;
