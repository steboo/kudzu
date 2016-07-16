var basic = (function() {
    var names = require('./names.js'),
        utils = require('./utilities.js');

    var all = {
        /* Basic Actions */
        cheat: {
            cost: null,
            prereq: null,
            effect: cheat
        },
        graze: {
            cost: null,
            prereq: null,
            effect: function(player) {
                player.goats.forEach(function(goat) {
                    graze(player, goat);
                });

                player.clicks++;
            }
        },
        goat: {
            cost: function(player) {
                var goats = player.goats.length;
                return { 'kudzu': Math.floor(1.5 * Math.pow((goats + 2), 2)) + 2 };
            },
            effect: goat
        }
    };

    function Goat(player) {
        this.items = { saddle: 2 };
        this.gender = utils.randomElement(['M', 'F']);
        this.hp = 100 * Math.min(this.level, 1);
        this.maxHunger = 0.5 + (Math.random() * 0.5);
        this.hunger = this.maxHunger / 2;
        this.level = 0;
        this.name = names.pickName(this.gender);
        this.pickiness = 0.5 + (Math.random() * 0.5);
        this.player = player;
        this.smarts = 0;
        this.wanderLust = 0; // For future use
        this.xp = 0;
    }

    function effect(player, actionName) {
        var action = all[actionName];
        var cost = (typeof(action.cost) == 'function' ? action.cost(player) : action.cost);

        if (utils.removeResources(player, cost)) {
            action.effect && action.effect(player);
        }
    }
    
    function prereq(player, actionName) {
        var action = all[actionName];
        var cost = (typeof(action.cost) == 'function' ? action.cost(player) : action.cost);
        var enoughResources = utils.checkResources(player, cost);
        
        return enoughResources;
    }

    /* Action Handling */
    function cheat(player) {
        player.resources.knapweed = player.resources.knapweed || 0;
        player.resources.knapweed += 1000;
        player.resources.kudzu = player.resources.kudzu || 0;
        player.resources.kudzu += 1000;

        player.goats.forEach(function(goat) {
            goat.smarts += 100;
        });
    }

    function eat(goat, resource, amount) {
        goat.hunger -= (1.3 * resource.nourishment * (amount || 1)) / 100;

        if (goat.hunger <= 0) {
            goat.hunger = 0;
        }
        
        if (resource.onEaten) {
            resource.onEaten(goat);
        }
    }

    function goat(player) {
        var newGoat = new Goat(player);
        
        if (utils.hasTech(player, 'Idleness')) {
            newGoat.job = 'Idler';
        }
        player.goats.push(newGoat);
        utils.sendMessage(player, 'A new goat joins your herd!');
    }
    
    function graze(player, goat) {
        var resource = utils.weightedRandom(utils.availableResources(player));
        var amount = 1;
        var willEat = (Math.random() <= (((1 - goat.pickiness) + resource.desirability) * 0.65 +
                                         (goat.hunger / goat.maxHunger) * 0.35));
        var resName = resource.name;

        if (willEat) {
            utils.sendMessage(player, goat.name + ' munches on some ' + resName + ' (hunger now ' + Math.round((goat.hunger / goat.maxHunger) * 100) + '%).');
            eat(goat, resource, amount);
        } else {
            var invAmount = utils.addResource(player, resource, amount);
            utils.sendMessage(player, goat.name + ' returns with some ' + resName + '. You now have ' + invAmount + ' ' +
                        (invAmount > 1 ?
                         ((resource.displayName && resource.displayName.plural) || resName) :
                         (resource.displayName && resource.displayName.singular) || resource.name) + '.');
        }

        // For now, grazing will increment the player's explored counter by 1/8 automagically. Make this a chance or something later, probably?
        player.explored += 0.125;
    }

    return {
        all: all,
        effect: effect,
        Goat: Goat,
        graze: graze,
        prereq: prereq
    };
})();

module.exports = basic;

