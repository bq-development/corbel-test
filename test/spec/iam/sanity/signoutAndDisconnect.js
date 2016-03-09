describe('In IAM module', function() {

    var corbelDriver;
    var oauthCommon;
    var authorizationParams;
    var prodCredentials = corbelTest.CONFIG.PRODUCTION_CREDENTIALS;

    var prodIamUser = prodCredentials.DEFAULT_USER_IAM;
    var prodIamAdminUser = prodCredentials.ADMIN_USER_IAM;
    var prodOauthClient = prodCredentials.DEFAULT_CLIENT_OAUTH;
    var prodOauthUser = prodCredentials.DEFAULT_USER_OAUTH;
    var prodOauthAdminUser = prodCredentials.ADMIN_USER_OAUTH;

    beforeEach(function(done) {
        corbelDriver = corbelTest.getCustomDriver(prodIamUser);
        oauthCommon = corbelTest.common.oauth;
        authorizationParams = oauthCommon.getClientParamsCodeIAM(corbelDriver, prodIamUser, prodOauthClient);

        corbelDriver.oauth.authorization(authorizationParams)
            .login(prodOauthUser.username, prodOauthUser.password)
        .should.be.eventually.fulfilled.and.should.notify(done);
    });

    var getAuthorizationParams = function(){
        return oauthCommon.getClientParamsCodeIAM(corbelDriver, prodIamUser, prodOauthClient);
    };

    describe('while retrieving user information after signout', function() {
        it('[SANITY] fails returning error UNAUTHORIZATED(401)', function(done) {
            corbelDriver.iam.user().get()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user('me')
                    .signOut()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user().get()
                .should.be.eventually.rejected;
            })
            .then(function(response) {
                expect(response).to.have.property('status', 401);
            })
            .should.notify(done);
        });
    });

    describe('when the user is logged twive', function() {
        describe('and request to signout with one token', function() {
            it('[SANITY] success returning access', function(done) {

                corbelDriver.oauth.authorization(getAuthorizationParams())
                    .login(prodOauthUser.username, prodOauthUser.password)
                .then(function() {
                    return corbelDriver.oauth.authorization(getAuthorizationParams())
                        .signout()
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.iam.user('me')
                        .signOut()
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.iam.user().get()
                    .should.be.eventually.rejected;
                })
                .then(function(response) {
                    expect(response).to.have.property('status', 401);
                })
                .should.notify(done);
            });
        });

        describe('when the user is logged twice and call disconnectMe', function() {
            it('[SANITY] two session returning error UNAUTHORIZATION(401)', function(done) {

                corbelDriver.oauth.authorization(getAuthorizationParams())
                    .login(prodOauthUser.username, prodOauthUser.password)
                .then(function() {
                    return corbelDriver.oauth.authorization(getAuthorizationParams())
                        .signout()
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.iam.user('me')
                        .disconnect()
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.iam.user().get()
                    .should.be.eventually.rejected;
                })
                .then(function(response) {
                    expect(response).to.have.property('status', 401);
                })
                .should.notify(done);
            });
        });

        describe('when a admin oauth logged user tries to retrieve info after disconnects', function() {
            it('qwerqwer[SANITY] fails returning error UNAUTHORIZATED(401)', function(done) {

                var user; 

                corbelDriver.oauth.authorization(getAuthorizationParams())
                    .login(prodOauthAdminUser.username, prodOauthAdminUser.password)
                .then(function() {
                    return corbelDriver.iam.user('me')
                        .get()
                        .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.iam.user('me')
                        .disconnect()
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.oauth.authorization(getAuthorizationParams())
                        .signout()
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.iam.user().get()
                    .should.be.eventually.rejected;
                })
                .then(function(response) {
                    expect(response).to.have.property('status', 401);
                })
                .should.notify(done);
            });
        });
    });
});
