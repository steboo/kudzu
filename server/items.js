var items = (function() {
    var utils = require('./utilities.js');

    var all = {
        /* (Craftable) Items */
        knapsack: {
            cost: { knapweed: 50 },
            description: "Goats can carry food",
            effect: function(player) {
                utils.removeResources(player, this.cost);
                if (!player.objects.knapsack) {
                    player.objects.knapsack = 0;
                }
                player.objects.knapsack += 1;
            },
            prereq: function(player) {
                return player.techs.indexOf("Weaving") >= 0;
            }
        }
    };

    function prereq(player, item) {
        var enough = utils.checkResources(player, all[item].cost);
        return enough;
    }

    return {
        all: all,
        prereq: prereq
    };
})();

module.exports = items;
