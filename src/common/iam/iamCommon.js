//@exclude
'use strict';
/*globals corbel */
//@endexclude

var queryOperators = {
    'eq': equalsQuery,
    'contain': containQuery,
    'notContain': notContainQuery,
    'dateLaterThan': dateLaterThanQuery
};
var timeStamp;

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

/**
 * Creates random users
 * @param  {CorbelDriver} driver
 * @param  {number} amount Number of random users to create
 * @return {Promise}       A promise that resolves when users are created
 */
function createUsers(driver, amount) {
    var promises = [];

    for (var count = 1; count <= amount; count++) {
        var random = Date.now() + '-' + count;
        var emailAccount = 'registerUser' + random + '@funkifake.com';

        var userData = {
            'firstName': 'registerUser' + random,
            'lastName': 'registerUser' + random,
            'email': 'silkroad-' + Date.now() + '@mail-tester.com',
            'username': 'registerUser' + random + '@funkifake.com',
            'password': 'passRegisterUser'
        };

        promises.push(createUser(userData, driver));
    }

    return Promise.all(promises);
}

function createUser(userData, driver){
    return driver.iam.users().create(userData).then(function(userId) {
        userData.id = userId;
        return userData;
    });
}

function getDomain(timeStamp, desc, sufix) {
    return {
        id: 'TestDomain_' + (timeStamp ? timeStamp : Date.now()) +
            (sufix ? ('_' + sufix) : ''),
        description: desc ? desc : 'anyDescription',
        scopes: ['iam:user:create', 'iam:user:read', 'iam:user:delete',
            'iam:user:me']
    };
}

function getClient(timeStamp, domainId, sufix) {
    return {
        name: 'testClient_' + (timeStamp ? timeStamp : Date.now()) +
            (sufix ? ('_' + sufix) : ''),
        signatureAlgorithm: 'HS256',
        domain: domainId ? domainId : 'TestDomain',
        scopes: ['iam:user:create', 'iam:user:read', 'iam:user:delete',
            'iam:user:me']
    };
}

function getScope(id) {
    return {
        id: id,
        audience: 'testAudience',
        rules: [{ testRule: 'this is a rule' }],
        parameters: { a: Date.now() }
    };
}

function buildEmailQuery (operator, field, value) {
    return {
        'op': operator,
        'field': field,
        'value': value
    };
}

function getActualDateEmail(driver) {
    var email = 'silkroadqanotificationtests@gmail.com';
    var notificationEvent = {
        'notificationId': 'notification-qa:email',
        'recipient': email,
        'properties': {
            'sender': 'qa-silkroad@bq.com',
            'subject': getTimeStamp(),
            'content': getTimeStamp()
        }
    };
    
    return new Promise(function(resolve, reject){
        debugger;
        driver.notifications().sendNotification(notificationEvent)
        .should.be.eventually.fulfilled
        .then(function() {
            var queries = [ //buildEmailQuery('eq', 'to', email),
                buildEmailQuery('contain', 'subject', getTimeStamp())
            ];

            return getMailWithQuery(email, 'qa2014silkroad', 'imap.gmail.com', queries);
        })
        .then(function(mail) {
            resolve(mail.date);
        }).catch (function(err){
            console.dir(err);
            });
    });
}

function getMailWithQuery (email, password, host, queries, retries) {
    debugger;

    return new Promise(function(resolve, reject){
        getMail(email, password, host)
        .should.be.eventually.fulfilled
        .then(function(emails) {
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

            if (myMail) {
                resolve(myMail);
            } else {
                retry();
            }
        }, function() {
            retry();
        });

        function retry() {
            if (retries === undefined) {
                retries = 10;
            }
            if (retries > 0) {
                setTimeout(function() {
                    getMailWithQuery(email, password, host, queries, retries - 1);
                }, 1000);
            } else {
                reject();
            }
        }
    });
}
//http://localhost:9002/lastemails?username=silkroadqanotificationtests@gmail.com&password=qa2014silkroad&host=imap.gmail.com&emailsToRead=20
//http://localhost:9002/lastemails?username=silkroadqanotificationtests@gmail.com&password=qa2014silkroad&host=imap.gmail.com&emailsToRead=20"
function getMail(email, password, host){
    var xhttp = new XMLHttpRequest();
    var url = 'http://localhost:9002' +
        //+ window.location.host.split(':')[0] + 
        //':' + (parseInt(window.location.host.split(':')[1], 10) + 1) +
    '/lastemails?username=' + email + '&password=' + password +
    '&host=' + host + '&emailsToRead=20';

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
    var code = email.text.match(/token=[\S]+\.[\S]+\.[\S]+/g);
    if (code.length > 0) {
        code = code[0].split('=')[1];
    } else {
        throw new Error('Mail withouth code');
    }
    return code;
}

function getUniqueEmailNameWithDotTrick() {
    var defaultEmail = 'silkroadqanotificationtests@gmail.com';
    var email = defaultEmail.split('@');
    var timestampBase = getTimeStamp().toString(2).split('');
    var baseEmail = email[0].split('');

    if (baseEmail.length > timestampBase.length) {
        for (var i = 0; i < baseEmail.length - timestampBase.length + 2; i++) {
            timestampBase.push(0);
        }
    }
    for (var j = baseEmail.length - 1; j > 0; j--) {
        baseEmail.splice(j, 0, '.'.repeat(parseInt(timestampBase.pop(), 10)));
    }
    return baseEmail.join('') + '@' + email[1];
}

function getTimeStamp() {
    timeStamp = timeStamp || Date.now();
    return timeStamp;
}

module.exports = {
    createUsers: createUsers,
    createUser: createUser,
    getDomain: getDomain,
    getClient: getClient,
    getScope: getScope,
    buildEmailQuery: buildEmailQuery,
    getActualDateEmail: getActualDateEmail,
    getMailWithQuery: getMailWithQuery,
    getMail: getMail,
    getCodeFromMail: getCodeFromMail
};
