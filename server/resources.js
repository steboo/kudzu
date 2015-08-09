var resources = (function() {
    var list = [
        /* Resources */
        {
            name: "knapweed",
            desirability: 0.67,
            minExplored: 0,
            displayName: "knapweed",
            nourishment: 0.8,
            prominence: 0.8
        },{
            name: "kudzu",
            desirability: 0.68,
            minExplored: 0,
            displayName: "kudzu",
            nourishment: 1,
            prominence: 0.8
        },{
            name: "rocks",
            desirability: 0.02,
            minExplored: 15, // Might need later adjustment
            displayName: { singular: "rock",
                           plural: "rocks" },
            nourishment: 0.01,
            prominence: 0.35
        },{
            name: "rubber",
            desirability: 0.21,
            minExplored: 50, // Might need later adjustment
            displayName: { singular: "bit of rubber",
                           plural: "bits of rubber" },
            nourishment: 0.1,
            prominence: 0.15
        },{
            name: "tin",
            desirability: 0.3,
            minExplored: 30, // Might need later adjustment
            displayName: { singular: "tin can",
                           plural: "tin cans" },
            nourishment: 0.01,
            prominence: 0.1
        },{
            name: "wood",
            desirability: 0.45,
            minExplored: 5, // Might need later adjustment
            displayName: { singular: "piece of wood",
                           plural: "pieces of wood" },
            nourishment: 0.2,
            prominence: 0.4
        }
    ];

    return {
        list: list
    };
})();

module.exports = resources;
