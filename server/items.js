var items = (function() {
    var utils = require('./utilities.js');

    var all = {
        /* (Craftable) Items */
        knapsack: {
            cost: { knapweed: 50 },
            description: "Goats can carry food",
            effect: function(player) {
                player.objects.knapsack += 1;
            }
        }
    };

    function prereq(player, item) {
        var enough = utils.checkResources(player, item.cost);
        return enough;
    }

    return {
        all: all,
        prereq: prereq
    };
})();

module.exports = items;
