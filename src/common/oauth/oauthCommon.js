var PORTS = require('../../../test/ports.conf.js');

function getOauthClientId(oauthClient) {
    if (oauthClient!==undefined && oauthClient!==null && oauthClient.clientId){
        return oauthClient.clientId;
    } else {
        return corbelTest.CONFIG.DEV_CREDENTIALS.DEFAULT_CLIENT_OAUTH.clientId;
    }   
}

function getOauthClientSecret(oauthClient) {
    if (oauthClient!==undefined && oauthClient!==null && oauthClient.secret){
        return oauthClient.secret;
    } else {
        return corbelTest.CONFIG.DEV_CREDENTIALS.DEFAULT_CLIENT_OAUTH.secret;
    }   
}

function getClientId(client) {
    if (client!==undefined && client!==null && client.clientId){
        return client.clientId;
    } else {
        return corbelTest.CONFIG.DEV_CREDENTIALS.DEFAULT_CLIENT_OAUTH.clientId;
    }   
}

function getClientSecret(client){
    if (client!==undefined && client!==null && client.clientSecret){
        return client.clientSecret;
    } else {
        return corbelTest.CONFIG.DEV_CREDENTIALS.DEFAULT_CLIENT_OAUTH.clientSecret;
    }   
}

function getIamJWT(client) {
    return corbel.jwt.generate({
            iss: getClientId(client),
            version: '1.0.0',
            aud: 'http://iam.bqws.io',
            exp: Math.round((new Date().getTime() / 1000)) + 3500,
            'oauth.service' : 'silkroad'
        },

        getClientSecret(client),
        corbelTest.CONFIG.DEV_CREDENTIALS.DEFAULT_CLIENT_OAUTH.jwtAlgorithm);
}

function getClientParams() {
    return {
        clientId: corbelTest.CONFIG.DEV_CREDENTIALS.DEFAULT_CLIENT_OAUTH.clientId,
        clientSecret: corbelTest.CONFIG.DEV_CREDENTIALS.DEFAULT_CLIENT_OAUTH.secret
    };
}

function getClientParamsCode(client) {
    return {
        clientId: getOauthClientId(client),
        responseType: 'code',
        redirectUri: 'http://' + window.location.host.split(':')[0] + ':' + PORTS.EXPRESS + '/requestinfo'
    };
}

function getAuthorizationClientParamsToken() {
    return {
        clientId: corbelTest.CONFIG.DEV_CREDENTIALS.DEFAULT_CLIENT_OAUTH.clientId,
        responseType: 'token'
    };
}

function getClientParamsCodeIAM(driver, iamUser, oauthClient) {
    return {
        clientId: getOauthClientId(oauthClient),
        responseType: 'code',
        redirectUri: getURI(driver, 'iam') +
            'oauth/token?grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + getIamJWT(iamUser)
    };
}

function getClientParamsAuthorizationToken() {
    return {
        clientId: corbelTest.CONFIG.DEV_CREDENTIALS.DEFAULT_CLIENT_OAUTH.clientId,
        responseType: 'token'
    };
}

function getClientParamsToken(oauthClient) {
    return {
        clientId: getOauthClientId(oauthClient),
        clientSecret: getOauthClientSecret(oauthClient),
        grantType: 'authorization_code'
    };
}

function getToken(driver, username, password) {
    return driver.oauth
        .authorization(getClientParamsCode())
        .login(username, password, false, false)
        .should.be.eventually.fulfilled
        .then(function(response) {
            return driver.oauth.token(getClientParamsToken())
                .get(response.data.query.code)
                .should.be.eventually.fulfilled;
        });
}

function lowLevelPostAuthorizationRequest(driver, clientParams, username, password, state) {
    var params = {
        url: getURI(driver, 'oauth') + 'oauth/authorize',
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: trasformParams(clientParams)
    };

    params.method = corbel.request.method.POST;
    params.data.username = username;
    params.data.password = password;
    params.data.state = state;
    return corbel.request.send(params);
}

