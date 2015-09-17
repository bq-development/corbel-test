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
            'firstName': 'registerUser',
            'lastName': 'registerUser',
            'email': 'registerUser' + random + '@funkifake.com',
            'username': 'registerUser' + random + '@funkifake.com',
            'password': 'passRegisterUser'
        };

        promises.push(createUser(userData, driver));
    }

    return Promise.all(promises);
}

function createUser(userData, driver){
    return driver.iam.user().create(userData).then(function(userId) {
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


module.exports = {
    createUsers: createUsers,
    createUser: createUser,
    getDomain: getDomain,
    getClient: getClient,
    getScope: getScope
};
