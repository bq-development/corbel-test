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

function joinObjects(obj1, obj2) {
    var key;
    var keys = Object.keys(obj2);
    var n = keys.length;

    while (n--) {
      key = keys[n];
      obj1[key] = obj2[key];
    }

    return obj1;
}


module.exports = {
    retry: retry,
    createDeferred: createDeferred,
    consultPlugins: consultPlugins,
    joinObjects: joinObjects
};
