'use strict';

var requestProtocol = {
    'http:': require('http'),
    'https:': require('https')
};
var url = require('url');

function getConfig(req) {
    return {
        url: req.query.url,
        etag: req.query.etag,
        token: req.query.token,
        accept: req.query.accept
    };
}

function checkRequiredParameters(config) {
    if (!config.url) {
        throw new Error('url is not defined');
    }
}

function httpRequest(req, res) {
    
    var config = getConfig(req);
    checkRequiredParameters(config);

    var parsedUrl = url.parse(config.url);

    var options = {
        host: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.8,es;q=0.6',
            'Host': parsedUrl.host
        }
    };

    if (config.etag) {
        options.headers['If-None-Match'] = config.etag;
    }

    if (config.accept) {
        options.headers['Accept'] = config.accept;
    }

    if (config.token) {
        options.headers['Authorization'] = 'Bearer ' + config.token
    }

    var callback = function(response) {
        var data = '';
        response.on('data', function(chunk) {
            data += chunk;
        });
        response.on('error', function(error) {
            res.send(error);
        });
        response.on('end', function() {
            res.send({
                'headers': response.headers,
                'statusCode': response.statusCode,
                'data': data
            });
        });
    };
    requestProtocol[parsedUrl.protocol || 'http:']
        .request(options, callback)
        .on('error', function(error) {
            res.send(error);
        })
        .end();
}

function setup(app) {
    app.get('/httpRequest', httpRequest);
}

module.exports = setup;
