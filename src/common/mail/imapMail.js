//@exclude
'use strict';
/*globals corbel */
//@endexclude

/* The response of this method is an object with a random email data and cookies
* with the session token
*/

var oauthEmailCommon = {};
var timeStamp;

function getMail(email, password, host) {
    var xhttp = new XMLHttpRequest();
    var url = 'http://' + window.location.host.split(':')[0] + ':5454/lastemails?username=' +
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

function getMailWithQuery(email, password, host, queries, retries, defer) {

    return new Promise(function(resolve, reject){
        getMail(email, password, host).
        then(function(emails) {
            var myMail;
            emails.reverse(); // start with the last mail
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

            if(myMail){
                resolve(myMail);
            } else {
                retry();
            }
        }, function(){
            retry();
        });

        function retry() {
            if (retries === undefined) {
                retries = 10;
            }
            if (retries > 0) {
                setTimeout(function() {
                    getMailWithQuery(email, password, host, queries, retries - 1, defer);
                }, 1000);
            } else {
                defer.reject();
            }
        }
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

module.exports = {
    getMail: getMail,
    buildQuery: buildQuery,
    getMailWithQuery: getMailWithQuery,
    getCodeFromMail: getCodeFromMail
};