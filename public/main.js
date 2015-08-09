(function () {
    var ws,
        wsUri = 'ws://localhost:9001/';

    function logDebug(message) {
        if ('console' in window) {
            if (typeof console.log == 'function') {
                console.log(message);
            }
        }
    }

    function logWarn(message) {
        if ('console' in window) {
            if (typeof console.warn == 'function') {
                console.warn(message);
            }
            else if (typeof console.log == 'function') {
                console.log(message);
            }
        }
    }

    function logError(message) {
        if ('console' in window) {
            if (typeof console.error == 'function') {
                console.error(message);
            }
            else if (typeof console.log == 'function') {
                console.log(message);
            }
        }
    }

    // todo: drop jquery
    // todo: prototype
    var goatsFound = false;
    var resourcesFound = false;

    function updateStats(goats) {
        var $goatsSection = $('.goats').empty(),
            $goatsList;

        if (Array.isArray(goats) && (goats.length > 0 || goatsFound)) { // down with old browsers
            goatsFound = true;
            $goatList = $('<ul></ul>');
            $('<h3>Goats (' + goats.length + ')</h3>').appendTo($goatsSection);
            goats.forEach(function(goat) {
                var $goat = $('<li></li>');
                $goat.text(goat.name).appendTo($goatList);
            });
            $goatList.appendTo($goatsSection);
        } else {
            $goatList = $('<ul></ul>');
            var goatCount = 0;
            for (var goat in goats) {
                goatCount++;
                var $goat = $('<li></li>');
                var sta = Math.round((1 - Number(goats[goat].hunger))*100)/100.0;
                $goat.text(goat + ' (' + String(sta) + '/1)').appendTo($goatList);
            }

            if (goatCount > 0) {
                goatsFound = true;
            }

            if (goatsFound) {
                $('<h3>Goats (' + goatCount + ')</h3>').appendTo($goatsSection);
                $goatList.appendTo($goatsSection);
            }
        }
    }

    function updateResources(resources) {
        var $resources = $('.resources').empty(),
            $resourceList;

        if (Array.isArray(resources) && (resources.length > 0 || resourcesFound)) { // down with old browsers
            $resourceList = $('<ul></ul>');
            resources.forEach(function(resource) {
                var $resource = $('<li></li>');
                $resource.text(resource.name + ' ' + resource.count).appendTo($resourceList);
            });
            $resourceList.appendTo($resources);
        } else {
            $resourceList = $('<ul></ul>');
            var resCnt = 0;
            for (var resource in resources) {
                resCnt++;
                var $resource = $('<li></li>');
                $resource.text(resource + ' ' + resources[resource]).appendTo($resourceList);
            }

            if (resCnt > 0) {
                resourcesFound = true;
            }

            if (resourcesFound) {
                $('<h3>Resources</h3>').appendTo($resources);
                $resourceList.appendTo($resources);
            }
        }
    }

    function updateActions(actions) {
        var $actions = $('.actions').empty();

        if (Array.isArray(actions)) {
            actions.forEach(function(action) {
                var $action = $('<button></button>').addClass('action').attr('data-action', action);
                $action.text(action).appendTo($actions);
            });
        }
    }

    function wsInit(wsUri) {
        ws = new WebSocket(wsUri);
        ws.onopen = function (e) {
            logDebug(e);
            $('.connection')
                .removeClass('wait')
                .removeClass('offline')
                .addClass('online');
            $('button.reconnect').remove();
        };

        ws.onclose = function (e) {
            var displayMessage = 'The connection to the server was closed.';
            logDebug(e);

            if (e.reason) {
                displayMessage = displayMessage + ' Reason: ' + e.reason;
            }

            $('.output')
                .append(
                    $('<p></p>').text(displayMessage)
                ).scrollTop($('.output')[0].scrollHeight);
            $('.connection')
                .removeClass('wait')
                .removeClass('online')
                .addClass('offline');
            createReconnectButton();
        };

        ws.onmessage = function (e) {
            var data;
            logDebug(e);

            try {
                data = JSON.parse(e.data);
            } catch (ex) {
                $('.output')
                    .append($('<p></p>').text(e.data))
                    .scrollTop($('.output')[0].scrollHeight);
            }

            if (data) {
                if (data.goats) {
                    updateStats(data.goats);
                }

                if (data.resources) {
                    updateResources(data.resources);
                }

                if (data.actions) {
                    updateActions(data.actions);
                }
                /*$('.output')
                    .append($('<p></p>')
                        .addClass('debug')
                        .text(e.data)
                    ).scrollTop($('.output')[0].scrollHeight);*/
            }
        };

        ws.onerror = function (e) {
            logError(e);
        };

        // Close websocket more cleanly when leaving the page
        window.onbeforeunload = function () {
            ws.onclose = function () {};
            ws.close();
        };
    }

    function bind() {
        $('form.actions').on('click', 'button.reconnect', function (e) {
            e.preventDefault();
            resetState();
            wsInit(wsUri);
        });

        $('form.actions').on('click', 'button.action', function (e) {
            e.preventDefault();
            ws.send(e.target.getAttribute('data-action'));
        });
    }

    function createReconnectButton() {
        var form = $('form.actions').empty();
        var button = $('<button></button>').addClass('reconnect').attr('data-action', 'reconnect').text('reconnect');
        form.append(button);
    }

    if (!('WebSocket' in window)) {
        $('.output')
            .append($('<p></p>')
                .addClass('debug')
                .text('Your web browser does not appear to support the features required to support this web application.')
            );
        $('.connection')
            .removeClass('wait')
            .removeClass('online')
            .addClass('offline');
        return;
    }

    wsInit(wsUri);
    bind();
})();
