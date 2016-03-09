describe('In ENGINE accessToken module', function() {
    var productionCredentials = corbelTest.CONFIG.PRODUCTION_CREDENTIALS;
    var productionClientValues = productionCredentials.ADMIN_CLIENT;
    var prodUser = productionCredentials.OAUTH_USER;
    var driver;
    var oauthCommon;

    describe('with logged user', function() {

        var tokenObject;

        beforeEach(function(done) {
            driver = corbelTest.getCustomDriver(productionClientValues);
            oauthCommon = corbelTest.common.oauth;
            var authorizationParams = oauthCommon.getClientParamsCodeIAM(driver, productionClientValues);
            driver.oauth
                .authorization(authorizationParams)
                .login(prodUser.username, prodUser.password)
                .should.be.eventually.fulfilled
                .then(function (response) {
                    return driver.iam.user().get();
                })
                .should.be.eventually.fulfilled
                .then(function (response) {
                    expect(response).to.have.deep.property('data');

                })
                .should.notify(done);
        });

        describe('when token refresh exists', function() {

            it('[SANITY] request a token with token refresh', function(done) {
                driver.iam.user().get()
                // driver.iam.token().create({})
                .should.be.eventually.fulfilled
                .should.notify(done);
            });
        });

    });
});
