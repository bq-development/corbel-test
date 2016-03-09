describe('In OAUTH module', function() {
    var driver;
    var oauthCommon;
    var authorizationParams;
    var prodCredentials = corbelTest.CONFIG.PRODUCTION_CREDENTIALS;

    var prodIamUser = prodCredentials.DEFAULT_USER_IAM;
    var prodOauthClient = prodCredentials.DEFAULT_CLIENT_OAUTH;
    var prodOauthUser = prodCredentials.DEFAULT_USER_OAUTH;

    describe('with correct default oauthService params', function() {

        beforeEach(function(){
            driver = corbelTest.getCustomDriver(prodIamUser);
            oauthCommon = corbelTest.common.oauth;
            authorizationParams = oauthCommon.getClientParamsCodeIAM(driver, prodIamUser, prodOauthClient);
        });

        it('[SANITY] it returns an access token while acessing with the username', function(done) {

            driver.oauth.authorization(authorizationParams)
                .login(prodOauthUser.username, prodOauthUser.password)
            .should.be.eventually.fulfilled
            .then(function () {
                return driver.iam.user()
                    .get()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('[SANITY] it returns an access token while acessing with the username', function(done) {

            driver.oauth.authorization(authorizationParams)
                .login(prodOauthUser.email, prodOauthUser.password)
            .should.be.eventually.fulfilled
            .then(function () {
                return driver.iam.user()
                    .get()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });
    });
});
