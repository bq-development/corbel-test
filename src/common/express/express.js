//@exclude
'use strict';
/*globals corbel */
//@endexclude

function getUrl() {
    return 'http://localhost:' + corbelTest.CONFIG.EXPRESS;
}

module.exports = {
    getUrl: getUrl
};
