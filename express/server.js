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

//Find all express file routes, public and private
var routes = glob.sync('**/*.express.js');

var publicRegex = '^express(.?)+';
var privateRegex = '^test(.?)+';

routes = routes.map(function(route) {
  if(route.match(publicRegex)) {
    console.log('Public express route found ' + route);
    route = route.replace(/^express/, '.')

    return route;
  } else if(route.match(privateRegex)) {
    console.log('Private express route found ' + route);
    return '../' + route;
  }
});

function addToServer(path){
  console.log(path + ' added to express.');
  require(path)(app);
}

routes.forEach(addToServer);

app.listen(process.env.PORT || 3000);
console.log('server started');


module.exports = app;
