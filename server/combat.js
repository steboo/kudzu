var combat = (function() {
    var utils = require('./utilities.js');

    function handleRaid(player, target) {
        // Goats fight
        // Outcome decided
        if (player.goats.length > target.goats.length) {
            raidOutcome(player, target);
        } else {
            raidOutcome(target, player);
        }
        // Winner wins
        // Loser loses
    }

    function raidOutcome(winner, loser) {
        var loss,
            reward;
        var loserResources = Object.keys(loser.resources);
        var possibleResources = loserResources.filter(function(resource) {
            return loser.resources[resource] > 0;
        });
        var resource = utils.randomElement(possibleResources);

        if (resource) {
            reward = Math.ceil(Math.random() * 0.5 * loser.resources[resource]);
            loss = Math.max(1, Math.floor(reward / 2));
            
            utils.sendMessage(winner, "You win! You plundered " + reward + " " + resource + "!");
            utils.sendMessage(loser, "You were unable to repel the herd of " + winner.goats[0].name + ", and lost " + loss + " " + resource + "!");
            utils.addResource(winner, { name: resource }, reward);
            utils.removeResource(loser, resource, loss);
        } else {
            utils.sendMessage(winner, "You win! Unfortunately, " + loser.goats[0].name + " didn't have anything worth taking!");
            utils.sendMessage(loser, "You lost! Fortunately for you, you didn't have anything worth taking.");
        }
    }

    return {
        handleRaid: handleRaid
    };

})();

module.exports = combat;
