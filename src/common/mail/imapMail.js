'use strict';

var express = require('../express/express.js');

function getMail(email, password, host) {
    var xhttp = new XMLHttpRequest();
    var url = express.getUrl() + '/imap/lastemails?username=' +
        email + '&password=' + password + '&host=' + host + '&emailsToRead=20&hash='+Date.now();

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

function equalsQuery(email, field, value) {
    if (email[field] !== value) {
        throw new Error('equalsQuery not verify');
    }
}

function containQuery(email, field, value) {
    if (email[field].indexOf(value) === -1) {
        throw new Error('containQuery not verify');
    }
}

function notContainQuery(email, field, value) {
    if (email[field].indexOf(value) >= 0) {
        throw new Error('notContainQuery not verify');
    }
}

function dateLaterThanQuery(email, field, value) {
    if (Date.parse(email[field]) < Date.parse(value)) {
        throw new Error('dateLaterThanQuery not verify');
    }
}

function buildQuery(operator, field, value) {
    return {
        'op': operator,
        'field': field,
        'value': value
    };
}

var queryOperators = {
    'eq': equalsQuery,
    'contain': containQuery,
    'notContain': notContainQuery,
    'dateLaterThan': dateLaterThanQuery
};

function _filterEmail(emails, queries){
    var myMail;
    return new Promise(function(resolve, reject){
        emails.every(function(mail) {
            try {
                queries.forEach(function(query) {
                    queryOperators[query.op](mail, query.field, query.value);
                });
            } catch (err) {
                return true; //EMAIL not matched, continue
            }
            myMail = mail;
            return false; //EMAIL match end
        });

        if(myMail) {
            resolve(myMail);
        } else {
            reject();
        }
    });
}

function _retry(retries, params) {
    if (retries > 0) {
        return getMailWithQuery(params.email, params.password, params.host, params.queries, retries - 1);
    } else {
        return Promise.reject();
    }
}

function getMailWithQuery(email, password, host, queries, retries) {
    if (!retries && retries !== 0) {
        retries = 10;
    }

    return getMail(email, password, host)
    .then(function(emails) {
        return emails.reverse();
    })
    .then(function(emails){
        return _filterEmail(emails, queries);
    }).catch(function(err){
        return _retry(retries, {
            email: email,
            password: password,
            host: host,
            queries: queries
        });
    });
}

function getCodeFromMail(email) {
    var code = email.text.match(/token=[\S]+\.[\S]+\.[\S]+/g);
    if (code.length > 0) {
        code = code[0].split('=')[1];
    } else {
        throw new Error('Mail withouth code');
    }
    return code;
}

function getRandomMail(){
    var str = corbelTest.CONFIG.clientCredentials.silkroad.email.split('@');
    return str[0]+'+'+Date.now()+'@'+str[1];
}

module.exports = {
    getMail: getMail,
    buildQuery: buildQuery,
    getMailWithQuery: getMailWithQuery,
    getCodeFromMail: getCodeFromMail,
    getRandomMail: getRandomMail
};
