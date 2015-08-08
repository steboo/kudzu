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
	this.resources = [knapweed, kudzu];
	this.status = STATUS_SUSPENDED;
    }

    function Player(socket) {
	this.explored = 0;
	this.goats = [new Goat()];
	this.resources = {};
	this.socket = socket;
	this.world = null;
    }

    function Goat() {
	this.gender = (Math.random() > 0.5 ? "F" : "M");
	this.maxHunger = 0.5 + (Math.random() * 0.5);
	this.hunger = this.maxHunger / 2;
	this.name = names.pickName(this.gender);
	this.pickiness = 0.5 + (Math.random() * 0.5);
	this.wanderLust = 0; // For future use
    };

/* Actions */

    function Action(cost, prereq, effect) {
	this.cost = cost;
	this.prereq = prereq;
	this.effect = effect;
    }
    
    var actions = {
	graze: new Action(null,
			  null,
			  function(player) {
			      player.goats.forEach(function(goat) {
				  graze(player, goat);
			      });
			  }),
	goat: new Action({"kudzu": 15},
			 function(player) {
			     var enoughResources = checkResources(player, this.cost);
			     console.log("Enough for goat (need ", this.cost, ")? ", enoughResources);
			     return enoughResources;
			 },
			 goat)
    };
    
/* Resources */
    var knapweed = {
	desirability: 0.67,
	minExplored: 0,
	name: "knapweed",
	nourishment: 0.8,
	prominence: 0.8
    };

    var kudzu = {
	desirability: 0.68,
	minExplored: 0,
	name: "kudzu",
	nourishment: 1,
	prominence: 0.8
    };


/* World Management */
    var world;

    // We need to be able to start the world; it should pause when no one's online.
    function initWorld(port) {
	if (!world) {
	    world = new World(); // TODO: should support saving/loading world (or should it?!)
	}

	socketServer.init(port, function(listener) {
	    broadcastMessage = listener.broadcast;
	    listener.on('connection', function(socket) {
		activateWorld();

		listener.broadcast("Someone connected to the server!");

		var player = addPlayer(world, socket);

		if (player) {
		    var numPlayers = listener.clients.length - 1;

		    socket.send("Welcome to " + world.name + "!");
		    socket.send("You have " + player.goats.length + " goat(s).");
		    socket.send("There are " + numPlayers + " other players connected.");
		} else {
		    socket.send("There was an error setting up or loading your game. Please try again.");
		}

		socket.on('message', function(data) {
		    var player = getPlayerBySocket(socket);
		    if (actions[data] &&
			(actions[data].prereq ? actions[data].prereq(player) : true)) {
			actions[data].effect(player);
		    } else if (data == "attack") {
			var target = randomPlayer(player);
			attack(player, target);
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

    // Grab a random player (but not the one passed in)
    function randomPlayer(player, targetWorld) {
	targetWorld = targetWorld || player.world || world;

	var playerList = targetWorld.players;
	
	if (player) {
	    playerIndex = playerList.indexOf(player);
	    playerList.splice(playerIndex, 1);
	}

	return randomElement(playerList);
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
	    getHungry(world.players);
	    sendStatus(world.players);
	}
    }

/* Events */
    function getHungry(players) {
	players.forEach(function(player) {
	    player.goats.forEach(function(goat) {
		goat.hunger = Math.min(goat.maxHunger, goat.hunger + (goat.maxHunger / 10));
	    });
	});
    }
    
/* Resource Handling */
    function addResource(player, resource, amount) {
	if (!player.resources[resource]) {
	    player.resources[resource] = 0;
	}
	player.resources[resource] += amount;
	
	return player.resources[resource];
    }

    function removeResource(player, resource, amount) {
	if (!player.resources[resource]) {
	    return false;
	} else {
	    return player.resources[resource] -= amount;
	}
    }

    function removeResources(player, resources) {
	if (checkResources(player, resources)) {
	    for (var name in resources) {
		var amount = resources[name];
		
		player.resources[name] && (player.resources[name] -= amount);
	    }	    
	    return true;
	}
	return false;
    }

    function checkResources(player, resources) {
	var enough = true;

	for (var name in resources) {
	    var amount = resources[name];

	    if (!player.resources[name] || player.resources[name] < amount) {
		enough = false;
		break;
	    }
	}

	return enough;

    }
    
/* Action Handling */
    function eat(goat, resource, amount) {
	goat.hunger -= (resource.nourishment * (amount || 1)) / 100;
	if (goat.hunger <= 0) {
	    goat.hunger = 0;
	}
    }

    function goat(player) {
	var newGoat = new Goat();

	if (removeResources(player, actions.goat.cost)) {
	    player.goats.push(newGoat);
	    sendMessage(player, "A new goat joins your herd!");
	}
    }
    
    function graze(player, goat) {
	var resource = randomElement(world.resources);
	var amount = Math.random() * resource.prominence * 4; // FIXME
	var willEat = (Math.random() <= (((1 - goat.pickiness) + resource.desirability) * 0.65 +
					 (goat.hunger / goat.maxHunger) * 0.35));
	if (willEat) {
	    sendMessage(player, goat.name + " munches on some " + resource.name + " (hunger now " + goat.hunger + "/" + goat.maxHunger + ".");
	    eat(goat, resource, amount);
	} else {
	    var invAmount = addResource(player, resource.name, 1);
	    sendMessage(player, goat.name + " returns with some " + resource.name + ". You now have " + invAmount + " " + resource.name + ".");
	}
    }

    function attack(player, target) {
	sendMessage(player, "You are attacking another player!");
	sendMessage(target, "You are being attacked by another player's goats!");
    }


    function explore(player) {
    }

    function availableActions(player) {
	var available = [];

	for (var action in actions) {
	    var prereq = actions[action].prereq;

	    if (prereq == null ||
		(prereq &&
		 prereq.call(actions[action], player))) { // FIXME
		available.push(action);
	    }
	}

	return available;
    }
    
/* User Output */
    // Send a message to a player
    function sendMessage(player, msg) {
	var socket = player.socket;

	socket.send(msg);
    }

    function sendJSON(player, object) {
	var JSONified = JSON.stringify(object);

	sendMessage(player, JSONified);
    }

    function goatStatus(player) {
	var status = {};

	player.goats.forEach(function(goat) {
	    status[goat.name] = { hunger: goat.hunger / goat.maxHunger };
	});

	return status;
    }

    function playerStatus(player) {
	var status = {};

	status.goats = goatStatus(player);
	status.resources = player.resources;
	status.actions = availableActions(player);

	return status;
    }

    function sendStatus(players) {
	if (!players.forEach) {
	    players = [players];
	}

	players.forEach(function(player) {
	    var status = playerStatus(player);
	    
	    sendJSON(player, status);
	});
    }
    
/* Utilities */
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
