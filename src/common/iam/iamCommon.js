//@exclude
'use strict';
/*globals corbel */
//@endexclude

function createDomain(driver, domain) {

    var promise = driver.iam.domain()
        .create(domain)
        .should.eventually.be.fulfilled
        .then(function(response) {
            return driver.iam.domain(response.data)
                .get()
                .should.eventually.be.fulfilled;
        });
    return promise;
}

function createClientDomain(driver, domain, client) {

    var promise = driver.iam.client(domain)
        .create(client)
        .should.eventually.be.fulfilled
        .then(function(response) {
            client.id = response.data;
            return driver.iam.client(domain, client.id)
                .get()
                .should.eventually.be.fulfilled;
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
            'email': emailAccount,
            'username': emailAccount,
            'password': 'passRegisterUser',
            'oauthService': 'silkroad'
        };

        var promise = driver.iam.user().create(userData).then(function(userId) {
            userData.id = userId;
            return userData;
        });
        promises.push(promise);
    }

    return Promise.all(promises);
}

module.exports = {
    createDomain: createDomain,
    createUsers: createUsers,
    createClientDomain: createClientDomain
};
