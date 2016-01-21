var express = require('express');
var bodyParser = require('body-parser');

// Set up the express server
var app = express();

// parse application/json
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', function(req, res) {
    res.send('Corbel-js express server');
});

app.listen(process.env.PORT || 3000);
console.log('server started');

[
  './emails/random.js',
  './emails/imap.js',
  './binaries/epubGenerator.js',
  './cryptography/crypto.js'
].forEach(function(routePath){
    require(routePath)(app);
});

module.exports = app;
