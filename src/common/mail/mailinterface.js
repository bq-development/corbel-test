//@exclude
'use strict';
/*globals corbel */
//@endexclude

var mail = require('./imapNotify.js');

function getCodeFromMail(email) {
    var code = email.body.split('token=');

    if (code.length > 1) {
        return code[1].trim();
    } else {
        throw new Error('Mail withouth code');
    }
}

module.exports = {
    getRandomMail: mail.getRandomMail,
    checkMail: mail.checkMail,
    getMail: mail.getMail,
    popEmail: mail.popEmail,
    getCodeFromMail: getCodeFromMail
};
