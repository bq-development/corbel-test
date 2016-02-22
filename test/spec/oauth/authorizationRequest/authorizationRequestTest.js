describe('In OAUTH module', function () {

    var corbelDriver;
    var oauthUserTest;
    var oauthCommon;

    before(function () {
        corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
        oauthCommon = corbelTest.common.oauth;
        oauthUserTest = oauthCommon.getOauthUserTestParams();
    });

    describe('for authorization requests that have one login endpoint', function () {

        it('allows to do login with POST and it obtains an IAM access token', function (done) {
            corbelDriver.oauth
                .authorization(oauthCommon.getClientParamsCodeIAM(corbelDriver))
                .login(oauthUserTest.username, oauthUserTest.password, false, false)
                .should.be.eventually.fulfilled
                .then(function (response) {
                    expect(response).have.deep.property('data.accessToken');
                    expect(response.data.accessToken).to.match(oauthCommon.getTokenValidation());
                })
                .should.notify(done);
        });

        it('allows to do login with POST or you can obtain OAUTH token', function (done) {
            corbelDriver.oauth
                .authorization(oauthCommon.getClientParamsAuthorizationToken())
                .login(oauthUserTest.username, oauthUserTest.password, false, false)
                .should.be.eventually.fulfilled
                .then(function (response) {
                    expect(response).have.property('access_token');
                    expect(response['access_token']).to.match(oauthCommon.getTokenValidation());
                    return corbelDriver.oauth
                        .user(oauthCommon.getClientParams(), response['access_token'])
                        .get('me')
                        .should.be.eventually.fulfilled;
                })
                .then(function (response) {
                    expect(response).to.have.deep.property('data.email', oauthUserTest.username);
                })
                .should.notify(done);
        });

        it('and when fills state, redirects with the given state', function (done) {
            var clientParamas = oauthCommon.getClientParamsCode();
            clientParamas.state = 'myState';

            corbelDriver.oauth
                .authorization(clientParamas)
                .login(oauthUserTest.username, oauthUserTest.password, false, false)
                .should.be.eventually.fulfilled
                .then(function (response) {
                    expect(response).to.have.deep.property('data.query.state', clientParamas.state);
                })
                .should.notify(done);
        });
    });
});
