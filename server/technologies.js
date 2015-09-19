var technologies = (function() {
    var utils = require('./utilities.js');

    var allTechs = {
        /* Technologies */
        "Billy Club": {
            // Unused
        },

        "Idleness": {
            cost: { "knapweed": 5,
                    "kudzu": 5 },
            effect: function(player) {
                player.goats.forEach(function(goat) {
                    goat.job = "Idler";
                });
            },
            minSmarts: 0
        },

        "Management": {
            cost: { "knapweed": 25 },
            minSmarts: 10,
            prereq: function(player) {
                return hasTech(player, "Idleness");
            }
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
