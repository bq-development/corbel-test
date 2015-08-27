'use strict';
var q = require('q');

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

module.exports = {
    retry : retry
};
