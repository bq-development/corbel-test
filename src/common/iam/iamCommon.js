//@exclude
'use strict';
/*globals corbel */
//@endexclude

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
            'email': 'registerUser' + random + '@funkifake.com',
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

function getRandomMail(){
    var xhttp = new XMLHttpRequest();
    var url = 'http://localhost:5454/email/randomemail';

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

/* The response of this method is a list of messages, represented as an array of objects.
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
    var url = 'http://localhost:5454/email/checkemail';

    return new Promise(function(resolve, reject){
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                resolve(JSON.parse(xhttp.responseText));
            } 
        };
        xhttp.open('POST', url, true);
        xhttp.send({token: token});
    });
}

function getMail(id){
    var xhttp = new XMLHttpRequest();
    var url = 'http://localhost:5454/email/getemail';

    return new Promise(function(resolve, reject){
        xhttp.onreadystatechange = function() {
                    if (xhttp.readyState === 4 && xhttp.status === 200) {
                        resolve(xhttp.responseText);
                    } 
                };
                xhttp.open('GET', url, true);
                //xhttp.setRequestHeader("Content-type", "");
                xhttp.send(id);
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
    createUsers: createUsers,
    createUser: createUser,
    getDomain: getDomain,
    getClient: getClient,
    getScope: getScope,
    getRandomMail: getRandomMail,
    checkMail: checkMail,
    getCodeFromMail: getCodeFromMail
};
