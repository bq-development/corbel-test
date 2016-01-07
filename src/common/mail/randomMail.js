//@exclude
'use strict';
/*globals corbel */
//@endexclude

/* The response of this method is an object with a random email data and cookies
* with the session token
*/
function getRandomMail(){
    var xhttp = new XMLHttpRequest();
    var url = 'http://localhost:5454/random/randomemail';

    return new Promise(function(resolve, reject){
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                resolve(JSON.parse(xhttp.responseText));
            } 
        };

        xhttp.open('GET', url, true);
        xhttp.send();
    });
}

/* userEmail must be the data before @ */
function setMail(token, userEmail){
    var xhttp = new XMLHttpRequest();
    var url = 'http://localhost:5454/random/setemail?token=' + token + '&userEmail=' + userEmail;

    return new Promise(function(resolve, reject){
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                resolve(JSON.parse(xhttp.responseText));
            } 
        };

        xhttp.open('GET', url, true);
        xhttp.send();
    });
}

/* The response of this method is a list of messages, represented as an array of objects and cookies
* with the session token
*
* Each object has the following properties:
* ‘mail_id’, 
* ‘mail_from’ (email address of sender),
* ‘mail_subject’,
* ‘mail_excerpt’ (snippet from the email),
* ‘mail_timestamp’ (a UNIX timestamp),
* ‘mail_read’ (1 if read, 0 if not),
* ‘mail_date’
*/
function checkMail(token){
    var xhttp = new XMLHttpRequest();
    var url = 'http://localhost:5454/random/checkemail?token=' + token;

    return new Promise(function(resolve, reject){
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                resolve(JSON.parse(xhttp.responseText));
            } 
        };

        xhttp.open('GET', url, true);
        xhttp.send();
    });
}

/* The response of this method is an object with the following properties:
* ‘mail_id’, 
* ‘mail_from’ (email address of sender),
* ‘mail_subject’,
* ‘mail_excerpt’ (snippet from the email),
* ‘mail_timestamp’ (a UNIX timestamp),
* ‘mail_read’ (1 if read, 0 if not),
* ‘mail_date’
*/
function getMail(token, emailId){
    var xhttp = new XMLHttpRequest();
    var url = 'http://localhost:5454/random/getemail?token=' + token + '&emailId=' + emailId;

    return new Promise(function(resolve, reject){
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                resolve(JSON.parse(xhttp.responseText));
            } 
        };

        xhttp.open('GET', url, true);
        xhttp.send();
    });
}

function getCodeFromMail(email) {
    var code = email.mail_body.split('token='); //jshint ignore:line

    if (code.length > 1) {
        return code[1];
    } else {
        throw new Error('Mail withouth code');
    }
}


module.exports = {
    getRandomMail: getRandomMail,
    setMail: setMail,
    checkMail: checkMail,
    getMail: getMail,
    getCodeFromMail: getCodeFromMail
};
