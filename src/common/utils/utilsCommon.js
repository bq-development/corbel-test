'use strict';
var q = require('q');
var $ = require('jquery');

function retry(retryFunction, maxRetries, retryPeriod, deferred, catches) {
    deferred = deferred || q.defer();
    catches = catches || [];

    if (maxRetries < 1) {
        deferred.reject(catches);
    } else {
        retryFunction().then(
            function(response) {
                deferred.resolve(response);
            })
            .catch(function(err) {
                catches.push(err);
                setTimeout(function() {
                    retry(retryFunction, maxRetries - 1, retryPeriod, deferred, catches);
                }, retryPeriod * 1000);
            });
    }

    return deferred.promise;
}

var getPluginsUrl = function(url) {
    return url.split('/v1.0')[0] + '/plugins';
};

function consultPlugins(currentUrl) {
    var deferred = q.defer();

    $.ajax({
        url: getPluginsUrl(currentUrl),
        type: 'GET',
        contentType: false,
        processData: false,
        cache: false
    }).done(function() {
        deferred.resolve();
    }).fail(function() {
        deferred.reject();
    });

    return deferred.promise;
}

function createNewUser(driver, username, password) {
    var userData = {
        'firstName': username,
        'lastName': 'registeredUserLastName',
        'email': username + '@funkyfake.com',
        'username': username,
        'password': password
    };

    return driver.iam.user().create(userData);
}

function loginUser(driver, username, password) {
    var driverToReturn;
    var claimDefault = _.cloneDeep(corbelTest.CONFIG['DEFAULT_CLIENT']);
    var version = _.cloneDeep(corbelTest.CONFIG['VERSION']);
    var jwtAlgorithm = 'HS256';

    var claims = {
        'basic_auth.username': username,
        'basic_auth.password': password,
        'scope': claimDefault.scopes
    };

    driver.iam.token().create({
        // jwt: corbel.jwt.generate(claims, claimDefault.clientSecret, jwtAlgorithm)
        claims: claims
    }).then(function(response) {
        driverToReturn = response;
    });

    return driverToReturn;
}

module.exports = {
    retry : retry,
    consultPlugins : consultPlugins,
    createNewUser: createNewUser,
    loginUser: loginUser
};
