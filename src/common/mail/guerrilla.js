//@exclude
'use strict';
/*globals corbel */
//@endexclude

var express = require('../express/express.js');

var MAX_RETRY = 40;
var RETRY_PERIOD = 2;

var mailsToken = {};


function getRandomMail() {
    var xhttp = new XMLHttpRequest();
    var url = express.getUrl() + '/random/randomemail';

    return new Promise(function(resolve, reject) {
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                var response = JSON.parse(xhttp.responseText);
                var email = response.emailData['email_addr'];
                mailsToken[email] = response.emailData['sid_token'];
                return popEmail(email)
                    .then(function() {
                        resolve(email);
                    });
            }
        };

        xhttp.open('GET', url, true);
        xhttp.send();
    });
}

function checkMail(email) {
    var xhttp = new XMLHttpRequest();

    var url = express.getUrl() + '/random/checkemail?token=' + mailsToken[email];

    return new Promise(function(resolve, reject) {
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                var response = JSON.parse(xhttp.responseText);
                var mails = response.list;
                mails = mails.map(function(mail) {
                  mail.id = mail['mail_id'];
                  return mail;
                });
                resolve(mails);
            }
        };

        xhttp.open('GET', url, true);
        xhttp.send();
    });
}

function getMail(email, emailId) {
    var xhttp = new XMLHttpRequest();
    var url = express.getUrl() + '/random/getemail?token=' + mailsToken[email] + '&emailId=' + emailId;

    return new Promise(function(resolve, reject) {
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                var mail = JSON.parse(xhttp.responseText);
                var response = {};
                response.content = mail['mail_body'];
                response.body = mail['mail_body'];
                response.subject = mail['mail_subject'];
                resolve(response);
            }
        };
        xhttp.open('GET', url, true);
        xhttp.send();
    });
}

function delMail(email, emailId) {
    var xhttp = new XMLHttpRequest();
    var url = express.getUrl() + '/random/delemail?token=' + mailsToken[email] + '&emailId=' + emailId;

    return new Promise(function(resolve, reject) {
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                resolve();
            }
        };
        xhttp.open('GET', url, true);
        xhttp.send();
    });
}

function popEmail(email) {
    var id;
    var emailContent;
    return corbelTest.common.utils.retry(function() {
            return corbelTest.common.mail.guerrilla.checkMail(email)
                .then(function(response) {
                    if (response.length === 0) {
                        return Promise.reject();
                    } else {
                        return response;
                    }
                });
        }, MAX_RETRY, RETRY_PERIOD)
        .then(function(response) {
            id = response[0].id;
            return getMail(email, id);
        })
        .then(function(response) {
            emailContent = response;
            return delMail(email, id);
        })
        .then(function(response) {
            return emailContent;
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
    checkMail: checkMail,
    getMail: getMail,
    popEmail: popEmail,
    getCodeFromMail: getCodeFromMail
};
