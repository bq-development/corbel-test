'use strict';

var drivers = {};
var tokens = {};
var logins = {};

/**
 *
 * @param  {string} clientName
 * @return {object} a corbel config object
 */
function getConfig(clientName) {
    var commonConfig = _.clone(corbelTest.CONFIG['COMMON']);
    if (corbelTest.CONFIG.ENV) {
        commonConfig.urlBase = commonConfig.urlBase.replace('{{ENV}}', corbelTest.CONFIG.ENV);
    }
    return _.extend(commonConfig, corbelTest.CONFIG[clientName]);
}

/**
 * Create a new driver with the clientName creadentials.
 * clientName credentials (corbelTest.CONFIG) are generated from .corbeltest config file or ENV variables
 * @param  {string}       clientName clientName configuration to log with
 * @return {corbelDriver} corbelDriver already autenticated
 */
function login(clientName) {
    if (!drivers[clientName]) {
        var driverConfig = corbelTest.getConfig(clientName);
        var savedConfig;
        try {
            savedConfig = JSON.parse(window.localStorage.getItem('driverconfig'));
        } catch (e) {
            console.warn('warn:parse:savedconfig');
            savedConfig = {};
        }

        // Generate a driver config between descriptor and user saved config
        driverConfig = _.extend(_.clone(driverConfig), savedConfig);
        drivers[clientName] = corbel.getDriver(driverConfig);
        var params = null;
        if (driverConfig.oauthService) {
            params.claims['oauth.service'] = driverConfig.oauthService;
        } else if (driverConfig.username && driverConfig.password) {
            params = {
                claims: {
                    'basic_auth.username': driverConfig.username,
                    'basic_auth.password': driverConfig.password,
                    'scope': driverConfig.scopes
                }
            };
        }
        logins[clientName] = drivers[clientName].iam.token().create(params);
    }
    return logins[clientName].then(function(response) {
        tokens[clientName] = response.data;
    });
}


/**
 * Login with corbel-oauth server
 * @param  {object} params
 * @param  {object.oauthService} Name of the oauth service
 * @param  {object.scopes} Scope to request
 * @param  {object.devideId} custom devide_id
 * @return {Promise}        Promise with a succesful oauth login
 */
function _oauth(driver) {
    /*
        var claims = corbel.jwt.generate({
          'iss': driver.config.get('clientId'),
          'aud': driver.config.get('aud'),
          'oauth.service': driver.config.get('oauthService'),
          'scope': driver.config.get('scopes'),
          'device_id': driver.config.get('deviceId')
        });

        var redirectQuery = {
          assertion: jwt.generate(claims),
          'grant_type': app.common.get('claimGrantType')
        };

        // Auto request accessToken
        app.log.debug('user.login', $.param(redirectQuery));
        var redirectUri = app.common.get('iamEndpoint') + 'oauth/token?' + $.param(redirectQuery);

        var authorizationBuilder = oauth.authorization({
          clientId: app.common.get('oauthClientId'),
          responseType: 'code',
          redirectUri: redirectUri
        });

        var promise;
        if (args.username && args.password) {
          promise = authorizationBuilder.login(args.username, args.password, args.setCookie ? true : false);
        } else {
          // support for authentication with cookies
          promise = authorizationBuilder.dialog();
        }

        return promise;
        */
}

/**
 * Login with all `*_CLIENT` + `*_USER` defined in `.corbeltest`
 * @return {Promise} A promise that resolves when all different clients/users are logged
 */
function loginAll() {
    var promises = [];

    Object.keys(corbelTest.CONFIG).forEach(function(clientName) {
        if (clientName.indexOf('_CLIENT') !== -1 || clientName.indexOf('_USER') !== -1) {
            promises.push(login(clientName));
        }
    });

    return Promise.all(promises);
}


module.exports = {
    login: login,
    loginAll: loginAll,
    drivers: drivers,
    logins: logins,
    tokens: tokens
};
