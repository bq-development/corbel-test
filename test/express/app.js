/* jshint sub:true */
'use strict';

var express = require('express'),
    cookieParser = require('cookie-parser'),
    cors = require('cors'),
    _ = require('underscore'),
    app = express(),
    fs = require('fs'),
    morgan = require('morgan');

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream('express.log', {flags: 'a'});
// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

app.use(express.bodyParser());
app.use(cookieParser());


app.use(cors({
    origin: function(origin, callback) {
        callback(null, true);
    },
    credentials: true
}));

app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

app.use(app.router);

app.use(function(err, req, res, next) {
    if (!err || _.isEmpty(err)) {
        return next();
    }
    console.log('[!!] express ', err);
    res.send(400, {
        error: err
    });
});

app.get('/', function(req, res) {
    res.send('Hello world');
});

[
    './cors/routes',
    './defecator/routes',
    './ec/routes',
    './emails/routes',
    './facebook/routes',
    './httpRequest/routes',
    './localStorage/routes',
    './lang/routes',
    './requestinfo/routes',
    './ingestionBinaries/routes'
].forEach(function(routePath) {
    require(routePath)(app);
});

module.exports = app;
