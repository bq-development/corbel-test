describe('In OAUTH module', function() {
    var driver;
    var oauthCommon;
    var prodCredentials = corbelTest.CONFIG.PRODUCTION_CREDENTIALS;

    var prodIamUser = prodCredentials.DEFAULT_USER_IAM;
    var prodOauthClient = prodCredentials.DEFAULT_CLIENT_OAUTH;
    var prodOauthUser = prodCredentials.DEFAULT_USER_OAUTH;

    describe('with logged user', function() {

        beforeEach(function(done) {
            driver = corbelTest.getCustomDriver(prodIamUser);
            oauthCommon = corbelTest.common.oauth;
            var authorizationParams = oauthCommon.getClientParamsCodeIAM(driver, prodIamUser, prodOauthClient);
            driver.oauth.authorization(authorizationParams)
                .login(prodOauthUser.username, prodOauthUser.password)
            .should.be.eventually.fulfilled
            .then(function (response) {
                return driver.iam.user().get();
            })
            .should.notify(done);
        });

        it('[SANITY] when token refresh exists request a token with token refresh', function(done) {
            var refreshToken = driver.config.getConfig().iamToken.refreshToken;
            driver.iam.token()
                .refresh(refreshToken, 'silkroad-qa-prod:user')
            .should.be.eventually.fulfilled
            .then(function (response){
                return driver.assets.asset().access()
                    .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('[SANITY] when token refresh does not exists request a new accessToken', function(done) {
            driver.iam.token()
                .refresh('', 'silkroad-qa-prod:user')
            .should.be.eventually.rejected
            .then(function (response){
                return driver.assets.asset().access()
                    .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('[SANITY] when token refresh is invalid request a new accessToken', function(done) {
            driver.iam.token()
                .refresh('invalid_refresh_token', 'silkroad-qa-prod:user')
            .should.be.eventually.rejected
            .then(function (response){
                return driver.assets.asset().access()
                    .should.be.eventually.fulfilled;
            })
            .should.notify(done);

        });

        it('[SANITY] returns expected information in the access_token', function(done) {

            var clientParamsCode = oauthCommon.getClientParamsCode();
            var oauthUserTest = oauthCommon.getOauthUserTestParams();
            var setCookie = false;
            var noRedirect = true;

            driver.oauth.authorization(clientParamsCode)
                .login(oauthUserTest.username, oauthUserTest.password, setCookie, noRedirect)
            .should.be.eventually.fulfilled
            .then(function(response) {

                return driver.oauth.token(oauthCommon.getClientParamsToken())
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

    describe('without logged user', function() {
        it('[SANITY] request a token as an application', function(done) {
            var claims = {
                'iss': prodIamUser.clientId,
                'aud': 'http://iam.bqws.io',
                'version': _.cloneDeep(corbelTest.CONFIG['VERSION']),
            };

            driver.iam.token()
            .create({
                jwt: corbel.jwt.generate(
                    claims,
                    prodIamUser.clientSecret,
                    corbel.jwt.ALGORITHM
                )
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });
    });
});
