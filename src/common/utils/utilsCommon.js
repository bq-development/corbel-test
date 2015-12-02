'use strict';
function retry(retryFunction, maxRetries, retryPeriod, catches) {
    return new Promise(function(resolve, reject){
        catches = catches || [];

        if (maxRetries < 1) {
            reject(catches);
        } else {
            retryFunction().then(function(response) {
                resolve(response);
            }).catch(function(err) {
                catches.push(err);
                setTimeout(function() {
                    retry(retryFunction, maxRetries - 1, retryPeriod, catches);
                }, retryPeriod * 1000);
            });
        }
    });
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
    consultPlugins: consultPlugins
};
