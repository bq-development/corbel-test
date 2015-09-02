'use strict';
var q = require('q');
var $ = require('jquery');

function getQPromise() {
    return q.defer();
}

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

var getPluginsUrl = function(url) {
    return url.split('/v1.0')[0] + '/plugins';
};

function consultPlugins(currentUrl) {
    var deferred = q.defer();

    $.ajax({
        url: getPluginsUrl(currentUrl),
        type: 'GET',
        contentType: false,
        processData: false,
        cache: false
    }).done(function() {
        deferred.resolve();
    }).fail(function() {
        deferred.reject();
    });

    return deferred.promise;
}

module.exports = {
    retry : retry,
    getQPromise: getQPromise,
    consultPlugins : consultPlugins 
};
