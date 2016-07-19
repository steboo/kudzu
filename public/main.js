(function ($) {
    var ws,
        wsUri = 'ws://' + location.hostname + ':9000/';
    var goats;

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

    function getLastOutput() {
        var $last = $('.output p:last-child');
        return $last;
    }

    function getSelected(className) {
        var selected = $('.' + className + '.selected').text();
        return selected;
    }

    function getSelectedGoat() {
        return getSelected('goat');
    }

    function getSelectedTab() {
        return getSelected('tab');
    }

    // todo: drop jquery
    // todo: prototype
    var goatsFound = false;
    var resourcesFound = false;

    function updateActions(actions, template) {
        var $actions = $('.actions').empty();

        if (Array.isArray(actions)) {
            if (!template ||
                (template.length <= 0)){
                actions.forEach(function(action) {
                    var $action = $('<button></button>')
                            .addClass('action')
                            .attr('data-action', action);
                    $action.text(action).appendTo($actions);
                });
            } else if (template == 'per_goat') {
                if (goats && goats.length > 0) {
                    goats.forEach(function(goat) {
                        var $div = $('<div/>').addClass('goat-actions'),
                            $label = $('<label/>').attr('for', goat.name),
                            $select = $('<select/>').addClass('action')
                                .attr('id', goat.name);

                        actions.forEach(function(action) {
                            var $option = $('<option/>').attr('value', action);

                            if (action == goat.job) {
                                $option.attr('selected', true);
                            }
                            $option.text(action).appendTo($select);
                        });
                        $label.text(goat.name).appendTo($div);
                        $select.appendTo($div);
                        $div.appendTo($actions);
                    });
                }
            }
        }
    }

    function updateEquipment(items) {
        if (goats &&
            goats.length > 0) {
            var $actions = $('.actions').empty();

            var $available = $('<div/>').addClass('items available'),
                $container = $('<div/>'),
                $goats = $('<div/>').addClass('goats');

            goats.forEach(function(goat) {
                var $goat = $('<div/>').addClass('goat')
                        .attr('id', goat.name)
                        .attr('data-inventory', JSON.stringify(goat.items)),
                    $inventory = $('<div/>')
                        .addClass('items')
                        .attr('data-owner', goat.name),
                    $span = $('<span/>').text(goat.name);

                Object.keys(goat.items).forEach(function(item) {
                    for (var i=0; i<goat.items[item]; i++) {
                        var $item = $('<span/>')
                                .addClass('item')
                                .addClass(item.replace(' ', '-'))
                                .attr('draggable', true)
                                .text(item);

                        $item.appendTo($inventory);
                    }
                });

                $span.appendTo($goat);
                $inventory.appendTo($goat);
                $goat.appendTo($goats);
            });

            if (Object.keys(items).length > 0) {
                Object.keys(items).forEach(function(item) {
                    for (var i=0; i<items[item]; i++) {
                        var $item = $('<span/>')
                                .addClass('item')
                                .addClass(item.replace(' ', '-'))
                                .attr('draggable', true)
                                .text(item);

                        $item.text(item).appendTo($available);
                    }
                });
            }

            $goats.appendTo($container);
            $available.appendTo($container);
            $container.appendTo($actions);
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

    function updateStats(goats) {
        var $goatsSection = $('.left > .goats').empty(),
            $goatList;

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

    function updateTabs(tabs) {
        var selected = getSelectedTab();
        var $tabs = $('.tabs');

        for (var tab in tabs) {
            var actions = JSON.stringify(tabs[tab].actions);
            var template = JSON.stringify(tabs[tab].template);
            var oldTab = document.getElementById(tab);

            if (oldTab &&
                (oldTab.getAttribute('data-actions') == actions) &&
                (oldTab.getAttribute('data-template') == template)) {
                continue;
            }

            var $span = $('<span/>');
            var $tab = (oldTab && $(oldTab)) ||
                    $('<button></button>').addClass('tab')
                    .attr('id', tab)
                    .empty();

            $tab.attr('data-actions', actions)
                .attr('data-template', template);


            if ((tab == selected) ||
                !selected) {
                $tab.addClass('selected');
                selected = tab;

                if (tab == 'equipment') {
                    updateEquipment(tabs[tab].actions);
                } else {
                    updateActions(tabs[tab].actions, tabs[tab].template);
                }
            }

            if (!oldTab) {
                $tab.text(tab).appendTo($span);
                $span.appendTo($tabs);

                $tab.on('click', function(e) {
                    var $actions = $('.actions');
                    var allTabs = document.getElementsByClassName('tab');
                    var clickedName = e.target.textContent;

                    for (var i = 0; i < allTabs.length; i++) {
                        var toggleTab = allTabs[i];
                        var tabName = toggleTab.textContent;

                        if (toggleTab == e.target) {
                            toggleTab.classList.add('selected');
                            $actions[0].classList.add(tabName);
                        } else {
                            toggleTab.classList.remove('selected');
                            $actions[0].classList.remove(tabName);
                        }
                    }

                    var actions = JSON.parse(e.target.getAttribute('data-actions'));
                    var template = JSON.parse(e.target.getAttribute('data-template'));

                    if (clickedName == 'equipment') {
                        updateEquipment(actions);
                    } else {
                        updateActions(actions, template);
                    }
                });
            }
        }

/*        if (!getSelectedTab()) { // We don't use selected here because we need to check again
            var $first = $('.tabs > :first-child');
            $first.click();
        }*/ // Doesn't work yet -- currently selects the /last/ tab instead of the first
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
//            logDebug(e);

            try {
                data = JSON.parse(e.data);
            } catch (ex) {
                var $last = getLastOutput(),
                    count = (+$last.attr('data-count') || 1) + 1,
                    lastText = ($last.length > 0 && $last[0].firstChild.textContent || $last.text()),
                    $span = (($last.children('span.counter').length > 0 &&
                              $last.children('span.counter')) ||
                             $('<span/>').addClass('counter'));


                if (lastText == e.data) {
                    $last.attr('data-count', count);
                    $span.text(count).appendTo($last);
                } else {
                    $('.output')
                        .append($('<p></p>').text(e.data))
                        .scrollTop($('.output')[0].scrollHeight);
                }
            }

            if (data) {
                if (data.goats) {
                    goats = data.goats;
                    updateStats(data.goats);
                }

                if (data.resources) {
                    updateResources(data.resources);
                }

                if (data.tabs) {
                    updateTabs(data.tabs);
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
        var dragElement;

        $('form.actions').on('click', 'button.reconnect', function (e) {
            e.preventDefault();
            //resetState();
            wsInit(wsUri);
        });

        $('form.actions').on('click', 'button.action', function (e) {
            var stanza = {
                action: e.target.getAttribute('data-action'),
                tab: getSelectedTab()
            };

            e.preventDefault();
            ws.send(JSON.stringify(stanza));
        });

        $('body').on('dragend', function (e) {
            var item = dragElement || $('.dragging')[0];
            item.classList.remove('dragging');
        });

        $('form.actions').on('dragenter', '.items', function (e) {
            e.dataTransfer || (e.dataTransfer = e.originalEvent.dataTransfer);
            e.dataTransfer.dropEffect = 'move';
            e.preventDefault();
        });

        $('form.actions').on('dragover', '.items', function (e) {
            e.dataTransfer || (e.dataTransfer = e.originalEvent.dataTransfer);
            e.dataTransfer.dropEffect = 'move';
            e.preventDefault();
        });

        $('form.actions').on('dragstart', '.item', function (e) {
            dragElement = e.target;

            e.dataTransfer || (e.dataTransfer = e.originalEvent.dataTransfer);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', e.target);

            e.target.classList.add('dragging');
        });

        $('form.actions').on('drop', '.items', function (e) {
            var item = dragElement;
            var oldParent = item && item.parentNode.getAttribute('data-owner');
            var newParent = e.target.getAttribute('data-owner');
            e.dataTransfer || (e.dataTransfer = e.originalEvent.dataTransfer);

            if (item &&
                (item.parentNode != e.target.parentNode)) {
                var stanza = {
                    action: 'equip',
                    from: oldParent,
                    item: item.textContent,
                    tab: getSelectedTab(),
                    to: newParent
                };

                item.parentNode.removeChild(item);
                e.target.appendChild(item);
                ws.send(JSON.stringify(stanza));
            }
            dragElement = null;
            e.preventDefault();
        });

        $('form.actions').on('change', 'select.action', function (e) {
            var stanza = {
                goat: e.target.id,
                action: e.target.options[e.target.selectedIndex].value,
                tab: getSelectedTab()
            };
            ws.send(JSON.stringify(stanza));
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
})(jQuery);
