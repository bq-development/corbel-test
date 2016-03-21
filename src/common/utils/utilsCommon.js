'use strict';

function waitFor(seconds) {
    var promise = new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve();
        }, seconds * 1000);
    });
    return promise;
}

function retry(retryFunction, maxRetries, retryPeriod, catches) {
    return new Promise(function(resolve, reject) {
        catches = catches || [];

        if (maxRetries < 1) {
            reject(catches);
        } else {
            retryFunction()
                .then(function(response) {
                    resolve(response);
                }).catch(function(err) {
                    catches.push(err);
                    setTimeout(function() {
                        retry(retryFunction, maxRetries - 1, retryPeriod, catches)
                            .then(resolve).catch(reject);
                    }, retryPeriod * 1000);
                });
        }
    });
}

function retryFail(retryFunction, maxRetries, retryPeriod) {
    return new Promise(function(resolve, reject) {
        if (maxRetries < 1) {
            reject();
        } else {
            retryFunction()
                .then(function(response) {
                    setTimeout(function() {
                        retryFail(retryFunction, maxRetries - 1, retryPeriod)
                            .then(resolve).catch(reject);
                    }, retryPeriod * 1000);
                }).catch(function(err) {
                    resolve(err);
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

function joinObjects(obj1, obj2) {
    var completeObject = {};
    var args = Array.prototype.slice.call(arguments, 0);
    args.map(function(obj) {
        var key;
        var keys = Object.keys(obj);
        var n = keys.length;
        while (n--) {
            key = keys[n];
            completeObject[key] = obj[key];
        }
    });

    return completeObject;
}

function replaceUriForProxyUse(driver) {
    driver.config.config.urlBase =
        driver.config.get('urlBase').replace('{{module}}', 'proxy')
        .replace('bqws.io/', 'bqws.io/{{module}}/');
}

function getTokenInfo(driver) {
    var token = driver.config.get(corbel.Iam.IAM_TOKEN, {}).accessToken;
    var info = JSON.parse(atob(token.split('.')[0]));
    return {
        token: token,
        info: info
    };
}

function removeBreaksFromString(string) {
    return string.replace(/(\r\n|\n|\r)/gm, '').trim();
}

function arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa(binary);
}

function expectFieldsToBeEquals(fields, object1, object2) {
    fields.forEach(function(field) {
        expect(object1[field]).to.be.equals(object2[field]);
    });
}

module.exports = {
    waitFor: waitFor,
    retry: retry,
    retryFail: retryFail,
    consultPlugins: consultPlugins,
    joinObjects: joinObjects,
    replaceUriForProxyUse: replaceUriForProxyUse,
    getTokenInfo: getTokenInfo,
    removeBreaksFromString: removeBreaksFromString,
    arrayBufferToBase64: arrayBufferToBase64,
    expectFieldsToBeEquals: expectFieldsToBeEquals
};
