'use strict';
var Imap = require('imap');

function getConfig(req) {
    return {
        username: req.query.username,
        password: req.query.password,
        host: req.query.host,
        emailsToRead: req.query.emailsToRead || 5
    };
}

function checkRequiredParameters(config) {
    if (!config.username || !config.password) {
        throw new Error('username or password is not defined');
    }

    if (!config.host) {
        throw new Error('host is not defined');
    }
}

function configureImap(config) {
    return new Imap({
        user: config.username,
        password: config.password,
        host: config.host,
        port: 993,
        tls: true,
        tlsOptions: {rejectUnauthorized: false},
        connTimeout: 25000
    });
}

function openBox(imap, name, cb) {
    imap.openBox(name, true, cb);
}

function readEmailBox(imap, config, res, err, box) {
    var searchFilter = ['ALL'];
    var emailsToRead = config.emailsToRead;
    var emails = [];

    if (err) { throw new Error(err); }

    imap.search(searchFilter, function(err, results) {
        if (err) { throw new Error(err); }

        if (results.length > 0) {
            emailsToRead = Math.min(emailsToRead, results.length);
            var lastMail = results.length + 1;
            var firstMail = results.length - emailsToRead + 1;
            var fetch = imap.seq.fetch(firstMail + ':' + lastMail, {
                bodies: '',
                markSeen: false
            });

            fetch.on('message', function(msg) {
                var MailParser = require('mailparser').MailParser;
                var parser = new MailParser();
                parser.on('end', function(mail) {
                    emails.push({
                        from: mail.headers.from || 'default',
                        to: mail.headers.to || 'default',
                        subject: mail.headers.subject || 'default',
                        text: mail.html || mail.text || 'default',
                        date: mail.headers.date || 'default'});

                    if (--emailsToRead === 0) {
                        res.send(emails);
                    }
                });
                msg.on('body', function(stream) { stream.pipe(parser); });
            });

            fetch.once('end', function() {imap.end();});            
            fetch.once('error', function(err) { console.log(err);});
        } else {
            res.send([]);
        }
    });
}

function getLastEmails(req, res) {
    var config = getConfig(req);
    checkRequiredParameters(config);
    var imap = configureImap(config);

    imap.once('ready', function() {
        openBox(imap, 'INBOX', readEmailBox.bind(this, imap, config, res));
    });
    imap.once('error', function(err) {
        console.log('IMAP error: ',err); res.status(500).send(err); });
    imap.once('end', function(val, err) { 
        console.dir(val);
        console.dir(err);
        console.log('Imap connection ended'); });
    imap.connect();
}

function setup(app) {
    app.disable('etag');
    app.get('/imap/lastemails', getLastEmails);
}

module.exports = setup;
