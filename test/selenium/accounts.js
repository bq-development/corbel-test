'use strict';
/* global exports */

var argv = require('yargs')
    .describe('login-test-username', 'Google email/username for login tests')
    .describe('login-test-password', 'Google password for login tests')
    .argv;

var accounts = {

    available: {
        username: argv['login-test-username'] || 'dev.silkroad@gmail.com',
        password: argv['login-test-password'] || 'dev2014silkroad'
    },

    notAvailable: {
        username: 'qa.corejs@gmail.com',
        password: 'qa2014corejs00',
        firstName: 'Corejs',
        lastName: 'Framework'
    }

};

exports.accounts = accounts;
