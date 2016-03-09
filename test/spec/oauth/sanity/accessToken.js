describe('In OAUTH module', function() {

    var corbelDriver;
    var setCookie = false;
    var noRedirect = true;
    var oauthCommon;

    var prodIamUser = corbelTest.CONFIG.PRODUCTION_CREDENTIALS.DEFAULT_USER_IAM;

    describe('in access token request exchange Access Token after the client obtains a '+
        'code using the oauth authorization request', function(){

        before(function(){
            corbelDriver = corbelTest.getCustomDriver(prodIamUser);
            oauthCommon = corbelTest.common.oauth;
        });
    
        it('[SANITY] the server can the use this endpoint to exchange such code'+
            ' for and access token', function(done) {

            var clientParamsCode = oauthCommon.getClientParamsCode();
            var oauthUserTest = oauthCommon.getOauthUserTestParams();
            var setCookie = false;
            var noRedirect = true;

            corbelDriver.oauth.authorization(clientParamsCode)
                .login(oauthUserTest.username, oauthUserTest.password, setCookie, noRedirect)
            .should.be.eventually.fulfilled
            .then(function(response) {

                return corbelDriver.oauth.token(oauthCommon.getClientParamsToken())
                    .get(response.data.query.code)
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response.data['access_token']).to.be.match(oauthCommon.getTokenValidation());
                expect(response.data['expires_in']).to.be.equal(3600);
            })
            .should.notify(done);
        });
    });
});
