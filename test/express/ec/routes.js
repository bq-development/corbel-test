'use strict';

var seleniumUtils = require('grunt-corejs-build/lib/selenium/common.js'),
    getDriver = require('../selenium').getDriver;


var TIMEOUT = 5000;

var extractRow = function(tbody) {
    var result = {};
    return tbody.findElement({
        xpath: '//td[1]'
    }).
    then(function(link) {
        return link.getText();
    }).then(function(content) {
        result.pspReference = content;
        return tbody.findElement({
            xpath: '//td[2]'
        });
    }).then(function(merchant) {
        return merchant.getText();
    }).then(function(content) {
        result.merchant = content;
        return tbody.findElement({
            xpath: '//td[3]'
        });
    }).then(function(date) {
        return date.getText();
    }).then(function(content) {
        result.date = content;
        return tbody.findElement({
            xpath: '//td[4]'
        });
    }).then(function(currency) {
        return currency.getText();
    }).then(function(content) {
        result.currency = content;
        return tbody.findElement({
            xpath: '//td[5]'
        });
    }).then(function(amount) {
        return amount.getText();
    }).then(function(content) {
        result.amount = content;
        return tbody.findElement({
            xpath: '//td[7]'
        });
    }).then(function(status) {
        return status.getText();
    }).then(function(content) {
        result.status = content;
        return tbody.findElement({
            xpath: '//td[8]'
        });
    }).then(function(shopperReference) {
        return shopperReference.getText();
    }).then(function(content) {
        result.shopperReference = content;
        return result;
    });
};

var retry = function(retryFunction, maxRetries, retryPeriod, deferred) {
    deferred = deferred || seleniumUtils.webdriver.promise.defer();

    if (maxRetries < 1) {
        deferred.reject();
    } else {
        retryFunction().then(
            function(response) {
                deferred.fulfill(response);
            },
            function() {
                setTimeout(function() {
                    retry(retryFunction, maxRetries - 1, retryPeriod, deferred);
                }, retryPeriod * 1000);
            }
        );
    }
    return deferred.promise;
};

var getRow = function(driver, shopper) {
    return driver.get('https://ca-test.adyen.com/ca/ca/payments/showList.shtml').
    then(
        function() {
            return driver.findElement({
                xpath: '//tr[ td[7]//text()[contains(., \'Authorised\')] and td[8]//text()[contains(., \'' + shopper + '\')]]'
            });
        }
    );
};


function getLastPurchase(req, res) {
    var driver = getDriver();
    driver.setDefaultTimeout(TIMEOUT);
    var webdriver = seleniumUtils.webdriver;

    driver.getAndWaitFor('https://ca-test.adyen.com/ca/ca/login.shtml', {
        tagName: 'form'
    }).then(
        function(form) {
            driver.findElement(webdriver.By.id('accountTextInput')).sendKeys('MundoReader');
            driver.findElement(webdriver.By.id('j_username')).sendKeys('orpheus');
            driver.findElement(webdriver.By.id('j_password')).sendKeys('!b1tbl1g!');
            return form.submit();
        }
    ).then(
        function() {
            var shopper = req.param('shopperReference');
            return retry(function() {
                return getRow(driver, shopper);
            }, 10, 5);
        }
    ).then(
        function(result) {
            return extractRow(result);
        }
    ).then(
        function(result) {
            res.status(200).send(result);
            driver.quit();
        },
        function(fail) {
            res.status(404).send(fail);
            driver.quit();
        }
    );
}

function setup(app) {
    app.get('/lastpurchase/:shopperReference', getLastPurchase);
}

module.exports = setup;
