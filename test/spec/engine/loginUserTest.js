describe('In ENGINE user module', function() {
    var driver;
    var oauthCommon;
    var prodCredentials = corbelTest.CONFIG.PRODUCTION_CREDENTIALS;

    var prodIamUser = prodCredentials.DEFAULT_USER_IAM;
    var prodOauthClient = prodCredentials.DEFAULT_CLIENT_OAUTH;
    var prodOauthUser = prodCredentials.DEFAULT_USER_OAUTH;

    describe('When user login with username', function() {

        describe('with correct default oauthService params', function() {

            it('[SANITY] it returns an access token', function(done) {
                driver = corbelTest.getCustomDriver(prodIamUser);
                oauthCommon = corbelTest.common.oauth;
                var authorizationParams = oauthCommon.getClientParamsCodeIAM(driver, prodIamUser, prodOauthClient);

                driver.oauth.authorization(authorizationParams)
                .login(prodOauthUser.username, prodOauthUser.password)
                .should.be.eventually.fulfilled
                .then(function (response) {
                    return driver.iam.user().get();
                })
                .should.notify(done);
            });
        });
    });
});
