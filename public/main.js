(function () {
    var ws,
        wsUri = 'ws://localhost:9000/';

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
                $('.output')
                    .append($('<p></p>')
                        .addClass('debug')
                        .text(e.data)
                    ).scrollTop($('.output')[0].scrollHeight);
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
            ws.send('increment');
        });
    }

    function createReconnectButton() {
        var form = $('form.actions').empty();
        var button = $('<button></button>').addClass('reconnect').attr('data-action', 'reconnect').text('Reconnect');
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
