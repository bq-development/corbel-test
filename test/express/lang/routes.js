'use strict';

var seleniumUtils = require('grunt-corejs-build/lib/selenium/common.js'),
    getDriver = require('../selenium').getDriver;

var TIMEOUT = 30000;

var assertionData = {
        elementsId: [
            'messages-zero',
            'messages-singular' ,
            'messages-zero-model',
            'messages-singular-model' ,
            'context',
            'context-male',
            'context-female',
            'escaped1',
            'escaped2',
            'replace',
            'prepend',
            'append',
            'attributes',
            'moment',
            'numeral1',
            'numeral2',
            'numeral3',
            'numeral4',
            'numeral5',
            'numeral6',
            'numeral7',
            'numeral8',
            'numeral9',
            'numeral10'
        ],
        expected: {
            'en-GB': [
                'You have 0 messages',
                'You have a message',
                'You have 0 messages',
                'You have a message',
                'A friend',
                'A boyfriend',
                'A girlfriend',
                'Not escaped <tag></tag>',
                'Escaped &lt;tag&gt;&lt;/tag&gt;',
                'singular',
                'singular\n    <span>Other content</span>\n',
                '\n    <span>Other content</span>\nsingular',
                'singular',
                'Saturday, October 5th 1985',
                '£1,000.23',
                '1,000.20 £',
                '£ 1,001',
                '(£1,000)',
                '-£1000.23',
                '£ 1.23 m',
                '100B',
                '2 KB',
                '7.3GB',
                '3.154 TB'
                ],
            'es-ES': [
                'Tienes 0 mensajes',
                'Tienes un mensaje',
                'Tienes 0 mensajes',
                'Tienes un mensaje',
                'Un amigo',
                'Novio',
                'Novia',
                '<tag></tag> no escapado',
                '&lt;tag&gt;&lt;/tag&gt; escapado',
                'singular',
                'singular\n    <span>Other content</span>\n',
                '\n    <span>Other content</span>\nsingular',
                'singular',
                'sábado, octubre 5º 1985',
                '€1.000,23',
                '1.000,20 €',
                '€ 1.001',
                '(€1.000)',
                '-€1000,23',
                '€ 1,23 mm',
                '100B',
                '2 KB',
                '7,3GB',
                '3,154 TB'
            ]
        }
    };

var _checkLang = function(driver, lang) {
    return driver.waitForElementPresent({css: 'button[data-lang="' + lang + '"]'}).then(function(element) {
        return element.click();
    }).then(function() {
        return driver.waitForElementPresent({css: 'h1[data-i18n="lang-title"]'});
    }).then(function() {

        console.log('wait:webapp:load');
        // wait for webapp load
        var promises = [];

        for (var i = assertionData.elementsId.length - 1; i >= 0; i--) {
            promises[i] = driver.assertInnerHtmlEqual({id: assertionData.elementsId[i]}, assertionData.expected[lang][i]);
        }

        return seleniumUtils.webdriver.promise.all(promises);
    });
};

var lang = function(req, res) {
    var driver = getDriver({
        browser:{
            browserName: 'phantomjs'
        }
    });
    driver.setDefaultTimeout(TIMEOUT);

    // Force logout
    return driver.get(seleniumUtils.getWebRoot() + '/#/lang').then(function() {
        return _checkLang(driver, 'en-GB');

    }).then(function() {

        return _checkLang(driver, 'es-ES');

    }).then(function() {

        res.send(200, {statusCode: 200, data: 'ok'});
        driver.quit();

    }).thenCatch(function() {
        console.log(arguments);
        res.send(500, {statusCode: 500, data: arguments});
        driver.quit();

    });

};

var setup = function(app) {
    app.get('/lang', lang);
};

module.exports = setup;
