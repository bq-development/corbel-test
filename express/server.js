var express = require('express');
var request = require('request');
var fs = require('fs');
var _ = require('lodash');
var glob = require('glob');

var ports = require('../test/ports.conf.js');

// Set up the express server
var app = express();

//Middlewares
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:'+ (ports.KARMA || 3000));
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

//Routes initializations
app.get('/', function(req, res) {
    res.send('Corbel-js express server');
});

//Corbel opensource services test
var publicRoutes = [
  './emails/random.js',
  './emails/imap.js',
  './requestinfo/requestinfo.js'
];

//Only available for non-opensource resources
var privateRoutes = glob.sync('../test/spec/private/express/**/*.js');

function addToServer(path){
  require(path)(app);
}

_.union(publicRoutes, privateRoutes)
  .filter(fs.existsSync)
  .forEach(addToServer);


app.listen(process.env.PORT || 3000);
console.log('server started');


module.exports = app;
