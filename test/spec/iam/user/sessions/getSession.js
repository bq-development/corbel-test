describe('In IAM module', function() {
    var corbelDriver;
    var user;

    afterEach(function(done) {
        corbelDriver.iam.user()
        .deleteMe()
        .should.be.eventually.fulfilled
        .should.notify(done);
    });

    describe('while testing get a user sessions', function() {

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(createdUsers) {
                user = createdUsers[0];

                return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
                .should.eventually.be.fulfilled;
            })
            .should.notify(done);
        });


        it('current session can be retrieved', function(done) {
            var sessionToken = corbelDriver.config.config.iamToken.accessToken;

            corbelDriver.iam.user('me')
            .getSession()
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.userId', user.id);
                expect(response).to.have.deep.property('data.token', sessionToken);
            })
            .should.notify(done);
        });
    });
});
