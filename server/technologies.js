var technologies = (function() {
    var all = {
        /* Technologies */
        "Billy Club": {
            // Unused
        },
        "Management": {
            cost: { "knapweed": 100 },
            minSmarts: 25,
            prereq: function() {
                return true;
            }
        },
        "Weaving": {
            minSmarts: 50,
            prereq: function() {
                return true;
            }
        }
    };

    return {
        all: all
    };
})();

module.exports = technologies;
