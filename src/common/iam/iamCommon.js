//@exclude
'use strict';
/*globals corbel */
//@endexclude

/**
 * Creates random users
 * @param  {CorbelDriver} driver
 * @param  {number} amount Number of random users to create
 * @param  {extraFields} fields to add to the user object
 * @return {Promise}       A promise that resolves when users are created
 */
function createUsers(driver, amount, extraFields) {
    var promises = [];
    var obj = extraFields || {};
    var key;
    var keys = Object.keys(obj);
    var n = keys.length;

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

        while (n--) {
          key = keys[n];
          userData[key] = obj[key];
        }

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

function getDomain(timeStamp, desc, sufix, scopes, publicScopes) {
    return {
        id: 'TestDomain_' + (timeStamp ? timeStamp : Date.now()) +
            (sufix ? ('_' + sufix) : ''),
        description: desc ? desc : 'anyDescription',
        scopes: scopes ? scopes : ['iam:user:create', 'iam:user:read', 'iam:user:delete',
            'iam:user:me'],
        publicScopes: publicScopes ? publicScopes : []
    };
}

function getClient(timeStamp, domainId, sufix, publicScopes) {
    return {
        name: 'testClient_' + (timeStamp ? timeStamp : Date.now()) +
            (sufix ? ('_' + sufix) : ''),
        signatureAlgorithm: 'HS256',
        domain: domainId ? domainId : 'TestDomain',
        scopes: ['iam:user:create', 'iam:user:read', 'iam:user:delete',
            'iam:user:me']
    };
}

function getScope(id, audience, rules, parameters) {
    return {
        id: id,
        audience: audience ? audience : 'testAudience',
        rules: rules ? rules : [{ testRule: 'this is a rule' }],
        parameters: parameters ? parameters : { a: Date.now() } 
    };
}


module.exports = {
    createUsers: createUsers,
    createUser: createUser,
    getDomain: getDomain,
    getClient: getClient,
    getScope: getScope
};
