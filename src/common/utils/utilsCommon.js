'use strict';
var q = require('q');

function createDeferred() {
    return q.defer();
}

function retry(retryFunction, maxRetries, retryPeriod, deferred, catches) {
    deferred = deferred || createDeferred();
    catches = catches || [];

    if (maxRetries < 1) {
        deferred.reject(catches);
    } else {
        retryFunction().then(function(response) {
            deferred.resolve(response);
        }).catch(function(err) {
            catches.push(err);
            setTimeout(function() {
                retry(retryFunction, maxRetries - 1, retryPeriod, deferred, catches);
            }, retryPeriod * 1000);
        });
    }

    return deferred.promise;
}

function consultPlugins(url) {
    return corbel.request.send({
        url: url.split('/v1.0')[0] + '/plugins?' + Math.random(),
        // inavalidate cache with random query string
        method: corbel.request.method.GET
    });
}

module.exports = {
    retry: retry,
    createDeferred: createDeferred,
    consultPlugins: consultPlugins
};
