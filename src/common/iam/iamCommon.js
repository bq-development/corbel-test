//@exclude
'use strict';
/*globals corbel */
//@endexclude

function createDomain(driver, domain) {

    var promise = driver.iam.domain()
        .create(domain)
        .should.be.eventually.fulfilled
        .then(function(id) {
            return driver.iam.domain(id)
                .get()
                .should.be.eventually.fulfilled;
        });
    return promise;
}

function createClientDomain(driver, domain, client) {

    var promise = driver.iam.client(domain)
        .create(client)
        .should.be.eventually.fulfilled
        .then(function(id) {
            client.id = id;
            return driver.iam.client(domain, client.id)
                .get()
                .should.be.eventually.fulfilled;
        });
    return promise;
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
            'firstName': 'registerUser',
            'lastName': 'registerUser',
            'email': 'registerUser' + random + '@funkifake.com',
            'username': 'registerUser' + random + '@funkifake.com',
            'password': 'passRegisterUser',
            'oauthService': 'silkroad'
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

function deleteUser(userId, driver){
    return driver.iam.user(userId).delete();
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
    createDomain: createDomain,
    createClientDomain: createClientDomain,
    createUsers: createUsers,
    createUser: createUser,
    deleteUser : deleteUser,
    getDomain: getDomain,
    getClient: getClient,
    getScope: getScope
};
