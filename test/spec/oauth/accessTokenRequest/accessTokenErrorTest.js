describe('In OAUTH module', function () {

    var corbelDriver;
    var oauthUserTest;
    var oauthCommon;

    before(function () {
        corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
        oauthCommon = corbelTest.common.oauth;
        oauthUserTest = oauthCommon.getOauthUserTestParams();
    });

    describe('in access token request test error', function () {
        var code;

        beforeEach(function (done) {
            corbelDriver.oauth
                .authorization(oauthCommon.getClientParamsCode())
                .login(oauthUserTest.username, oauthUserTest.password, false, false)
                .should.be.eventually.fulfilled
                .then(function (response) {
                    code = response.data.query.code;
                    expect(code).to.match(oauthCommon.getTokenValidation());
                })
                .should.notify(done);
        });

        it('an error [401] is returned when request an access using a invalid client credentials', function (done) {
            var client = {
                clientId: 'asdf',
                clientSecret: 'xsfes',
                grantType: 'authorization_code'
            };

            corbelDriver.oauth
                .token(client)
                .get(code)
                .should.be.eventually.rejected
                .then(function (response) {
                    expect(response).to.have.property('status', 401);
                    expect(response).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
        });

        it('an error [401] is returned when request an access using a invalid clientId', function (done) {
            var client = {
                clientId: 'asdf',
                clientSecret: oauthUserTest.clientSecret,
                grantType: 'authorization_code'
            };

            corbelDriver.oauth
                .token(client)
                .get(code)
                .should.be.eventually.rejected
                .then(function (response) {
                    expect(response).to.have.property('status', 401);
                    expect(response).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
        });

        it('an error [401] is returned when request an access using a invalid client secret', function (done) {
            var client = {
                clientId: oauthUserTest.clientId,
                clientSecret: 'xsfes',
                grantType: 'authorization_code'
            };

            corbelDriver.oauth
                .token(client)
                .get(code)
                .should.be.eventually.rejected
                .then(function (response) {
                    expect(response).to.have.property('status', 401);
                    expect(response).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
        });

        it('an error [401] is returned when request an access using a invalid code', function (done) {
            corbelDriver.oauth
                .token(oauthCommon.getClientParamsToken())
                .get('codeInvalid')
                .should.be.eventually.rejected
                .then(function (response) {
                    expect(response).to.have.property('status', 401);
                    expect(response).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
        });

        it('an error [400] is returned when request an access missing clientId', function (done) {
            var params = {
                clientSecret: oauthUserTest.clientSecret,
                grantType: 'authorization_code',
                validatedMailRequired: false,
                code: code
            };

            oauthCommon
                .lowLevelOauthToken(corbelDriver, params)
                .should.be.eventually.rejected
                .then(function (response) {
                    expect(response).to.have.property('status', 400);
                    expect(response).to.have.deep.property('data.error', 'missing_parameter');
                    expect(response).to.have.deep.property('data.errorDescription', 'client_id');
                })
                .should.notify(done);
        });

        it('an error [400] is returned when request an access using a missing client secret', function (done) {
            var params = {
                clientId: oauthUserTest.clientId,
                grantType: 'authorization_code',
                validatedMailRequired: false,
                code: code
            };

            oauthCommon
                .lowLevelOauthToken(corbelDriver, params)
                .should.be.eventually.rejected
                .then(function (response) {
                    expect(response).to.have.property('status', 400);
                    expect(response).to.have.deep.property('data.error', 'missing_parameter');
                    expect(response).to.have.deep.property('data.errorDescription', 'client_secret');
                })
                .should.notify(done);
        });

        it('an error [400] is returned When request an access missing code', function (done) {
            corbelDriver.oauth
                .token(oauthCommon.getClientParamsToken())
                .get('')
                .should.be.eventually.rejected
                .then(function (response) {
                    expect(response).to.have.property('status', 400);
                    expect(response).to.have.deep.property('data.error', 'missing_parameter');
                })
                .should.notify(done);
        });

        it('an error [400] is returned when request an access using a invalid grant_type', function (done) {
            var BAD_GRANT_TYPE = 'asdf';

            var params = {
                clientId: oauthUserTest.clientId,
                clientSecret: oauthUserTest.clientSecret,
                grantType: BAD_GRANT_TYPE,
                validatedMailRequired: false,
                code: code
            };

            oauthCommon
                .lowLevelOauthToken(corbelDriver, params)
                .should.be.eventually.rejected
                .then(function (response) {
                    expect(response).to.have.property('status', 400);
                    expect(response).to.have.deep.property('data.error', 'invalid_grant');
                })
                .should.notify(done);
        });

        it('an error [400] is returned when request an access missing grant_type', function (done) {
            var params = {
                clientId: oauthUserTest.clientId,
                clientSecret: oauthUserTest.clientSecret,
                validatedMailRequired: false,
                code: code
            };

            oauthCommon
                .lowLevelOauthToken(corbelDriver, params)
                .should.be.eventually.rejected
                .then(function (response) {
                    expect(response).to.have.property('status', 400);
                    expect(response).to.have.deep.property('data.error', 'missing_parameter');
                    expect(response).to.have.deep.property('data.errorDescription', 'grant_type');
                })
                .should.notify(done);
        });

        it('an error [401] is returned when request an access token and the code is expired', function (done) {
            oauthCommon.waitFor(31)
                .should.be.eventually.fulfilled
                .then(function () {
                    return corbelDriver.oauth
                        .token(oauthCommon.getClientParamsToken())
                        .get(code)
                        .should.be.eventually.rejected;
                })
                .then(function (response) {
                    expect(response).to.have.property('status', 401);
                    expect(response).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
        });
    });
});
