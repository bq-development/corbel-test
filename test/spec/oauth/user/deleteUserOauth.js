describe('In OAUTH module', function () {

    describe('testing delete operation over a oauth user', function () {

        var corbelDriver;
        var oauthCommon;
        var oauthAdminUserTest, oauthRootUserTest;
        var adminAccessToken;
        var accessToken;

        var userTest;

        before(function (done) {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
            oauthCommon = corbelTest.common.oauth;
            oauthAdminUserTest = oauthCommon.getOauthAdminUserParams();
            oauthRootUserTest = oauthCommon.getOauthRootUserParams();

            oauthCommon
                .getToken(corbelDriver, oauthAdminUserTest.username, oauthAdminUserTest.password)
                .should.be.eventually.fulfilled
                .then(function (response) {
                    adminAccessToken = response.data['access_token'];
                })
                .should.notify(done);

        });

        beforeEach(function (done) {
            var timeStamp = Date.now();
            userTest = {
                'username': 'deleteUserOauthTest' + timeStamp,
                'password': 'passwordTest',
                'email': 'deleteUserOauthTes' + timeStamp + '@funkifake.com'
            };

            corbelDriver.oauth
                .user(oauthCommon.getClientParams())
                .create(userTest)
                .should.be.eventually.fulfilled
                .then(function () {
                    return oauthCommon
                        .getToken(corbelDriver, userTest.username, userTest.password)
                        .should.be.eventually.fulfilled;
                })
                .then(function (response) {
                    accessToken = response.data['access_token'];
                    expect(accessToken).to.match(oauthCommon.getTokenValidation());
                })
                .should.notify(done);
        });


        it('204 is returned when request to delete a user using delete me', function (done) {
            corbelDriver.oauth
                .user(oauthCommon.getClientParams(), accessToken)
                .delete('me')
                .should.be.eventually.be.fulfilled.and.notify(done);
        });

        it('204 is returned when requestUsing delete other user', function (done) {
            corbelDriver.oauth
                .user(oauthCommon.getClientParams(), accessToken)
                .get('me')
                .should.be.eventually.fulfilled
                .then(function (response) {
                    return corbelDriver.oauth
                        .user(oauthCommon.getClientParams(), adminAccessToken)
                        .delete(response.data.id)
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });

        it('401 is returned when request to delete and user not exist, (bad access token)', function (done) {
            return corbelDriver.oauth
                .user(oauthCommon.getClientParams(), 'BAD ACCESS TOKEN')
                .delete('me')
                .should.be.eventually.rejected
                .then(function (response) {
                    expect(response).to.have.property('status', 401);
                })
                .should.notify(done);
        });

        it('404 is returned when request to delete a root user with an admin user', function (done) {
            oauthCommon
                .getToken(corbelDriver, oauthRootUserTest.username, oauthRootUserTest.password)
                .should.be.eventually.fulfilled
                .then(function (response) {
                    return corbelDriver.oauth
                        .user(oauthCommon.getClientParams(), response.data['access_token'])
                        .get('me')
                        .should.be.eventually.fulfilled;
                })
                .then(function (response) {
                    return corbelDriver.oauth
                        .user(oauthCommon.getClientParams(), adminAccessToken)
                        .delete(response.data.id)
                        .should.be.eventually.rejected;
                })
                .then(function (response) {
                    expect(response).to.have.property('status', 404);
                })
                .should.notify(done);
        });
    });
});
