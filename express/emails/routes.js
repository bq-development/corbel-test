var request = require('request');

module.exports = function setup(app) {

    var API_EMAIL_ENDPOINT = 'http://api.guerrillamail.com/ajax.php';
    var API_RANDOM_EMAIL_SUFFIX = 'f=get_email_address';
    var API_SET_EMAIL_SUFFIX = 'f=set_email_user';
    var API_CHECK_EMAIL_SUFFIX = 'f=check_email&seq=1';
    var API_GET_EMAIL_SUFFIX = 'f=fetch_email';

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

    app.get('/email/setemail', function(req, res){
        var credentials = req.query.token;
        var userEmail = req.query.userEmail;
        var url = API_EMAIL_ENDPOINT + '?' + API_SET_EMAIL_SUFFIX + '&email_user=' + userEmail;
        var options = {
              url: url,
              headers: {
                  Cookie: 'PHPSESSID=' + credentials
              }
        };
        
        request(options, function (error, response, body) {
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

    app.get('/email/checkemail', function(req, res){
        var credentials = req.query.token;
        var url = API_EMAIL_ENDPOINT + '?' + API_CHECK_EMAIL_SUFFIX;
        var options = {
              url: url,
              headers: {
                  Cookie: 'PHPSESSID=' + credentials
              }
        };
        
        request(options, function (error, response, body) {
            var cookiesHeader = {};
            if (!error && response.statusCode === 200) {
                response.headers['set-cookie'].map(function(cookieArray){
                    cookieArray.split(';').map(function(cookie){
                        var cookieData = cookie.split('=');
                        cookiesHeader[cookieData[0]] = cookieData[1] || '';
                    });
                });

                res.send({cookies: cookiesHeader, emailList: JSON.parse(body)});
            }else{
                console.log('error');
                res.status(500).send(error);
            }
        });
    });

    app.get('/email/getemail', function(req, res){
        var credentials = req.query.token;
        var emailId = req.query.emailId;
        var url = API_EMAIL_ENDPOINT + '?' + API_GET_EMAIL_SUFFIX + '&email_id=' + emailId;
        var options = {
              url: url,
              headers: {
                  Cookie: 'PHPSESSID=' + credentials
              }
        };
        
        request(options, function (error, response, body) {
          if (!error && response.statusCode === 200) {
            res.send(JSON.parse(body));
          }else{
            res.status(500).send(error);
          }
        });
    });
};
