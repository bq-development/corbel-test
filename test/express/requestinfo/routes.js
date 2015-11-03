'use strict';

// @todo: get server port
var PORT = 3000;

var redirect = function(req, res) {
    
    var response = {};

    response.query = req.query;
    response.ip = req.ip;
    response.path = req.path;
    response.port = PORT;
    response.host = req.host;
    response.protocol = req.protocol;
    response.subdomains = req.subdomains;
    response.headers = req.headers;
    response.url = req.url;

    response.url = req.protocol + '://' + req.host  + ( response.port === 80 || response.port === 443 ? '' : ':'+ response.port ) + req.path;

    // var url = require('url');
    // response.urlObject = url.parse(response.url);

    // response.url2 = url.format(req);
    
    // var util = require('util'); // core module
    // console.log(util.inspect(req));

    // response.etc = req._parsedUrl.pathname;
    // response.inspect = util.inspect(req);

    res.json(response);

};


function setup(app) {
    app.get('/requestinfo', redirect);
}

module.exports = setup;
