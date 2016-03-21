//@exclude
'use strict';
/*globals corbel */
//@endexclude

var MailParser = require('mailparser').MailParser;

var PORTS = require('../../../test/ports.conf.js');
var MAX_RETRY = 40;
var RETRY_PERIOD = 2;

function getRandomMail() {
    return new Promise(function(resolve, reject) {
        resolve('corbel-' + Date.now() + '@maildrop.cc');
    });
}

function checkMail(email) {
    var xhttp = new XMLHttpRequest();
    var username = email.replace('@maildrop.cc', '');

    var url = 'http://localhost:' + PORTS.EXPRESS + '/maildrop/checkemail?user=' + username;

    return new Promise(function(resolve, reject) {
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                resolve(JSON.parse(xhttp.responseText));
            }
        };

        xhttp.open('GET', url, true);
        xhttp.send();
    });
}

function getMail(email, emailId) {
    var xhttp = new XMLHttpRequest();
    var username = email.replace('@maildrop.cc', '');
    var url = 'http://localhost:' + PORTS.EXPRESS +
        '/maildrop/getemail?user=' + username + '&emailId=' + emailId;

    return new Promise(function(resolve, reject) {
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                var mail = JSON.parse(xhttp.responseText);
                var mailparser = new MailParser();
                mailparser.on('end', function(mailObject) {
                    mail.content = mailObject.html;
                    resolve(mail);
                });
                mailparser.write(mail.body);
                mailparser.end();
            }
        };

        xhttp.open('GET', url, true);
        xhttp.send();
    });
}

function delMail(email, emailId) {
    var xhttp = new XMLHttpRequest();
    var username = email.replace('@maildrop.cc', '');
    var url = 'http://localhost:' + PORTS.EXPRESS +
        '/maildrop/delemail?user=' + username + '&emailId=' + emailId;

    return new Promise(function(resolve, reject) {
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                resolve(JSON.parse(xhttp.responseText));
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
            return corbelTest.common.mail.maildrop.checkMail(email)
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
    var code = email.body.split('token=');

    if (code.length > 1) {
        return code[1].trim();
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
