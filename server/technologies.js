var technologies = (function() {
    var utils = require('./utilities.js');

    var allTechs = {
        /* Technologies */
        "Billy Club": {
            // Unused
        },

        "Management": {
            cost: { "knapweed": 25 },
            minSmarts: 10
        },

        "Sharpened Hooves": {
            minSmarts: 25,
            prereq: function(player) {
                var resources = { rocks: 15 };
                return utils.checkResources(player, resources);
            }
        },

        "Weaving": {
            minSmarts: 5
        }
    };

    function effect(player, techName) {
        var tech = allTechs[techName];

        utils.removeResources(player, tech.cost);
        player.techs.push(techName); // FIXME
    }

    function prereq(player, techName) {
        var goat = player.goats.reduce(function(goat1, goat2) {
            return (goat1.smarts > goat2.smarts ? goat1 : goat2);
        });
        var tech = allTechs[techName];

        if ((player.techs.indexOf(techName) < 0) &&
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
        prereq: prereq
    };
})();

module.exports = technologies;
