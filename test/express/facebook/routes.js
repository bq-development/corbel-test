'use strict';

var seleniumUtils = require('grunt-corejs-build/lib/selenium/common.js'),
    getDriver = require('../selenium').getDriver,
    accounts = require('../../selenium/accounts').accounts,
    locators = require('../../selenium/locators').locators;

var TIMEOUT = 5000;

var _loginPopupAccessToken = function(req, driver, account) {

    // Force logout
    var promise = driver.getAndWaitFor(seleniumUtils.getWebRoot() + '/#/logout', {id: 'home'}).then(function() {

        return driver.getAndWaitFor(seleniumUtils.getWebRoot() + '/#/login/facebook', {id: 'login-facebook'});

    }).then(function() {

        return driver.oauth({
            triggerLocator: {id: 'login-facebook'},
            usernameLocator: locators.facebook.username,
            passwordLocator: locators.facebook.password,
            submitLocator: locators.facebook.login,
            aproveLocator: locators.facebook.aprove,
            account: account
        });

    }).then(function() {

        return driver.waitForElementPresent({id: 'response'});

    }).then(function() {
        // console.log('login:response');

        return driver.findElement({id: 'response'}).getText().then(function(response) {

            console.log('login-response:', response);
            if (!response) {
                throw new Error('Unable to login');
            }

            return response;

        });

    });

    return promise;

};

var loginAccessToken = function(req, res) {

    var driver = getDriver();

    driver.setDefaultTimeout(TIMEOUT);

    _loginPopupAccessToken(req, driver, accounts.available).then(function(accessToken) {
        res.send(200, {statusCode: 200, data: accessToken});
    }).thenCatch(function(error) {
        res.send(500, {statusCode: 500, data: error});
    }).then(function() {
        driver.quit();
    });

};

var setup = function(app) {
    app.get('/facebook/accessToken', loginAccessToken);
};

module.exports = setup;
