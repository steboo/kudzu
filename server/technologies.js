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
            prereq: {
                tech: ['Idleness']
            }
        }, // TODO: need cost, minsmarts

        'Crime': {
            cost: {},
            minSmarts: 15,
            prereq: {
                tech: function(player) {
                    return !utils.hasTech(player, 'Billy Club');
                }
            }
        }, // TODO: no effect yet

        'Currency': {
            cost: {},
            minSmarts: 100,
            prereq: {
                tech: ['Mathematics']
            }
        }, // TODO: no effect yet

        'Friendship': {
            prereq: {
                tech: ['Love']
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
            prereq: {
                tech: ['Idleness']
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
            prereq: {
                tech: ['War', 'Friendship']
            }
        }, // TODO: no effect yet

        'Prejudice': {
            cost: {},
            minSmarts: 150,
            prereq: {
                tech: ['Pride']
            }
        }, // TODO: no effect yet

        'Pride': {
        }, // TODO: no effect yet

        'Punishment': {
            cost: {},
            minSmarts: 25,
            prereq: {
                tech: ['Crime']
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
            prereq: {
                tech: ['Sense']
            }
        }, // TODO: no effect yet

        'Sharpened Hooves': {
            cost: { rocks: 25 },
            minSmarts: 25,
            prereq: {
                resources: { rocks: 15 },
                tech: ['Weaponry']
            }
        },

        'Tools': {
            cost: {},
            minSmarts: 20,
            prereq: {
                tech: ['Woodgnawing']
            }
        }, // TODO: no effect yet

        'Trade': {
            cost: {},
            minSmarts: 25,
            prereq: {
                tech: ['Mathematics']
            }
        }, // TODO: no effect yet

        'War': {
            cost: {},
            minSmarts: 15,
            prereq: {
                // Player must have discovered at least one neighbor
            }
        }, // TODO: no effect yet

        'Weaponry': {
            cost: {},
            minSmarts: 25,
            prereq: {
                tech: ['Tools', 'War']
            }
        }, // TODO: no effect yet

        'Weaving': {
            minSmarts: 5,
            prereq: {
                tech: ['Craftsgoatship']
            }
        },

        'Woodgnawing': {
            cost: {},
            minSmarts: 18,
            prereq: {
                tech: ['Craftsgoatship']
            }
        } // TODO: no effect yet
    };

    function prereqMet(player, prereqs) {
        function checkTech(prereq) {
            var type = typeof prereq;

            if (type == 'String') {
                return utils.hasTech(player, prereq);
            } else if (prereq.map) {
                return prereq.every(function(item) {
                    return checkTech(item);
                });
            } else if (type == 'Function') {
                return type(player);
            }
        }

        var prereqFns = {
            resources: function(pr) {
                return utils.checkResources(player, pr);
            },
            tech: checkTech
        };

        var types = Object.keys(prereqs || {});

        var result = (types.length == 0) ||
            types.every(function(type) {
                if (!prereqFns[type]) {
                    console.error('No prereq function for prereq type ' + type);
                    return false;
                }

                return prereqFns[type](prereqs[type]);
            });

        return result;
    }

    function effect(player, techName) {
        var tech = allTechs[techName];

        utils.removeResources(player, tech.cost);
        player.techs.push(techName); // FIXME
        tech.effect && tech.effect(player);
    }

    function prereq(player, techName) {
        var goat = player.goats.reduce(function(goat1, goat2) {
            return (goat1.smarts > goat2.smarts ? goat1 : goat2);
        });

        var tech = allTechs[techName];

        if (!utils.hasTech(player, techName) &&
            utils.checkResources(player, tech.cost) &&
            goat.smarts >= tech.minSmarts &&
            prereqMet(player, tech.prereq)) {
            return true;
        } else {
            return false;
        }
    }

    return {
        all: allTechs,
        effect: effect,
        prereq: prereq
    };
})();

module.exports = technologies;
