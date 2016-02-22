describe('In OAUTH module', function () {

    var corbelDriver;
    var oauthCommon;

    before(function () {
        corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
        oauthCommon = corbelTest.common.oauth;

    });

    describe('for access token request, after the client obtains a code using the oauth authorization request',
        function () {

            it('the server can the use this endpoint to exchange such code for an access token', function (done) {
                var clientParamsCode = oauthCommon.getClientParamsCode();
                var oauthUserTest = oauthCommon.getOauthUserTestParams();
                var setCookie = false;
                var noRedirect = true;

                corbelDriver.oauth
                    .authorization(clientParamsCode)
                    .login(oauthUserTest.username, oauthUserTest.password, setCookie, noRedirect)
                    .should.be.eventually.fulfilled
                    .then(function (response) {
                        return corbelDriver.oauth
                            .token(oauthCommon.getClientParamsToken())
                            .get(response.data.query.code)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function (token) {
                        expect(token).to.have.deep.property('data.access_token').and.to
                            .match(oauthCommon.getTokenValidation());
                        expect(token).to.have.deep.property('data.expires_in', 3600);
                    })
                    .should.notify(done);
            });
        });
});