function lowLevelGetAuthorizationRequest(driver, clientParams) {
    var params = {};
    params.customQueryParams = trasformParams(clientParams);
    return corbel.request.send({
        url: getURI(driver, 'oauth') + 'oauth/authorize?' + corbel.utils.serializeParams(params),
        contentType: corbel.Oauth._URL_ENCODED,
        method: corbel.request.method.GET,
        dataType: 'text'
    });
}

function lowLevelOauthToken(driver, params) {
    var p = {
        url: getURI(driver, 'oauth') + 'oauth/token',
        contentType: corbel.Oauth._URL_ENCODED,
        data: trasformParams(params),
        method: corbel.request.method.POST
    };

    return corbel.request.send(p);
}

function trasformParams(clientParams) {
    for (var key in clientParams) {
        if (clientParams.hasOwnProperty(key)) {
            var keyWithUnderscores = toUnderscore(key);
            if (key !== keyWithUnderscores) {
                clientParams[keyWithUnderscores] = clientParams[key];
                delete clientParams[key];
            }
        }
    }
    return clientParams;
}

function deleteOauthUser(corbelDriver, username, password) {
    return corbelDriver.oauth
        .authorization(getClientParams)
        .signout()
        .then(function() {
            corbelDriver.oauth
                .user(getClientParams())
                .delete('me');
        });
}

function getOauthUserTestParams() {
    return {
        username: corbelTest.CONFIG.DEV_CREDENTIALS.DEFAULT_CLIENT_OAUTH.username,
        password: corbelTest.CONFIG.DEV_CREDENTIALS.DEFAULT_CLIENT_OAUTH.password,
        email: corbelTest.CONFIG.DEV_CREDENTIALS.DEFAULT_CLIENT_OAUTH.email,
        clientId: corbelTest.CONFIG.DEV_CREDENTIALS.DEFAULT_CLIENT_OAUTH.clientId,
        clientSecret: corbelTest.CONFIG.DEV_CREDENTIALS.DEFAULT_CLIENT_OAUTH.secret
    };
}

function toUnderscore(string) {
    return string.replace(/([A-Z])/g, function(cad) {
        return '_' + cad.toLowerCase();
    });
}

function getTokenValidation() {
    return /^.+\..+\..+$/;
}

function getURI(driver, serv) {
    return driver.config.get('urlBase').replace('{{module}}', serv);
}

function getRequestInfoEndpoint() {
    return 'http://localhost: ' + PORTS.EXPRESS;
}

function getOauthAdminUserParams() {
    return corbelTest.CONFIG.DEV_CREDENTIALS.ADMIN_USER_OAUTH;
}

function getOauthRootUserParams() {
    return corbelTest.CONFIG.DEV_CREDENTIALS.ROOT_USER_OAUTH;
}

module.exports = {
    getClientParams: getClientParams,
    getClientParamsCode: getClientParamsCode,
    getAuthorizationClientParamsToken: getAuthorizationClientParamsToken,
    getClientParamsCodeIAM: getClientParamsCodeIAM,
    getClientParamsAuthorizationToken: getClientParamsAuthorizationToken,
    getClientParamsToken: getClientParamsToken,
    getToken: getToken,
    lowLevelPostAuthorizationRequest: lowLevelPostAuthorizationRequest,
    lowLevelGetAuthorizationRequest: lowLevelGetAuthorizationRequest,
    lowLevelOauthToken: lowLevelOauthToken,
    deleteOauthUser: deleteOauthUser,
    getOauthUserTestParams: getOauthUserTestParams,
    getTokenValidation: getTokenValidation,
    getURI: getURI,
    getRequestInfoEndpoint: getRequestInfoEndpoint,
    getOauthAdminUserParams: getOauthAdminUserParams,
    getOauthRootUserParams: getOauthRootUserParams
};
