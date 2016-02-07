var jobs = (function() {
    var basic = require('./basic.js');

    var all = {
        /* Jobs */
        'Idler': {
            effect: function(goat) {
                basic.graze(goat.player, goat); // FIXME: Idlers should eat from the home store first
            },
            frequency: 300,
            maxPerTick: 16 // FIXME: decide on ticks or seconds
        },
        'Manager': {
        },
        'Number Cruncher': {
        },
        'Soldier': {
        }
    };

    function prereq(player, job) {
        return player.techs.indexOf('Management') >= 0;
    }

    function effect(player, job, goatName) {
        var goat = player.goats.find(function(g) {
            if (g.name == goatName) {
                return g;
            }
        });
        goat.job = job;
    }

    function doJobs(player) {
        player.goats.forEach(function(goat) {
            var job = all[goat.job];
            var i = 0;

            if (job &&
                job.effect) {
                do {
                    // FIXME: jobs are currently done 1/tick, regardless of frequency/maxPerTick
                    setTimeout(function() { job.effect(goat); },
                               job.frequency * i);
                    i++;
                } while (job.frequency &&
                         job.frequency > 0 &&
                         (job.frequency * i) < 5000 &&
                         i < job.maxPerTick);
            }
        });
    }

    return {
        all: all,
        doJobs: doJobs,
        effect: effect,
        prereq: prereq
    };
})();

module.exports = jobs;
