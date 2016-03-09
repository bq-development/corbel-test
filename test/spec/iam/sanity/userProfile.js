describe('In IAM module', function() {

    var corbelDriver;
    var oauthCommon;
    var authorizationParams;
    var prodCredentials = corbelTest.CONFIG.PRODUCTION_CREDENTIALS;

    var prodIamUser = prodCredentials.DEFAULT_USER_IAM;
    var prodOauthClient = prodCredentials.DEFAULT_CLIENT_OAUTH;
    var prodOauthUser = prodCredentials.DEFAULT_USER_OAUTH;


    describe('when requesting a user profile', function() {

        beforeEach(function(done) {
            corbelDriver = corbelTest.getCustomDriver(prodIamUser);
            oauthCommon = corbelTest.common.oauth;
            authorizationParams = oauthCommon.getClientParamsCodeIAM(corbelDriver, prodIamUser, prodOauthClient);

            corbelDriver.oauth.authorization(authorizationParams)
                .login(prodOauthUser.username, prodOauthUser.password)
            .should.be.eventually.fulfilled.and.should.notify(done);
        });

        it('[SANITY] server returns requested info if the user exists', function(done) {

            corbelDriver.iam.user('me')
                .get()
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.username', 'silkroad.qa.prod@gmail.com');
                expect(response).to.have.deep.property('data.firstName', 'silkroad.qaProd');
                expect(response).to.have.deep.property('data.email', 'silkroad.qa.prod@gmail.com');

                return corbelDriver.iam.user(response.data.id)
                    .getProfile()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.username', 'silkroad.qa.prod@gmail.com');
                expect(response).to.have.deep.property('data.firstName', 'silkroad.qaProd');
                expect(response).to.have.deep.property('data.email', 'silkroad.qa.prod@gmail.com');
            })
            .should.notify(done);
        });

        it('[SANITY] server returns an error if the user does not exists', function(done) {

            corbelDriver.iam.user('userIdNotExist')
                .getProfile()
            .should.be.eventually.rejected
            .then(function(response) {
                expect(response).to.have.property('status', 404);
                expect(response).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });
    });
});
