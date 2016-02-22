'use strict';

module.exports = function setup(app) {

    app.get('/requestinfo', function (req, res) {
        var PORT = process.env.PORT || 3000;

        res.json({
            query: req.query,
            ip: req.ip,
            path: req.path,
            port: PORT,
            host: req.hostname,
            protocol: req.protocol,
            subdomains: req.subdomains,
            headers: req.headers,
            url: req.protocol + '://' + req.hostname + ( PORT === 80 || PORT === 443 ? '' : ':' + PORT ) + req.path
        });
    });
};
