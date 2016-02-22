describe('In OAUTH module', function () {

    describe('when requests to create a new user fails', function () {
        var corbelDriver;
        var oauthCommon;
        var userTest, userTestSameName, userTestSameMail, userTestCaseUp;
        var timeStamp;

        before(function () {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            oauthCommon = corbelTest.common.oauth;
        });

        beforeEach(function () {
            timeStamp = Date.now();

            userTest = {
                'username': 'createUserOauthTest' + timeStamp,
                'password': 'passwordTest',
                'email': 'createUserOauthTest' + timeStamp + '@funkifake.com'
            };

            userTestSameName = {
                'username': 'createUserOauthTest' + timeStamp,
                'password': 'passwordTest',
                'email': 'otherCreateUserOauthTest' + timeStamp + '@funkifake.com'
            };

            userTestSameMail = {
                'username': 'OtherCreateUserOauthTest' + timeStamp,
                'password': 'passwordTest',
                'email': 'createUserOauthTest' + timeStamp + '@funkifake.com'
            };

            userTestCaseUp = {
                'username': userTest.username.toUpperCase(),
                'password': 'passwordTest',
                'email': userTest.email
            };
        });

        it('409 is returned when requests to create a user and already exists', function (done) {
            var userId;

            corbelDriver.oauth
                .user(oauthCommon.getClientParams())
                .create(userTest)
                .should.be.eventually.fulfilled
                .then(function (id) {
                    userId = id;

                    return corbelDriver.oauth
                        .user(oauthCommon.getClientParams())
                        .create(userTest)
                        .should.be.eventually.rejected;
                })
                .then(function (response) {
                    expect(response).to.have.property('status', 409);
                    expect(response).to.have.deep.property('data.error', 'entity_exists');

                    return corbelDriver.oauth
                        .user(oauthCommon.getClientParams())
                        .create(userTestSameName)
                        .should.be.eventually.rejected;
                })
                .then(function (response) {
                    expect(response).to.have.property('status', 409);
                    expect(response).to.have.deep.property('data.error', 'entity_exists');

                    return corbelDriver.oauth
                        .user(oauthCommon.getClientParams())
                        .create(userTestSameMail)
                        .should.be.eventually.rejected;
                })
                .then(function (response) {
                    userTest.id = userId;

                    expect(response).to.have.property('status', 409);
                    expect(response).to.have.deep.property('data.error', 'entity_exists');

                    return corbelDriver.oauth
                        .user(oauthCommon.getClientParams())
                        .create(userTest).should.be.eventually.rejected;
                })
                .then(function (response) {
                    expect(response).to.have.property('status', 409);
                    expect(response).to.have.deep.property('data.error', 'entity_exists');

                    return oauthCommon
                        .getToken(corbelDriver, userTest.username, userTest.password)
                        .should.be.eventually.fulfilled;
                })
                .then(function (response) {
                    return corbelDriver.oauth
                        .user(oauthCommon.getClientParams(), response.data['access_token'])
                        .delete('me')
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });


        it('409 is returned when requests to create an existing user using case sensitive username', function (done) {
            corbelDriver.oauth
                .user(oauthCommon.getClientParams())
                .create(userTest)
                .should.be.eventually.fulfilled
                .then(function () {
                    return corbelDriver.oauth
                        .user(oauthCommon.getClientParams())
                        .create(userTestCaseUp)
                        .should.be.eventually.rejected;
                })
                .then(function (response) {
                    expect(response).to.have.property('status', 409);
                    expect(response).to.have.deep.property('data.error', 'entity_exists');

                    return oauthCommon
                        .getToken(corbelDriver, userTest.username, userTest.password)
                        .should.be.eventually.fulfilled;
                })
                .then(function (response) {
                    return corbelDriver.oauth
                        .user(oauthCommon.getClientParams(), response.data['access_token'])
                        .delete('me')
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });


        var usersTest = [{
            'userTest': {
                'username': 'createUserOauthTest' + timeStamp,
                'password': 'passwordTest',
                'email': 'invalidEmail' + timeStamp
            },
            'description': 'bad email'
        }, {
            'userTest': {
                'username': 'username|' + timeStamp,
                'password': 'passwordTest',
                'email': 'createUserOauthTest' + timeStamp + '@funkifake.com'
            },
            'description': 'invalid username'
        }, {
            'userTest': {
                'username': 'username' + timeStamp,
                'password': 'passwordTest'
            },
            'description': 'missing email'
        }, {
            'userTest': {
                'password': 'passwordTest',
                'email': 'createUserOauthTest' + timeStamp + '@funkifake.com'
            },
            'description': 'missing username'
        }, {
            'userTest': {
                'username': 'username' + timeStamp,
                'email': 'createUserOauthTest@funkifake.com'
            },
            'description': 'missing password'
        }];

        usersTest.forEach(function (user) {

            it('422 is returned requests an user access token using: ' + user.description, function (done) {
                corbelDriver.oauth
                    .user(oauthCommon.getClientParams())
                    .create(user.userTest)
                    .should.be.eventually.rejected
                    .then(function (response) {
                        expect(response).to.have.property('status', 422);
                        expect(response).to.have.deep.property('data.error', 'invalid_entity');
                    })
                    .should.notify(done);
            });

        });

        it('401 is returned when request an user with invalid access token', function (done) {
            corbelDriver.oauth
                .user({
                    clientId: 'clientInvalid',
                    clientSecret: oauthCommon.getOauthUserTestParams().clientSecret
                })
                .create(userTest)
                .should.be.eventually.rejected
                .then(function (response) {
                    expect(response).to.have.property('status', 401);
                })
                .should.notify(done);
        });
    });
});
