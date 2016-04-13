//@exclude
'use strict';
/*globals corbel */
//@endexclude

var mail = require('./imapNotify.js');

function getCodeFromMail(email) {
    var code = email.body.split('token=');

    if (code.length > 1) {
        code = code[1].trim();
        var htmlCode = code.indexOf('<');
        if (htmlCode>0) {
          code = code.slice(0, htmlCode);
        }
        return code;
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
