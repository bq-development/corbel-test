var request = require('request');

module.exports = function setup(app) {

    app.get('/maildrop/checkemail', function(req, res) {
        var options = {
            url: 'http://maildrop.cc/api/inbox/' + req.query.user
        };
        request(options, function(error, response, body) {
            var cookiesHeader = {};
            if (!error && response.statusCode === 200) {
                res.send(JSON.parse(body));
            } else {
                console.log('error');
                res.status(500).send(error);
            }
        });
    });

    app.get('/maildrop/getemail', function(req, res) {
        var options = {
            url: 'http://maildrop.cc/api/inbox/' + req.query.user + '/' + req.query.emailId
        };

        request(options, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                res.send(JSON.parse(body));
            } else {
                res.status(500).send(error);
            }
        });
    });

    app.get('/maildrop/delemail', function(req, res) {
        var options = {
            method: 'DELETE',
            url: 'http://maildrop.cc/api/inbox/' + req.query.user + '/' + req.query.emailId
        };

        request(options, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                res.send(JSON.parse(body));
            } else {
                res.status(500).send(error);
            }
        });
    });

};
