describe('In OAUTH module', function() {
    var corbelDriver;

    before(function() {
        corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
    });

    var tokenValidation = corbelTest.CONFIG.GLOBALS.tokenValidation;

    it('user management allows CRUD flow over user', function(done) {
        var code, accessToken;
        var timeStamp = Date.now();
        var username = 'createUserTest' + timeStamp;
        var updateUsername = 'updateCreateUserTest' + timeStamp;
        var password = 'passwordTest';
        var updatePassword = 'updatePasswordTest';
        var email = 'createUserTest' + timeStamp + '@funkifake.com';

        var userTest = {
            'username': username,
            'password': password,
            'email': email
        };

        corbelDriver.oauth.user(corbelTest.common.oauth.getClientParams())
        .create(userTest)
        .should.be.eventually.fulfilled
        .then(function() {
            return corbelDriver.oauth.authorization(corbelTest.common.oauth.getClientParamsCode())
            .login(username, password)
            .should.be.eventually.fulfilled;
        })
        .then(function(codeResponse) {
            expect(codeResponse.query.code).to.be.match(tokenValidation);
            code = codeResponse.query.code;

            return corbelDriver.oauth.token(corbelTest.common.oauth.getClientParamsToken())
            .get(code)
            .should.be.eventually.fulfilled;
        })
        .then(function(tokenResponse) {
            expect(tokenResponse['access_token']).to.be.match(tokenValidation);
            accessToken = tokenResponse['access_token'];
            return corbelDriver.oauth.user(corbelTest.common.oauth.getClientParams(), accessToken)
            .getMe()
            .should.be.eventually.fulfilled;
        })
        .then(function(userGetMeResponse) {
            expect(userGetMeResponse.username).to.be.equal(username.toLowerCase());
            expect(userGetMeResponse.email).to.be.equal(email.toLowerCase());
                
            var updateUserData = {
                'username': updateUsername,
                'password': updatePassword
            };

            return corbelDriver.oauth.user(corbelTest.common.oauth.getClientParams(), accessToken)
            .updateMe(updateUserData)
            .should.be.eventually.fulfilled;
        })
        .then(function() {
            return corbelDriver.oauth.authorization(corbelTest.common.oauth.getClientParamsCode())
            .login(updateUsername, updatePassword)
            .should.be.eventually.fulfilled;
        })
        .then(function(codeResponse) {
            code = codeResponse.query.code;
            expect(code).to.be.match(tokenValidation);
            return corbelDriver.oauth.token(corbelTest.common.oauth.getClientParamsToken())
            .get(code)
            .should.be.eventually.fulfilled;
        })
        .then(function(tokenResponse) {
            accessToken = tokenResponse['access_token'];
            expect(accessToken).to.be.match(tokenValidation);
            return corbelDriver.oauth.user(corbelTest.common.oauth.getClientParams(), accessToken)
            .getMe()
            .should.be.eventually.fulfilled;
        })
        .then(function(userGetMeResponse) {
            expect(userGetMeResponse.username).to.be.equal(updateUsername.toLowerCase());
            expect(userGetMeResponse.email).to.be.equal(email.toLowerCase());
            return corbelDriver.oauth.user(corbelTest.common.oauth.getClientParams(), accessToken)
            .deleteMe()
            .should.be.eventually.fulfilled;
        })
        .then(function() {
            return corbelDriver.oauth.authorization(corbelTest.common.oauth.getClientParamsCode())
            .login(updateUsername, updatePassword)
            .should.be.eventually.rejected;
        })
        .should.notify(done);
    });
});