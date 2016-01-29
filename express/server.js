var express = require('express');
var fs = require('fs');
var _ = require('lodash');
var glob = require('glob');

// Set up the express server
var app = express();

//Middlewares
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

//Routes initializations
app.get('/', function(req, res) {
    res.send('Corbel-js express server');
});

//Corbel opensource services test
var publicRoutes = [
  './emails/random.js',
  './emails/imap.js'
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
