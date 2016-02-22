var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var glob = require('glob');

var ports = require('../test/ports.conf.js');

// Set up the express server
var app = express();

// parse application/json
app.use(bodyParser.json());

//Middlewares
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:'+ (ports.KARMA || 3000));
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, ' +
      'Set-Cookie');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

//Routes initializations
app.get('/', function(req, res) {
    res.send('Corbel-js express server');
});

//Corbel opensource services test
var publicRoutes = [
  './emails/random.express.js',
  './emails/imap.express.js',
  './binaries/epubGenerator.express.js',
  './requestinfo/requestinfo.express.js'
];

//Only available for non-opensource resources
var privateRoutes = glob.sync('../test/spec/private/**/*.express.js');

function addToServer(path){
  require(path)(app);
}

_.union(publicRoutes, privateRoutes)
  .forEach(addToServer);

app.listen(process.env.PORT || 3000);
console.log('server started');


module.exports = app;
