'use strict';

var seleniumUtils = require('grunt-corejs-build/lib/selenium/common.js');
var fs = require('fs');
var _ = require('underscore');
var seleniumConfig = (JSON.parse(fs.readFileSync('.selenium', 'utf8')));


var getDriver = function(capabilities) {
    if (!capabilities) {
        capabilities = _.omit(seleniumConfig, 'browsers');

        // get the first brwoser configuration
        // @todo: improve this
        capabilities.name = Object.keys(seleniumConfig.browsers)[0];
        capabilities.browser = seleniumConfig.browsers[capabilities.name];
    }

    console.log('express.selenium.getDriver', capabilities);

    return seleniumUtils.getDriver(capabilities);
};

exports.config = seleniumConfig;
exports.getDriver = getDriver;
