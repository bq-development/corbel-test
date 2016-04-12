'use strict';
var notify = require('imap-notify');

module.exports = function setup(app) {
    var mails = [];
    var init = false;

    function getConfig(req) {
        return {
            username: req.query.username,
            password: req.query.password,
            host: req.query.host
        };
    }

    app.get('/imapNotify/init', function(req, res) {
        if (init) {
            res.send({});
            return;
        }
        init = true;

        var config = getConfig(req);
        var options = {
            user: config.username,
            password: config.password,
            host: config.host,
            port: 993,
            tls: true,
            box: 'Inbox'
        };

        var notifier = notify(options);

        notifier.on('error', function(err) {
            console.log('imapNotify account express fail: ' + err);
            init = false;
        });

        notifier.on('mail', function(msg) {
            mails.push(msg);
        });

        notifier.on('success', function() {
            console.log('imapNotify account express connected');
            res.send({});
        });

        notifier.on('close', function() {
            console.log('imapNotify account express closed');
            init = false;
        });
    })

    app.get('/imapNotify/popMails', function(req, res) {
        var offset= req.query.offset || 0;
        res.send(mails.slice(offset));
    })

};
