describe('In IAM module', function() {

    var corbelDriver;
    var oauthCommon;
    var authorizationParams;
    var prodCredentials = corbelTest.CONFIG.PRODUCTION_CREDENTIALS;

    var prodIamUser = prodCredentials.DEFAULT_USER_IAM;
    var prodOauthClient = prodCredentials.DEFAULT_CLIENT_OAUTH;
    var prodOauthUser = prodCredentials.DEFAULT_USER_OAUTH;

    before(function() {
        corbelDriver = corbelTest.getCustomDriver(prodIamUser);
        oauthCommon = corbelTest.common.oauth;
        authorizationParams = oauthCommon.getClientParamsCodeIAM(corbelDriver, prodIamUser, prodOauthClient);
    });

    describe('When request retrieve user me without scope necessary', function() {
        it.only('[SANITY] fails returning an unauthorized error', function(done) {
            corbelDriver.iam.user('me').get()
            .should.be.eventually.rejected
            .then(function(response) {
                expect(response).to.have.property('status', 401);
                expect(response).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });
    });
});
