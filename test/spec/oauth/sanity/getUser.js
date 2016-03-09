describe('In OAUTH module', function() {

    var corbelDriver;
    var oauthCommon;
    var authorizationParams;

    var prodCredentials = corbelTest.CONFIG.PRODUCTION_CREDENTIALS;
    var prodOauthClient = prodCredentials.DEFAULT_CLIENT_OAUTH;
    var prodIamUser = prodCredentials.DEFAULT_USER_IAM;
    var prodOauthUser = prodCredentials.DEFAULT_USER_OAUTH;

    describe('when a user is logged in', function(){

        before(function(){
            corbelDriver = corbelTest.getCustomDriver(prodIamUser);
            oauthCommon = corbelTest.common.oauth;
            authorizationParams = oauthCommon.getClientParamsCodeIAM(corbelDriver, prodIamUser, prodOauthClient);
        });
    
        it('[SANITY] user information can be retrieved through user/me', function(done) {

            var clientParamsCode = oauthCommon.getClientParamsCode(prodOauthClient);
            var clientParamsToken = oauthCommon.getClientParamsToken(prodOauthClient);
            var oauthUserTest = oauthCommon.getOauthUserTestParams();
            var setCookie = false;
            var noRedirect = true;
            var accessToken;

            corbelDriver.oauth.authorization(clientParamsCode)
                .login(prodOauthUser.username, prodOauthUser.password, setCookie, noRedirect)
            .should.be.eventually.fulfilled
            .then(function(response) {

                return corbelDriver.oauth.token(clientParamsToken)
                    .get(response.data.query.code)
                .should.be.eventually.fulfilled;
            })
            .then(function (response) {
                accessToken = response.data['access_token'];

                return corbelDriver.oauth.user(oauthCommon.getClientParams(), accessToken)
                    .get('me')
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response.data.username).to.be.equal('silkroad.qa.prod@gmail.com');
                expect(response.data.email).to.be.equal('silkroad.qa.prod@gmail.com');
            })
            .should.notify(done);
        });
    });
});
