var jobs = (function() {
    var all = {
        /* Jobs */
        "Manager": {
        },
        "Number Cruncher": {
        },
        "Soldier": {
        }
    };

    function prereq(player, job) {
        return player.techs.indexOf("Management") >= 0;
    }

    function effect(player, job, goatName) {
        var goat = player.goats.find(function(g) {
            if (g.name == goatName) {
                return g;
            }
        });
        goat.job = job;
    }

    return {
        all: all,
        prereq: prereq
    };
})();

module.exports = jobs;
