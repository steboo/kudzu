var items = (function() {
    var utils = require('./utilities.js');

    var all = {
        /* (Craftable) Items */
        'hoof spikes': {
            cost: {
                rocks: 5,
                wood: 5
            },
            description: 'Hooves do more damage',
            effect: function(player) {
                // TODO: Something something hooves do more damage when fighting
                return true || player;
            },
            prereq: function(player) {
                utils.hasTech(player, 'Sharpened Hooves');
            }
        },

        knapsack: {
            cost: { knapweed: 50 },
            description: 'Goats can carry food',
            effect: function(player) {
                utils.removeResources(player, this.cost);
                if (!player.items.knapsack) {
                    player.items.knapsack = 0;
                }
                player.items.knapsack += 1;
            },
            prereq: function(player) {
                return utils.hasTech(player, 'Weaving') >= 0;
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
