var combat = (function() {
    var utils = require('./utilities.js');

    function collectRolls(numRolls) {
        var results = [];

        for (var i=0; i<numRolls; i++) {
            var roll = rollAD6();
            results.push(roll);
        }

        return results.sort().reverse();
    }

    // TODO: currently you have to attack with all your goats; implement squads/military
    function handleRaid(player, target) {
        // Goats fight
        var outcome = resolveCombat(player.goats.length, target.goats.length);
        reportOutcome(outcome, player, target);

        // Outcome decided
        if (outcome.attackerLosses > 0) {
            killGoats(player, outcome.attackerLosses);
            harvestLeather(target, outcome.attackerLosses);
        }

        if (outcome.defenderLosses > 0) {
            killGoats(target, outcome.defenderLosses);
            harvestLeather(player, outcome.defenderLosses);
        }

        // If attacker is out of attacking troops, attacker gets nada
        // If defender is out of troops, attacker raids defender's stockpile
        if (player.goats.length > 0 &&
            target.goats.length == 0) {
            raidOutcome(player, target);
        }
    }

    function harvestLeather(player, num) {
        utils.sendMessage(player, 'You harvest ' + num + ' skins from your slain foes.');
        utils.addResource(player, { name: 'leather' }, num);
    }

    function killGoats(player, num) {
        for (var i=0; i<num; i++) {
            var goat = Math.floor(Math.random() * player.goats.length);

            player.goats.splice(player.goats[goat], 1);
        }

        if (player.goats.length == 0) {
            loseGame(player);
        }
    }

    function loseGame(player) {
        utils.sendMessage(player, 'You lose!');
        player.socket.close(); // FIXME: bug here: Error caught in socket domain:Error: not opened
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
            
            utils.sendMessage(winner, 'You win! You plundered ' + reward + ' ' + resource + '!');
            utils.sendMessage(loser, 'You were unable to repel the herd of ' + winner.goats[0].name + ', and lost ' + loss + ' ' + resource + '!');
            utils.addResource(winner, { name: resource }, reward);
            utils.removeResource(loser, resource, loss);
        } else {
            utils.sendMessage(winner, 'You win! Unfortunately, ' + loser.goats[0].name + ' didn\'t have anything worth taking!');
            utils.sendMessage(loser, 'You lost! Fortunately for you, you didn\'t have anything worth taking.');
        }
    }

    function reportOutcome(outcome, attacker, defender) {
        utils.sendMessage(attacker, 'You killed ' + outcome.defenderLosses + ' enemy goats and lost ' + outcome.attackerLosses + '.');
        utils.sendMessage(defender, 'You killed ' + outcome.attackerLosses + ' enemy goats and lost ' + outcome.defenderLosses + '.');
    }

    // For now, combat works like Risk
    function resolveCombat(attackers, defenders) {
        var attackerLosses = 0,
            defenderLosses = 0;

        var attackDice = Math.min(3, attackers - 1);
        var defenseDice = Math.min(2, defenders);

        var attackRolls = collectRolls(attackDice);
        var defenseRolls = collectRolls(defenseDice);

        console.log('Attacker\'s rolls:', attackRolls);
        console.log('Defender\'s rolls:', defenseRolls);
        for (var i=0; i<Math.min(attackDice, defenseDice); i++) {
            if (attackRolls[i] > defenseRolls[i]) {
                defenderLosses++;
            } else {
                attackerLosses++;
            }
        }

        return {
            attackerLosses: attackerLosses,
            defenderLosses: defenderLosses
        };
    }

    function rollAD6() {
        return Math.ceil(Math.random() * 6);
    }

    return {
        handleRaid: handleRaid
    };

})();

module.exports = combat;
