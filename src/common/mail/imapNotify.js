//@exclude
'use strict';
/*globals corbel */
//@endexclude

var express = require('../express/express.js');

var MailParser = require('mailparser').MailParser;

var MAX_RETRY = 40;
var RETRY_PERIOD = 1;

var init = false;

var emails = {};
var mailsReaded=0;

function getRandomMail() {
    return new Promise(function(resolve, reject) {
        var randomMail = corbelTest.CONFIG.IMAP_MAIL.email.split('@');
        var randomValue = Math.floor((Math.random() * 100) + 1);
        randomMail = randomMail[0] + '+' + Date.now() + '' + randomValue + '@' + randomMail[1];
        if (!init) {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (xhttp.readyState === 4) {
                  if(xhttp.status === 200) {
                    resolve(randomMail);
                    init = true;
                  } else {
                    reject('fail generate randomMail in imapNotify');
                  }
                }
            };

            var url = express.getUrl() + '/imapNotify/init?' +
                    'username=' + encodeURIComponent(corbelTest.CONFIG.IMAP_MAIL.email) +
                    '&password=' + encodeURIComponent(corbelTest.CONFIG.IMAP_MAIL.password) +
                    '&host=' + encodeURIComponent(corbelTest.CONFIG.IMAP_MAIL.host);

            xhttp.open('GET', url, true);
            xhttp.send();
        } else {
            resolve(randomMail);
        }
    });
}

function imapPopMails() {
    var url = express.getUrl() + '/imapNotify/popMails?offset=' + mailsReaded;

    return new Promise(function(resolve, reject) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                var responseMails = JSON.parse(xhttp.responseText);
                mailsReaded += responseMails.length;
                responseMails.forEach(function(mail) {
                    var destination = mail.headers['delivered-to'];
                    emails[destination] = emails[destination] || [];
                    emails[destination].push({
                        id: mail.messageId,
                        from: mail.from[0].address,
                        to: destination,
                        subject: mail.subject,
                        content: mail.html,
                        body: mail.html
                    });
                });
                resolve();
            }
        };

        xhttp.open('GET', url, true);
        xhttp.send();
    });
}


function checkMail(email) {
    return imapPopMails()
        .then(function() {
            return emails[email] || [];
        });
}

function getMail(email, emailId) {
    var mails = emails[email] || [];
    var mail = mails.find(function(mail) {
        return mail.id === emailId;
    });
    return new Promise(function(resolve, reject) {
        resolve(mail);
    });
}

function delMail(email, emailId) {
    var mails = emails[email] || [];
    var resultMails = [];
    mails.forEach(function(mail) {
        if (mail.id !== emailId) {
            resultMails.push(mail);
        }
    });
    emails[email] = resultMails;
    return new Promise(function(resolve, reject) {
        resolve();
    });
}

function popEmail(email) {
    var id;
    var emailContent;
    return corbelTest.common.utils.retry(function() {
            return checkMail(email)
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

module.exports = {
    getRandomMail: getRandomMail,
    checkMail: checkMail,
    getMail: getMail,
    popEmail: popEmail
};
