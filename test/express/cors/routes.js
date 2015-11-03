'use strict';


function setCookie(req, res) {
    res.cookie('MYSID', 'value', {
        // domain: '.example.com',
        path: '/',
        maxAge: 900000
        // expires: new Date(Date.now() + 900000),
        // secure: true,
        // httpOnly: true
    });
    res.send(200, {statusCode: 200, data: req.cookies});
}

function setCookieRedirect(req, res) {
    res.cookie('MYSID', 'value', {
        // domain: '.example.com',
        path: '/',
        maxAge: 900000
        // expires: new Date(Date.now() + 900000),
        // secure: true,
        // httpOnly: true
    });
    var port = req.socket.localPort || 9002;
    res.location('http://localhost:'+port+'/requestinfo');
    res.send(302);
}

function setup(app) {
    app.get('/cookies', setCookie);
    app.get('/cookies/redirect', setCookieRedirect);
}

module.exports = setup;