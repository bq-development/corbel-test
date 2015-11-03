/* global describe, it, beforeEach, afterEach */
'use strict';

var assert = require('assert'),
    seleniumUtils = require('grunt-corejs-build/lib/selenium/common.js'),
    accounts = require('../accounts').accounts,
    locators = require('../locators').locators;

describe('[' + seleniumUtils.getDriverString() + '] With Facebook oauth', function() {

    this.timeout(40000);
    this.slow(20000);

    var driver;

    beforeEach(function() {
        driver = seleniumUtils.getDriver();
        driver.setDefaultTimeout(TIMEOUT);
    });

    afterEach(function(done) {
        driver.quit().then(done);
    });

    var TIMEOUT = 10000;

    /**
     * Facebook login popup flow
     * @param  {Object} account
     * @param  {String} account.username
     * @param  {String} account.password
     * @param  {Boolean} remember
     * @return {Promise} Promise that resolves when flow is completed
     */
    var loginPopup = function(account, remember) {
        return _loginPopup('login-facebook', account, remember);
    };

    var loginRegisterPopup = function(account, remember) {
        return _loginPopup('login-register-facebook', account, remember).then(function() {
            return driver.getAndWaitFor(seleniumUtils.getWebRoot() + '/#/me/remove', {id: 'home'});
        });
    };

    var _loginPopup = function(buttonAction, account, remember) {

        return driver.getAndWaitFor(seleniumUtils.getWebRoot() + '/#/login', locators.username).then(function() {

            if (remember) {
                driver.findElement(locators.remember).click();
            }

            return driver.oauth({
                triggerLocator: {id: buttonAction},
                usernameLocator: locators.facebook.username,
                passwordLocator: locators.facebook.password,
                submitLocator: locators.facebook.login,
                //aproveLocator: locators.facebook.aprove,  // facebook account should have permissions previously aproved
                account: account
            });

        }).then(function() {

            console.log('login:response');

            return driver.waitForElementPresent(locators.loginResponse);

        }).then(function() {

            return driver.assertValueEqual(locators.loginResponse, 'ok').then(function() {
                // @todo: check {id: 'login-error'} innerhtml when fails

                return driver.executeScript('return app.session.get("accessToken");').then(function(accessToken) {
                    // Check if accessToken exists
                    console.log('accessToken', accessToken);
                    assert(Boolean(accessToken), true);
                });

            });

        });
    };

    /**
     * Facebook popup flow.
     * Popup only shows when not logged.
     * @param  {String} buttonAction
     * @param  {Object} account
     * @param  {String} account.username
     * @param  {String} account.password
     * @return {Promise}    Promise that resolves when flow is completed
     */
    var _register = function(buttonAction, account) {

        return driver.getAndWaitFor(seleniumUtils.getWebRoot() + '/#/register', {id: 'firstName'}).then(function() {

            return driver.waitForEnabled({id: buttonAction});

        }).then(function() {

            return driver.oauth({
                triggerLocator: {id: buttonAction},
                usernameLocator: locators.facebook.username,
                passwordLocator: locators.facebook.password,
                submitLocator: locators.facebook.login,
                //aproveLocator: locators.facebook.aprove,  // facebook account should have permissions previously aproved
                account: account
            });

        }).then(function() {
            return driver.waitForElementPresent(locators.registerResponse);
        });

    };

    var register = function(account) {
        return _register('register-facebook', account).then(function() {

            return driver.assertValueEqual(locators.registerResponse, 'ok').then(function() {
                // remove user
                return loginPopup(account, false).then(function() {
                    return driver.getAndWaitFor(seleniumUtils.getWebRoot() + '/#/me/remove', {id: 'home'});
                });
            });

        });
    };

    var registerMe = function(account) {

        return _register('register-facebook-me', account).then(function() {
            return driver.assertValueEqual(locators.registerResponse, 'ok').then(function() {
                // @todo: check {id: 'register-error'} innerhtml when fails
                return driver.assertValueEqual(locators.firstName, account.firstName);
            }).then(function() {
                return driver.assertValueEqual(locators.lastName, account.lastName);
            }).then(function() {
                return driver.assertValueEqual(locators.email, account.username);
            });

        });

    };

    var checkProfile = function(account) {

        return _register('register-facebook', account).then(function() {
            return driver.assertValueEqual(locators.registerResponse, 'ok').then(function() {
                // @todo: check {id: 'register-error'} innerhtml when fails
                return loginPopup(account, false, true);
            }).then(function() {
                driver.waitForElementPresent(locators.avatar);
            }).then(function() {
                driver.assertAttributeEqual(locators.avatarImage, 'src', true, function(locatorValue) {
                    return Boolean(locatorValue);
                });
            }).then(function() {
                return driver.getAndWaitFor(seleniumUtils.getWebRoot() + '/#/me/remove', {id: 'home'});
            });

        });

    };

    var registerLogin = function(account) {
        return _register('register-login-facebook', account).then(function() {

            return driver.assertValueEqual(locators.registerResponse, 'ok').then(function() {
                // remove user
                return driver.getAndWaitFor(seleniumUtils.getWebRoot() + '/#/me/remove', {id: 'home'});
            });

        });
    };

    it('can complete form with correct user successfully', function(done) {
        return registerMe(accounts.notAvailable).then(function() {
            done();
        });
    });

    it('can register with correct user successfully', function(done) {
        return register(accounts.notAvailable).then(function() {
            done();
        });
    });

    it('when register an user with avatar and login, its shows his avatar', function(done) {
        return checkProfile(accounts.notAvailable).then(function() {
            done();
        });
    });

    it('can register + login with correct user successfully', function(done) {
        return registerLogin(accounts.notAvailable).then(function() {
            done();
        });
    });

    it('can login with correct user successfully', function(done) {
        return loginPopup(accounts.available).then(function() {
            done();
        });
    });

    it('can login (remmeber) with correct user successfully', function(done) {
        return loginPopup(accounts.available, true).then(function() {
            done();
        });
    });

    it('can login-register with correct user successfully', function(done) {
        return loginRegisterPopup(accounts.notAvailable).then(function() {
            done();
        });
    });

});
