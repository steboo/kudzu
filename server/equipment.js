var items = (function() {
    var items = require('./items.js');
    var utils = require('./utilities.js');

    var all = {
        equip: {
        },
        destroy: {
        }
    };

    function prereq(player, action) {
        // Currently no prereqs for equipping a goat with something; later, could be weight or free slots
//        console.log('player.items:', player.items);
        return Object.keys(player.items).length > 0;
        //return player.items[item] && player.items[item] > 0;
    }

    function effect(player, action, unused, args) {
        var item = args.item;

        if (action == 'equip') {
            var from = args.from,
                to = args.to,
                fromGoat = from && utils.findGoat(player, from),
                toGoat = to && utils.findGoat(player, to);

            if (!from &&
                toGoat) {
                transferItem(item, player, toGoat);
            } else if (!to &&
                       fromGoat) {
                transferItem(item, fromGoat, player);
            } else if (toGoat && fromGoat) {
                transferItem(item, fromGoat, toGoat);
            }
        }
    }

    function transferItem(item, from, to) {
        if (from.items[item] > 0) {
            from.items[item] -= 1;
            to.items[item] || (to.items[item] = 0);
            to.items[item] += 1;
        }
    }

    return {
        all: all,
        effect: effect,
        prereq: prereq
    };
})();

module.exports = items;
