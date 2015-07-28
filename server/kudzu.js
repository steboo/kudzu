var kudzu = (function() {
    var socketServer = require('./socketServer');

    const STATUS_ACTIVE = 0;
    const STATUS_SUSPENDED = 1;

    function World() {
	this.name = "Earth"; // TODO: expand possibilities, and make sure the planet doesn't already exist (register with other servers)
	this.status = STATUS_ACTIVE;
    }

    function Player() {
	this.goats = [new Goat()];
    }

    function Goat() {
	this.gender = (Math.random() > 0.5 ? "F" : "M");
	this.maxHunger = 50 + (Math.random() * 50);
	this.name = (this.gender == "M" ? "Billy" : "Nanny"); // TODO: expand possibilities
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

    // We need to be able to start the world, though perhaps it should pause when no one's online.
    function initWorld(port) {
	socketServer.init(port);
	if (world) {
	    activateWorld();
	} else {
	    world = new World(); // TODO: should support saving/loading world
	}
    }

    function activateWorld() {
	world.status = STATUS_ACTIVE;
    }

    function suspendWorld() {
	world.status = STATUS_SUSPENDED;
    }

    // We need to be able to add players to the world
    function addPlayer(world) {
	var player = new Player();
	world.players.push(player);

	return player;
    }

    return {
	addPlayer: addPlayer,
	initWorld: initWorld
    };
})();

module.exports = kudzu;
