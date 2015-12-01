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

    for (var count = 1; count <= amount; count++) {
        var random = Date.now() + '-' + count;
        var userData = {
            'firstName': 'registerUser' + random,
            'lastName': 'registerUser' + random,
            'email': 'registerUser' + random + '@funkifake.com',
            'username': 'registerUser' + random + '@funkifake.com',
            'password': 'passRegisterUser'
        };
        if (extraFields) {
            userData = corbelTest.common.utils.joinObjects(userData, extraFields);
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
