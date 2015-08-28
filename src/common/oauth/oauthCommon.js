//@exclude
'use strict';
/*globals corbel */
//@endexclude

function getClientParams() {
	return {
		clientId: corbelTest.CONFIG.OAUTH.clientId,
		clientSecret: corbelTest.CONFIG.OAUTH.secret
	};
}

function getClientParamsCode() {
	return {
		clientId: corbelTest.CONFIG.OAUTH.clientId,
		responseType: 'code',
		redirectUri: corbelTest.CONFIG.GLOBALS.requestInfoEndpoint
	};
}

function getClientParamsToken() {
	return {
		clientId: corbelTest.CONFIG.OAUTH.clientId,
		clientSecret: corbelTest.CONFIG.OAUTH.secret,
		grantType: 'authorization_code'
	};
}

module.exports = {
    getClientParams : getClientParams,
    getClientParamsCode : getClientParamsCode,
    getClientParamsToken : getClientParamsToken
};