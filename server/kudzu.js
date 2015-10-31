var kudzu = (function() {
    var allResources = require('./resources.js');
    var basic = require('./basic.js');
    var combat = require('./combat.js');
    var equipment = require('./equipment.js');
    var items = require('./items.js');
    var jobs = require('./jobs.js');
    var socketServer = require('./socketServer');
    var tech = require('./technologies.js');
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
        this.clicks = 0;
        this.explored = 0;
        this.goats = [new basic.Goat(this)];
        this.items = {};
        this.resources = {};
        this.socket = socket;
        this.techs = [];
        this.title = "the new kid"; // Maybe each goat should get a title
        this.world = null;
    }

    /* Tabs */
    var tabs = {
        basic: { actions: basic.all, effect: basic.effect, prereq: basic.prereq },
        crafting: { actions: items.all, prereq: items.prereq },
        equipment: { actions: equipment.all, effect: equipment.effect, prereq: equipment.prereq, template: "per_goat" },
        exploration: { actions: { "attack": {} } },
        management: { actions: jobs.all, effect: jobs.effect, prereq: jobs.prereq, template: "per_goat" }, // FIXME
        research: { actions: tech.all, effect: tech.effect, prereq: tech.prereq }
//        upgrades: { actions: null, effect: null, prereq: null, template: ["per_goat"] }
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
                    var action,
                        command,
                        goat;
                    var player = getPlayerBySocket(socket);

                    try { 
                        command = JSON.parse(data);
                        action = command.action;
                        goat = command.goat;
                    } catch(e) {
                        utils.sendMessage(player, "Invalid input!");
                        return;
                    }

                    if (command.tab &&
                        action &&
                        tabs[command.tab] &&
                        (tabs[command.tab].actions[action].prereq ? tabs[command.tab].actions[action].prereq(player, goat) : true)) {
                        if (tabs[command.tab].effect) {
                            tabs[command.tab].effect(player, action, goat, command);
                        } else {
                            tabs[command.tab].actions[action].effect(player, goat, command);
                        }
                    } else if (data == "attack") {
                        var target = randomPlayer(player);
                        attack(player, target);
                    }

                    sendStatus(player);
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

        if (player) {
            var playerList = targetWorld.players.filter(function(p) {
                return p != player;
            });
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
    function tick() { // FIXME: operate on events instead of single-function model?
        if (world.status == STATUS_ACTIVE) {
            console.log("Tick!");
            broadcastMessage("Tick!");
            getHungry(world.players);
            world.players.forEach(jobs.doJobs);
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

    
    function attack(player, target) {
        utils.sendMessage(player, "You are attacking the herd of " + target.goats[0].name + " " + target.title + "!");
        utils.sendMessage(target, "You are being attacked by the herd of " + player.goats[0].name + " " + player.title + "!");
        combat.handleRaid(player, target);
    }


    function explore(player) {
    }

    function availableActions(player, actions, pred) {
        var available = [];

        for (var action in actions) {
            if ((pred == null || pred(player, action)) &&
                (actions[action].prereq == null || (actions[action].prereq(player)))) {
                available.push(action);
            }
        }

        return available;
    }

    /* Status Messages */
    function goatStatus(player) {
        var status = [];

        player.goats.forEach(function(goat) {
            status.push({ name: goat.name,
                          hunger: goat.hunger / goat.maxHunger,
                          items: goat.items,
                          job: goat.job,
                          smarts: goat.smarts
                        });
        });

        return status;
    }

    function playerStatus(player) {
        var status = {};

        status.goats = goatStatus(player);
        status.items = player.items;
        status.resources = player.resources;
        status.technologies = player.techs;
        status.tabs = tabStatus(player);

        return status;
    }

    function tabStatus(player) {
        var available = {};
        
        for (var tab in tabs) {
            var actions = availableActions(player, tabs[tab].actions, tabs[tab].prereq);

            if (actions &&
                actions.length > 0) {
                if (tab == "equipment") {
                    actions = player.items;
                }

                available[tab] = { actions: actions };

                if (tabs[tab].template) {
                    available[tab].template = tabs[tab].template;
                }
            }
        }

        return available;
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
