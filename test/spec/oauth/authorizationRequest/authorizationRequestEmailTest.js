describe('In OAUTH module', function () {

    describe('for authorization requests that have one login endpoint email', function () {

        var corbelDriver;
        var oauthUserTest;
        var oauthCommon;

        before(function () {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            oauthCommon = corbelTest.common.oauth;
            oauthUserTest = oauthCommon.getOauthUserTestParams();
        });

        it('allows do login with POST and obtains an IAM access token', function (done) {

            var authorize = corbelDriver.oauth.authorization(oauthCommon.getClientParamsCodeIAM(corbelDriver));

            authorize
                .login(oauthUserTest.email, oauthUserTest.password, false, false)
                .should.be.eventually.fulfilled
                .then(function (response) {
                    expect(response).have.deep.property('data.accessToken');
                    expect(response.data.accessToken).to.match(oauthCommon.getTokenValidation());
                    return authorize
                        .signout()
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });

        it('allows do login with POST or you can obtain OAUTH token', function (done) {
            var authorize = corbelDriver.oauth.authorization(oauthCommon.getClientParamsAuthorizationToken());

            authorize
                .login(oauthUserTest.email, oauthUserTest.password, false, false)
                .should.be.eventually.fulfilled
                .then(function (response) {
                    expect(response).have.property('access_token');
                    expect(response['access_token']).to.match(oauthCommon.getTokenValidation());

                    return corbelDriver.oauth
                        .user(oauthCommon.getClientParams(), response['access_token'])
                        .get('me');
                })
                .then(function (response) {
                    expect(response).to.have.deep.property('data.email', oauthUserTest.email);
                    return authorize.signout()
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });

        it('when fills state redirects with the given state', function (done) {
            var state = 'myState';
            var clientParamas = oauthCommon.getClientParamsCode();
            clientParamas.state = state;
            var authorize = corbelDriver.oauth.authorization(clientParamas);

            authorize
                .login(oauthUserTest.email, oauthUserTest.password, false, false)
                .should.be.eventually.fulfilled
                .then(function (response) {
                    expect(response).have.deep.property('data.query.state', state);
                    return authorize.signout()
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });
    });
});
