var express = require('express');
var request = require('request');
var ports = require('../test/ports.conf.js');

var API_EMAIL_ENDPOINT = 'http://api.guerrillamail.com/ajax.php';
var API_RANDOM_EMAIL_SUFFIX = 'f=get_email_address';
var API_SET_EMAIL_SUFFIX = 'f=set_email_user';
var API_CHECK_EMAIL_SUFFIX = 'f=check_email&seq=1';
var API_GET_EMAIL_SUFFIX = 'f=fetch_email';
// Set up the express server
var app = express();

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:'+ (ports.KARMA || 3000));
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
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
  './requestinfo/requestinfo.js'
].forEach(function(routePath){
    require(routePath)(app);
});

module.exports = app;
