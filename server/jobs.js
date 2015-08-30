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

    return {
        all: all,
        prereq: prereq
    };
})();

module.exports = jobs;
