var express = require('express');
var request = require('request');

var API_EMAIL_ENDPOINT = 'http://api.guerrillamail.com/ajax.php';
var API_RANDOM_EMAIL_SUFFIX = 'f=get_email_address';
var API_CHECK_EMAIL_SUFFIX = 'f=check_email';
var API_GET_EMAIL_SUFFIX = 'f=fetch_email';
// Set up the express server
var app = express();

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/email/randomemail', function(req, res){
    request(API_EMAIL_ENDPOINT + '?' + API_RANDOM_EMAIL_SUFFIX, function (error, response, body) {
        var cookiesHeader = {};
      if (!error && response.statusCode === 200) {
          response.headers['set-cookie'].map(function(cookieArray){
              cookieArray.split(';').map(function(cookie){
                  var cookieData = cookie.split('=');
                  cookiesHeader[cookieData[0]] = cookieData[1] || '';
              });
          });

          res.send({cookies: cookiesHeader, emailData: JSON.parse(body)});
      }else{
        res.status(500).send(error);
      }
    });
});

app.post('/email/checkemail', function(req, res){
    var credentials = req;
    console.dir(credentials);
    var url = API_EMAIL_ENDPOINT + '?' + API_CHECK_EMAIL_SUFFIX;
    var options = {
          url: url,
          headers: {
              Cookie: 'PHPSESSID=' + credentials + '\r\n'
          }
    };
    
    request(options, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log(body);
        //console.log(response.headers);
        res.send(body);
      }else{
        res.status(500).send(error);
      }
    });
});

app.get('/email/getemail', function(req, res){
    var emailId = req.body;
    var completeUri = API_EMAIL_ENDPOINT + '?' + API_GET_EMAIL_SUFFIX + '&email_id=' + emailId;
    
    request(completeUri, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log(body);
        //console.log(response.headers);
        res.send(body);
      }else{
        res.status(500).send(error);
      }
    });
});

app.listen(process.env.PORT || 3000);
console.log('server started');
