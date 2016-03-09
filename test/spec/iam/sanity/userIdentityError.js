describe('In IAM module', function() {

    var corbelDriver;
    var oauthCommon;
    var authorizationParams;
    var prodCredentials = corbelTest.CONFIG.PRODUCTION_CREDENTIALS;

    var prodIamUser = prodCredentials.DEFAULT_USER_IAM;
    var prodOauthClient = prodCredentials.DEFAULT_CLIENT_OAUTH;
    var prodOauthUser = prodCredentials.DEFAULT_USER_OAUTH;

    var identities = ['facebook', 'twitter', 'silkroad', 'google'];

    before(function(done) {
        corbelDriver = corbelTest.getCustomDriver(prodIamUser);
        oauthCommon = corbelTest.common.oauth;
        authorizationParams = oauthCommon.getClientParamsCodeIAM(corbelDriver, prodIamUser, prodOauthClient);

        corbelDriver.oauth.authorization(authorizationParams)
            .login(prodOauthUser.username, prodOauthUser.password)
        .should.be.eventually.fulfilled.and.should.notify(done);
    });

    describe('when user requests user/me without necessary scope', function() {
        it('[SANITY] fails returning an unauthorized error', function(done) {
            corbelDriver.iam.user('me').getIdentities()
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response.data.length).to.be.equal(4);
                response.data.forEach(
                    function(value) {
                        expect(identities).to.contain(value.oauthService);
                    }
                );
            })
            .should.notify(done);
        });
    });
});
