var kudzu = (function() {
    var names = require('./names.js');
    var allResources = require('./resources.js');
    var combat = require('./combat.js');
    var socketServer = require('./socketServer');
    var utils = require('./utilities.js');
    var broadcastMessage,
        timer;

    const STATUS_ACTIVE = 0;
    const STATUS_SUSPENDED = 1;

    function World() {
        this.name = "Earth"; // TODO: expand possibilities, and make sure the planet doesn't already exist (register with other servers)
        this.players = [];
        this.resources = allResources.list.sort(function(a, b) {
            return a.prominence - b.prominence;
        });
        this.status = STATUS_SUSPENDED;
    }

    function Player(socket) {
        this.explored = 0;
        this.goats = [new Goat()];
        this.resources = {};
        this.socket = socket;
        this.title = "the new kid"; // Maybe each goat should get a title
        this.world = null;
    }

    function Goat() {
        this.gender = utils.randomElement(["M", "F"]);
        this.maxHunger = 0.5 + (Math.random() * 0.5);
        this.hp = 100 * Math.min(this.level, 1);
        this.hunger = this.maxHunger / 2;
        this.level = 0;
        this.name = names.pickName(this.gender);
        this.pickiness = 0.5 + (Math.random() * 0.5);
        this.wanderLust = 0; // For future use
        this.xp = 0;
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
        goat: new Action(
            function(player) {
                var goats = player.goats.length;
                return { "kudzu": Math.floor(1.5 * Math.pow((goats + 2), 2)) + 2 };
            },
            function(player) {
                var cost = (typeof(this.cost) == "function" ? this.cost(player) : this.cost);
                var enoughResources = utils.checkResources(player, cost);

                return enoughResources;
            },
            goat)
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
        if (player) {
            var worldPlayers = player.world.players;
            var playerIndex = worldPlayers.indexOf(player);
            
            if (playerIndex > -1) {
                worldPlayers.splice(playerIndex, 1);
            }
        } else {
            world.players.filter(function(value) {
                return value !== null;
            });
        }
    }

    // Grab a random player (but not the one passed in)
    function randomPlayer(player, targetWorld) {
        targetWorld = targetWorld || player.world || world;

        var playerList = targetWorld.players.slice();
        
        if (player) {
            playerIndex = playerList.indexOf(player);
            playerList.splice(playerIndex, 1);
        }

        return utils.randomElement(playerList);
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

    
    /* Action Handling */
    function eat(goat, resource, amount) {
        goat.hunger -= (resource.nourishment * (amount || 1)) / 100;
        if (goat.hunger <= 0) {
            goat.hunger = 0;
        }
    }

    function goat(player) {
        var newGoat = new Goat();
        var cost = (typeof(actions.goat.cost) == "function" ? actions.goat.cost(player) : actions.goat.cost);
        
        if (utils.removeResources(player, cost)) {
            player.goats.push(newGoat);
            utils.sendMessage(player, "A new goat joins your herd!");
        }
    }
    
    function graze(player, goat) {
//        var resource = utils.randomElement(availableResources(player));
        var resource = utils.weightedRandom(availableResources(player));
        var amount = 1;
        var willEat = (Math.random() <= (((1 - goat.pickiness) + resource.desirability) * 0.65 +
                                         (goat.hunger / goat.maxHunger) * 0.35));
        var resName = resource.name;

        if (willEat) {
            utils.sendMessage(player, goat.name + " munches on some " + resName + " (hunger now " + Math.round((goat.hunger / goat.maxHunger) * 100) + "%).");
            eat(goat, resource, amount);
        } else {
            var invAmount = utils.addResource(player, resource, amount);
            utils.sendMessage(player, goat.name + " returns with some " + resName + ". You now have " + invAmount + " " +
                        (invAmount > 1 ?
                         ((resource.displayName && resource.displayName.plural) || resName) :
                         (resource.displayName && resource.displayName.singular) || resource.name) + ".");
        }

        // For now, grazing will increment the player's explored counter by 1/8 automagically. Make this a chance or something later, probably?
        player.explored += 0.125;
    }

    function attack(player, target) {
        utils.sendMessage(player, "You are attacking the herd of " + target.goats[0].name + " " + target.title + "!");
        utils.sendMessage(target, "You are being attacked by the herd of " + player.goats[0].name + " " + player.title + "!");
        combat.handleRaid(player, target);
    }


    function explore(player) {
    }

    function availableActions(player) {
        var available = [];

        for (var action in actions) {
            if (actions[action].prereq == null ||
                (actions[action].prereq &&
                 actions[action].prereq(player))) {
                available.push(action);
            }
        }

        return available;
    }

    function availableResources(player) {
        var available = [];
        
        player.world.resources.forEach(function(resource) {
            if (player.explored >= resource.minExplored) {
                available.push(resource);
            }
        });

        return available;
    }

    /* Status Messages */
    function goatStatus(player) {
        var status = [];

        player.goats.forEach(function(goat) {
            status.push({ name: goat.name,
                          hunger: goat.hunger / goat.maxHunger });
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
            
            utils.sendJSON(player, status);
        });
    }

    
    return {
        addPlayer: addPlayer,
        initWorld: initWorld
    };
})();

module.exports = kudzu;
