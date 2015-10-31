var utilities = (function() {
    /* Resource Handling */
    function addResource(player, resource, amount) {
        var name = resource.name;

        if (!player.resources[name]) {
            player.resources[name] = 0;
        }
        player.resources[name] += amount;
        
        return player.resources[name];
    }

    function availableResources(player) {
        var available = [];

        player.world.resources.forEach(function(resource) {
            if (player.explored >= resource.minExplored) {
                available.push(resource);
            }
        });

        return available;
    }

    function checkResources(player, resources) {
        var enough = true;

        for (var name in resources) {
            var amount = resources[name];

            if (!player.resources[name] || player.resources[name] < amount) {
                enough = false;
                break;
            }
        }

        return enough;

    }

    function removeResource(player, resource, amount) {
        if (!player.resources[resource]) {
            return false;
        } else {
            return player.resources[resource] -= amount;
        }
    }

    function removeResources(player, resources) {
        if (checkResources(player, resources)) {
            for (var name in resources) {
                var amount = resources[name];
                
                player.resources[name] && (player.resources[name] -= amount);
            }        
            return true;
        }
        return false;
    }


    /* Misc */
    function findGoat(player, goatName) {
        var goat = player.goats.find(function(g) {
            if (g.name == goatName) {
                return g;
            }
        });

        return goat;
    }

    /* User Output */
    // Send a message to a player
    function sendMessage(player, msg) {
        var socket = player.socket;

        socket.send(msg);
    }

    function sendJSON(player, object) {
        var JSONified = JSON.stringify(object);

        sendMessage(player, JSONified);
    }


    /* General Utilities */
    function weightedRandom(resources) {
        var cumulativeWeight = 0,
            random,
            total = 0;

        resources.forEach(function(resource) {
            total += resource.prominence;
        });

        random = Math.random() * total;

        for (var i=0; i<resources.length; i++) {
            cumulativeWeight += resources[i].prominence;
            if (random < cumulativeWeight) {
                return resources[i];
            }
        }
    }

    function randomElement(array) {
        var index = Math.floor(Math.random() * array.length);
        return array[index];
    }

    if (!Array.prototype.find) {
        Array.prototype.find = function(predicate) {
            if (this === null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;
            
            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return value;
                }
            }
            return undefined;
        };
    }

    return {
        addResource: addResource,
        availableResources: availableResources,
        checkResources: checkResources,
        findGoat: findGoat,
        removeResource: removeResource,
        removeResources: removeResources,
        randomElement: randomElement,
        sendJSON: sendJSON,
        sendMessage: sendMessage,
        weightedRandom: weightedRandom
    };
})();

module.exports = utilities;
