var technologies = (function() {
    var utils = require('./utilities.js');

    var allTechs = {
        /* Technologies */
        'Billy Club': {
            minSmarts: 50
        }, // TODO: need cost, effects

        'Craftsgoatship': {
            cost: {
                knapweed: 10,
                kudzu: 10
            },
            minSmarts: 5,
            prereq: function(player) {
                return hasTech(player, 'Idleness');
            }
        }, // TODO: need cost, minsmarts

        'Crime': {
            cost: {},
            minSmarts: 15,
            prereq: function(player) {
                return !hasTech(player, 'Billy Club');
            }
        }, // TODO: no effect yet

        'Currency': {
            cost: {},
            minSmarts: 100,
            prereq: function(player) {
                return hasTech(player, 'Mathematics');
            }
        }, // TODO: no effect yet

        'Friendship': {
            prereq: function(player) {
                return hasTech(player, 'Love');
            }
        }, // TODO: no effect yet

        'Idleness': {
            cost: {
                'knapweed': 5,
                'kudzu': 5
            },
            effect: function(player) {
                player.goats.forEach(function(goat) {
                    goat.job = 'Idler';
                });
            },
            minSmarts: 0
        },

        'Love': {
            cost: {},
            minSmarts: 85
        }, // TODO: no effect yet

        'Management': {
            cost: { 'knapweed': 25 },
            minSmarts: 10,
            prereq: function(player) {
                return hasTech(player, 'Idleness');
            }
        },

        'Mathematics': {
            cost: {
                'knapweed': 200,
                'kudzu': 200
            },
            minSmarts: 15
        }, // TODO: no effect yet

        'Peace': {
            prereq: function(player) {
                return hasTech(player, 'War') &&
                       hasTech(player, 'Friendship');
            }
        }, // TODO: no effect yet

        'Prejudice': {
            cost: {},
            minSmarts: 150,
            prereq: function(player) {
                return hasTech(player, 'Pride');
            }
        }, // TODO: no effect yet

        'Pride': {
        }, // TODO: no effect yet

        'Punishment': {
            cost: {},
            minSmarts: 25,
            prereq: function(player) {
                return hasTech(player, 'Crime');
            }
        }, // TODO: no effect yet

        'Literacy': {
            minSmarts: 175
        }, // TODO: no effect yet

        'Sense': {
            cost: {},
            minSmarts: 125
        }, // TODO: no effect yet

        'Sensibility': {
            cost: {},
            minSmarts: 130,
            prereq: function(player) {
                return hasTech(player, 'Sense');
            }
        }, // TODO: no effect yet

        'Sharpened Hooves': {
            minSmarts: 25,
            prereq: function(player) {
                var resources = { rocks: 15 };
                return hasTech(player, 'Weaponry') &&
                       utils.checkResources(player, resources);
            }
        },

        'Tools': {
            cost: {},
            minSmarts: 20,
            prereq: function(player) {
                return hasTech(player, 'Woodworking');
            }
        }, // TODO: no effect yet

        'Trade': {
            cost: {},
            minSmarts: 25,
            prereq: function(player) {
                return hasTech(player, 'Mathematics');
            }
        }, // TODO: no effect yet

        'War': {
            cost: {},
            minSmarts: 15,
            prereq: function(player) {
                // Player must have discovered at least one neighbor
                return true;
            }
        }, // TODO: no effect yet

        'Weaponry': {
            cost: {},
            minSmarts: 25,
            prereq: function(player) {
                return hasTech(player, 'Tools') &&
                       hasTech(player, 'War');
            }
        }, // TODO: no effect yet

        'Weaving': {
            minSmarts: 5,
            prereq: function(player) {
                return hasTech(player, 'Craftsgoatship');
            }
        },

        'Woodworking': {
            cost: {},
            minSmarts: 18,
            prereq: function(player) {
                return hasTech(player, 'Craftsgoatship');
            }
        } // TODO: no effect yet
    };

    function effect(player, techName) {
        var tech = allTechs[techName];

        utils.removeResources(player, tech.cost);
        player.techs.push(techName); // FIXME
        tech.effect && tech.effect(player);
    }

    function hasTech(player, techName) {
        return player.techs.indexOf(techName) >= 0;
    }

    function prereq(player, techName) {
        var goat = player.goats.reduce(function(goat1, goat2) {
            return (goat1.smarts > goat2.smarts ? goat1 : goat2);
        });
        var tech = allTechs[techName];

        if (!hasTech(player, techName) &&
            utils.checkResources(player, tech.cost) &&
            goat.smarts >= tech.minSmarts &&
            (tech.prereq == null ||
             allTechs[techName].prereq(player))) {
            return true;
        } else {
            return false;
        }
    }

    return {
        all: allTechs,
        effect: effect,
        hasTech: hasTech,
        prereq: prereq
    };
})();

module.exports = technologies;
