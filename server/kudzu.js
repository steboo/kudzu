var kudzu = (function() {
    var names = require('./names.js');
    var socketServer = require('./socketServer');
    var broadcastMessage,
	timer;

    const STATUS_ACTIVE = 0;
    const STATUS_SUSPENDED = 1;

    function World() {
	this.name = "Earth"; // TODO: expand possibilities, and make sure the planet doesn't already exist (register with other servers)
	this.players = [];
	this.resources = [Knapweed, Kudzu];
	this.status = STATUS_SUSPENDED;
    }

    function Player(socket) {
	this.goats = [new Goat()];
	this.socket = socket;
	this.world = null;
    }

    function Goat() {
	this.gender = (Math.random() > 0.5 ? "F" : "M");
	this.maxHunger = 50 + (Math.random() * 50);
	this.name = names.pickName(this.gender);
	this.pickiness = 50 + (Math.random() * 50);
	this.wanderLust = 0; // For future use
    };

    function Knapweed() {
	this.desirability = 87;
	this.name = "knapweed";
	this.nourishment = 0.8;
	this.prominence = 80;
    };

    function Kudzu() {
	this.desirability = 88;
	this.name = "kudzu";
	this.nourishment = 1;
	this.prominence = 80;
    };

    var world;

    // We need to be able to start the world; it should pause when no one's online.
    function initWorld(port) {
	if (!world) {
	    world = new World(); // TODO: should support saving/loading world
	}

	socketServer.init(port, function(listener) {
	    broadcastMessage = listener.broadcast;
	    listener.on('connection', function(socket) {
		activateWorld();

		listener.broadcast("Someone connected to the server!");

		var player = addPlayer(world, socket);

		if (player) {
		    var numPlayers = listener.clients.length - 1;

		    socket.send("Welcome, player!");
		    socket.send("You have " + player.goats.length + " goat(s).");
		    socket.send("There are " + numPlayers + " other players connected.");
		} else {
		    socket.send("There was an error setting up or loading your game. Please try again.");
		}

		socket.on('message', function(data) {
		    var player = getPlayerBySocket(socket);
		    if (data == "graze") {
			player.goats.forEach(function(goat) {
			    graze(player, goat);
			});
		    }
		});

		socket.on('close', function() {
		    var player = getPlayerBySocket(socket);
		    removePlayer(player);
		    if (listener.clients.length == 0) {
			suspendWorld();
		    }
		});
	    });

	});

    }

    function activateWorld() {
	if (world.status == STATUS_SUSPENDED) {
	    world.status = STATUS_ACTIVE;
	    timer = setInterval(tick, 5000);
	}
    }

    function suspendWorld() {
	console.log("Suspending world.");
	world.status = STATUS_SUSPENDED;
        clearInterval(timer);
    }

    // We need to be able to add players to the world
    function addPlayer(world, socket) {
	var player = new Player(socket);
	world.players.push(player);
	player.world = world;

	return player;
    }

    // And remove them, too!
    function removePlayer(player) {
	var worldPlayers = player.world.players;
	var playerIndex = worldPlayers.indexOf(player);

	if (playerIndex > -1) {
	    worldPlayers.splice(playerIndex, 1);
	}
    }

    // Look up a player by their socket
    function getPlayerBySocket(socket) {
	var socketPlayer = world.players.find(function(player) {
	    return player.socket == socket;
	});
	return socketPlayer;
    }

    // Make the world go 'round!
    function tick() {
	if (world.status == STATUS_ACTIVE) {
	    console.log("Tick!");
	    broadcastMessage("Tick!");
	}
    }

    function graze(player, goat) {
	var resource = new (randomElement(world.resources));
	player.socket.send(goat.name + " munches on some " + resource.name + ".");
    }

    function randomElement(array) {
	var index = Math.floor(Math.random() * array.length);
	return array[index];
    }

    if (!Array.prototype.find) {
	Array.prototype.find = function(predicate) {
	    if (this === null) {
		throw new TypeError('Array.prototype.find called on null or undefined');
	    }
	    if (typeof predicate !== 'function') {
		throw new TypeError('predicate must be a function');
	    }
	    var list = Object(this);
	    var length = list.length >>> 0;
	    var thisArg = arguments[1];
	    var value;
	    
	    for (var i = 0; i < length; i++) {
		value = list[i];
		if (predicate.call(thisArg, value, i, list)) {
		    return value;
		}
	    }
	    return undefined;
	};
    }

    return {
	addPlayer: addPlayer,
	initWorld: initWorld
    };
})();

module.exports = kudzu;
