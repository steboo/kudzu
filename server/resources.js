var resources = (function() {
    var utils = require('./utilities.js');
    
    var list = [
        /* Resources */
        {
            name: "bones",
            desirability: 0.05,
            displayName: { singular: "bone",
                           plural: "bones" },
            minExplored: 40,
            nourishment: 0.2,
            prominence: 0.25
        },{
            name: "bunnies",
            desirability: -25,
            displayName: { singular: "baby bunny",
                           plural: "baby bunnies" },
            minExplored: 10,
            nourishment: -25,
            prominence: 0.00001
        },{
            name: "cloth",
            desirability: 0.4,
            displayName: { singular: "scrap of cloth",
                           plural: "scraps of cloth" },
            minExplored: 25,
            nourishment: 0.18,
            prominence: 0.2
        },{
            name: "knapweed",
            desirability: 0.67,
            minExplored: 0,
            nourishment: 0.8,
            prominence: 1
        },{
            name: "kudzu",
            desirability: 0.68,
            minExplored: 0,
            nourishment: 1,
            prominence: 1
        },{
            name: "leather",
            desirability: 0,
            minExplored: 0,
            nourishment: 0,
            prominence: 0 // Does not occur naturally
        },{
            name: "paper",
            desirability: 0.5,
            displayName: { singular: "piece of paper",
                           plural: "pieces of paper" },
            minExplored: 15, // Might need later adjustment
            nourishment: 0.2,
            onEaten: function(goat) {
                var smarts = 1 + Math.floor(Math.random() * 5);
                goat.smarts += smarts;
                utils.sendMessage(goat.player, goat.name + " gains " + smarts + " smarts.");
            },
            prominence: 0.1
        },{
            name: "rocks",
            desirability: 0.02,
            displayName: { singular: "rock",
                           plural: "rocks" },
            minExplored: 15, // Might need later adjustment
            nourishment: 0.01,
            prominence: 0.2
        },{
            name: "rubber",
            desirability: 0.21,
            displayName: { singular: "bit of rubber",
                           plural: "bits of rubber" },
            minExplored: 50, // Might need later adjustment
            nourishment: 0.1,
            prominence: 0.1
        },{
            name: "tin",
            desirability: 0.3,
            displayName: { singular: "tin can",
                           plural: "tin cans" },
            minExplored: 30, // Might need later adjustment
            nourishment: 0.01,
            prominence: 0.1
        },{
            name: "wood",
            desirability: 0.45,
            displayName: { singular: "piece of wood",
                           plural: "pieces of wood" },
            minExplored: 5, // Might need later adjustment
            nourishment: 0.2,
            prominence: 0.28
        }
    ];

    return {
        list: list
    };
})();

module.exports = resources;
