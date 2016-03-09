describe('In OAUTH module', function () {
    var corbelDriver;
    var oauthCommon;
    var oauthUserTest;

    before(function () {
        corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
        oauthCommon = corbelTest.common.oauth;
        oauthUserTest = oauthCommon.getOauthUserTestParams();
    });

    describe('testing signout', function () {

        it('when I do login, oauth remember me, but if I do signout oauth send me login form', function (done) {
                corbelDriver.oauth.authorization(oauthCommon.getClientParamsAuthorizationToken())
                    .login(oauthUserTest.username, oauthUserTest.password)
                .should.be.eventually.fulfilled
                .then(function (response) {
                    expect(response).have.property('access_token');
                    expect(response['access_token']).to.match(oauthCommon.getTokenValidation());

                    return corbelDriver.oauth
                        .authorization(oauthCommon.getClientParamsCode())
                        .loginWithCookie()
                        .should.be.eventually.fulfilled;
                })
                .then(function (request) {
                    expect(request).to.have.deep.property('data.query.code');

                    return corbelDriver.oauth
                        .authorization(oauthCommon.getClientParamsCode())
                        .signout()
                        .should.be.eventually.fulfilled;
                })
                .then(function () {
                    return corbelDriver.oauth
                        .authorization(oauthCommon.getClientParamsCode())
                        .loginWithCookie()
                        .should.be.eventually.rejected;
                })
                .then(function (response) {
                    expect(response).to.not.have.deep.property('data.query');
                })
                .should.notify(done);
        });
    });
});
